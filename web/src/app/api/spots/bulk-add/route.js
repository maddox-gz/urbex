import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { spots } = body;

    if (!Array.isArray(spots) || spots.length === 0) {
      return Response.json(
        { error: "spots array is required" },
        { status: 400 },
      );
    }

    const results = [];
    const userId = session.user.id;

    for (const spot of spots) {
      const {
        name,
        description,
        latitude,
        longitude,
        whatToExpect,
        imageUrls,
      } = spot;

      if (!name || !latitude || !longitude) {
        results.push({
          name: name || "Unknown",
          status: "skipped",
          reason: "Missing required fields (name, latitude, longitude)",
        });
        continue;
      }

      try {
        // Insert spot
        const spotResult = await sql`
          INSERT INTO urbex_spots (name, description, latitude, longitude, what_to_expect, created_by)
          VALUES (${name}, ${description || null}, ${latitude}, ${longitude}, ${whatToExpect || null}, ${userId})
          RETURNING id
        `;

        const spotId = spotResult[0].id;

        // Insert images if provided
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
          for (const imageUrl of imageUrls) {
            await sql`
              INSERT INTO spot_images (spot_id, image_url, uploaded_by)
              VALUES (${spotId}, ${imageUrl}, ${userId})
            `;
          }
        }

        results.push({
          name,
          status: "success",
          spotId,
        });
      } catch (error) {
        console.error(`Error adding spot ${name}:`, error);
        results.push({
          name,
          status: "error",
          reason: error.message,
        });
      }
    }

    return Response.json({
      message: "Bulk add complete",
      results,
      summary: {
        total: spots.length,
        success: results.filter((r) => r.status === "success").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        errors: results.filter((r) => r.status === "error").length,
      },
    });
  } catch (error) {
    console.error("Error in bulk add:", error);
    return Response.json(
      { error: "Failed to bulk add spots" },
      { status: 500 },
    );
  }
}
