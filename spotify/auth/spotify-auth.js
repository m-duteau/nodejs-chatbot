import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { readUserSecret } from "../../utils/config-utils.js";

// Path to spotify-tokens.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenPath = path.resolve(__dirname, "spotify-tokens.json");

// Find the access token and refresh token held in config.json
let accessToken = readUserSecret("SPOTIFY_ACCESS_TOKEN");
let refreshToken = readUserSecret("SPOTIFY_REFRESH_TOKEN");
let tokenExpiresAt = 0;

// Gets access token; will get new access token and refresh token if needed
export async function getAccessToken(force = false) {
    if (force || Date.now() >= tokenExpiresAt) {
        console.log("Access token expired, refreshing token...");
        const newTokens = await refreshAccessToken();
        accessToken = newTokens.access_token;
        if (newTokens.refresh_token) {
            refreshToken = newTokens.refresh_token;
        }
        tokenExpiresAt = Date.now() + newTokens.expires_in * 1000;
        saveTokens();
    }

    return accessToken;
}

// Loads tokens from spotify-tokens.json
function loadTokens() {
    if (fs.existsSync(tokenPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
            accessToken = data.access_token;
            refreshToken = data.refresh_token;
            tokenExpiresAt = data.expires_at || 0;
            console.log("Spotify tokens loaded from spotify-tokens.json");
            return true;
        } catch (err) {
            console.error(
                "Failed to load Spotify tokens from spotify-tokens.json: ",
                err.message
            );
            return false;
        }
    }
    return false;
}

if (!loadTokens()) {
    // Fallback to config if spotify-tokens.json does not exist or is corrupt
    console.warn(
        "spotify-tokens.json not found or unreadable. Using fallback from config.json; tokens will be saved to spotify-tokens.json after config.json fallback."
    );
    accessToken = readUserSecret("SPOTIFY_ACCESS_TOKEN") || "";
    refreshToken = readUserSecret("SPOTIFY_REFRESH_TOKEN") || "";
    tokenExpiresAt = 0;
}

// Saves tokens to spotify-tokens.json when new tokens are generated
function saveTokens() {
    const data = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: tokenExpiresAt,
    };
    fs.writeFileSync(tokenPath, JSON.stringify(data, null, 2));
    console.log("Spotify tokens saved to spotify-tokens.json");
}

// Refreshes the access token when necessary and returns new token data
async function refreshAccessToken() {
    try {
        const clientId = readUserSecret("SPOTIFY_CLIENT_ID");
        const clientSecret = readUserSecret("SPOTIFY_CLIENT_SECRET");
        const authHeader = Buffer.from(
            `${clientId}:${clientSecret}`,
            "utf-8"
        ).toString("base64");

        const res = await axios.post(
            "https://accounts.spotify.com/api/token",
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${authHeader}`,
                },
            }
        );

        return res.data;
    } catch (err) {
        console.error(
            "Failed to refresh access token: ",
            err.response?.data || err.message
        );
        throw err;
    }
}
