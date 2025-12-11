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
    const { username, bio, city, profilePicture, completed } = body;

    // If just marking onboarding as completed (old flow)
    if (completed && !username) {
      await sql`
        UPDATE auth_users
        SET accepted_terms = true
        WHERE id = ${userId}
      `;

      // Create user profile if doesn't exist
      const existing = await sql`
        SELECT * FROM user_profiles WHERE user_id = ${userId}
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO user_profiles (user_id)
          VALUES (${userId})
        `;
      }

      return Response.json({ success: true });
    }

    // Update username in auth_users
    if (username) {
      const existingUser = await sql`
        SELECT id FROM auth_users WHERE username = ${username} AND id != ${userId}
      `;

      if (existingUser.length > 0) {
        return Response.json(
          { error: "Username already taken" },
          { status: 400 },
        );
      }

      await sql`
        UPDATE auth_users
        SET username = ${username}, accepted_terms = true
        WHERE id = ${userId}
      `;
    } else {
      // Just mark terms as accepted
      await sql`
        UPDATE auth_users
        SET accepted_terms = true
        WHERE id = ${userId}
      `;
    }

    // Check if profile exists
    const existingProfile = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existingProfile.length > 0) {
      // Update existing profile
      await sql`
        UPDATE user_profiles
        SET bio = ${bio || null},
            profile_picture = ${profilePicture || null},
            city = ${city || null}
        WHERE user_id = ${userId}
      `;
    } else {
      // Create new profile
      await sql`
        INSERT INTO user_profiles (user_id, bio, profile_picture, city)
        VALUES (${userId}, ${bio || null}, ${profilePicture || null}, ${city || null})
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
