import { PrivategptApi, PrivategptApiClient } from '..';
import { useRef, useState } from 'react';

import { getAssistantResponse } from './utils';
import useSWR from 'swr';

type UseChatArgs = {
  environment: string;
  messages: PrivategptApi.OpenAiMessage[];
  includeSources?: boolean;
  useContext?: boolean;
  onFinish?: (message: string) => void;
  client: PrivategptApiClient;
};
export const useChat = ({
  environment,
  messages,
  includeSources = false,
  useContext = false,
  onFinish,
  client,
}: UseChatArgs) => {
  const [completion, setCompletion] = useState<string | null>(null);
  const abortController = useRef(new AbortController());
  const queryKey = ['chat', messages] as const;
  const shouldFetch =
    !!environment &&
    messages.length > 0 &&
    messages[messages.length - 1].content?.trim() !== '' &&
    messages[messages.length - 1].role === 'user';
  const fetcher = async () => {
    abortController.current = new AbortController();
    const result = await getAssistantResponse(
      client.contextualCompletions.chatCompletionStream.bind(
        client.contextualCompletions,
      ),
      [
        {
          messages: queryKey[1],
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
    setCompletion(null);
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
    stop: () => {
      abortController.current.abort();
    },
  };
};
