import { Stream, streamToReadableStream } from '..';

function createChunkDecoder() {
  const decoder = new TextDecoder();

  return function (chunk: Uint8Array | undefined): string {
    if (!chunk) return '';
    return decoder.decode(chunk, { stream: true });
  };
}
type GetAssistantResponse<T extends any[], R> = (...args: T) => R;

export async function getAssistantResponse<
  T extends any[],
  R extends Promise<Stream<any>>,
>({
  fn,
  args,
  onNewMessage,
  abortController,
}: {
  fn: GetAssistantResponse<T, R>;
  args: T;
  onNewMessage?: (message: string) => void;
  abortController?: AbortController;
}): Promise<string> {
  const stream = await fn(...args);
  const readableStream = streamToReadableStream(stream);
  const reader = readableStream.getReader();
  const decoder = createChunkDecoder();
  const loopRunner = true;
  let result = '';

  while (loopRunner) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    const decodedChunk = decoder(value);
    if (!decodedChunk) continue;
    result += decoder(value);
    onNewMessage?.(result);
    if (abortController === null) {
      reader.cancel();
      break;
    }
  }
  return result;
}
