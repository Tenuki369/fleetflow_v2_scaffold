"use client";

import { DocumentKind } from "@prisma/client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type LoadDocument = {
  id: string;
  kind: DocumentKind;
  fileName: string;
  sizeBytes: number | null;
  mimeType: string | null;
  createdAt: string;
};

type PresignResponse = {
  url: string;
  key: string;
  expiresAt: string;
};

const REQUIRED_KINDS: DocumentKind[] = ["RATE_CON", "BOL", "POD"];

function formatBytes(value: number | null): string {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatKind(kind: DocumentKind): string {
  return kind.replace("_", " ").toLowerCase();
}

export function LoadDocumentsPanel({
  loadId,
  documents: initialDocuments,
}: {
  loadId: string;
  documents: LoadDocument[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [documents, setDocuments] = useState(initialDocuments);
  const [kind, setKind] = useState<DocumentKind>("RATE_CON");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const coverage = useMemo(() => {
    const seen = new Set(documents.map((item) => item.kind));
    return REQUIRED_KINDS.map((requiredKind) => ({
      kind: requiredKind,
      complete: seen.has(requiredKind),
    }));
  }, [documents]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a file to upload");
      return;
    }

    try {
      const presignResponse = await fetch("/api/documents/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          loadId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });

      const presignData = (await presignResponse.json().catch(() => null)) as
        | ({ error?: string } & Partial<PresignResponse>)
        | null;

      if (!presignResponse.ok || !presignData?.url || !presignData.key) {
        throw new Error(presignData?.error ?? "Unable to prepare upload");
      }

      const uploadResponse = await fetch(presignData.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Storage upload failed");
      }

      const createResponse = await fetch(`/api/loads/${loadId}/documents`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          fileName: file.name,
          s3Key: presignData.key,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
        }),
      });

      const created = (await createResponse.json().catch(() => null)) as
        | ({ error?: string } & Partial<LoadDocument>)
        | null;

      if (!createResponse.ok || !created?.id || !created?.createdAt || !created.kind || !created.fileName) {
        throw new Error(created?.error ?? "Unable to register document");
      }

      setDocuments((current) => [created as LoadDocument, ...current]);
      setSuccess(`${file.name} uploaded`);
      setFile(null);
      startTransition(() => router.refresh());
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload document");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload rate confirmations, bills of lading, PODs, and invoice files.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {coverage.map((item) => (
            <span
              key={item.kind}
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                item.complete
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              {formatKind(item.kind)} {item.complete ? "ready" : "missing"}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleUpload} className="mt-6 grid gap-4 border-b border-slate-200 pb-6 md:grid-cols-[180px_1fr_auto]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as DocumentKind)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {Object.values(DocumentKind).map((value) => (
              <option key={value} value={value}>
                {formatKind(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">File</span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {documents.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id}>
                  <td className="px-4 py-3 text-slate-700">{formatKind(document.kind)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{document.fileName}</td>
                  <td className="px-4 py-3 text-slate-700">{formatBytes(document.sizeBytes)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(document.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/api/documents/${document.id}/download`}
                      className="text-sm font-medium text-slate-900 underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
