import fs from "fs";
import path from "path";
import axios from "axios";
import { getAccessToken } from "../index.js";

const lastSongPath = path.resolve("spotify", "last-song.json");

/*
 * Show the song currently playing
 * param sendChatMessage sends messages to the chat regarding currently playing song
 * param requesterNameEnabled will determine whether the requester's name is shown in the message
 */
export async function nowPlaying(sendChatMessage, requesterNameEnabled) {
    const accessToken = await getAccessToken();

    try {
        // Get the song currently playing
        const res = await axios.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // Case if no song is playing
        if (res.status === 204 || !res.data || !res.data.is_playing) {
            return sendChatMessage("No song is currently playing.");
        }

        // Take the track, artist name(s), song name, and uri from the result
        const track = res.data.item;
        const artistNames = track.artists
            .map((artist) => artist.name)
            .join(", ");
        const songName = track.name;
        const currentUri = track.uri;

        // Initiate requestedBy
        let requestedBy = null;
        // If requester name is enabled and last-song.json exists we can parse the username that requested the last song
        if (requesterNameEnabled && fs.existsSync(lastSongPath)) {
            try {
                const content = fs.readFileSync(lastSongPath, "utf-8").trim();
                // Check that last-song.json loads properly
                if (content) {
                    const lastSong = JSON.parse(content);
                    if (lastSong.uri === currentUri) {
                        // Take the username if the current song uri is the same as the uri in last-song.json
                        requestedBy = lastSong.username;
                    }
                }
                // Alert if last-song.json could not be parsed
            } catch (err) {
                console.warn("Could not parse last-song.json: ", err.message);
            }
        }

        // Only send requester name if requestedBy is not null, otherwise just show song name and artist(s)
        const message = requestedBy
            ? `Now playing: ${songName} by ${artistNames} - requested by ${requestedBy}`
            : `Now playing: ${songName} by ${artistNames}`;

        // Return by sending the message
        return sendChatMessage(message);
    } catch (err) {
        console.error(
            "Error fetching currently playing track: ",
            err.response?.data || err.message
        );
        sendChatMessage("Couldn't fetch the currently playing song.");
    }
}
