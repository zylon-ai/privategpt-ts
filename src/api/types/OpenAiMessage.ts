/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as PrivategptApi from '..';

/**
 * Inference result, with the source of the message.
 *
 * Role could be the assistant or system
 * (providing a default response, not AI generated).
 */
export interface OpenAiMessage {
  role?: PrivategptApi.OpenAiMessageRole;
  content?: string;
}
