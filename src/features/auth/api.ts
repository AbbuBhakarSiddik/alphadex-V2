import { supabase } from "../../lib/supabase";
import type { AuthCredentials, Profile } from "./types";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

export async function signUp({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const delimiterIndex = Math.max(url.indexOf("#"), url.indexOf("?"));
  if (delimiterIndex === -1) return params;

  const queryString = url.substring(delimiterIndex + 1);
  const pairs = queryString.split("&");

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  return params;
}

export async function signInWithGoogle() {
  // Generate redirect URL using deep link scheme (e.g. alphadex://)
  const redirectTo = Linking.createURL("auth-callback", { scheme: "alphadex" });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  // Open WebBrowser session
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type === "success" && res.url) {
    const params = parseUrlParams(res.url);
    const { access_token, refresh_token } = params;

    if (access_token && refresh_token) {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) throw sessionError;
      return sessionData;
    } else {
      throw new Error("No session tokens found in redirect URL.");
    }
  } else if (res.type === "cancel") {
    throw new Error("Sign-in cancelled.");
  } else {
    throw new Error("Failed to complete browser authentication.");
  }
}

