import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all pending submissions (admin only)
export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await sql`
      SELECT is_admin FROM auth_users WHERE id = ${session.user.id}
    `;

    if (!user[0]?.is_admin) {
      return Response.json(
        { error: "Forbidden - Admin only" },
        { status: 403 },
      );
    }

    const submissions = await sql`
      SELECT 
        s.*,
        u.username as submitted_by_username,
        u.name as submitted_by_name,
        COALESCE(
          json_agg(
            json_build_object('id', si.id, 'image_url', si.image_url)
          ) FILTER (WHERE si.id IS NOT NULL),
          '[]'
        ) as images
      FROM pending_spot_submissions s
      LEFT JOIN auth_users u ON s.submitted_by = u.id
      LEFT JOIN submission_images si ON s.id = si.submission_id
      WHERE s.status = 'pending'
      GROUP BY s.id, u.username, u.name
      ORDER BY s.created_at DESC
    `;

    return Response.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return Response.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
