"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function GameList() {
    interface Game {
        id: number;
        name: string;
        cover?: { url: string };
        first_release_date?: number;
        rating?: number;
    }

    const [games, setGames] = useState<Game[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // 버튼 클릭 시 데이터를 불러오는 함수
    const handleSearch = async () => {
        const res = await fetch(`/api/games?search=${searchQuery}`);
        const data = await res.json();
        console.log("가져온 게임 데이터:", data);
        setGames(data);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>🎮 게임 리스트</h1>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="게임 이름 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <button onClick={handleSearch}>검색</button>
            </div>
            <ul className={styles.list}>
                {games.map((game) => (
                    <li key={game.id} className={styles.card}>
                        {game.cover && (
                            <img
                                src={`https:${game.cover.url.replace("t_thumb", "t_cover_big")}`}
                                alt={game.name}
                                className={styles.image}
                            />
                        )}
                        <div className={styles.info}>
                            <h2 className={styles.name}>{game.name}</h2>
                            <p className={styles.date}>
                                발매일:{" "}
                                {game.first_release_date
                                    ? new Date(game.first_release_date * 1000).toLocaleDateString()
                                    : "정보 없음"}
                            </p>
                            {game.rating && <p className={styles.rating}>평점: {game.rating.toFixed(1)}점</p>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
