import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    if (!query.trim()) {
      const spots = await sql`
        SELECT 
          s.id,
          s.name,
          s.description,
          s.latitude,
          s.longitude,
          (SELECT image_url FROM spot_images WHERE spot_id = s.id LIMIT 1) AS main_image
        FROM urbex_spots s
        ORDER BY s.created_at DESC
        LIMIT 100
      `;
      return Response.json({ spots: spots || [] });
    }

    const searchTerm = `%${query}%`;
    const spots = await sql`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.latitude,
        s.longitude,
        (SELECT image_url FROM spot_images WHERE spot_id = s.id LIMIT 1) AS main_image
      FROM urbex_spots s
      WHERE 
        LOWER(s.name) LIKE LOWER(${searchTerm})
        OR LOWER(s.description) LIKE LOWER(${searchTerm})
      ORDER BY s.created_at DESC
      LIMIT 50
    `;

    return Response.json({ spots: spots || [] });
  } catch (error) {
    console.error("Error searching spots:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
