# PrivateGPT TypeScript SDK

The PrivateGPT TypeScript SDK is a powerful open-source library that allows developers to work with AI in a private and secure manner. This SDK provides a set of tools and utilities to interact with the PrivateGPT API and leverage its capabilities.

## Installation

```
npm install privategpt-ts
```

## Usage

### Initialize client

First you need to initalize the `PrivategptApiClient`:
```ts
const pgptApiClient = new PrivategptApiClient({ environment: 'http://localhost:8001' });
```
Now you can use all the methods to interact with privategpt: ingest file, chat completion, prompt completion, etc

