import axios from "axios";
import {
    getAccessToken,
    nowPlaying,
    isRequesterNameEnabled,
} from "../index.js";

let lastTrackUri = null;

/*
 * Polls the current track; will show Now Playing message when bot or Spotify is initialized or when a song finishes and moves to the next
 * sendChatMessage passed to nowPlaying to show what is currently playing as a message in the chat
 */
export async function pollCurrentTrack(sendChatMessage) {
    try {
        const accessToken = await getAccessToken();
        // Get the song currently playing
        const res = await axios.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        // If no track is playing
        if (res.status === 204 || !res.data.is_playing) {
            lastTrackUri = null;
            return;
        }

        // uri of the current track
        const currentTrackUri = res.data.item.uri;

        // If the track playing changes, it is no longer the same as the last track's uri
        if (currentTrackUri !== lastTrackUri) {
            // In this case, make last track equal to the current track to detect when the track changes and call nowPlaying() when the track changes
            lastTrackUri = currentTrackUri;
            await nowPlaying(sendChatMessage, isRequesterNameEnabled());
        }
    } catch (err) {
        console.error("Polling error: ", err.message);
    }
}
