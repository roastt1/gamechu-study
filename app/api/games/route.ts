import { NextRequest, NextResponse } from "next/server";
import { getTwitchAccessToken } from "@/utils/getTwitchAccessToken";

export async function GET(req: NextRequest) {
    const clientId = process.env.TWITCH_CLIENT_ID!;
    const searchQuery = req.nextUrl.searchParams.get("search")?.trim() || "";
    console.log("검색어:", searchQuery);
    try {
        const accessToken = await getTwitchAccessToken();

        // 검색어 기반 또는 기본 쿼리 설정
        const query = searchQuery
            ? `fields name,cover.url,first_release_date,rating,total_rating_count;
       where name ~ *"${searchQuery}"*;
       sort total_rating_count desc;
       limit 12;`
            : `fields name,cover.url,first_release_date,rating,total_rating_count;
       sort total_rating_count desc;
       limit 12;`;

        const igdbRes = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
            },
            body: query,
        });

        if (!igdbRes.ok) {
            throw new Error("Failed to fetch game data from IGDB");
        }

        const games = await igdbRes.json();
        return NextResponse.json(games);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
