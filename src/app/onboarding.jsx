import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import useUpload from "../utils/useUpload";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [upload] = useUpload();

  const [step, setStep] = useState(1); // 1 = terms, 2 = profile setup
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const canContinueTerms =
    agreedToTerms && agreedToRules && agreedToSafety && scrolledToBottom;

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    setScrolledToBottom(isAtBottom);
  };

  const handleAcceptTerms = () => {
    setStep(2);
  };

  const pickProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please enable photo library permissions"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setProfilePicture(result.assets[0]);
    }
  };

  const handleComplete = async () => {
    if (!username.trim()) {
      Alert.alert("Username Required", "Please enter a username");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = null;
      if (profilePicture) {
        const result = await upload({ reactNativeAsset: profilePicture });
        uploadedImageUrl = result.url;
      }

      const response = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          city,
          profilePicture: uploadedImageUrl,
        }),
      });

      if (response.ok) {
        router.replace("/(tabs)/map");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.error || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert("Error", "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: "#121212" }}>
        <StatusBar style="light" />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            Welcome to Urbex
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#BAC5E9",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Please read and accept our terms
          </Text>
        </View>

        {/* Scrollable Terms */}
        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={true}
        >
          <View
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginBottom: 12,
              }}
            >
              🛡️ Safety First
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#BAC5E9",
                lineHeight: 22,
              }}
            >
              • Always explore with a buddy{"\n"}• Respect private property and
              "No Trespassing" signs{"\n"}• Bring proper safety equipment{"\n"}•
              Never enter structurally unsafe buildings{"\n"}• Check local laws
              before exploring
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginBottom: 12,
              }}
            >
              🤝 Community Guidelines
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#BAC5E9",
                lineHeight: 22,
              }}
            >
              • Be respectful to other users{"\n"}• Do not share exact
              coordinates of sensitive locations publicly
              {"\n"}• Leave no trace - take only photos{"\n"}• Report
              inappropriate content{"\n"}• Share accurate information
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
                marginBottom: 12,
              }}
            >
              ⚖️ Legal Disclaimer
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#BAC5E9",
                lineHeight: 22,
              }}
            >
              By using this app, you acknowledge that urban exploration can be
              dangerous and illegal in some areas. You are solely responsible
              for your actions and safety. The app creators are not liable for
              any injuries, legal issues, or damages that may occur during
              exploration.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1E1E1E",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name={
                agreedToTerms ? "checkmark-circle" : "checkmark-circle-outline"
              }
              size={24}
              color={agreedToTerms ? "#FF4F8E" : "#BAC5E9"}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#FFFFFF",
                flex: 1,
              }}
            >
              I accept the terms and conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAgreedToRules(!agreedToRules)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1E1E1E",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name={
                agreedToRules ? "checkmark-circle" : "checkmark-circle-outline"
              }
              size={24}
              color={agreedToRules ? "#FF4F8E" : "#BAC5E9"}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#FFFFFF",
                flex: 1,
              }}
            >
              I understand and will follow the community rules
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAgreedToSafety(!agreedToSafety)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1E1E1E",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name={
                agreedToSafety ? "checkmark-circle" : "checkmark-circle-outline"
              }
              size={24}
              color={agreedToSafety ? "#FF4F8E" : "#BAC5E9"}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_400Regular",
                color: "#FFFFFF",
                flex: 1,
              }}
            >
              I will prioritize safety when exploring
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Continue Button */}
        <View
          style={{
            backgroundColor: "#121212",
            borderTopWidth: 1,
            borderColor: "#2A2A2A",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <TouchableOpacity
            onPress={handleAcceptTerms}
            disabled={!canContinueTerms}
            style={{
              height: 52,
              borderRadius: 26,
              backgroundColor: canContinueTerms ? "#FF4F8E" : "#444",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Profile Setup
  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Set Up Your Profile
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#BAC5E9",
            marginBottom: 32,
          }}
        >
          Help other explorers get to know you
        </Text>

        {/* Profile Picture */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <TouchableOpacity onPress={pickProfilePicture}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture.uri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  marginBottom: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#1E1E1E",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="camera" size={40} color="#BAC5E9" />
              </View>
            )}
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Inter_600SemiBold",
                color: "#FF4F8E",
              }}
            >
              {profilePicture ? "Change Photo" : "Add Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username - Required */}
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Username *
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          placeholderTextColor="#666"
          autoCapitalize="none"
          style={{
            backgroundColor: "#1E1E1E",
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#FFFFFF",
            marginBottom: 20,
          }}
        />

        {/* Bio */}
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Bio
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
          style={{
            backgroundColor: "#1E1E1E",
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#FFFFFF",
            marginBottom: 20,
            minHeight: 80,
            textAlignVertical: "top",
          }}
        />

        {/* City */}
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          City
        </Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Where are you based?"
          placeholderTextColor="#666"
          style={{
            backgroundColor: "#1E1E1E",
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#FFFFFF",
            marginBottom: 32,
          }}
        />

        {/* Complete Button */}
        <TouchableOpacity
          onPress={handleComplete}
          disabled={loading}
          style={{
            height: 52,
            borderRadius: 26,
            backgroundColor: loading ? "#666" : "#FF4F8E",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            {loading ? "Completing..." : "Complete Setup"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setStep(1)}
          style={{
            height: 52,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Inter_400Regular",
              color: "#BAC5E9",
            }}
          >
            Back to Terms
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}