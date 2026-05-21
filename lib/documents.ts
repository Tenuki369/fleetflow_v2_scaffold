import { DocumentKind } from "@prisma/client";
import { z } from "zod";

export const documentUploadIntentSchema = z.object({
  loadId: z.string().cuid(),
  fileName: z.string().min(1).max(256),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024),
});

export const documentCreateSchema = z.object({
  kind: z.nativeEnum(DocumentKind),
  fileName: z.string().min(1).max(256),
  s3Key: z.string().min(1).max(1024),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024).nullable().optional(),
  mimeType: z.string().min(1).max(255).nullable().optional(),
});

export function isValidDocumentKey(orgId: string, loadId: string, key: string): boolean {
  return key.startsWith(`orgs/${orgId}/loads/${loadId}/`);
}
