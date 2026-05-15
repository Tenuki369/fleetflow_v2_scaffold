import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const UPLOAD_TTL_SECONDS = 60 * 5;
const DOWNLOAD_TTL_SECONDS = 60 * 60;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// Lazy-init so missing env vars at build time don't break `next build`.
let _s3: S3Client | null = null;
let _bucket: string | null = null;
function s3(): S3Client {
  if (_s3) return _s3;
  _bucket = requireEnv("S3_BUCKET");
  _s3 = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
          secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
        }
      : undefined,
  });
  return _s3;
}
function bucket(): string {
  if (!_bucket) s3();
  return _bucket!;
}

export interface UploadUrlInput {
  orgId: string;
  loadId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}
export interface UploadUrlResult { url: string; key: string; expiresAt: string; }

export async function createUploadUrl(input: UploadUrlInput): Promise<UploadUrlResult> {
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large (max ${MAX_UPLOAD_BYTES} bytes)`);
  }
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `orgs/${input.orgId}/loads/${input.loadId}/${randomUUID()}-${safeName}`;
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: input.mimeType,
    ContentLength: input.sizeBytes,
  });
  const url = await getSignedUrl(s3(), cmd, { expiresIn: UPLOAD_TTL_SECONDS });
  return { url, key, expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString() };
}

export interface DownloadUrlInput { key: string; fileName?: string; }
export async function createDownloadUrl(input: DownloadUrlInput): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: bucket(),
    Key: input.key,
    ResponseContentDisposition: input.fileName
      ? `attachment; filename="${input.fileName.replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(s3(), cmd, { expiresIn: DOWNLOAD_TTL_SECONDS });
}
