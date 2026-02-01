import { apiClient } from './client';
import type {
  Tenant,
  Conversation,
  ChatMessage,
  Agent,
  AiConfiguration,
  KnowledgeBaseItem,
  ConversationFilters,
  SendMessageData,
  CreateTenantData,
  UpdateTenantData,
  InviteAgentData,
  UpdateAiConfigData,
  CreateKnowledgeBaseItemData,
  AgentStatusType,
  NotificationSettings,
  VisitorListItem,
  VisitorDetails,
  VisitorFilters,
  ConversationNote,
} from '../types/chat';

// Tenant/Workspace APIs
export const tenantsApi = {
  list: async () => {
    const response = await apiClient.get<{ status: string; data: Tenant[] }>('/tenants');
    return response.data;
  },

  get: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: Tenant }>(`/tenants/${tenantId}`);
    return response.data;
  },

  create: async (data: CreateTenantData) => {
    const response = await apiClient.post<{ status: string; data: Tenant }>('/tenants', data);
    return response.data;
  },

  update: async (tenantId: number, data: UpdateTenantData) => {
    const response = await apiClient.put<{ status: string; data: Tenant }>(`/tenants/${tenantId}`, data);
    return response.data;
  },

  delete: async (tenantId: number) => {
    const response = await apiClient.delete<{ status: string }>(`/tenants/${tenantId}`);
    return response.data;
  },

  getWidgetCode: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: { embed_code: string; tenant: Tenant } }>(
      `/tenants/${tenantId}/widget-code`
    );
    return response.data;
  },
};

// Agent APIs
export const agentsApi = {
  list: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: Agent[] }>(`/tenants/${tenantId}/agents`);
    return response.data;
  },

  invite: async (tenantId: number, data: InviteAgentData) => {
    const response = await apiClient.post<{ status: string; data: Agent }>(
      `/tenants/${tenantId}/agents/invite`,
      data
    );
    return response.data;
  },

  update: async (tenantId: number, agentId: number, data: { role?: string; is_active?: boolean }) => {
    const response = await apiClient.put<{ status: string }>(
      `/tenants/${tenantId}/agents/${agentId}`,
      data
    );
    return response.data;
  },

  remove: async (tenantId: number, agentId: number) => {
    const response = await apiClient.delete<{ status: string }>(
      `/tenants/${tenantId}/agents/${agentId}`
    );
    return response.data;
  },

  updateStatus: async (tenantId: number, status: AgentStatusType) => {
    const response = await apiClient.post<{ status: string; data: { status: AgentStatusType; last_activity_at: string } }>(
      `/tenants/${tenantId}/agents/status`,
      { status }
    );
    return response.data;
  },

  heartbeat: async (tenantId: number) => {
    const response = await apiClient.post<{ status: string; data: { status: AgentStatusType; last_activity_at: string } }>(
      `/tenants/${tenantId}/agents/heartbeat`
    );
    return response.data;
  },

  getNotificationSettings: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: NotificationSettings }>(
      `/tenants/${tenantId}/agents/me/notifications`
    );
    return response.data;
  },

  updateNotificationSettings: async (tenantId: number, settings: Partial<NotificationSettings>) => {
    const response = await apiClient.patch<{ status: string; data: NotificationSettings }>(
      `/tenants/${tenantId}/agents/me/notifications`,
      settings
    );
    return response.data;
  },

  getMyProfile: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: Agent }>(
      `/tenants/${tenantId}/agents/me/profile`
    );
    return response.data;
  },

  updateMyProfile: async (tenantId: number, data: { display_name?: string | null; display_avatar?: File | null; clear_avatar?: boolean }) => {
    const formData = new FormData();

    if (data.display_name !== undefined) {
      formData.append('display_name', data.display_name || '');
    }

    if (data.display_avatar) {
      formData.append('display_avatar', data.display_avatar);
    }

    if (data.clear_avatar) {
      formData.append('clear_avatar', '1');
    }

    const response = await apiClient.patch<{ status: string; data: Agent; message: string }>(
      `/tenants/${tenantId}/agents/me/profile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

// Conversation APIs
export const conversationsApi = {
  list: async (tenantId: number, filters?: ConversationFilters) => {
    const response = await apiClient.get<{
      status: string;
      data: {
        data: Conversation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>(`/tenants/${tenantId}/conversations`, { params: filters });
    return response.data;
  },

  getQueue: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: Conversation[] }>(
      `/tenants/${tenantId}/conversations/queue`
    );
    return response.data;
  },

  get: async (tenantId: number, conversationId: number) => {
    const response = await apiClient.get<{ status: string; data: Conversation }>(
      `/tenants/${tenantId}/conversations/${conversationId}`
    );
    return response.data;
  },

  accept: async (tenantId: number, conversationId: number) => {
    const response = await apiClient.post<{ status: string; data: Conversation }>(
      `/tenants/${tenantId}/conversations/${conversationId}/accept`
    );
    return response.data;
  },

  takeover: async (tenantId: number, conversationId: number) => {
    const response = await apiClient.post<{ status: string; data: Conversation }>(
      `/tenants/${tenantId}/conversations/${conversationId}/takeover`
    );
    return response.data;
  },

  transfer: async (tenantId: number, conversationId: number, agentId: number, reason?: string) => {
    const response = await apiClient.post<{ status: string }>(
      `/tenants/${tenantId}/conversations/${conversationId}/transfer`,
      { agent_id: agentId, reason }
    );
    return response.data;
  },

  decline: async (tenantId: number, conversationId: number) => {
    const response = await apiClient.post<{ status: string; message: string }>(
      `/tenants/${tenantId}/conversations/${conversationId}/decline`
    );
    return response.data;
  },

  close: async (tenantId: number, conversationId: number) => {
    const response = await apiClient.post<{ status: string }>(
      `/tenants/${tenantId}/conversations/${conversationId}/close`
    );
    return response.data;
  },
};

// Message APIs
export const messagesApi = {
  list: async (tenantId: number, conversationId: number, params?: { before_id?: number; after_id?: number; limit?: number }) => {
    const response = await apiClient.get<{ status: string; data: ChatMessage[] }>(
      `/tenants/${tenantId}/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  send: async (tenantId: number, conversationId: number, data: SendMessageData) => {
    const formData = new FormData();

    if (data.content) {
      formData.append('content', data.content);
    }

    if (data.files) {
      data.files.forEach((file) => {
        formData.append('files[]', file);
      });
    }

    const response = await apiClient.post<{ status: string; data: ChatMessage }>(
      `/tenants/${tenantId}/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  markRead: async (tenantId: number, conversationId: number, messageIds?: number[]) => {
    const response = await apiClient.post<{ status: string }>(
      `/tenants/${tenantId}/conversations/${conversationId}/messages/read`,
      messageIds ? { message_ids: messageIds } : {}
    );
    return response.data;
  },

  sendTyping: async (tenantId: number, conversationId: number, typing: boolean) => {
    const response = await apiClient.post<{ status: string }>(
      `/tenants/${tenantId}/conversations/${conversationId}/typing`,
      { typing }
    );
    return response.data;
  },
};

// AI Configuration APIs
export const aiConfigApi = {
  get: async (tenantId: number) => {
    const response = await apiClient.get<{ status: string; data: AiConfiguration | null }>(
      `/tenants/${tenantId}/ai`
    );
    return response.data;
  },

  update: async (tenantId: number, data: UpdateAiConfigData) => {
    const response = await apiClient.put<{ status: string; data: AiConfiguration }>(
      `/tenants/${tenantId}/ai`,
      data
    );
    return response.data;
  },

  test: async (tenantId: number, message: string) => {
    const response = await apiClient.post<{ status: string; data: { response: string; model: string; tokens_used: number } }>(
      `/tenants/${tenantId}/ai/test`,
      { message }
    );
    return response.data;
  },
};

// Knowledge Base APIs
export const knowledgeBaseApi = {
  list: async (tenantId: number, params?: { search?: string; type?: string; is_active?: boolean }) => {
    const response = await apiClient.get<{ status: string; data: KnowledgeBaseItem[] }>(
      `/tenants/${tenantId}/knowledge-base`,
      { params }
    );
    return response.data;
  },

  get: async (tenantId: number, itemId: number) => {
    const response = await apiClient.get<{ status: string; data: KnowledgeBaseItem }>(
      `/tenants/${tenantId}/knowledge-base/${itemId}`
    );
    return response.data;
  },

  create: async (tenantId: number, data: CreateKnowledgeBaseItemData) => {
    const response = await apiClient.post<{ status: string; data: KnowledgeBaseItem }>(
      `/tenants/${tenantId}/knowledge-base`,
      data
    );
    return response.data;
  },

  update: async (tenantId: number, itemId: number, data: Partial<CreateKnowledgeBaseItemData>) => {
    const response = await apiClient.put<{ status: string; data: KnowledgeBaseItem }>(
      `/tenants/${tenantId}/knowledge-base/${itemId}`,
      data
    );
    return response.data;
  },

  delete: async (tenantId: number, itemId: number) => {
    const response = await apiClient.delete<{ status: string }>(
      `/tenants/${tenantId}/knowledge-base/${itemId}`
    );
    return response.data;
  },

  bulkImport: async (tenantId: number, items: CreateKnowledgeBaseItemData[]) => {
    const response = await apiClient.post<{ status: string; data: { imported: number; failed: number } }>(
      `/tenants/${tenantId}/knowledge-base/import`,
      { items }
    );
    return response.data;
  },
};

// Notes APIs
export const notesApi = {
  list: async (tenantId: number, conversationId: number) => {
    const response = await apiClient.get<{ status: string; data: ConversationNote[] }>(
      `/tenants/${tenantId}/conversations/${conversationId}/notes`
    );
    return response.data;
  },

  create: async (tenantId: number, conversationId: number, content: string) => {
    const response = await apiClient.post<{ status: string; data: ConversationNote }>(
      `/tenants/${tenantId}/conversations/${conversationId}/notes`,
      { content }
    );
    return response.data;
  },

  delete: async (tenantId: number, conversationId: number, noteId: number) => {
    const response = await apiClient.delete<{ status: string }>(
      `/tenants/${tenantId}/conversations/${conversationId}/notes/${noteId}`
    );
    return response.data;
  },
};

// Visitor APIs
export const visitorsApi = {
  list: async (tenantId: number, filters?: VisitorFilters) => {
    const response = await apiClient.get<{
      status: string;
      data: {
        data: VisitorListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>(`/tenants/${tenantId}/visitors`, { params: filters });
    return response.data;
  },

  get: async (tenantId: number, visitorId: number) => {
    const response = await apiClient.get<{ status: string; data: VisitorDetails }>(
      `/tenants/${tenantId}/visitors/${visitorId}`
    );
    return response.data;
  },

  startChat: async (tenantId: number, visitorId: number, message: string) => {
    const response = await apiClient.post<{
      status: string;
      data: {
        conversation_id: number;
        message: ChatMessage;
      };
    }>(`/tenants/${tenantId}/visitors/${visitorId}/start-chat`, { message });
    return response.data;
  },
};

// Export all APIs
export const chatApi = {
  tenants: tenantsApi,
  agents: agentsApi,
  conversations: conversationsApi,
  messages: messagesApi,
  notes: notesApi,
  aiConfig: aiConfigApi,
  knowledgeBase: knowledgeBaseApi,
  visitors: visitorsApi,
};

export default chatApi;
