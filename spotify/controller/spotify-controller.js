import {
    nowPlaying,
    skipSong,
    handleQueueSong,
    startPolling,
    stopPolling,
    peekQueue,
    clearQueue,
} from "../index.js";

// Array of authorized users that can trigger certain commands that are not available to all chatroom members
// MUST BE LOWERCASE
const authorizedUsers = ["yourusername", "moderatorusername"];
// Spotify module and requester names shown in nowPlaying() are enabled by default
let spotifyEnabled = true;
let requesterNameEnabled = true;

/*
 * Handles all spotify related commands in switch case based on the trigger passed
 * param trigger will dictate which action is carried out
 * param query is a query, e.g., song/artist names or url
 * param currentChatter is the person calling the command
 * param sendChatMessage passes the sendChatMessage function
 */
async function handleSpotifyCommand(
    trigger,
    query,
    currentChatter,
    sendChatMessage
) {
    // Spotify module is not enabled; return
    if (!spotifyEnabled && (trigger !== "spotifyon" || trigger !== "spon")) {
        sendChatMessage("Spotify module is not currently enabled.");
        return;
    }

    switch (trigger) {
        // Song is being requested
        case "songrequest":
        case "sr":
            return await handleQueueSong(
                query,
                currentChatter,
                sendChatMessage
            );
        // Message showing the currently playing song is being requested
        case "nowplaying":
        case "np":
            return await nowPlaying(sendChatMessage, requesterNameEnabled);
        // Skipping the currently playing song has been requested
        case "skipsong":
        case "skip":
            if (!isAuthorizedUser(currentChatter)) {
                // Send access denied message for non-authorized users
                sendAccessDenied(sendChatMessage);
            } else {
                // Else skip the song
                return await skipSong(sendChatMessage, currentChatter);
            }
            break;
        // Turn on the Spotify module
        case "spotifyon":
        case "spon":
            if (!isAuthorizedUser(currentChatter)) {
                // Send access denied message for non-authorized users
                sendAccessDenied(sendChatMessage);
            } else if (spotifyEnabled) {
                // Send a message if already enabled
                sendChatMessage("Spotify commands already enabled.");
            } else {
                // Else enable module, send message to confirm, start polling
                spotifyEnabled = true;
                sendChatMessage("Spotify commands enabled.");
                startPolling(sendChatMessage);
            }
            break;
        // Turn off the Spotify module
        case "spotifyoff":
        case "spoff":
            if (!isAuthorizedUser(currentChatter)) {
                // Send access denied message for non-authorized users
                sendAccessDenied(sendChatMessage);
            } else {
                // Else disable Spotify, send message to confirm, stop polling
                spotifyEnabled = false;
                sendChatMessage("Spotify commands disabled.");
                stopPolling();
            }
            break;
        // Turn on requester's name in nowPlaying message
        case "requesternameon":
        case "rnon":
            if (!isAuthorizedUser(currentChatter)) {
                // Send access denied message for non-authorized users
                sendAccessDenied(sendChatMessage);
            } else {
                // Else enable requester name and confirm with message
                requesterNameEnabled = true;
                sendChatMessage("Requester name enabled.");
            }
            break;
        // Turn off requester's name in nowPlaying message
        case "requesternameoff":
        case "rnoff":
            if (!isAuthorizedUser(currentChatter)) {
                // Send access denied message for non-authorized users
                sendAccessDenied(sendChatMessage);
            } else {
                // Else disable requester name and confirm with message
                requesterNameEnabled = false;
                sendChatMessage("Requester name disabled.");
            }
            break;
        // Display queue of next 5 tracks (or less) in the queue
        case "queue":
        case "q":
            // Get first 5 (or less) tracks in queue.json
            const upcoming = peekQueue(5);
            // If length is 0 then queue.json is empty
            if (upcoming.length === 0) {
                sendChatMessage("The queue is currently empty.");
            } else {
                // Join all queue.json items taken into a string
                const summary = upcoming
                    .map((item, i) => {
                        const artists = item.track.artists
                            .map((a) => a.name)
                            .join(", ");
                        const requester = requesterNameEnabled
                            ? ` (${item.username})`
                            : "";
                        return `${i + 1}. ${
                            item.track.name
                        } by ${artists}${requester}`;
                    })
                    .join(" | ");
                // Return the queue to chat
                sendChatMessage(`Up next: ${summary}`);
            }
            break;
        // Clears queue.json
        case "clearqueue":
        case "cq":
            if (!isAuthorizedUser(currentChatter)) {
                sendAccessDenied(sendChatMessage);
            } else {
                clearQueue();
            }
            break;
    }
}

// Checks if Spotify module is enabled
function isSpotifyEnabled() {
    return spotifyEnabled;
}

// Checks if requester name is enabled
function isRequesterNameEnabled() {
    return requesterNameEnabled;
}

// Checks if currentChatter is an authorized user
function isAuthorizedUser(username) {
    return authorizedUsers.includes(username.toLowerCase());
}

// Send a chat message to let chatters know when they're attempting to access a function they don't have privileges for
function sendAccessDenied(sendChatMessage) {
    sendChatMessage("Sorry, that is a moderator-only command!");
}

export { handleSpotifyCommand, isSpotifyEnabled, isRequesterNameEnabled };
