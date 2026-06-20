import { NextResponse } from "next/server";

export function sendOk<T>(data: T, message = "성공", status = 200) {
  return NextResponse.json({ ok: true, status, message, data }, { status });
}

export function sendError(message: string, status = 400) {
  return NextResponse.json({ ok: false, status, message, data: null }, { status });
}

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
