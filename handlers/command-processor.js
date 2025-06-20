import path from "path";
import { getTriggerMatch } from "../utils/get-trigger-match.js";
import {
    audioTriggers,
    chatTriggers,
    openaiTriggers,
} from "../triggers/index.js";
import { PythonShell } from "python-shell";
import { promptOpenAI } from "../utils/openai-helper.js";

// Path to the script that runs audio for audio commands
const audioPlayerPath = path.resolve("utils", "audio_player.py");

// Bulk of command processing occurs in this function
// Add more commands at your leisure in between the first if statement and the last else if statement to avoid any issues
export async function processCommand(message, currentChatter, sendChatMessage) {
    // Split the message in case there's an OpenAI trigger
    const [potentialTrigger, ...restWords] = message.trim().split(/\s+/);
    // This variable will hold OpenAI trigger data if the message starts with a trigger (I.e., "!chatbot")
    const matchedOpenaiTrigger = getTriggerMatch(
        potentialTrigger,
        openaiTriggers
    );
    // This variable will hold chat message trigger data if the message starts with a trigger (I.e., "!commands")
    const matchedChatTrigger = getTriggerMatch(message, chatTriggers);
    // This variable will hold audio trigger data if the message starts with a trigger (I.e., "!lol")
    const matchedAudioTrigger = getTriggerMatch(message, audioTriggers);

    // If an OpenAI trigger phrase was detected in the message, promptOpenAI will execute and a response will be sent to the chat
    if (matchedOpenaiTrigger) {
        // Take the remaining text within the chat message after the trigger command to send to the OpenAI API
        const userPrompt = restWords.join(" ").trim();
        // Along with the userPrompt, we are sending the behavior of the matched trigger so that OpenAI will respond with the appropriate personality
        const returnVal = await promptOpenAI(
            userPrompt,
            matchedOpenaiTrigger.data.behavior,
            currentChatter
        );
        // Send the returned value as a chat message
        await sendChatMessage(returnVal);
    }

    // If a chat message trigger was detected in the message, the associated response will be sent to the chat
    else if (matchedChatTrigger) {
        await sendChatMessage(matchedChatTrigger.data.chatMessage);
    }

    // If an audio trigger was detected, the associated sound will play
    else if (matchedAudioTrigger) {
        PythonShell.run(audioPlayerPath, {
            args: [matchedAudioTrigger.data.file],
        });
        // Response will be sent to the chat only if there is an audioMessage associated with the trigger
        if (matchedAudioTrigger.data.audioMessage != null) {
            await sendChatMessage(matchedAudioTrigger.data.audioMessage);
        }
    }
}
