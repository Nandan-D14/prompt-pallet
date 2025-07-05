import { NextResponse } from "next/server";
import { signOut } from "@/lib/actions/auth.action";
import { handleApiError } from "@/lib/utils/error-handler";

// POST /api/auth/signout - Sign out the current user
export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}