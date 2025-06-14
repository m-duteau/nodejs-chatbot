import WebSocket from 'ws';
import OpenAI from "openai";
import { PythonShell } from 'python-shell';
import { audioTriggers } from './audio-triggers.js';
import { openaiTriggers } from './openai-triggers.js';
import { chatTriggers } from './chat-triggers.js';

// User ID of the chat bot
// Can use https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/ to find the ID
const BOT_USER_ID = 'ENTER THE BOT USER ID';
const OAUTH_TOKEN = 'ENTER OAUTH TOKEN'; // Needs scopes user:read:chat, user:write:chat
const CLIENT_ID = 'ENTER CLIENT ID';

// User ID of the channel that the bot will join and listen to chat messages of
// Can use https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/ to find the ID
const CHAT_CHANNEL_USER_ID = 'ENTER YOUR CHANNEL USER ID';

const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

// Instantiate the OpenAI module
const openai = new OpenAI();

var websocketSessionID;

// Start executing the bot from here
(async () => {
	// Verify that the authentication is valid
	await getAuth();

	// Start WebSocket client and register handlers
	const websocketClient = startWebSocketClient();
})();

// WebSocket will persist the application loop until you exit the program forcefully

async function getAuth() {
	// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
	let response = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: {
			'Authorization': 'OAuth ' + OAUTH_TOKEN
		}
	});

	if (response.status != 200) {
		let data = await response.json();
		console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
		console.error(data);
		process.exit(1);
	}

	console.log("Validated token.");
}

function startWebSocketClient() {
	let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

	websocketClient.on('error', console.error);

	websocketClient.on('open', () => {
		console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL);
	});

	websocketClient.on('message', (data) => {
		handleWebSocketMessage(JSON.parse(data.toString()));
	});

	return websocketClient;
}

function handleWebSocketMessage(data) {
	switch (data.metadata.message_type) {
		case 'session_welcome': // First message you get from the WebSocket server when connecting
			websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

			// Listen to EventSub, which joins the chatroom from your bot's account
			registerEventSubListeners();
			break;
		case 'notification': // An EventSub notification has occurred, such as channel.chat.message
			switch (data.metadata.subscription_type) {
				case 'channel.chat.message':
					// First, print the message to the program's console.
					console.log(`MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`);

					// This variable holds the current message being read
					// .toLowerCase() will ensure that the message will always be saved entirely in lowercase!!!
					// This is important if you do not want triggers to be case sensitive!!!
					let currentMessage = data.payload.event.message.text.trim().toLowerCase();

					// the character denoting a command will trigger processCommand()
					if (currentMessage.startsWith("!")) {
						processCommand(currentMessage, randomNumber);
					}

					break;
			}
			break;
	}
}

async function sendChatMessage(chatMessage) {
	let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: CHAT_CHANNEL_USER_ID,
			sender_id: BOT_USER_ID,
			message: chatMessage
		})
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
	let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + OAUTH_TOKEN,
			'Client-Id': CLIENT_ID,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			type: 'channel.chat.message',
			version: '1',
			condition: {
				broadcaster_user_id: CHAT_CHANNEL_USER_ID,
				user_id: BOT_USER_ID
			},
			transport: {
				method: 'websocket',
				session_id: websocketSessionID
			}
		})
	});

	if (response.status != 202) {
		let data = await response.json();
		console.error("Failed to subscribe to channel.chat.message. API call returned status code " + response.status);
		console.error(data);
		process.exit(1);
	} else {
		const data = await response.json();
		console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
	}
}

// Bulk of command processing occurs in this function
// Add more commands at your leisure in between the first if statement and the last else if statement to avoid any issues
async function processCommand(message) {
	// this variable will hold an OpenAI trigger key (I.e., "!chatbot") if the message starts with one
	const matchedOpenaiTrigger = Object.keys(openaiTriggers).find(key => message.startsWith(key));
	// this variable will hold a chat message trigger key (I.e., "!commands") if the message is one
	const matchedChatTrigger = Object.keys(chatTriggers).find(key => message == key);

	// if an OpenAI trigger phrase was detected in the message, promptOpenAI will execute and a response will be sent to the chat
	if (matchedOpenaiTrigger) {
		// Take the remaining text within the chat message after the trigger command to send to the OpenAI API, as well as the behavior assocaited with the trigger
		promptOpenAI(message.substring(openaiTriggers[matchedOpenaiTrigger].triggerLength), openaiTriggers[matchedOpenaiTrigger].behavior).then(function(returnVal) {
			// Send the returned value as a chat message
			sendChatMessage(returnVal);
		});
	}

	// if a chat message trigger was detected in the message, the associated response will be sent to the chat
	if (matchedChatTrigger) {
		sendChatMessage(chatTriggers[matchedChatTrigger].chatMessage);
	}

	// if the message is found within the audio triggers, the associated sound will play
	else if (message in audioTriggers) {
		PythonShell.run('audio_player.py', {
			args: [audioTriggers[message].file]
		});
		// response will be sent to the chat only if there is an audioMessage associated with the trigger
		if (audioTriggers[message].audioMessage != null) {
			sendChatMessage(audioTriggers[message].audioMessage);
		}	
	}
}

// Function that prompts OpenAI for a response
// param message is the message sent to OpenAI that it will respond to
// param behavior will determine the OpenAI response's behavior
async function promptOpenAI(message, behavior) {
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini", // Choose whatever model you think is appropriate
		messages: [
			// Content for "system" role will determine the OpenAI response behavior
			{ role: "system", content: behavior },
			// Send the message from message param to OpenAI for a response
			{
				role: "user",
				content: message,
			},
		],
	});
	
	// The response is held within the content of completion's message
	return completion.choices[0].message.content;
}