import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi } from '../api/endpoints';
import type { ChatSessionSummary, ChatTurn, ShippingResult } from '../api/types';
import { useLanguage } from '../context/language-context';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  shipping: ShippingResult | null;
  timestamp: string;
}

const turnToMessages = (turn: ChatTurn): ChatMessage[] => [
  { id: `${turn.id}-u`, role: 'user', text: turn.userMessage, shipping: null, timestamp: turn.createdAt },
  { id: `${turn.id}-b`, role: 'bot', text: turn.botReply, shipping: turn.shipping, timestamp: turn.createdAt },
];

/** All chat state and side effects. Components only render what this hook returns. */
export function useChat(firstName: string) {
  const { t } = useLanguage();
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageCounter = useRef(0);

  const nextId = () => `local-${(messageCounter.current += 1)}`;

  const refreshSessions = useCallback(async () => {
    try {
      setSessions(await chatApi.listSessions());
    } catch {
      // The sidebar is a convenience; a failure here should not interrupt chatting.
    }
  }, []);

  const startNewChat = useCallback(() => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setError(null);
  }, []);

  const openSession = useCallback(
    async (id: string) => {
      setSessionId(id);
      setError(null);
      try {
        const turns = await chatApi.getSession(id);
        setMessages(turns.flatMap(turnToMessages));
      } catch {
        setError(t('chat.loadError'));
      }
    },
    [t],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      setError(null);
      setSending(true);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', text: trimmed, shipping: null, timestamp: new Date().toISOString() },
      ]);

      try {
        const reply = await chatApi.send(trimmed, sessionId);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'bot', text: reply.reply, shipping: reply.shipping, timestamp: new Date().toISOString() },
        ]);
        void refreshSessions();
      } catch {
        setError(t('chat.sendError'));
      } finally {
        setSending(false);
      }
    },
    [sending, sessionId, refreshSessions, t],
  );

  useEffect(() => {
    let cancelled = false;
    chatApi
      .listSessions()
      .then((list) => !cancelled && setSessions(list))
      .catch(() => undefined); // the sidebar is optional; chatting still works
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = t('chat.greeting', { name: firstName });

  return { sessionId, sessions, messages, sending, error, greeting, sendMessage, startNewChat, openSession };
}
