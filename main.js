import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = path.join(app.getPath("userData"), "config.json");

ipcMain.on("credentials-submitted", (event, creds) => {
    console.log("Received credentials:", creds);

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
    });

    console.log(`Writing config to: ${configPath}`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("Credentials written to config.json");
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    console.log("🔍 Preload path:", path.join(__dirname, "preload.cjs"));
    win.loadFile("gui/index.html");
    win.webContents.openDevTools();
};

app.whenReady().then(() => {
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
