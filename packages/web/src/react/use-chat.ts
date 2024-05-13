import { PrivategptApi, PrivategptApiClient } from 'privategpt-sdk-utils';
import { useRef, useState } from 'react';

import { getAssistantResponse } from './utils';
import useSWR from 'swr';

type UseChatArgs = {
  messages: PrivategptApi.OpenAiMessage[];
  includeSources?: boolean;
  useContext?: boolean;
  onFinish?: ({
    completion,
    sources,
  }: {
    completion: string;
    sources: PrivategptApi.Chunk[];
  }) => void;
  client: PrivategptApiClient;
  enabled?: boolean;
  systemPrompt?: string;
  contextFilter?: PrivategptApi.ContextFilter;
};
export const useChat = ({
  messages,
  includeSources = false,
  useContext = false,
  onFinish,
  client,
  enabled = true,
  systemPrompt,
  contextFilter,
}: UseChatArgs) => {
  const [completion, setCompletion] = useState<string>('');
  const abortController = useRef<AbortController | null>(null);
  const queryKey = ['chat', messages] as const;
  const shouldFetch =
    enabled &&
    messages.length > 0 &&
    messages[messages.length - 1].content?.trim() !== '' &&
    messages[messages.length - 1].role === 'user';
  const fetcher = async () => {
    abortController.current = new AbortController();
    let sources: PrivategptApi.Chunk[] = [];
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
          contextFilter,
        },
        {},
        abortController.current.signal,
      ],
      onNewMessage: (openAiCompletion) => {
        const message = openAiCompletion.choices?.[0]?.delta?.content || '';
        const chunks =
          openAiCompletion.choices?.[0]?.sources?.reduce((acc, chunk) => {
            const chunkInAcc = acc.find(
              (c) =>
                c.document?.docMetadata?.file_name ===
                chunk.document?.docMetadata?.file_name,
            );
            if (chunk && !chunkInAcc) {
              acc.push(chunk);
            }
            return acc;
          }, [] as PrivategptApi.Chunk[]) ?? [];
        if (chunks.length > 0 && sources.length === 0) {
          sources = chunks;
        }
        setCompletion((prev) => prev + message);
      },
      abortController: abortController.current,
    });
    setCompletion('');
    onFinish?.({
      completion: result,
      sources,
    });
    return result;
  };
  const { isLoading, isValidating } = useSWR(
    queryKey,
    shouldFetch ? fetcher : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
  return {
    completion,
    isLoading: isLoading || isValidating,
    setCompletion,
    stop: () => {
      abortController.current?.abort();
      abortController.current = null;
      onFinish?.({
        completion: completion || '',
        sources: [],
      });
      setCompletion('');
    },
  };
};
