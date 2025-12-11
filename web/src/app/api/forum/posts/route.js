import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const posts = await sql`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.image_url,
        p.created_at,
        u.username,
        u.name AS user_name,
        u.image AS user_image,
        u.is_admin,
        (SELECT COUNT(*) FROM forum_post_likes WHERE post_id = p.id) AS likes,
        (SELECT COUNT(*) FROM forum_post_comments WHERE post_id = p.id) AS comments
      FROM forum_posts p
      LEFT JOIN auth_users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    return Response.json({ posts: posts || [] });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
