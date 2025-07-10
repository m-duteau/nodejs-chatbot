import fs from "fs/promises";
import path from "path";
import { app } from "electron";

export async function loadTriggers(type) {
    const fileMap = {
        chat: "chat-triggers.json",
        audio: "audio-triggers.json",
        openai: "openai-triggers.json",
        spotify: "spotify-triggers.json",
        prefixes: "prefixes.json",
    };

    const fileName = fileMap[type];
    if (!fileName) throw new Error(`Unknown trigger type: ${type}`);

    const triggerPath = path.join(app.getPath("userData"), fileName);
    try {
        const content = await fs.readFile(triggerPath, "utf-8");
        const data = JSON.parse(content);

        if (type === "prefixes" && !Array.isArray(data)) {
            console.warn(
                "Prefixes file is invalid, using default fallback '!'"
            );
            return ["!"];
        }

        return data;
    } catch (err) {
        console.error(`Failed to load ${type} triggers: `, err);
        if (type === "prefixes") return ["!"];
        return {};
    }
}
