/**
 * Typed access to environment variables. Expo's CLI has built-in support for
 * .env files — any var prefixed EXPO_PUBLIC_ is automatically injected into
 * process.env at bundle time. No dotenv package or app.config.ts needed.
 * Never read process.env directly elsewhere in the app — go through this file.
 */
type Extra = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function getExtra(): Extra {
  const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Did you create a .env.local and restart `expo start -c`?"
    );
  }

  if (!supabaseUrl.startsWith("http")) {
    throw new Error(
      `Invalid EXPO_PUBLIC_SUPABASE_URL — expected https://<ref>.supabase.co, got: "${supabaseUrl}". ` +
        "Check .env.local for stray quotes, a missing https://, or a secret key pasted in place of the URL."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export const env = getExtra();
