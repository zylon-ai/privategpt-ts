# PrivateGPT TypeScript SDK

The PrivateGPT TypeScript SDK is a powerful open-source library that allows developers to work with AI in a private and secure manner. This SDK provides a set of tools and utilities to interact with the PrivateGPT API and leverage its capabilities.

[Live demo](https://privategpt-react.vercel.app/)

[Live demo source code](https://github.com/frgarciames/privategpt-react)

## Installation web

```
npm install privategpt-sdk-web
```

## Installation node

```
npm install privategpt-sdk-node
```

## Usage (js or ts)

### Initialize client

First you need to initalize the `PrivategptApiClient`:
```ts
const pgptApiClient = new PrivategptApiClient({ environment: 'http://localhost:8001' });
```

### Ingest file

```ts
import { pgptApiClient } from 'your/path';

const file = getFileFromSomewhere();
const ingestResponse = await pgptApiClient.ingestion.ingestFile(file);
```

### Get ingested files

```ts
import { pgptApiClient } from 'your/path';

const ingestResponse = await pgptApiClient.ingestion.listIngested();
```

### Delete ingested file

```ts
import { pgptApiClient } from 'your/path';

await pgptApiClient.ingestion.deleteIngested(docId);
```

### Chat completion

```ts
import { pgptApiClient } from 'your/path';

// stream way
const stream = await pgptApiClient.completion.chatCompletionStream({
  messages: [
    {
      content: 'How are you',
      role: 'user'
    }
  ],
  includeSources: true,
  useContext: true
});
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
}
return result;

// async way
const openAiCompletionResponse = await pgptApiClient.completion.chatCompletionStream({
  messages: [
    {
      content: 'How are you',
      role: 'user'
    }
  ],
  includeSources: true,
  useContext: true
});
```

### Prompt completion

```ts
import { pgptApiClient } from 'your/path';

// stream way
const stream = await pgptApiClient.completion.promptCompletionStream({
  promt: 'Hello! Make a joke',
  includeSources: true,
  useContext: true
});
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
}
return result;

// async way
const openAiCompletionResponse = await pgptApiClient.completion.promptCompletion({
  promt: 'Hello! Make a joke',
  includeSources: true,
  useContext: true
});
```


### Get ingested files

```ts
import { pgptApiClient } from 'your/path';

const ingestResponse = await pgptApiClient.ingestion.listIngested();
```

### Delete ingested file

```ts
import { pgptApiClient } from 'your/path';

await pgptApiClient.ingestion.deleteIngested(docId);
```

### Chat completion

```ts
import { pgptApiClient } from 'your/path';

// stream way
const stream = await pgptApiClient.completion.chatCompletionStream({
  messages: [
    {
      content: 'How are you',
      role: 'user'
    }
  ],
  includeSources: true,
  useContext: true
});
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
}
return result;

// async way
const openAiCompletionResponse = await pgptApiClient.completion.chatCompletionStream({
  messages: [
    {
      content: 'How are you',
      role: 'user'
    }
  ],
  includeSources: true,
  useContext: true
});
```

### Prompt completion

```ts
import { pgptApiClient } from 'your/path';

// stream way
const stream = await pgptApiClient.completion.promptCompletionStream({
  promt: 'Hello! Make a joke',
  includeSources: true,
  useContext: true
});
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
}
return result;

// async way
const openAiCompletionResponse = await pgptApiClient.completion.promptCompletion({
  promt: 'Hello! Make a joke',
  includeSources: true,
  useContext: true
});
```

## Usage (react adapter)

### Initialize client

First you need to initalize the `PrivategptApiClient`:
```ts
const pgptApiClient = new PrivategptApiClient({ environment: 'http://localhost:8001' });
```

### useFiles (ingest file, delete file, get ingested files)

```tsx
import { pgptApiClient } from 'your/path';

const YourComponent = () => {
  const {
    addFile,
    isUploadingFile,
    isDeletingFile,
    files,
    deleteFile,
    isFetchingFiles,
    errorDeletingFile,
    errorFetchingFiles,
    errorUploadingFile,
  } = useFiles({
    client: pgptApiClient,
    fetchFiles: true // in case you don't want to fetch files automatically when using this hook
  });
}
```

### useChat (chat completion) 

```tsx
import { pgptApiClient } from 'your/path';

const YourComponent = () => {
  const {
    stop,
    isLoading,
    completion,
    setCompletion
  } = useChat({
    messages: [
      {
        content: 'Hello, how are you?',
        role: 'user'
      }
    ],
    includeSources: true,
    useContext: true,
    onFinish: () => {
      console.log('finished streaming');
    },
    client: pgptApiClient,
    systemPrompt: 'You are a character from Battlestar Galactica'
  });
}
```

### usePrompt (prompt completion) 

```tsx
import { pgptApiClient } from 'your/path';

const YourComponent = () => {
  const {
    stop,
    isLoading,
    completion,
    setCompletion
  } = useChat({
    prompt: 'Hello, make a joke in japanese',
    includeSources: true,
    useContext: true,
    onFinish: () => {
      console.log('finished streaming');
    },
    client: pgptApiClient,
    systemPrompt: 'You are a japanese chef'
  });
}
```