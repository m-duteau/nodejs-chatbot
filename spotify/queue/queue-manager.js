import {
    queueSong,
    getTrackInfoUrl,
    searchSong,
    addToQueue,
} from "../index.js";

/*
 * Handles queueing a song via a query
 * param query can be either a Spotify link or a prompt of song name and/or artist name
 * param currentChatter shows who queued the song
 * param sendChatMessage shows the song that the currentChatter queued as a message in chat
 */
export async function handleQueueSong(query, currentChatter, sendChatMessage) {
    let track = null;

    try {
        if (query.includes("spotify.com/track/")) {
            // Track is a url
            track = await getTrackInfoUrl(query, sendChatMessage);
        } else {
            // Track is a prompt
            track = await searchSong(query, sendChatMessage);
        }

        // There may be no track found so just return if that's the case
        if (!track) return;

        // Queue the song
        await queueSong(track.uri);
        addToQueue(track, currentChatter);

        // Send a message to the chat
        sendChatMessage(
            `${currentChatter} queued: ${track.name} by ${track.artists
                .map((a) => a.name)
                .join(", ")}`
        );
    } catch (err) {
        console.error("queueSong error: ", err.message);
        sendChatMessage("Could not queue the song.");
    }
}
