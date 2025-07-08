import { NextRequest, NextResponse } from "next/server";
import { signUp, signIn } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP API ENDPOINT ===");
    const body = await request.json();
    console.log("Request body:", { ...body, idToken: body.idToken ? `${body.idToken.substring(0, 20)}...` : 'missing' });
    
    const { uid, email, name, idToken } = body;

    if (!uid || !email || !name || !idToken) {
      console.log("Missing required fields:", { uid: !!uid, email: !!email, name: !!name, idToken: !!idToken });
      return NextResponse.json(
        { error: "All fields are required", received: { uid: !!uid, email: !!email, name: !!name, idToken: !!idToken } },
        { status: 400 }
      );
    }

    // First create the user account
    const signUpResult = await signUp({ uid, email, name });

    if (!signUpResult.success) {
      return NextResponse.json(
        { error: signUpResult.message },
        { status: 400 }
      );
    }

    // Then sign them in to set the session cookie
    const signInResult = await signIn({ email, idToken });

    if (signInResult.success) {
      return NextResponse.json({
        success: true,
        message: "Account created and signed in successfully"
      });
    } else {
      return NextResponse.json(
        { error: signInResult.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
