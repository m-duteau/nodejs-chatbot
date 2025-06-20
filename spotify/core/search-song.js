import axios from "axios";
import { getAccessToken } from "../index.js";

/*
 * Search for a song using song name and/or artist prompt
 * param query is the song name and/or artist
 * sendChatMessage passed to send a chat message if no results were found
 * returns the track
 */
export async function searchSong(query, sendChatMessage) {
    const accessToken = await getAccessToken();

    // Search the query
    const res = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
            q: query,
            type: "track",
            limit: 1,
        },
    });

    // Take the track from the result
    const track = res.data.tracks.items[0];
    // Notify chat if no song was found
    if (!track) return sendChatMessage(`No results found for "${query}".`);

    // Return the track if found
    return track;
}
