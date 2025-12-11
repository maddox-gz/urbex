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
    const { difficultyRating } = body;

    if (difficultyRating < 1 || difficultyRating > 5) {
      return Response.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Check if rating exists
    const existing = await sql`
      SELECT id FROM spot_difficulty_ratings WHERE spot_id = ${id} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Update existing rating
      await sql`
        UPDATE spot_difficulty_ratings 
        SET difficulty_rating = ${difficultyRating}
        WHERE spot_id = ${id} AND user_id = ${userId}
      `;
    } else {
      // Create new rating
      await sql`
        INSERT INTO spot_difficulty_ratings (spot_id, user_id, difficulty_rating)
        VALUES (${id}, ${userId}, ${difficultyRating})
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error rating spot:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
