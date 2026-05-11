export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode: number };

export type ApiError = {
  error: string;
  message: string;
  statusCode: number;
};