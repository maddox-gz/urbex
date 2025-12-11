import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const spots = await sql`
      SELECT 
        s.*,
        (SELECT image_url FROM spot_images WHERE spot_id = s.id LIMIT 1) AS main_image,
        (SELECT COUNT(*) FROM spot_likes WHERE spot_id = s.id AND is_like = true) AS likes,
        (SELECT COUNT(*) FROM check_ins WHERE spot_id = s.id) AS check_ins
      FROM urbex_spots s
      WHERE s.id = ${id}
    `;

    if (spots.length === 0) {
      return Response.json({ error: "Spot not found" }, { status: 404 });
    }

    const spot = spots[0];

    // Get user's interaction with this spot
    let userHasLiked = false;
    let userHasCheckedIn = false;
    let userDifficultyRating = 0;

    if (userId) {
      const likes = await sql`
        SELECT is_like FROM spot_likes WHERE spot_id = ${id} AND user_id = ${userId}
      `;
      userHasLiked = likes.length > 0 && likes[0].is_like;

      const checkIns = await sql`
        SELECT id FROM check_ins WHERE spot_id = ${id} AND user_id = ${userId}
      `;
      userHasCheckedIn = checkIns.length > 0;

      const ratings = await sql`
        SELECT difficulty_rating FROM spot_difficulty_ratings WHERE spot_id = ${id} AND user_id = ${userId}
      `;
      userDifficultyRating =
        ratings.length > 0 ? ratings[0].difficulty_rating : 0;
    }

    // Get comments
    const comments = await sql`
      SELECT 
        c.id,
        c.comment_text,
        c.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM spot_comments c
      LEFT JOIN auth_users u ON c.user_id = u.id
      WHERE c.spot_id = ${id}
      ORDER BY c.created_at DESC
    `;

    return Response.json({
      spot: {
        ...spot,
        user_has_liked: userHasLiked,
        user_has_checked_in: userHasCheckedIn,
        user_difficulty_rating: userDifficultyRating,
        comments: comments || [],
      },
    });
  } catch (error) {
    console.error("Error fetching spot:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
