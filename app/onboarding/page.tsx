"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const payload = (await res.json()) as { error?: string; redirectTo?: string };
    setIsSubmitting(false);

    if (!res.ok) {
      setError(payload.error ?? "We could not create your organization. Please try again.");
      return;
    }

    router.replace(payload.redirectTo ?? "/dispatch");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="font-semibold tracking-tight text-slate-950">FleetFlow</div>
        <UserButton />
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl items-center">
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            First organization
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Set up your carrier workspace.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            Create the organization that will own dispatch, loads, documents, invoices,
            and team access.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md">
            <label htmlFor="org-name" className="text-sm font-medium text-slate-800">
              Organization name
            </label>
            <input
              id="org-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
              autoComplete="organization"
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="Acme Freight LLC"
            />

            {error ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Creating..." : "Continue to dispatch"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
