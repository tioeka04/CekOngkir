import { useCallback, useEffect, useState } from 'react';

import { chatApi } from '../api';
import type { ChatSessionSummary } from '../types/api';

/** Loads the signed-in user's chat history list (newest first). */
export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      setSessions(await chatApi.fetchSessions());
      setError(null);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
