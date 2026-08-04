type SupabaseEnvironment = {
  url: string;
  publishableKey: string;
};

function requireEnvironmentValue(name: string, value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}.`);
  }

  return normalizedValue;
}

function validateSupabaseUrl(value: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.",
    );
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must use the http or https protocol.",
    );
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

export const supabaseEnvironment: SupabaseEnvironment = Object.freeze({
  url: validateSupabaseUrl(
    requireEnvironmentValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
  ),
  publishableKey: requireEnvironmentValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
});
