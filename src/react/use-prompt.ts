import { useRef, useState } from 'react';

import { PrivategptApiClient } from '..';
import { getAssistantResponse } from './utils';
import useSWR from 'swr';

type UsePromptArgs = {
  prompt: string;
  includeSources?: boolean;
  useContext?: boolean;
  onFinish?: (message: string) => void;
  client: PrivategptApiClient;
  enabled?: boolean;
  systemPrompt?: string;
};
export const usePrompt = ({
  prompt,
  includeSources = false,
  useContext = false,
  onFinish,
  client,
  systemPrompt,
  enabled = true,
}: UsePromptArgs) => {
  const [completion, setCompletion] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const queryKey = ['prompt', prompt] as const;
  const shouldFetch = enabled && prompt?.trim() !== '';
  const fetcher = async () => {
    abortController.current = new AbortController();
    if (!prompt) return '';
    setCompletion(null);
    const result = await getAssistantResponse({
      fn: client.contextualCompletions.promptCompletionStream.bind(
        client.contextualCompletions,
      ),
      args: [
        {
          prompt,
          includeSources,
          useContext,
          systemPrompt,
        },
        {},
        abortController.current.signal,
      ],
      onNewMessage: (message) => {
        setCompletion(message);
      },
      abortController: abortController.current,
    });
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
