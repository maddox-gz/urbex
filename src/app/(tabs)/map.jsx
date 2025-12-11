import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const mapRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWhatToExpect, setShowWhatToExpect] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Fetch spots
      const response = await fetch("/api/spots/list");
      if (response.ok) {
        const data = await response.json();
        setSpots(data.spots || []);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDirections = (lat, lng) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;
    const label = selectedSpot?.name || "Urbex Location";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
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
      <StatusBar style="dark" />

      {location ? (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={location}
            showsUserLocation
            showsMyLocationButton
            onPress={() => setSelectedSpot(null)}
          >
            {spots.map((spot) => (
              <Marker
                key={spot.id}
                coordinate={{
                  latitude: parseFloat(spot.latitude),
                  longitude: parseFloat(spot.longitude),
                }}
                onPress={() => setSelectedSpot(spot)}
              >
                <View
                  style={{
                    backgroundColor: "#FF4F8E",
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 3,
                    borderColor: "white",
                  }}
                >
                  <Ionicons name="location" size={24} color="white" />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Selected Spot Details */}
          {selectedSpot && (
            <View
              style={{
                position: "absolute",
                bottom: insets.bottom + 20,
                left: 20,
                right: 20,
                backgroundColor: theme.backgroundColor,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  onPress={() => setSelectedSpot(null)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    zIndex: 10,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.iconBackground,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: theme.textPrimary,
                    marginBottom: 12,
                    paddingRight: 40,
                  }}
                >
                  {selectedSpot.name}
                </Text>

                {selectedSpot.description && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: theme.textSecondary,
                      lineHeight: 20,
                      marginBottom: 16,
                    }}
                  >
                    {selectedSpot.description}
                  </Text>
                )}

                {/* What to Expect - Click to Reveal */}
                {selectedSpot.what_to_expect && (
                  <View style={{ marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => setShowWhatToExpect(!showWhatToExpect)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: theme.iconBackground,
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: showWhatToExpect ? 12 : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: "Inter_600SemiBold",
                          color: "#FF4F8E",
                        }}
                      >
                        {showWhatToExpect
                          ? "Hide What's Inside"
                          : "Click to Reveal What's Inside"}
                      </Text>
                      <Ionicons
                        name={showWhatToExpect ? "eye-off" : "eye"}
                        size={20}
                        color="#FF4F8E"
                      />
                    </TouchableOpacity>

                    {showWhatToExpect && (
                      <View
                        style={{
                          backgroundColor: theme.iconBackground,
                          padding: 12,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Inter_400Regular",
                            color: theme.textSecondary,
                            lineHeight: 20,
                          }}
                        >
                          {selectedSpot.what_to_expect}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Stats */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name="heart"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: theme.textSecondary,
                      }}
                    >
                      {selectedSpot.likes || 0}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: theme.textSecondary,
                      }}
                    >
                      {selectedSpot.check_ins || 0} visited
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() =>
                      openDirections(
                        selectedSpot.latitude,
                        selectedSpot.longitude,
                      )
                    }
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#FF4F8E",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons name="navigate" size={18} color="white" />
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Inter_600SemiBold",
                        color: "white",
                      }}
                    >
                      Get Directions
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSpot(null);
                      router.push(`/(tabs)/spot/${selectedSpot.id}`);
                    }}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: theme.buttonBackground,
                      borderWidth: 1,
                      borderColor: theme.border,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color={theme.textPrimary}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Inter_600SemiBold",
                        color: theme.textPrimary,
                      }}
                    >
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Ionicons
            name="location-outline"
            size={64}
            color={theme.textSecondary}
          />
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: theme.textPrimary,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Location Permission Required
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: theme.textSecondary,
              textAlign: "center",
            }}
          >
            Please enable location permissions to view the map
          </Text>
        </View>
      )}
    </View>
  );
}
