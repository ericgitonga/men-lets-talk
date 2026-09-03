import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, writeToken } from "@/sanity/env";

// Editor-scoped token — this client can create/mutate documents. Import only from server-side
// code (API routes, Server Actions); "server-only" makes an accidental client-component import
// a build error rather than a leaked-token runtime bug.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
});
