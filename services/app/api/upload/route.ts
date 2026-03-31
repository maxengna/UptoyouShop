import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

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

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "products");
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
    const fileUrl = `/uploads/products/${uniqueFilename}`;

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
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 },
      );
    }

    // For security, only allow deleting files from uploads directory
    const allowedPath = filePath.startsWith("/uploads/products/");
    if (!allowedPath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const fullPath = join(process.cwd(), "public", filePath);

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
