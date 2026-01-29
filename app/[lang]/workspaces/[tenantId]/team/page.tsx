"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { agentsApi } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  Trash2,
  Loader2,
  Circle,
  X,
  Crown,
} from 'lucide-react';
import type { Agent } from '@/lib/types/chat';

export default function TeamPage() {
  const params = useParams();
  const { agents, loadAgents } = useChat();
  const tenantId = Number(params.tenantId);

  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'agent'>('agent');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await loadAgents();
      } catch (err) {
        console.error('Failed to load agents:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [loadAgents]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);

    try {
      await agentsApi.invite(tenantId, { email: inviteEmail, role: inviteRole });
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteModal(false);
      await loadAgents();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send invitation';
      setError(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (agent: Agent, newRole: 'admin' | 'agent') => {
    try {
      await agentsApi.update(tenantId, agent.id, { role: newRole });
      await loadAgents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      setError(message);
    }
  };

  const handleRemove = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to remove ${agent.name} from this workspace?`)) {
      return;
    }

    try {
      await agentsApi.remove(tenantId, agent.id);
      setSuccess(`${agent.name} has been removed from the workspace`);
      await loadAgents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove agent';
      setError(message);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      default:
        return 'Offline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
              <p className="text-gray-500 dark:text-gray-400">
                {agents.length} member{agents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Invite Agent
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center justify-between">
            {success}
            <button onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Team List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {agent.avatar ? (
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <Circle
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-current',
                            getStatusColor(agent.status)
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </span>
                          {agent.is_owner && (
                            <span title="Owner">
                              <Crown className="h-4 w-4 text-yellow-500" />
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn('text-sm font-medium', getStatusColor(agent.status))}>
                      {getStatusLabel(agent.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.is_owner ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                        <Crown className="h-3 w-3" />
                        Owner
                      </span>
                    ) : (
                      <select
                        value={agent.role || 'agent'}
                        onChange={(e) => handleRoleChange(agent, e.target.value as 'admin' | 'agent')}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {!agent.is_owner && (
                      <button
                        onClick={() => handleRemove(agent)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Remove from workspace"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Legend */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Agent</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Can handle conversations and view basic workspace information.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Admin</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Full access including settings, team management, and AI configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'agent')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    isInviting
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  )}
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
