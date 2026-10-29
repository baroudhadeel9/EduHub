import { NextRequest, NextResponse } from "next/server";

const BACKEND_TARGET = "https://eduhub-api-uz1z.onrender.com/api";

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_TARGET}/${pathStr}${search}`;

  const forwardHeaders = new Headers();

  const auth = req.headers.get("authorization");
  const queryToken = req.nextUrl.searchParams.get("token");
  if (auth) {
    forwardHeaders.set("Authorization", auth);
  } else if (queryToken) {
    forwardHeaders.set("Authorization", `Bearer ${queryToken}`);
  }

  const accept = req.headers.get("accept") || "*/*";
  forwardHeaders.set("Accept", accept);

  const contentType = req.headers.get("content-type");
  if (contentType) forwardHeaders.set("Content-Type", contentType);

  const method = req.method;

  let body: BodyInit | null = null;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const buffer = await req.arrayBuffer();
      if (buffer.byteLength > 0) {
        body = buffer;
      }
    } catch {
      body = null;
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
    });

    const resHeaders = new Headers();
    const upContentType = upstreamRes.headers.get("content-type");
    if (upContentType) {
      resHeaders.set("Content-Type", upContentType);
    }
    const upContentDisposition = upstreamRes.headers.get("content-disposition");
    if (upContentDisposition) {
      resHeaders.set("Content-Disposition", upContentDisposition);
    }
    const upContentLength = upstreamRes.headers.get("content-length");
    if (upContentLength) {
      resHeaders.set("Content-Length", upContentLength);
    }

    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    resHeaders.set("Access-Control-Allow-Headers", "*");

    const resData = await upstreamRes.arrayBuffer();

    return new NextResponse(resData, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    console.error("Next.js Proxy upstream error:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر الاتصال بسيرفر الباك إند حالياً. يرجى الانتظار ثوانٍ حتى يستيقظ السيرفر من وضع الخمول.",
      },
      {
        status: 502,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, ctx);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, ctx);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, ctx);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, ctx);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(req, ctx);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
