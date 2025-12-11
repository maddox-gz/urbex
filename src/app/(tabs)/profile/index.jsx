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
import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../utils/auth/useAuth";
import { useRouter } from "expo-router";
import useUser from "../../../utils/useUser";
import Header from "../../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile/me");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setCheckIns(data.checkIns || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || userLoading || loading) {
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
      <Header
        title="Profile"
        rightComponent={
          <TouchableOpacity onPress={() => router.push("/(tabs)/messages")}>
            <Ionicons name="mail-outline" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Profile Content */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
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
                marginBottom: 4,
              }}
            >
              {user?.name || user?.email}
            </Text>
            {profile?.bio && (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                {profile.bio}
              </Text>
            )}
          </View>

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 24,
              paddingVertical: 20,
              backgroundColor: theme.backgroundColor,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.textPrimary,
                }}
              >
                {checkIns.length}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  marginTop: 4,
                }}
              >
                Visited
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.textPrimary,
                }}
              >
                {profile?.followers || 0}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  marginTop: 4,
                }}
              >
                Followers
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.textPrimary,
                }}
              >
                {profile?.following || 0}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  marginTop: 4,
                }}
              >
                Following
              </Text>
            </View>
          </View>

          {/* Visited Spots Grid */}
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: theme.textPrimary,
              marginBottom: 12,
            }}
          >
            Places Visited
          </Text>

          {checkIns.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Ionicons name="location" size={48} color={theme.textSecondary} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No places visited yet
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {checkIns.map((checkIn) => (
                <View
                  key={checkIn.id}
                  style={{
                    width: "31%",
                    aspectRatio: 1,
                    borderRadius: 8,
                    backgroundColor: theme.iconBackground,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {checkIn.spot_image ? (
                    <Image
                      source={{ uri: checkIn.spot_image }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                    />
                  ) : (
                    <Ionicons
                      name="image"
                      size={32}
                      color={theme.textSecondary}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={() => signOut()}
            style={{
              height: 52,
              borderRadius: 26,
              backgroundColor: theme.buttonBackground,
              borderWidth: 1,
              borderColor: theme.border,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FF4F8E",
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
