import { useColorScheme } from "react-native";

export const useTheme = () => {
  const colorScheme = useColorScheme();

  const theme = {
    light: {
      backgroundColor: "#FFFFFF",
      textPrimary: "#1A1A1A",
      textSecondary: "#616161",
      border: "#E8E8E8",
      segmentedControlBg: "#F7F7F7",
      statusBar: "dark",
      iconBackground: "#FFF5F8",
      notificationBg: "#F3F3F3",
      notificationIcon: "#666",
      buttonBorder: "#E4E4E4",
      buttonBackground: "#FFFFFF",
      tabBarBackground: "#FFFFFF",
      tabBarBorder: "#E8E8E8",
      tabBarActiveTint: "#FF4E8C",
      tabBarInactiveTint: "#616161",
    },
    dark: {
      backgroundColor: "#121212",
      textPrimary: "#FFFFFF",
      textSecondary: "#BAC5E9",
      border: "#1A1A1A",
      segmentedControlBg: "#1E1E1E",
      statusBar: "light",
      iconBackground: "#262626",
      notificationBg: "#262626",
      notificationIcon: "#BAC5E9",
      buttonBorder: "#262626",
      buttonBackground: "#1E1E1E",
      tabBarBackground: "#181818",
      tabBarBorder: "#1A1A1A",
      tabBarActiveTint: "#FF4E8C",
      tabBarInactiveTint: "#BAC5E9",
    },
  };

  return theme[colorScheme] || theme.light;
};
