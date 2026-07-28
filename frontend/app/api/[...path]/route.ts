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
  const backendBaseUrl = (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8089"
  ).replace(/\/$/, "");
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
    let body: ArrayBuffer | null = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      duplex: "half",
    } as RequestInit);

    const raw = await response.text();
    let data: unknown = null;

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        // Upstream returned plain text/HTML (e.g. Render "Not Found") — never crash on .json()
        console.error(
          `Proxy non-JSON response from ${url} (${response.status}):`,
          raw.slice(0, 200)
        );
        return NextResponse.json(
          {
            success: false,
            message:
              response.status === 404
                ? "Backend API not found. Check API_BASE_URL / NEXT_PUBLIC_API_BASE_URL on Render."
                : "Backend returned a non-JSON response",
            upstreamStatus: response.status,
            upstreamBody: raw.slice(0, 300),
          },
          { status: response.status >= 400 ? response.status : 502 }
        );
      }
    }

    return NextResponse.json(data ?? {}, { status: response.status });
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Proxy error connecting to backend API",
        backendBaseUrl,
      },
      { status: 502 }
    );
  }
}
