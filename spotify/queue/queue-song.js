import axios from "axios";
import { getAccessToken } from "../index.js";

//Queues a song using the uri
export async function queueSong(uri) {
    let accessToken = await getAccessToken();

    try {
        // Queue the song
        await axios.post("https://api.spotify.com/v1/me/player/queue", null, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { uri },
        });
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
        } else {
            throw err;
        }
    }
}
