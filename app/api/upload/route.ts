export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudniary";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { message: "Missing image data" },
        { status: 400 }
      );
    }
    
    const result = await cloudinary.uploader.upload(image, {
      folder: "profile_images",
      resource_type: "image",
    });

    return NextResponse.json(
      { url: result.secure_url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
      { status: 500 }
    );
  }
}

