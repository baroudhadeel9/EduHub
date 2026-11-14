import { NextRequest, NextResponse } from "next/server";

const CLOUD_FALLBACK = "https://eduhub-api-uz1z.onrender.com/api";
const BACKEND_TARGET =
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/api"
    : CLOUD_FALLBACK);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetUrl = `${BACKEND_TARGET}/events/${id}/image`;

  try {
    let res = await fetch(targetUrl, { cache: "no-store" });
    if (!res.ok && (targetUrl.includes("127.0.0.1") || targetUrl.includes("localhost"))) {
      try {
        res = await fetch(`${CLOUD_FALLBACK}/events/${id}/image`, { cache: "no-store" });
      } catch {}
    }

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const data = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Failed to stream event image:", error);
    return new NextResponse(null, { status: 500 });
  }
}

