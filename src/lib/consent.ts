// Bump this whenever the consent checkbox copy on the story-submission form changes, so a
// stored consentVersion accurately reflects what the submitter actually saw — see the Kenya
// DPA 2019 compliance review (#28 §2). Stamped server-side, never trusted from the client.
export const STORY_CONSENT_VERSION = "story-consent-v1";
