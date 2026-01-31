// Chat/Conversation Types for Satis.az

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  owner_user_id: number;
  settings: TenantSettings;
  widget_settings: WidgetSettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Role-based access control
  role?: 'admin' | 'agent';
  is_owner?: boolean;
}

export interface TenantSettings {
  ai_timeout_seconds?: number;
  business_hours?: BusinessHours;
  timezone?: string;
}

export interface BusinessHours {
  enabled: boolean;
  schedule: {
    [key: string]: { start: string; end: string } | null; // 'monday' -> { start: '09:00', end: '18:00' }
  };
}

export interface WidgetSettings {
  primary_color?: string;
  position?: 'bottom-right' | 'bottom-left';
  greeting_message?: string;
  offline_message?: string;
  show_agent_avatar?: boolean;
  show_agent_name?: boolean;
  language?: 'az' | 'en' | 'ru';
}

export interface Visitor {
  id: number;
  tenant_id: number;
  visitor_uid: string;
  name?: string;
  email?: string;
  phone?: string;
  metadata?: {
    avatar?: string;
    wallet_id?: string;
    gender?: string;
    dob?: string;
    [key: string]: unknown;
  };
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus = 'queued' | 'active' | 'waiting' | 'closed';
export type HandlerType = 'human' | 'ai' | 'unassigned';
export type SenderType = 'visitor' | 'agent' | 'ai' | 'system';
export type ContentType = 'text' | 'image' | 'file';

export interface Conversation {
  id: number;
  tenant_id: number;
  visitor_id: number;
  assigned_agent_id?: number;
  status: ConversationStatus;
  handler_type: HandlerType;
  queue_entered_at?: string;
  ai_took_over_at?: string;
  human_took_over_at?: string;
  closed_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relationships
  visitor?: Visitor;
  assigned_agent?: Agent;
  messages?: ChatMessage[];
  messages_count?: number;
  unread_count?: number;
  last_message?: {
    content: string;
    sender_type: SenderType;
    created_at: string;
  };
  // Transfer-related fields (populated from queue endpoint)
  transferred_to_agent_id?: number;
  transferred_from_agent_name?: string;
  transferred_at?: string;
  transfer_reason?: string;
}

export interface Agent {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'agent';
  status?: AgentStatusType;
  is_owner?: boolean;
}

export type AgentStatusType = 'online' | 'away' | 'offline';

export interface AgentStatus {
  agent: Agent;
  status: AgentStatusType;
  last_activity_at?: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_type: SenderType;
  sender_id?: number;
  content: string;
  content_type: ContentType;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  sender?: Agent;
  files?: FileUpload[];
}

export interface FileUpload {
  id: number;
  chat_message_id: number;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  created_at: string;
}

export interface ChatTransfer {
  id: number;
  conversation_id: number;
  from_agent_id?: number;
  to_agent_id?: number;
  from_type: 'human' | 'ai' | 'queue';
  to_type: 'human' | 'ai' | 'queue';
  reason?: string;
  created_at: string;
  from_agent?: Agent;
  to_agent?: Agent;
}

export interface AiConfiguration {
  id: number;
  tenant_id: number;
  provider: 'openai' | 'claude' | 'gemini';
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseItem {
  id: number;
  tenant_id: number;
  title: string;
  content: string;
  content_type: 'faq' | 'document' | 'url';
  source_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface ConversationFilters {
  status?: ConversationStatus | 'all';
  handler_type?: HandlerType | 'all';
  assigned_to_me?: boolean;
  per_page?: number;
  page?: number;
}

export interface SendMessageData {
  content?: string;
  files?: File[];
}

export interface CreateTenantData {
  name: string;
  slug: string;
  settings?: TenantSettings;
  widget_settings?: WidgetSettings;
}

export interface UpdateTenantData {
  name?: string;
  settings?: TenantSettings;
  widget_settings?: WidgetSettings;
}

export interface InviteAgentData {
  email: string;
  role?: 'admin' | 'agent';
}

export interface UpdateAiConfigData {
  provider?: 'openai' | 'claude' | 'gemini';
  api_key?: string;
  model?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
}

export interface CreateKnowledgeBaseItemData {
  title: string;
  content: string;
  content_type: 'faq' | 'document' | 'url';
  source_url?: string;
  is_active?: boolean;
}

// WebSocket Event Types
export interface WebSocketEvent {
  event: string;
  channel: string;
  data: unknown;
}

export interface NewConversationEvent {
  conversation: Conversation;
}

export interface ConversationAcceptedEvent {
  conversation_id: number;
  status: ConversationStatus;
  handler_type: HandlerType;
  agent: Agent;
}

export interface ConversationClosedEvent {
  conversation_id: number;
  status: 'closed';
  closed_at: string;
  closed_by?: Agent;
}

export interface NewMessageEvent {
  message: ChatMessage;
}

export interface TypingIndicatorEvent {
  conversation_id: number;
  typer_type: 'visitor' | 'agent';
  typer_id?: number;
  typer_name?: string;
  is_typing: boolean;
}

export interface AgentStatusChangedEvent {
  agent: Agent;
  status: AgentStatusType;
  online_agents_count: number;
  timestamp: string;
}

export interface AiTookOverEvent {
  conversation_id: number;
  handler_type: 'ai';
  ai_took_over_at: string;
}

export interface HumanTookOverEvent {
  conversation_id: number;
  handler_type: 'human';
  agent: Agent;
  human_took_over_at: string;
}

export interface MessageReadEvent {
  conversation_id: number;
  message_ids: number[];
  read_by: 'visitor' | 'agent';
  read_at: string;
}

export interface ConversationTransferredEvent {
  conversation_id: number;
  conversation: Conversation;
  transferred_to_agent_id: number;
  transferred_from_agent: {
    id: number;
    name: string;
  };
  reason?: string;
  transferred_at: string;
}

// Notification Settings
export interface NotificationSettings {
  new_conversation: boolean;
  transfer_request: boolean;
  workspace_invite: boolean;
}
