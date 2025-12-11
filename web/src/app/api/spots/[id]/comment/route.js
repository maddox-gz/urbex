import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;
    const body = await request.json();
    const { commentText } = body;

    if (!commentText || !commentText.trim()) {
      return Response.json({ error: "Comment text required" }, { status: 400 });
    }

    await sql`
      INSERT INTO spot_comments (spot_id, user_id, comment_text)
      VALUES (${id}, ${userId}, ${commentText})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error posting comment:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
