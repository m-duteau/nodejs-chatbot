import { writeFileSync } from "fs";
import { audioTriggers } from "./audio-triggers.js";

// audioTriggers keys are the trigger strings themselves, i.e., "lol"; the prefix '!' is prepended to each trigger in the file
const triggers = Object.keys(audioTriggers).map((trigger) => {
    return trigger.startsWith("!") ? trigger : "!" + trigger;
});
// triggersText combines all triggers with newline between each such that each trigger will be on its own line in the .txt file
const triggersText = triggers.join("\n");
// audio-trigger-output.txt is a placeholder, you can name it whatever you like
const triggersFileName = "audio_trigger_output.txt";

// triggersText is written to triggersFileName
writeFileSync(triggersFileName, triggersText);

console.log("Audio triggers list successfully saved to " + triggersFileName);
