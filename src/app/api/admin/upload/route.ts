import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  MAX_IMAGE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constant";
import {
  uploadImage,
  getImageVariants,
} from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Admin access required",
        },
      },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: "NO_FILE",
            message: "No file provided",
          },
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_TYPE",
            message: "File type not allowed",
          },
        },
        { status: 400 }
      );
    }

    // Validate size
    if (
      file.size >
      MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: `File must be under ${MAX_IMAGE_SIZE_MB}MB`,
          },
        },
        { status: 400 }
      );
    }

    // Convert File -> Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadImage(
      buffer,
      "ahf-auto-parts/products"
    );

    // Generate variants
    const variants = getImageVariants(
      result.public_id
    );

    return NextResponse.json({
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,

        variants,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        error: {
          code: "UPLOAD_FAILED",
          message: "Failed to upload image",
        },
      },
      { status: 500 }
    );
  }
}