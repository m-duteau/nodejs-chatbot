import { pollCurrentTrack, isSpotifyEnabled } from "../index.js";

let pollingInterval = null;
let sendChatMessageRef = null;

/*
 * Start polling for currently playing songs
 * param sendChatMessage passed to pollCurrentTrack to send to nowPlaying
 */
export function startPolling(sendChatMessage) {
    // If already polling we don't need to start polling again so return
    if (pollingInterval) return;

    // Reference to sendChatMessage
    sendChatMessageRef = sendChatMessage;
    // Poll every 5 seconds
    pollingInterval = setInterval(async () => {
        if (isSpotifyEnabled()) {
            try {
                await pollCurrentTrack(sendChatMessageRef);
            } catch (err) {
                console.error("Error polling current track: ", err);
            }
        }
    }, 5000);
}

// Stop polling; clear the pollingInterval and empty the sendChatMessage reference
export function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        sendChatMessageRef = null;
    }
}
