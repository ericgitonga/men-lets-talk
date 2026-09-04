import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  // The dataset is private, so a token is required regardless — useCdn stays off since the
  // CDN doesn't serve authenticated requests.
  useCdn: false,
});
