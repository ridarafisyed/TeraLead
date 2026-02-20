import { apiRequest } from '@/lib/api';

export type Message = {
  id: string;
  patientId: string;
  role: 'USER' | 'AI';
  content: string;
  createdAt: string;
};

export function listMessages(patientId: string, limit = 50) {
  return apiRequest<{ items: Message[] }>(`/patients/${patientId}/messages?limit=${limit}`);
}

export function sendChat(payload: { patientId: string; message: string }) {
  return apiRequest<{ reply: string }>('/chat', { method: 'POST', body: payload });
}
