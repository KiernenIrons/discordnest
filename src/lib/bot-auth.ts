import { NextRequest } from "next/server";

/**
 * Validates the x-bot-secret header on bot API routes.
 * Returns true if the request is authenticated as the bot.
 */
export function validateBotSecret(req: NextRequest): boolean {
  const secret = req.headers.get("x-bot-secret");
  const expected = process.env.BOT_API_SECRET;

  if (!expected) {
    console.error("BOT_API_SECRET env var is not set");
    return false;
  }

  return secret === expected;
}
