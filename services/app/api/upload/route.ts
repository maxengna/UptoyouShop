import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/services/admin.service";

export async function OPTIONS(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  return new NextResponse(null, { status: 200, headers });
}

export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status, headers },
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400, headers },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400, headers },
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400, headers },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file content via magic bytes
    const MAGIC_BYTES: Record<string, Uint8Array> = {
      "image/jpeg": new Uint8Array([0xFF, 0xD8, 0xFF]),
      "image/png": new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
      "image/webp": new Uint8Array([0x52, 0x49, 0x46, 0x46]), // "RIFF"
    };

    const magic = MAGIC_BYTES[file.type];
    if (!magic || !magic.every((byte, i) => buffer[i] === byte)) {
      return NextResponse.json(
        { error: "File content does not match declared type" },
        { status: 400, headers },
      );
    }

    // Hardcode extension based on validated MIME type
    const EXTENSION_MAP: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const uniqueFilename = `${uuidv4()}.${EXTENSION_MAP[file.type]}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    console.log("Uploads directory:", uploadsDir);

    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log("Directory created/verified");
    } catch (dirError) {
      console.error("Directory creation error:", dirError);
      throw dirError;
    }

    // Write file to uploads directory
    const filePath = join(uploadsDir, uniqueFilename);
    console.log("File path:", filePath);

    try {
      await writeFile(filePath, buffer);
      console.log("File written successfully");
    } catch (writeError) {
      console.error("File write error:", writeError);
      throw writeError;
    }

    // Return the file URL
    const fileUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: fileUrl,
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      },
      { headers },
    );
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack",
    });

    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 },
      );
    }

    // For security, only allow deleting files from uploads directory
    const uploadsDir = resolve(process.cwd(), "public", "uploads");
    const fullPath = resolve(process.cwd(), "public", filePath);

    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Use fs/promises for delete operation
    const { unlink } = await import("fs/promises");
    await unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
