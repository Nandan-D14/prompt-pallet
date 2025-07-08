import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNIN API ENDPOINT ===");
    const body = await request.json();
    console.log("Request body:", { ...body, idToken: body.idToken ? `${body.idToken.substring(0, 20)}...` : 'missing' });
    
    const { email, idToken } = body;

    if (!email || !idToken) {
      console.log("Missing required fields:", { email: !!email, idToken: !!idToken });
      return NextResponse.json(
        { error: "Email and ID token are required", received: { email: !!email, idToken: !!idToken } },
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
