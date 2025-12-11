import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const spots = await sql`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.latitude,
        s.longitude,
        s.what_to_expect,
        s.created_at,
        (SELECT image_url FROM spot_images WHERE spot_id = s.id LIMIT 1) AS main_image,
        (SELECT COUNT(*) FROM spot_likes WHERE spot_id = s.id AND is_like = true) AS likes,
        (SELECT COUNT(*) FROM check_ins WHERE spot_id = s.id) AS check_ins
      FROM urbex_spots s
      ORDER BY s.created_at DESC
      LIMIT 100
    `;

    return Response.json({ spots: spots || [] });
  } catch (error) {
    console.error("Error fetching spots:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
