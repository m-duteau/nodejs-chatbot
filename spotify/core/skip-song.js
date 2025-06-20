import axios from "axios";
import { getAccessToken } from "../index.js";

/*
 * Skips the song currently playing
 * sendChatMessage param passes sendChatMessage function to send message to chat when a song is skipped
 * currentChatter param will show who triggered the skip song command in sendChatMessage
 */
export async function skipSong(sendChatMessage, currentChatter) {
    const accessToken = await getAccessToken();

    try {
        // Skip to next song
        await axios.post("https://api.spotify.com/v1/me/player/next", null, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Send a chat message with the username of who skipped the song
        return sendChatMessage(`${currentChatter} skipped to the next song.`);
    } catch (err) {
        console.error(
            "Error skipping song: ",
            err.response?.data || err.message
        );
        sendChatMessage("Couldn't skip the song.");
    }
}
