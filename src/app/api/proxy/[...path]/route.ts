import { NextRequest, NextResponse } from "next/server";

const CLOUD_FALLBACK = "https://eduhub-api-uz1z.onrender.com/api";

const BACKEND_TARGET =
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/api"
    : CLOUD_FALLBACK);

// Background Keep-Alive tracker to prevent Render free-tier sleep
let lastKeepAlive = 0;

function triggerBackgroundKeepAlive() {
  const now = Date.now();
  if (now - lastKeepAlive > 7 * 60 * 1000) {
    lastKeepAlive = now;
    fetch(`${CLOUD_FALLBACK}/health`, { cache: "no-store" }).catch(() => {});
  }
}

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

  // Trigger non-blocking keep-alive ping to keep the cloud server warm
  triggerBackgroundKeepAlive();

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

  let upstreamRes: Response | null = null;

  try {
    upstreamRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
    });
  } catch (err: unknown) {
    // If local development backend is unreachable, automatically fallback to live cloud API
    if (targetUrl.includes("127.0.0.1") || targetUrl.includes("localhost")) {
      try {
        const fallbackUrl = `${CLOUD_FALLBACK}/${pathStr}${search}`;
        upstreamRes = await fetch(fallbackUrl, {
          method,
          headers: forwardHeaders,
          body,
          cache: "no-store",
        });
      } catch (fallbackErr) {
        console.error("Cloud fallback error:", fallbackErr);
      }
    }

    // If server was cold/sleeping, wait 2 seconds and retry once before giving up
    if (!upstreamRes) {
      try {
        await new Promise((r) => setTimeout(r, 2000));
        const retryUrl = targetUrl.includes("127.0.0.1") || targetUrl.includes("localhost")
          ? `${CLOUD_FALLBACK}/${pathStr}${search}`
          : targetUrl;
        upstreamRes = await fetch(retryUrl, {
          method,
          headers: forwardHeaders,
          body,
          cache: "no-store",
        });
      } catch (retryErr) {
        console.error("Wake-up retry failed:", retryErr);
      }
    }

    if (!upstreamRes) {
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

  const resData = await upstreamRes.arrayBuffer();

    const resHeaders = new Headers();
    const upContentType = upstreamRes.headers.get("content-type");
    if (upContentType) {
      resHeaders.set("Content-Type", upContentType);
    }
    const upContentDisposition = upstreamRes.headers.get("content-disposition");
    if (upContentDisposition) {
      resHeaders.set("Content-Disposition", upContentDisposition);
    }
    resHeaders.set("Content-Length", String(resData.byteLength));

    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    resHeaders.set("Access-Control-Allow-Headers", "*");

    return new NextResponse(resData, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
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
