import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export class ApiResponseHelper {
  static success<T>(data: T, message = 'Success', status = 200) {
    const responseBody: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return NextResponse.json(responseBody, { status });
  }

  static error(message = 'Internal Server Error', status = 500, errors: unknown = null) {
    const responseBody: ApiResponse = {
      success: false,
      message,
    };

    // Penanganan spread aman tanpa memicu TS2698
    if (errors !== null && errors !== undefined) {
      responseBody.errors = errors;
    }

    return NextResponse.json(responseBody, { status });
  }

  static badRequest(message = 'Bad Request', errors: unknown = null) {
    return this.error(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message = 'Resource Not Found') {
    return this.error(message, 404);
  }
}