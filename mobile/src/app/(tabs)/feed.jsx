import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";
import Header from "../../components/Header";
import SegmentedControl from "../../components/SegmentedControl";
import PostCard from "../../components/PostCard";
import useUser from "../../utils/useUser";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function FeedScreen() {
  const theme = useTheme();
  const { data: user } = useUser();
  const [selectedTab, setSelectedTab] = useState("Nearby");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const endpoint =
        selectedTab === "Nearby" ? "/api/feed/nearby" : "/api/feed/following";

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <Header title="Feed" showBorder={false} />

      <SegmentedControl
        options={["Nearby", "Following"]}
        selectedOption={selectedTab}
        onSelectionChange={setSelectedTab}
        style={{ marginHorizontal: 20, marginBottom: 16 }}
      />

      {loading && !refreshing ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FF4F8E" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF4F8E"
            />
          }
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
