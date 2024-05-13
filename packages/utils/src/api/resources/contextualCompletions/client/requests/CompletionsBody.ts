/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as PrivategptApi from '../../../..';

/**
 * @example
 *     {
 *         prompt: "string",
 *         contextFilter: {}
 *     }
 */
export interface CompletionsBody {
  prompt: string;
  systemPrompt?: string;
  useContext?: boolean;
  contextFilter?: PrivategptApi.ContextFilter;
  includeSources?: boolean;
  stream?: boolean;
}