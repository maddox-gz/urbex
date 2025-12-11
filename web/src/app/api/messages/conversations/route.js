import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await sql`
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        user_name,
        user_avatar,
        last_message,
        last_message_time,
        unread_count
      FROM (
        SELECT 
          CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END AS other_user_id,
          u.name AS user_name,
          (SELECT profile_picture FROM user_profiles WHERE user_id = u.id) AS user_avatar,
          message_text AS last_message,
          created_at AS last_message_time,
          (SELECT COUNT(*) FROM direct_messages WHERE receiver_id = ${userId} AND sender_id = u.id AND is_read = false) AS unread_count
        FROM direct_messages m
        LEFT JOIN auth_users u ON u.id = CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
        ORDER BY created_at DESC
      ) AS conversations
      ORDER BY other_user_id, last_message_time DESC
    `;

    return Response.json({ conversations: conversations || [] });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
