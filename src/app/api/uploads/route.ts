import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function safeFilename(name: string) {
  const parts = name.toLowerCase().split(".");
  const ext = parts.length > 1 ? parts.pop() : "bin";
  const base = parts.join(".").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "upload";
  return `${base}.${ext}`;
}

function publicUrlForKey(key: string) {
  const publicBase = requiredEnv("CLOUDFLARE_R2_PUBLIC_DEV_URL").replace(/\/+$/, "");
  return `${publicBase}/${key}`;
}

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: requiredEnv("CLOUDFLARE_R2_ENDPOINT"),
    credentials: {
      accessKeyId: requiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
    }
  });
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder")?.toString() || "uploads").replace(/[^a-z0-9-]/gi, "-").toLowerCase();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Upload an image file: JPG, PNG, WEBP, GIF, or SVG." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
    }

    const now = new Date();
    const key = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
    const body = Buffer.from(await file.arrayBuffer());

    await r2Client().send(new PutObjectCommand({
      Bucket: requiredEnv("CLOUDFLARE_R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable"
    }));

    return NextResponse.json({
      key,
      url: publicUrlForKey(key),
      size: file.size,
      contentType: file.type
    });
  } catch (error) {
    console.error("upload route error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
