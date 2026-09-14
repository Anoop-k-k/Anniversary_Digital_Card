import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    message: "Web_5 Backend API Service",
    endpoints: {
      story: "/api/story",
      auth: "/api/auth",
      upload: "/api/upload",
    },
  });
}
