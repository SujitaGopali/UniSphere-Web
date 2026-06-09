interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponseHelper {
  static success<T>(
    status: number,
    message: string,
    data?: T,
    meta?: Record<string, unknown>
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      status,
      success: true,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (meta !== undefined) {
      response.meta = meta;
    }

    return response;
  }

  static error(
    status: number,
    message: string,
    data?: unknown
  ): ApiResponse {
    const response: ApiResponse = {
      status,
      success: false,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    return response;
  }
}
