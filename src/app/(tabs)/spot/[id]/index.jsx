import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../../../hooks/useTheme";
import { useRouter, useLocalSearchParams } from "expo-router";
import useUser from "../../../../utils/useUser";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function SpotDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: user } = useUser();

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [comment, setComment] = useState("");
  const [difficultyRating, setDifficultyRating] = useState(0);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    fetchSpot();
  }, [id]);

  const fetchSpot = async () => {
    try {
      const response = await fetch(`/api/spots/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSpot(data.spot);
        setLiked(data.spot.user_has_liked || false);
        setCheckedIn(data.spot.user_has_checked_in || false);
        setDifficultyRating(data.spot.user_difficulty_rating || 0);
      }
    } catch (error) {
      console.error("Error fetching spot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);

    try {
      await fetch(`/api/spots/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLike: !liked }),
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCheckIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await fetch(`/api/spots/${id}/checkin`, {
        method: "POST",
      });

      if (response.ok) {
        setCheckedIn(true);
        Alert.alert("Success", "Check-in recorded!");
      }
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const handleRating = async (rating) => {
    setDifficultyRating(rating);

    try {
      await fetch(`/api/spots/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficultyRating: rating }),
      });
    } catch (error) {
      console.error("Error rating spot:", error);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch(`/api/spots/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText: comment }),
      });

      if (response.ok) {
        setComment("");
        fetchSpot();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
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

  if (!spot) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: theme.textSecondary,
          }}
        >
          Spot not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <StatusBar style={theme.statusBar} />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: insets.top + 16,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Image */}
        {spot.main_image && (
          <Image
            source={{ uri: spot.main_image }}
            style={{ width: "100%", height: 300 }}
            resizeMode="cover"
          />
        )}

        <View style={{ padding: 20 }}>
          {/* Title & Stats */}
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Inter_600SemiBold",
              color: theme.textPrimary,
              marginBottom: 8,
            }}
          >
            {spot.name}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons name="heart" size={18} color={theme.textSecondary} />
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                }}
              >
                {spot.likes || 0}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.textSecondary}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                }}
              >
                {spot.check_ins || 0} visited
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleLike}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 24,
                backgroundColor: liked ? "#FF4F8E" : theme.buttonBackground,
                borderWidth: 1,
                borderColor: liked ? "#FF4F8E" : theme.border,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="heart"
                size={20}
                color={liked ? "white" : theme.textPrimary}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_600SemiBold",
                  color: liked ? "white" : theme.textPrimary,
                }}
              >
                {liked ? "Liked" : "Like"}
              </Text>
            </TouchableOpacity>

            {!checkedIn && (
              <TouchableOpacity
                onPress={handleCheckIn}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#FF4F8E",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    color: "white",
                  }}
                >
                  I've Been Here
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          {spot.description && (
            <>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.textPrimary,
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  lineHeight: 22,
                  marginBottom: 24,
                }}
              >
                {spot.description}
              </Text>
            </>
          )}

          {/* What to Expect */}
          {spot.what_to_expect && (
            <>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.textPrimary,
                  marginBottom: 8,
                }}
              >
                What to Expect
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_400Regular",
                  color: theme.textSecondary,
                  lineHeight: 22,
                  marginBottom: 24,
                }}
              >
                {spot.what_to_expect}
              </Text>
            </>
          )}

          {/* Difficulty Rating */}
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: theme.textPrimary,
              marginBottom: 8,
            }}
          >
            Difficulty Rating
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => handleRating(rating)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor:
                    difficultyRating >= rating
                      ? "#FF4F8E"
                      : theme.buttonBackground,
                  borderWidth: 1,
                  borderColor:
                    difficultyRating >= rating ? "#FF4F8E" : theme.border,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color:
                      difficultyRating >= rating ? "white" : theme.textPrimary,
                  }}
                >
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comments */}
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: theme.textPrimary,
              marginBottom: 12,
            }}
          >
            Comments
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              placeholderTextColor={theme.textSecondary}
              style={{
                flex: 1,
                backgroundColor: theme.backgroundColor,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: theme.textPrimary,
              }}
            />
            <TouchableOpacity
              onPress={handleComment}
              disabled={!comment.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: comment.trim() ? "#FF4F8E" : theme.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {spot.comments &&
            spot.comments.map((c) => (
              <View
                key={c.id}
                style={{
                  backgroundColor: theme.backgroundColor,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_600SemiBold",
                    color: theme.textPrimary,
                    marginBottom: 4,
                  }}
                >
                  {c.user_name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: theme.textSecondary,
                  }}
                >
                  {c.comment_text}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
