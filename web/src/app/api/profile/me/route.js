import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile
    const profiles = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;

    const profile = profiles[0] || null;

    // Get check-ins with spot details
    const checkIns = await sql`
      SELECT 
        c.id,
        c.spot_id,
        c.created_at,
        s.name AS spot_name,
        (SELECT image_url FROM spot_images WHERE spot_id = s.id LIMIT 1) AS spot_image
      FROM check_ins c
      LEFT JOIN urbex_spots s ON c.spot_id = s.id
      WHERE c.user_id = ${userId}
      ORDER BY c.created_at DESC
    `;

    // Get follower/following counts
    const followerCount = await sql`
      SELECT COUNT(*) AS count FROM follows WHERE following_id = ${userId}
    `;

    const followingCount = await sql`
      SELECT COUNT(*) AS count FROM follows WHERE follower_id = ${userId}
    `;

    return Response.json({
      profile: {
        ...profile,
        followers: parseInt(followerCount[0]?.count || 0),
        following: parseInt(followingCount[0]?.count || 0),
      },
      checkIns: checkIns || [],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
