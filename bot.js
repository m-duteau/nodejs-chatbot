import WebSocket from "ws";
import dotenv from "dotenv";
import { processCommand } from "./handlers/command-processor.js";
import { getDisplayName } from "./utils/get-display-name.js";
import { startPolling } from "./spotify/index.js";

dotenv.config();

const BOT_USER_ID = process.env.TWITCH_BOT_USER_ID;
const OAUTH_TOKEN = process.env.TWITCH_OAUTH_TOKEN;
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CHAT_CHANNEL_USER_ID = process.env.TWITCH_CHAT_CHANNEL_USER_ID;

const EVENTSUB_WEBSOCKET_URL = "wss://eventsub.wss.twitch.tv/ws";

var websocketSessionID;

// Start executing the bot from here
(async () => {
    // Verify that the authentication is valid
    await getAuth();

    // Start WebSocket client and register handlers
    const websocketClient = startWebSocketClient();

    // Start polling Spotify for current track
    startPolling(sendChatMessage);
})();

// WebSocket will persist the application loop until you exit the program forcefully
async function getAuth() {
    // https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
    let response = await fetch("https://id.twitch.tv/oauth2/validate", {
        method: "GET",
        headers: {
            Authorization: "OAuth " + OAUTH_TOKEN,
        },
    });

    if (response.status != 200) {
        let data = await response.json();
        console.error(
            "Token is not valid. /oauth2/validate returned status code " +
                response.status
        );
        console.error(data);
        process.exit(1);
    }

    console.log("Validated token.");
}

function startWebSocketClient() {
    let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

    websocketClient.on("error", console.error);

    websocketClient.on("open", () => {
        console.log("WebSocket connection opened to " + EVENTSUB_WEBSOCKET_URL);
    });

    websocketClient.on("message", async (data) => {
        try {
            await handleWebSocketMessage(JSON.parse(data.toString()));
        } catch (err) {
            console.error("Error handling WebSocket message:", err);
        }
    });

    return websocketClient;
}

async function handleWebSocketMessage(data) {
    switch (data.metadata.message_type) {
        case "session_welcome": // First message you get from the WebSocket server when connecting
            websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

            // Listen to EventSub, which joins the chatroom from your bot's account
            registerEventSubListeners();
            break;
        case "notification": // An EventSub notification has occurred, such as channel.chat.message
            switch (data.metadata.subscription_type) {
                case "channel.chat.message":
                    // First, print the message to the program's console.
                    console.log(
                        `MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`
                    );

                    // This variable holds the current message being read
                    // .toLowerCase() will ensure that the message will always be saved entirely in lowercase!!!
                    // This is important if you do not want triggers to be case sensitive!!!
                    const currentMessage = data.payload.event.message.text
                        .trim()
                        .toLowerCase();
                    const currentChatter = await getDisplayName(
                        data.payload.event.chatter_user_login.trim()
                    );

                    await processCommand(
                        currentMessage,
                        currentChatter,
                        sendChatMessage
                    );

                    break;
            }
            break;
    }
}

async function sendChatMessage(chatMessage) {
    let response = await fetch("https://api.twitch.tv/helix/chat/messages", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + OAUTH_TOKEN,
            "Client-Id": CLIENT_ID,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            broadcaster_id: CHAT_CHANNEL_USER_ID,
            sender_id: BOT_USER_ID,
            message: chatMessage,
        }),
    });

    if (response.status != 200) {
        let data = await response.json();
        console.error("Failed to send chat message");
        console.error(data);
    } else {
        console.log("Sent chat message: " + chatMessage);
    }
}

async function registerEventSubListeners() {
    // Register channel.chat.message
    let response = await fetch(
        "https://api.twitch.tv/helix/eventsub/subscriptions",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + OAUTH_TOKEN,
                "Client-Id": CLIENT_ID,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "channel.chat.message",
                version: "1",
                condition: {
                    broadcaster_user_id: CHAT_CHANNEL_USER_ID,
                    user_id: BOT_USER_ID,
                },
                transport: {
                    method: "websocket",
                    session_id: websocketSessionID,
                },
            }),
        }
    );

    if (response.status != 202) {
        let data = await response.json();
        console.error(
            "Failed to subscribe to channel.chat.message. API call returned status code " +
                response.status
        );
        console.error(data);
        process.exit(1);
    } else {
        const data = await response.json();
        console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
    }
}
