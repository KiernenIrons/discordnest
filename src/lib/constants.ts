/** How many servers can be listed for free before Stripe is required */
export const FREE_SLOT_LIMIT = 250;

/** Bump cooldown in milliseconds (2 hours) */
export const BUMP_COOLDOWN_MS = 2 * 60 * 60 * 1000;

/** Maximum number of custom tags a server can have */
export const MAX_CUSTOM_TAGS = 5;

/** Maximum number of tags total (predefined + custom) per server */
export const MAX_TAGS_PER_SERVER = 8;

/** Short description max length */
export const SHORT_DESC_MAX = 160;

/** Server description max length */
export const DESCRIPTION_MAX = 2000;

/** Default servers per page on home */
export const SERVERS_PER_PAGE = 20;
