import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/useTheme";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import useUpload from "../../../utils/useUpload";
import useUser from "../../../utils/useUser";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

export default function ForumScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const [upload, { loading: uploading }] = useUpload();
  const { data: currentUser } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Create post form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/forum/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching forum posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please enable photo library permissions",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setPostImage(result.assets[0]);
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing Fields", "Please enter a title and description");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (postImage) {
        const result = await upload({ reactNativeAsset: postImage });
        imageUrl = result.url;
      }

      // Create post
      const response = await fetch("/api/forum/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add new post to the top of the list
        setPosts([data.post, ...posts]);
        setShowCreateModal(false);
        setTitle("");
        setContent("");
        setPostImage(null);
      } else {
        Alert.alert("Error", "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <Header
        title="Forum"
        rightComponent={
          <TouchableOpacity onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add-circle" size={28} color="#FF4F8E" />
          </TouchableOpacity>
        }
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF4F8E"
            />
          }
        >
          {posts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            return (
              <TouchableOpacity
                key={post.id}
                onPress={() => setExpandedPostId(isExpanded ? null : post.id)}
                style={{
                  backgroundColor: theme.backgroundColor,
                  marginHorizontal: 20,
                  marginVertical: 8,
                  padding: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                {/* User Info */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  {post.user_image ? (
                    <Image
                      source={{ uri: post.user_image }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        marginRight: 10,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#FF4F8E",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Inter_600SemiBold",
                          color: "white",
                        }}
                      >
                        {(post.username ||
                          post.user_name ||
                          "U")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: "Inter_600SemiBold",
                          color: theme.textPrimary,
                        }}
                      >
                        {post.username || post.user_name || "Anonymous"}
                      </Text>
                      {post.is_admin && (
                        <View
                          style={{
                            backgroundColor: "#FF4F8E",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Inter_600SemiBold",
                              color: "white",
                            }}
                          >
                            ADMIN
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Post Title */}
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: theme.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  {post.title}
                </Text>

                {/* Post Content */}
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Inter_400Regular",
                    color: theme.textSecondary,
                    lineHeight: 22,
                    marginBottom: 12,
                  }}
                  numberOfLines={isExpanded ? undefined : 3}
                >
                  {post.content}
                </Text>

                {/* Post Image */}
                {isExpanded && post.image_url && (
                  <Image
                    source={{ uri: post.image_url }}
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                    resizeMode="cover"
                  />
                )}

                {/* Stats */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
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
                      size={18}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: theme.textSecondary,
                      }}
                    >
                      {post.likes || 0}
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
                      name="chatbubble"
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
                      {post.comments || 0}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#FF4F8E",
                    }}
                  >
                    {isExpanded ? "Tap to collapse" : "Tap to expand"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
          <Header
            title="Create Post"
            leftComponent={
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={theme.textPrimary} />
              </TouchableOpacity>
            }
          />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 20,
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: theme.textPrimary,
                marginBottom: 8,
                marginTop: 20,
              }}
            >
              Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter post title"
              placeholderTextColor={theme.textSecondary}
              style={{
                backgroundColor: theme.backgroundColor,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: theme.textPrimary,
                marginBottom: 20,
              }}
            />

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: theme.textPrimary,
                marginBottom: 8,
              }}
            >
              Description *
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              style={{
                backgroundColor: theme.backgroundColor,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: theme.textPrimary,
                marginBottom: 20,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />

            {/* Image */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: theme.textPrimary,
                marginBottom: 8,
              }}
            >
              Image (Optional)
            </Text>

            {postImage ? (
              <View style={{ position: "relative", marginBottom: 20 }}>
                <Image
                  source={{ uri: postImage.uri }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setPostImage(null)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  height: 120,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: theme.border,
                  borderStyle: "dashed",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.backgroundColor,
                  marginBottom: 20,
                }}
              >
                <Ionicons name="camera" size={32} color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: theme.textSecondary,
                    marginTop: 8,
                  }}
                >
                  Add Image
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={submitting || uploading}
              style={{
                height: 52,
                borderRadius: 26,
                backgroundColor: submitting || uploading ? "#666" : "#FF4F8E",
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
                {submitting || uploading ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
