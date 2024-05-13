import { PrivategptApi, PrivategptApiClient } from 'privategpt-sdk-utils';
import { useRef, useState } from 'react';

import { getAssistantResponse } from './utils';
import useSWR from 'swr';

type UsePromptArgs = {
  prompt: string;
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
export const usePrompt = ({
  prompt,
  includeSources = false,
  useContext = false,
  onFinish,
  client,
  systemPrompt,
  enabled = true,
  contextFilter,
}: UsePromptArgs) => {
  const [completion, setCompletion] = useState<string>('');
  const abortController = useRef<AbortController | null>(null);
  const queryKey = ['prompt', prompt] as const;
  const shouldFetch = enabled && prompt?.trim() !== '';

  const fetcher = async () => {
    abortController.current = new AbortController();
    if (!prompt) return '';
    let sources: PrivategptApi.Chunk[] = [];
    setCompletion('');
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
    onFinish?.({
      completion: result,
      sources,
    });
    return result;
  };
  const { isLoading } = useSWR(queryKey, shouldFetch ? fetcher : null, {
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
      onFinish?.({
        completion: completion || '',
        sources: [],
      });
      setCompletion('');
    },
  };
};
