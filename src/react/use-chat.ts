import { PrivategptApi, PrivategptApiClient } from '..';
import { useRef, useState } from 'react';

import { getAssistantResponse } from './utils';
import useSWR from 'swr';

type UseChatArgs = {
  messages: PrivategptApi.OpenAiMessage[];
  includeSources?: boolean;
  useContext?: boolean;
  onFinish?: (message: string) => void;
  client: PrivategptApiClient;
  enabled?: boolean;
  systemPrompt?: string;
};
export const useChat = ({
  messages,
  includeSources = false,
  useContext = false,
  onFinish,
  client,
  enabled = true,
  systemPrompt,
}: UseChatArgs) => {
  const [completion, setCompletion] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const queryKey = ['chat', messages] as const;
  const shouldFetch =
    enabled &&
    messages.length > 0 &&
    messages[messages.length - 1].content?.trim() !== '' &&
    messages[messages.length - 1].role === 'user';
  const fetcher = async () => {
    abortController.current = new AbortController();
    const result = await getAssistantResponse({
      fn: client.contextualCompletions.chatCompletionStream.bind(
        client.contextualCompletions,
      ),
      args: [
        {
          messages: systemPrompt
            ? [{ content: systemPrompt, role: 'system' }, ...messages]
            : messages,
          includeSources,
          useContext,
        },
        {},
        abortController.current.signal,
      ],
      onNewMessage: (message) => {
        setCompletion(message);
      },
      abortController: abortController.current,
    });
    setCompletion(null);
    onFinish?.(result);
    return result;
  };
  const { isLoading } = useSWR(queryKey, shouldFetch ? fetcher : null, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return {
    completion,
    isLoading,
    setCompletion,
    stop: () => {
      abortController.current?.abort();
      abortController.current = null;
      onFinish?.(completion || '');
      setCompletion(null);
    },
  };
};
