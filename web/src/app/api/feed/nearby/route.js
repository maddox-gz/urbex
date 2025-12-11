import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Get recent check-ins as feed posts
    const posts = await sql`
      SELECT 
        c.id,
        c.spot_id,
        c.created_at AS timestamp,
        s.name AS spot_name,
        s.description,
        (SELECT image_url FROM spot_images WHERE spot_id = s.id LIMIT 1) AS image_url,
        (SELECT COUNT(*) FROM spot_likes WHERE spot_id = s.id AND is_like = true) AS likes,
        (SELECT COUNT(*) FROM check_ins WHERE spot_id = s.id) AS check_ins,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        (SELECT profile_picture FROM user_profiles WHERE user_id = u.id) AS user_avatar
      FROM check_ins c
      LEFT JOIN urbex_spots s ON c.spot_id = s.id
      LEFT JOIN auth_users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `;

    return Response.json({ posts: posts || [] });
  } catch (error) {
    console.error("Error fetching nearby feed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
