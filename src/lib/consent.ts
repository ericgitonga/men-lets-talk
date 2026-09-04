// Bump the relevant constant whenever that form's consent checkbox copy changes, so a stored
// consentVersion accurately reflects what the submitter actually saw — see the Kenya DPA 2019
// compliance review (#28 §2). Always stamped server-side, never trusted from the client.
export const STORY_CONSENT_VERSION = "story-consent-v1";
export const REGISTRATION_CONSENT_VERSION = "registration-consent-v1";
export const SUBSCRIBE_CONSENT_VERSION = "subscribe-consent-v1";
