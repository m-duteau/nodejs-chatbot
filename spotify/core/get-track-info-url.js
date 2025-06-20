import axios from "axios";
import { getAccessToken } from "../index.js";

/*
 * Search a song by its url
 * param url is the song url to find
 * param sendChatMessage passed to send a chat message if no track is found/url is invalid
 */
export async function getTrackInfoUrl(url, sendChatMessage) {
    // Extract track ID using regex to find substring of the URL starting with "track/"
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    // No match was found so return
    if (!match) return sendChatMessage("Invalid Spotify track URL.");

    // Take the track ID
    const trackId = match[1];
    console.log("Extracted track ID: ", trackId);
    const accessToken = await getAccessToken();

    // Get track info with the ID
    const res = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );

    // Return track info
    return res.data;
}
