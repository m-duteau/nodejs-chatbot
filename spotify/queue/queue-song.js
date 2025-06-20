import fs from "fs";
import path from "path";
import axios from "axios";
import { getAccessToken } from "../index.js";

const lastSongPath = path.resolve("spotify", "queue", "last-song.json");

/*
 * Queues a song using the uri
 * params uri and username are written to last-song.json to track who had requested the song when calling nowPlaying()
 */
export async function queueSong(uri, username) {
    let accessToken = await getAccessToken();

    try {
        // Queue the song
        await axios.post("https://api.spotify.com/v1/me/player/queue", null, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { uri },
        });

        // Save who requested the song
        fs.writeFileSync(
            lastSongPath,
            JSON.stringify({ uri, username }, null, 2)
        );
    } catch (err) {
        if (err.response?.status === 401) {
            // Force refresh token
            console.log("Retrying queue with refreshed token:", accessToken);
            accessToken = await getAccessToken(true);
            // Queue the song
            await axios.post(
                "https://api.spotify.com/v1/me/player/queue",
                null,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { uri },
                }
            );

            // Save who requested the song after retry
            fs.writeFileSync(
                lastSongPath,
                JSON.stringify({ uri, username }, null, 2)
            );
        } else {
            throw err;
        }
    }
}
