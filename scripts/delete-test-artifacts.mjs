// Deletes every Sanity document flagged `testArtifact: true` (mlt-cms's QA-only Studio
// checkbox on subscriber/story/registration — see mlt-cms#25/men-lets-talk#100).
//
// Manual verification of a Sanity-backed write path (subscribe/share-story/register) against
// the real production dataset — the documented pattern for every such feature, since CI has no
// write token — leaves real documents behind unless someone remembers to delete them by hand.
// That happened repeatedly: 12 stray draft "Anonymous" story submissions and 23 stray
// test@example.com subscribers were found sitting in production on 2026-09-05. The fix: tick
// `Test artifact (QA only)` in Studio on anything created purely for verification, then run
// this script once done testing, instead of deleting by hand or guessing at "test-looking" data.
//
// Usage:
//   node --env-file=.env.local scripts/delete-test-artifacts.mjs           # dry run, lists matches
//   node --env-file=.env.local scripts/delete-test-artifacts.mjs --yes     # actually deletes

import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "9ks0sgl2";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("SANITY_API_WRITE_TOKEN is not set — nothing to authenticate with.");
  process.exit(1);
}

// perspective: "raw" — share-story submissions are always unpublished drafts, and the default
// query perspective excludes those, which would silently leave them undeleted.
const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
  perspective: "raw",
});

const confirmed = process.argv.includes("--yes");

const docs = await client.fetch("*[testArtifact == true]{_id, _type}");

if (docs.length === 0) {
  console.log("No documents flagged testArtifact: true. Nothing to do.");
  process.exit(0);
}

console.log(`${docs.length} flagged document(s):`);
for (const doc of docs) console.log(`  ${doc._type}\t${doc._id}`);

if (!confirmed) {
  console.log("\nDry run — pass --yes to actually delete these.");
  process.exit(0);
}

for (const doc of docs) {
  await client.delete(doc._id);
  console.log(`Deleted ${doc._type} ${doc._id}`);
}
console.log(`\nDeleted ${docs.length} document(s).`);
