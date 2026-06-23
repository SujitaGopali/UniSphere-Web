import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, { path }: { path: string[] }) {
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";
  const pathString = path.join("/");
  const url = `${backendBaseUrl}/api/${pathString}${request.nextUrl.search}`;

  const token = request.cookies.get("auth_token")?.value;
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    let body: any = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      duplex: "half",
    } as any);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Proxy error connecting to backend API" },
      { status: 502 }
    );
  }
}
