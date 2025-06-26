import axios from "axios";
import {
    getAccessToken,
    nowPlaying,
    isRequesterNameEnabled,
    removeFirstFromQueue,
} from "../index.js";

const lastSongPath = path.resolve("spotify", "queue", "last-song.json");
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
        if (
            res.status === 204 ||
            !res.data ||
            !res.data.is_playing ||
            !res.data.item ||
            !res.data.item.uri
        ) {
            lastTrackUri = null;
            return;
        }

        // uri of the current track
        const currentTrackUri = res.data.item.uri;

        // If the track playing changes, it is no longer the same as the last track's uri
        if (currentTrackUri !== lastTrackUri) {
            // In this case, make last track equal to the current track to detect when the track changes and call nowPlaying() when the track changes
            lastTrackUri = currentTrackUri;

            const playedSong = removeFirstFromQueue();

            // If playedSong holds an object, write it to last-song.json
            if (
                playedSong &&
                typeof playedSong === "object" &&
                playedSong.uri
            ) {
                fs.writeFileSync(
                    lastSongPath,
                    JSON.stringify(playedSong, null, 2)
                );
                // Else write currentTrackUri to last-song.json
            } else {
                fs.writeFileSync(
                    lastSongPath,
                    JSON.stringify({ uri: currentTrackUri }, null, 2)
                );
            }

            await nowPlaying(sendChatMessage, isRequesterNameEnabled());
        }
    } catch (err) {
        console.error("Polling error: ", err.message);
    }
}
