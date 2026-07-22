import { Redirect } from "expo-router";
import { useAuth } from "../src/features/auth/hooks";

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    return (
        <Redirect href={isAuthenticated ? "/(tabs)/feed" : "/(auth)/landing"} />
    );
}