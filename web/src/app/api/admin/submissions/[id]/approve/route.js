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

    // Get submission details
    const submission = await sql`
      SELECT * FROM pending_spot_submissions WHERE id = ${submissionId}
    `;

    if (submission.length === 0) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }

    const sub = submission[0];

    // Create the spot
    const newSpot = await sql`
      INSERT INTO urbex_spots (name, description, latitude, longitude, what_to_expect, created_by)
      VALUES (${sub.name}, ${sub.description}, ${sub.latitude}, ${sub.longitude}, ${sub.what_to_expect}, ${sub.submitted_by})
      RETURNING id
    `;

    const spotId = newSpot[0].id;

    // Copy images from submission_images to spot_images
    const submissionImages = await sql`
      SELECT image_url FROM submission_images WHERE submission_id = ${submissionId}
    `;

    for (const img of submissionImages) {
      await sql`
        INSERT INTO spot_images (spot_id, image_url, uploaded_by)
        VALUES (${spotId}, ${img.image_url}, ${sub.submitted_by})
      `;
    }

    // Update submission status
    await sql`
      UPDATE pending_spot_submissions
      SET status = 'approved', approved_spot_id = ${spotId}
      WHERE id = ${submissionId}
    `;

    return Response.json({
      message: "Submission approved",
      spotId,
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    return Response.json(
      { error: "Failed to approve submission" },
      { status: 500 },
    );
  }
}
