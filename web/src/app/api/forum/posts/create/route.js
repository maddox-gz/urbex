import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    const post = await sql`
      INSERT INTO forum_posts (user_id, title, content, image_url)
      VALUES (${session.user.id}, ${title}, ${content}, ${imageUrl || null})
      RETURNING id, user_id, title, content, image_url, created_at
    `;

    // Get user info
    const user = await sql`
      SELECT id, username, name, image, is_admin
      FROM auth_users
      WHERE id = ${session.user.id}
    `;

    return Response.json({
      post: {
        ...post[0],
        username: user[0].username,
        user_name: user[0].name,
        user_image: user[0].image,
        is_admin: user[0].is_admin,
        likes: 0,
        comments: 0,
      },
    });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
