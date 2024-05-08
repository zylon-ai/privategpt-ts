import { Buffer } from 'buffer';
import { OpenAiCompletion } from '../../api';
import { Readable } from 'stream';

export class StreamingTextResponse extends Response {
  constructor(res: ReadableStream, init?: ResponseInit) {
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
  stream: AsyncIterable<OpenAiCompletion>,
): AsyncGenerator<string> {
  for await (let chunk of stream) {
    if (chunk && chunk.choices && chunk.choices[0]) {
      yield chunk.choices[0].delta?.content!;
    }
  }
}

function createTransformer(): TransformStream<string> {
  const textEncoder = new TextEncoder();

  return new TransformStream({
    async transform(message, controller): Promise<void> {
      controller.enqueue(textEncoder.encode(message));
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

export const streamToReadableStream = (stream: Stream<OpenAiCompletion>) => {
  return readableFromAsyncIterable(streamable(stream)).pipeThrough<Uint8Array>(
    createTransformer(),
  );
};

export class Stream<T> implements AsyncIterable<T> {
  private stream: Readable;
  private parse: (val: unknown) => Promise<T>;
  private terminator: string;

  constructor({
    stream,
    parse,
    terminator,
  }: {
    stream: Readable;
    parse: (val: unknown) => Promise<T>;
    terminator: string;
  }) {
    this.stream = stream;
    this.parse = parse;
    this.terminator = terminator;
  }

  private async *iterMessages(): AsyncGenerator<T, void> {
    let previous = '';
    for await (const chunk of this.stream) {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      previous += bufferChunk;
      let terminatorIndex: number;

      while ((terminatorIndex = previous.indexOf(this.terminator)) >= 0) {
        const line = previous.slice(0, terminatorIndex).trimEnd();
        if (line) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') {
            terminatorIndex = -1;
            return;
          }
          const message = await this.parse(JSON.parse(data));
          yield message;
        }
        previous = previous.slice(terminatorIndex + 1);
      }
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T, void, unknown> {
    for await (const message of this.iterMessages()) {
      yield message;
    }
  }
}
