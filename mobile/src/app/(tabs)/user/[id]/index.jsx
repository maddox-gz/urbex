import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../../../hooks/useTheme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FF4F8E" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <StatusBar style={theme.statusBar} />

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: insets.top + 16,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.buttonBackground,
          borderWidth: 1,
          borderColor: theme.border,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingTop: insets.top + 80,
        }}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Image
              source={{
                uri:
                  profile?.profile_picture || "https://via.placeholder.com/100",
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 16,
              }}
            />
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Inter_600SemiBold",
                color: theme.textPrimary,
                marginBottom: 8,
              }}
            >
              {profile?.name || "Unknown User"}
            </Text>
            {profile?.bio && (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  textAlign: "center",
                }}
              >
                {profile.bio}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={{
              height: 48,
              borderRadius: 24,
              backgroundColor: "#FF4F8E",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "white",
              }}
            >
              Follow
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
