import { useCallback, useRef, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectAccessToken } from '@/features/auth/authSlice';
import type { ChatMessage } from '@fluxo/shared';

interface ChatState {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function useChat() {
  const accessToken = useAppSelector(selectAccessToken);
  const [state, setState] = useState<ChatState>({
    messages: [],
    streamingText: '',
    isStreaming: false,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!accessToken || state.isStreaming) return;

      const userMessage: ChatMessage = { role: 'user', content };
      const newMessages = [...state.messages, userMessage];

      setState({
        messages: newMessages,
        streamingText: '',
        isStreaming: true,
        error: null,
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ messages: newMessages }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Server returned ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data) as
                | { type: 'chunk'; text: string }
                | { type: 'done' }
                | { type: 'error'; message: string };

              if (parsed.type === 'chunk') {
                accumulated += parsed.text;
                setState((prev) => ({ ...prev, streamingText: accumulated }));
              } else if (parsed.type === 'done') {
                setState({
                  messages: [
                    ...newMessages,
                    { role: 'assistant', content: accumulated },
                  ],
                  streamingText: '',
                  isStreaming: false,
                  error: null,
                });
                return;
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message);
              }
            } catch (err) {
              if (err instanceof SyntaxError) continue;
              throw err;
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            streamingText: '',
          }));
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          streamingText: '',
          error: message,
        }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    [accessToken, state.isStreaming, state.messages],
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearConversation = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      messages: [],
      streamingText: '',
      isStreaming: false,
      error: null,
    });
  }, []);

  return {
    messages: state.messages,
    streamingText: state.streamingText,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    cancelStream,
    clearConversation,
  };
}