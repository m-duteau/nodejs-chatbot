import WebSocket from 'ws';
import OpenAI from "openai";
import { PythonShell } from 'python-shell';
import fs from 'fs';

// User ID of the chat bot
// Can use https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/ to find the ID
const BOT_USER_ID = 'ENTER THE BOTS USER ID';
const OAUTH_TOKEN = 'ENTER OAUTH TOKEN'; // Needs scopes user:bot, user:read:chat, user:write:chat
const CLIENT_ID = 'ENTER CLIENT ID';

// User ID of the channel that the bot will join and listen to chat messages of
// Can use https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/ to find the ID
const CHAT_CHANNEL_USER_ID = 'ENTER YOUR CHANNEL USER ID';

const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

const openai = new OpenAI();

var websocketSessionID;

// ADD YOUR AUDIO TRIGGERS AND FILE NAMES HERE
// This array stores key-value pairs that assist in playing audio later in the code
// Check the audio folder's files to further understand how the file names work here
var myAudio = [
	// each object should contain a trigger and mp3 file name
	// ALL TRIGGERS SHOULD BE LOWERCASE
	// ex. {trigger: "your trigger", mp3: 'the name of the mp3'}
	{trigger: "!hello", mp3: 'Female Saying Hello Sound Effect', message: "Hello!"}, // message can be added if desired
	{trigger: "!wompwomp", mp3: 'Sad Trombone - Sound Effect (HD)'},
	{trigger: "!lol", mp3: 'Sound Effects - Sitcom Laugh'}
];


// UNCOMMENT THE FOLLOWING CODE BLOCK AND RUN node bot.js IN TERMINAL TO OUTPUT A TXT FILE OF YOUR AUDIO TRIGGERS
// If your list of audio files/triggers becomes lengthy, this can be handy for copy/pasting to
// your bot's Twitch channel or wherever you choose to list your audio triggers for viewers to reference

/* let triggerData = "";

for (var audioObj of myAudio) {
	triggerData = triggerData + audioObj.trigger + "\n";
}

fs.writeFile("AUDIOTRIGGEROUTPUT.txt", triggerData, (err) => {
	if (err) throw err;
}); */


// OPENAI TRIGGER
// Define the phrase that will trigger OpenAI with a trailing space
// TRIGGER SHOULD BE LOWERCASE
const openaiTrigger = "!openai";
// The length of the trigger will determine which part of the chat message is sent to OpenAI
const triggerLength = openaiTrigger.length;

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

					// OpenAI (ChatGPT) prompt triggering
					if (currentMessage.startsWith(openaiTrigger)) { // checks that the chat message begins with the trigger
						// Take the remaining text within the chat message after the trigger command to send to the OpenAI API
						promptOpenAI(currentMessage.substring(triggerLength)).then(function(returnVal) {
							// Send the returned value as a chat message
							sendChatMessage(returnVal);
						});
					}

					// Audio triggering
					else if (currentMessage.startsWith("!")) { // check that message starts with trigger symbol to avoid running the for loop when not necessary
						for (var audioObj of myAudio) {
							if (currentMessage == audioObj.trigger) { // check that message matches a trigger listed in myAudio array
								PythonShell.run('audio_player.py', {
									args: [audioObj.mp3] // play the associated .mp3 file name when current message matches the associated trigger
								});
								if (audioObj.message != null) { // send chat message only if message is defined in associated audioObj
									sendChatMessage(audioObj.message);
								}
							}
						}
					}

					// Chat message triggering
					// AGAIN, ALL TRIGGERS DEFINED IN THE FILE SHOULD BE LOWERCASE!
					else if (currentMessage == "!commands") { // Check if the chat message is a command
						sendChatMessage("Check out currently available commands at https://www.twitch.tv/YourBotChannel/about"); // Send the associated message
					}

					else if (currentMessage == "!hyped") { // Check if the chat message is a command
						sendChatMessage("TwitchConHYPE"); // Send the associated message
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

// Function that prompts OpenAI for a response
// param message is the message sent to OpenAI that it will respond to
async function promptOpenAI(message) {
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini", // Choose whatever model you think is appropriate
		messages: [
			// Content for "system" role will determine the OpenAI response behavior
			{ role: "system", content: "You are a helpful assistant. You must respond with 500 characters or less." },
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