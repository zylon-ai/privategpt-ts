import { PrivategptApi, Stream } from 'privategpt-sdk-utils';
import { ReadableStream, TransformStream } from 'stream/web';

import { Readable } from 'stream';

export class StreamingTextResponse extends Response {
  constructor(res: Readable, init?: ResponseInit) {
    let processedStream = res;
    super(processedStream as any, {
      ...init,
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...init?.headers,
      },
    });
  }
}

async function* streamable(
  stream: AsyncIterable<PrivategptApi.OpenAiCompletion>,
): AsyncGenerator<PrivategptApi.OpenAiCompletion> {
  for await (let chunk of stream) {
    yield chunk;
  }
}

function createTransformer(): TransformStream<PrivategptApi.OpenAiCompletion> {
  const textEncoder = new TextEncoder();

  return new TransformStream({
    async transform(message, controller): Promise<void> {
      controller.enqueue(textEncoder.encode(JSON.stringify(message)));
    },
  });
}

function readableFromAsyncIterable<T>(iterable: AsyncIterable<T>) {
  let it = iterable[Symbol.asyncIterator]();
  return new ReadableStream<T>({
    async pull(controller) {
      const { done, value } = await it.next();
      if (done) controller.close();
      else controller.enqueue(value);
    },

    async cancel(reason) {
      await it.return?.(reason);
    },
  });
}

export const streamToReadableStream = (
  stream: Stream<PrivategptApi.OpenAiCompletion>,
) => {
  return readableFromAsyncIterable(streamable(stream)).pipeThrough<Uint8Array>(
    createTransformer(),
  );
};
