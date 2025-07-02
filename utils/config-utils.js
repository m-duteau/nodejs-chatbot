import fs from "fs";
import path from "path";
import { app } from "electron";

const configPath = path.join(app.getPath("userData"), "config.json");

export function readUserSecret(key) {
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        return config[key];
    }

    return null;
}

export function saveUserSecret(key, value) {
    let config = {};
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
