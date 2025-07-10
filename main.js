import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userDataDir = app.getPath("userData");
const configPath = path.join(userDataDir, "config.json");
const defaultsDir = path.join(__dirname, "defaults");

const defaultTriggersMap = {
    chat: "chat-triggers.default.json",
    audio: "audio-triggers.default.json",
    openai: "openai-triggers.default.json",
    spotify: "spotify-triggers.default.json",
    prefixes: "prefixes.default.json",
};

ipcMain.handle("credentials-submitted", async (event, creds) => {
    console.log("Received credentials:", creds);

    try {
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        }

        Object.assign(config, {
            TWITCH_CHAT_CHANNEL_USER_ID: creds.twitchChannelUserID,
            TWITCH_BOT_USER_ID: creds.twitchBotUserID,
            TWITCH_CLIENT_ID: creds.twitchClientID,
            TWITCH_OAUTH_TOKEN: creds.twitchToken,
            SPOTIFY_CLIENT_ID: creds.spotifyClientID,
            SPOTIFY_CLIENT_SECRET: creds.spotifyClientSecret,
            SPOTIFY_REDIRECT_URI: creds.spotifyRedirectUri,
        });

        console.log(`Writing config to: ${configPath}`);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        console.log("Credentials written to config.json");
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload", "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    console.log(
        "Preload path:",
        path.join(__dirname, "preload", "preload.cjs")
    );
    win.loadFile("views/credentials.html");
    // win.webContents.openDevTools();
};

app.whenReady().then(() => {
    Object.keys(defaultTriggersMap).forEach(ensureTriggerFile);

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

function ensureTriggerFile(triggerType) {
    const defaultFileName = defaultTriggersMap[triggerType];
    const userFileName = defaultFileName.replace(".default", "");

    const userFile = path.join(userDataDir, userFileName);
    const defaultFile = path.join(defaultsDir, defaultFileName);

    if (!fs.existsSync(userFile)) {
        console.log(
            `Copying default ${triggerType} triggers to user data folder.`
        );
        fs.copyFileSync(defaultFile, userFile);
    }
}
