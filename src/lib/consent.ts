// Bump the relevant constant whenever that form's consent checkbox copy changes, so a stored
// consentVersion accurately reflects what the submitter actually saw — see the Kenya DPA 2019
// compliance review (#28 §2). Always stamped server-side, never trusted from the client.
// v2: added a Privacy Notice link once /privacy shipped (#86) — the copy itself changed, so
// the version bumps even though the substance of what's being consented to didn't.
export const STORY_CONSENT_VERSION = "story-consent-v2";
export const REGISTRATION_CONSENT_VERSION = "registration-consent-v2";
export const SUBSCRIBE_CONSENT_VERSION = "subscribe-consent-v2";
