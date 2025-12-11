import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";

export default function Header({
  title,
  showBorder = true,
  showBack = false,
  leftComponent = null,
  rightComponent = null,
}) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: theme.backgroundColor,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: theme.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ width: 40 }}>
          {leftComponent ||
            (showBack && (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.textPrimary}
                />
              </TouchableOpacity>
            ))}
        </View>

        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter_600SemiBold",
            color: theme.textPrimary,
          }}
        >
          {title}
        </Text>

        <View style={{ width: 40, alignItems: "flex-end" }}>
          {rightComponent}
        </View>
      </View>
    </>
  );
}
