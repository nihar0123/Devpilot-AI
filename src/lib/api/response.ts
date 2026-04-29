import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function success<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function failure(error: string, status = 400) {
  return NextResponse.json<ApiFailure>({ ok: false, error }, { status });
}
