/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from '..';
import * as PrivategptApi from '../../api';
import * as core from '../../core';

export const OpenAiChoice: core.serialization.ObjectSchema<
  serializers.OpenAiChoice.Raw,
  PrivategptApi.OpenAiChoice
> = core.serialization.object({
  finishReason: core.serialization.property(
    'finish_reason',
    core.serialization.string().optional(),
  ),
  delta: core.serialization
    .lazyObject(async () => (await import('..')).OpenAiDelta)
    .optional(),
  message: core.serialization
    .lazyObject(async () => (await import('..')).OpenAiMessage)
    .optional(),
  sources: core.serialization
    .list(core.serialization.lazyObject(async () => (await import('..')).Chunk))
    .optional(),
  index: core.serialization.number().optional(),
});

export declare namespace OpenAiChoice {
  interface Raw {
    finish_reason?: string | null;
    delta?: serializers.OpenAiDelta.Raw | null;
    message?: serializers.OpenAiMessage.Raw | null;
    sources?: serializers.Chunk.Raw[] | null;
    index?: number | null;
  }
}
