import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || "admin";
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASS || "love2026";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASS) {
      return NextResponse.json({
        success: true,
        token: "auth_token_love_anniversary_2026_valid",
        message: "Authentication successful",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error during authentication" },
      { status: 500 }
    );
  }
}
