import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(req, { params }) {
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

    const submissionId = parseInt(params.id);

    // Update submission status
    const result = await sql`
      UPDATE pending_spot_submissions
      SET status = 'rejected'
      WHERE id = ${submissionId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }

    return Response.json({ message: "Submission rejected" });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    return Response.json(
      { error: "Failed to reject submission" },
      { status: 500 },
    );
  }
}
