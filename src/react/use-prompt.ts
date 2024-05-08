import { useRef, useState } from 'react';

import { PrivategptApiClient } from '..';
import { getAssistantResponse } from './utils';
import useSWR from 'swr';

type UsePromptArgs = {
  environment: string;
  prompt?: string;
  includeSources?: boolean;
  useContext?: boolean;
  onFinish?: (message: string) => void;
  client: PrivategptApiClient;
};
export const usePrompt = ({
  environment,
  prompt,
  includeSources = false,
  useContext = false,
  onFinish,
  client,
}: UsePromptArgs) => {
  const [completion, setCompletion] = useState<string | null>(null);
  const abortController = useRef(new AbortController());
  const queryKey = ['prompt', prompt] as const;
  const shouldFetch = !!environment && prompt && prompt?.trim() !== '';
  const fetcher = async () => {
    abortController.current = new AbortController();
    if (!prompt) return '';
    setCompletion(null);
    const result = await getAssistantResponse(
      client.contextualCompletions.promptCompletionStream.bind(
        client.contextualCompletions,
      ),
      [
        {
          prompt,
          includeSources,
          useContext,
        },
        {},
        abortController.current.signal,
      ],
      (message) => {
        setCompletion(message);
      },
    );
    onFinish?.(result);
    return result;
  };
  const { isLoading } = useSWR(queryKey, shouldFetch ? fetcher : null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return {
    completion,
    isLoading,
    clearCompletion: () => setCompletion(null),
    stop: () => {
      abortController.current.abort();
    },
  };
};