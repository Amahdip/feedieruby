import { type ApiErrorResponse } from "@salamruby/types/errors";

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export interface ApiSuccessResponse<T = Record<string, unknown>> {
  data: T;
}
