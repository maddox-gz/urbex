import { useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../utils/auth/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  const { isAuthenticated, isReady, signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#FF4F8E" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: "#121212" }}>
        <StatusBar style="light" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <Text
            style={{
              fontSize: 48,
              fontWeight: "700",
              color: "#FF4F8E",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Urbex
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#BAC5E9",
              textAlign: "center",
              marginBottom: 48,
              lineHeight: 26,
            }}
          >
            Discover and explore abandoned places around the world
          </Text>

          <TouchableOpacity
            onPress={() => signIn()}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 26,
              backgroundColor: "#FF4F8E",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <Redirect href="/(tabs)/map" />;
}
