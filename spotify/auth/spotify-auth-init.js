import express from "express";
import open from "open";
import axios from "axios";
import { readUserSecret } from "../../utils/config-utils.js";

const app = express();
const PORT = 8888;

const clientId = readUserSecret("SPOTIFY_CLIENT_ID");
const clientSecret = readUserSecret("SPOTIFY_CLIENT_SECRET");
const redirectUri = readUserSecret("SPOTIFY_REDIRECT_URI");

// Required scopes
const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-read-private",
    "user-read-currently-playing",
].join(" ");

// Redirect to Spotify login using credentials in config.json
app.get("/", (req, res) => {
    const authUrl =
        `https://accounts.spotify.com/authorize` +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    res.send(`Click here to <a href="${authUrl}">authorize Spotify</a>.`);
    console.log(
        "\nVisit http://localhost:8888 to authorize your Spotify account.\n"
    );
});

// Handle redirect and exchange code for tokens
app.get("/callback", async (req, res) => {
    const code = req.query.code;

    try {
        const tokenRes = await axios.post(
            "https://accounts.spotify.com/api/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token, refresh_token } = tokenRes.data;

        // Tokens will print to console; save these tokens in config.json file as directed
        console.log("\nSuccess. Use these tokens in your config.json file:\n");
        console.log(`SPOTIFY_ACCESS_TOKEN=${access_token}`);
        console.log(`SPOTIFY_REFRESH_TOKEN=${refresh_token}`);
        res.send("Token retrieval successful. You can close this tab now.");

        process.exit(0);
    } catch (err) {
        console.error(
            "Error retrieving tokens: ",
            err.response?.data || error.message
        );
        res.send("Failed to get tokens.");
    }
});

// Start server
app.listen(PORT, () => {
    open(`http://localhost:${PORT}`);
});
