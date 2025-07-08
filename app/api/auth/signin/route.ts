import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    const { email, idToken } = await request.json();

    if (!email || !idToken) {
      return NextResponse.json(
        { error: "Email and ID token are required" },
        { status: 400 }
      );
    }

    const result = await signIn({ email, idToken });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
