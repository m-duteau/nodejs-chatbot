import {
    nowPlaying,
    skipSong,
    handleQueueSong,
    startPolling,
    stopPolling,
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
    if (!spotifyEnabled && trigger !== "spotifyon") {
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
            if (!isAuthorizedUser(currentChatter)) {
                // Send access denied message for non-authorized users
                sendAccessDenied(sendChatMessage);
            } else {
                // Else disable requester name and confirm with message
                requesterNameEnabled = false;
                sendChatMessage("Requester name disabled.");
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
