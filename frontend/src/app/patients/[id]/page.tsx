'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startTransition, useOptimistic, useState } from 'react';
import { getPatient } from '@/features/patients/patientApi';
import { listMessages, sendChat, type Message } from '@/features/chat/chatApi';

type OptimisticMessage = Message | { id: string; role: 'USER' | 'AI'; content: string; createdAt: string; pending: true; patientId: string };

export default function PatientChatPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const patientQuery = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId)
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', patientId],
    queryFn: () => listMessages(patientId)
  });

  const baseItems = messagesQuery.data?.items ?? [];
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<OptimisticMessage[], OptimisticMessage>(
    baseItems,
    (state, message) => [...state, message]
  );

  const sendMutation = useMutation({
    mutationFn: sendChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', patientId] });
    }
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/patients" className="text-sm text-brand-600">← Back to patients</Link>
          <h1 className="text-2xl font-semibold">{patientQuery.data?.name ?? 'Patient Chat'}</h1>
        </div>
      </div>

      <div className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-xl bg-white p-4 shadow">
        {messagesQuery.error ? <p className="text-sm text-red-600">{(messagesQuery.error as Error).message}</p> : null}
        {optimisticMessages.map((message) => (
          <div key={message.id} className={message.role === 'USER' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block rounded-lg px-3 py-2 ${
                message.role === 'USER' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {sendMutation.isPending ? <p className="text-sm text-slate-500">AI is typing...</p> : null}
      </div>

      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const message = text.trim();
          if (!message) return;
          setText('');

          startTransition(() => {
            addOptimisticMessage({
              id: `optimistic-${Date.now()}`,
              patientId,
              role: 'USER',
              content: message,
              createdAt: new Date().toISOString(),
              pending: true
            });
          });

          await sendMutation.mutateAsync({ patientId, message });
        }}
      >
        <input
          className="flex-1 rounded border px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button className="rounded bg-brand-500 px-4 py-2 text-white">Send</button>
      </form>
    </main>
  );
}
