import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { createGalleryItem, getAllGalleryItems, getGalleryItemById, updateGalleryItem, deleteGalleryItem, GalleryItem } from "@/lib/db/gallery.repository";
import { handleApiError, ErrorType } from "@/lib/utils/error-handler";

// Admin emails for authorization
const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

// Helper function to check if user is admin
async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // First check if user has isAdmin flag set
  if (user.isAdmin === true) {
    return true;
  }
  
  // Fallback to email check
  return ADMIN_EMAILS.includes(user.email);
}

// GET /api/gallery - Get all gallery items with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const tag = searchParams.get('tag') || undefined;
    const color = searchParams.get('color') || undefined;
    const orientation = searchParams.get('orientation') || undefined;
    
    // Get gallery items
    const items = await getAllGalleryItems({ limit, tag, color, orientation });
    
    return NextResponse.json(items);
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/gallery - Create a new gallery item (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { type: ErrorType.AUTHORIZATION, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['src', 'alt', 'title', 'description', 'tags', 'height', 'orientation', 'color', 'gridSize'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          type: ErrorType.VALIDATION, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Create gallery item
    const item = await createGalleryItem(data);
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// GET /api/gallery/:id - Get a specific gallery item
export async function GET_ITEM(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Get gallery item
    const item = await getGalleryItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { type: ErrorType.NOT_FOUND, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// Note: This PUT endpoint should be in [id]/route.ts, not here
// Keeping this commented out to avoid confusion
/*
// PUT /api/gallery/:id - Update a gallery item (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { type: ErrorType.AUTHORIZATION, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Update gallery item
    const item = await updateGalleryItem(id, data);
    
    return NextResponse.json(item);
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}
*/

// Note: This DELETE endpoint should be in [id]/route.ts, not here
// Keeping this commented out to avoid confusion
/*
// DELETE /api/gallery/:id - Delete a gallery item (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { type: ErrorType.AUTHORIZATION, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Delete gallery item
    await deleteGalleryItem(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}
*/