/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from '..';
import * as PrivategptApi from '../../api';
import * as core from '../../core';

export const HttpValidationError: core.serialization.ObjectSchema<
  serializers.HttpValidationError.Raw,
  PrivategptApi.HttpValidationError
> = core.serialization.object({
  detail: core.serialization
    .list(
      core.serialization.lazyObject(
        async () => (await import('..')).ValidationError,
      ),
    )
    .optional(),
});

export declare namespace HttpValidationError {
  interface Raw {
    detail?: serializers.ValidationError.Raw[] | null;
  }
}