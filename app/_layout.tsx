import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthListener, useAuth } from "../src/features/auth/hooks";

/**
 * Redirects between the (auth) and (tabs) route groups based on session
 * state. This is the ONE place route-protection logic lives — individual
 * screens don't need to check auth themselves.
 */
function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/landing");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/feed");
    }
  }, [isAuthenticated, isLoading, segments, router]);
}

export default function RootLayout() {
  useAuthListener();
  useProtectedRoute();

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="manage-interests" />
        <Stack.Screen name="my-storage" />
        <Stack.Screen name="study-schedule" />
      </Stack>
    </>
  );
}
