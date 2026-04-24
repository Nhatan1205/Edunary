import { ActivityType } from "../web-api-client.ts";

/**
 * Convert ActivityType numeric enum value to its key name string.
 * Uses TypeScript enum's built-in reverse mapping:
 *   ActivityType[0]   → "Login"
 *   ActivityType[205] → "ChangeUserRole"
 */
export const getActivityTypeLabel = (value) => ActivityType[value] ?? "Unknown";
