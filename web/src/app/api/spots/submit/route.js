import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, description, latitude, longitude, whatToExpect, imageUrls } =
      body;

    if (
      !name ||
      !latitude ||
      !longitude ||
      !imageUrls ||
      imageUrls.length === 0
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user is admin
    const user = await sql`
      SELECT is_admin FROM auth_users WHERE id = ${userId}
    `;

    const isAdmin = user[0]?.is_admin || false;

    if (isAdmin) {
      // Auto-approve for admins - insert directly into urbex_spots
      const spot = await sql`
        INSERT INTO urbex_spots (name, description, latitude, longitude, what_to_expect, created_by)
        VALUES (${name}, ${description || null}, ${latitude}, ${longitude}, ${whatToExpect || null}, ${userId})
        RETURNING id
      `;

      const spotId = spot[0].id;

      // Insert images
      for (const imageUrl of imageUrls) {
        await sql`
          INSERT INTO spot_images (spot_id, image_url, uploaded_by)
          VALUES (${spotId}, ${imageUrl}, ${userId})
        `;
      }

      return Response.json({
        success: true,
        spotId,
        autoApproved: true,
        message: "Spot created successfully (auto-approved)",
      });
    } else {
      // Create pending submission for regular users
      const submission = await sql`
        INSERT INTO pending_spot_submissions 
          (name, description, latitude, longitude, what_to_expect, submitted_by, status)
        VALUES (${name}, ${description || null}, ${latitude}, ${longitude}, ${whatToExpect || null}, ${userId}, 'pending')
        RETURNING id
      `;

      const submissionId = submission[0].id;

      // Add images
      for (const imageUrl of imageUrls) {
        await sql`
          INSERT INTO submission_images (submission_id, image_url)
          VALUES (${submissionId}, ${imageUrl})
        `;
      }

      return Response.json({
        success: true,
        submissionId,
        message: "Submission received for approval",
      });
    }
  } catch (error) {
    console.error("Error submitting spot:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
