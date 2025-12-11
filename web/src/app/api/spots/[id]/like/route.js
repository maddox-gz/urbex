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
    const { isLike } = body;

    // Check if like exists
    const existing = await sql`
      SELECT id FROM spot_likes WHERE spot_id = ${id} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Update existing like
      await sql`
        UPDATE spot_likes 
        SET is_like = ${isLike}
        WHERE spot_id = ${id} AND user_id = ${userId}
      `;
    } else {
      // Create new like
      await sql`
        INSERT INTO spot_likes (spot_id, user_id, is_like)
        VALUES (${id}, ${userId}, ${isLike})
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
