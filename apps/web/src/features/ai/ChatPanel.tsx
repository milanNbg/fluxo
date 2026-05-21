import { useEffect, useRef, useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from './useChat';
import { SuggestedQuestions } from './SuggestedQuestions';
import { Button } from '@/components/Button';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const {
    messages,
    streamingText,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
    clearConversation,
  } = useChat();

  const [input, setInput] = useState('');
  const user = useAppSelector(selectCurrentUser);
  const firstName = user?.name?.split(' ')[0] ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isOpen && !isStreaming) {
      inputRef.current?.focus();
    }
  }, [isOpen, isStreaming]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isStreaming) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isStreaming, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    void sendMessage(trimmed);
  };

  const handleSelectSuggestion = (question: string) => {
    if (isStreaming) return;
    void sendMessage(question);
  };

  const hasMessages = messages.length > 0 || streamingText.length > 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={isStreaming ? undefined : onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:border-l sm:border-gray-200 ${
          isOpen
            ? 'translate-x-0 translate-y-0'
            : 'translate-y-full sm:translate-x-full sm:translate-y-0'
        }`}
        aria-label="AI Assistant"
      >
        <div className="shrink-0 border-b border-gray-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-primary-700 text-lg">
                ✨
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-gray-900">AI Assistant</h2>
                <p className="truncate text-xs text-gray-500">Powered by Claude · Personalized</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {hasMessages && (
                <button
                  type="button"
                  onClick={clearConversation}
                  disabled={isStreaming}
                  className="rounded-lg px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isStreaming}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close AI assistant"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-5">
          {!hasMessages && (
            <div className="space-y-6">
              <div className="rounded-xl bg-linear-to-br from-primary-50 to-white p-5 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary-100 text-2xl">
                  ✨
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  {firstName ? `Hi, ${firstName}!` : 'Hi there!'}
                </h3>
                <p className="text-sm text-gray-600">
                  I'm your finance assistant. Ask me about your spending, savings, or how to improve
                  your finances.
                </p>
              </div>

              <SuggestedQuestions onSelect={handleSelectSuggestion} />
            </div>
          )}

          {hasMessages && (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role} content={msg.content} />
              ))}
              {streamingText && (
                <MessageBubble role="assistant" content={streamingText} isStreaming />
              )}
              {isStreaming && !streamingText && <ThinkingIndicator />}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask anything about your finances..."
              rows={1}
              disabled={isStreaming}
              maxLength={4000}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              className="flex-1 resize-none overflow-y-auto rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
            />
            {isStreaming ? (
              <Button type="button" variant="secondary" onClick={cancelStream}>
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                Send
              </Button>
            )}
          </div>
          <p className="mt-2 hidden text-center text-xs text-gray-400 sm:block">
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      </aside>
    </>
  );
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'border border-gray-200 bg-white text-gray-900 shadow-sm'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap wrap-break-word">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 wrap-break-word">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="ml-0.5 inline-block size-2 animate-pulse rounded-full bg-primary-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  );
}
