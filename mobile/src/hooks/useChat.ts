import { useCallback, useRef, useState } from 'react';

import { chatApi } from '../api';
import type { ChatMessage } from '../types/chat';
import { turnsToMessages } from '../utils/chatMessages';
import { generateUuid } from '../utils/uuid';

export const MAX_MESSAGE_LENGTH = 500;

interface UseChatOptions {
  /** Called after a message round-trip so the history list can refresh. */
  onMessageSent?: () => void;
}

/** Conversation state for one chat session; the server owns the history. */
export function useChat({ onMessageSent }: UseChatOptions = {}) {
  const [sessionId, setSessionId] = useState(generateUuid);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // Lets async results discard themselves after the user switched sessions.
  const activeSessionRef = useRef(sessionId);

  const activate = useCallback((id: string) => {
    activeSessionRef.current = id;
    setSessionId(id);
    setMessages([]);
    setError(null);
    setSending(false);
  }, []);

  const startNewChat = useCallback(() => activate(generateUuid()), [activate]);

  const openSession = useCallback(
    async (id: string) => {
      activate(id);
      setLoadingSession(true);
      try {
        const turns = await chatApi.fetchSessionTurns(id);
        if (activeSessionRef.current === id) setMessages(turnsToMessages(turns));
      } catch (caught) {
        if (activeSessionRef.current === id) setError(caught);
      } finally {
        if (activeSessionRef.current === id) setLoadingSession(false);
      }
    },
    [activate],
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const targetSession = activeSessionRef.current;
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      text,
      shipping: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setInput('');
    setError(null);
    setSending(true);

    try {
      const reply = await chatApi.sendMessage(text, targetSession);
      if (activeSessionRef.current !== targetSession) return;
      const botMessage: ChatMessage = {
        id: `local-${Date.now()}-bot`,
        role: 'bot',
        text: reply.reply,
        shipping: reply.shipping,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, botMessage]);
      onMessageSent?.();
    } catch (caught) {
      if (activeSessionRef.current !== targetSession) return;
      // Roll back so the user can edit and resend the same text.
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setInput(text);
      setError(caught);
    } finally {
      if (activeSessionRef.current === targetSession) setSending(false);
    }
  }, [input, sending, onMessageSent]);

  return {
    sessionId,
    messages,
    input,
    setInput,
    sending,
    loadingSession,
    error,
    dismissError: () => setError(null),
    send,
    startNewChat,
    openSession,
  };
}
