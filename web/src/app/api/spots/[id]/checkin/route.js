import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;

    // Check if already checked in
    const existing = await sql`
      SELECT id FROM check_ins WHERE spot_id = ${id} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      return Response.json({ message: "Already checked in" });
    }

    // Create check-in
    await sql`
      INSERT INTO check_ins (spot_id, user_id)
      VALUES (${id}, ${userId})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error checking in:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
