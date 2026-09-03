// projectId/dataset aren't secret, so a fallback default (rather than throwing when unset) is
// safe — and necessary, since CI builds and runs this app with zero environment configuration
// at all (see ONBOARDING.md).
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "9ks0sgl2";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-01-01";

// The mlt-cms dataset is private (Stories carries consent/PII considerations), so every
// read — including public marketing content — needs this token, unlike a typical
// public-dataset Sanity setup. Deliberately NOT required here (unlike projectId/dataset
// above): CI builds and runs this app with zero cloud credentials (see ONBOARDING.md), so
// callers must treat a missing token as "Sanity isn't configured" and degrade gracefully
// (e.g. render an empty state) rather than crash the build.
export const readToken = process.env.SANITY_API_READ_TOKEN;

// Editor-scoped — only used server-side (API routes), never imported into a client component.
// Same "missing means not configured" contract as readToken: CI has neither.
export const writeToken = process.env.SANITY_API_WRITE_TOKEN;
