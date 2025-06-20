import express from "express";
import open from "open";
import dotenv from "dotenv";
import axios from "axios";

// Path to .env
dotenv.config({ path: "../../.env" });

const app = express();
const PORT = 8888;

// Required scopes
const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-read-private",
    "user-read-currently-playing",
].join(" ");

// Redirect to Spotify login using credentials in .env
app.get("/", (req, res) => {
    const authUrl =
        `https://accounts.spotify.com/authorize` +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(process.env.SPOTIFY_CLIENT_ID)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}`;

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
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token, refresh_token } = tokenRes.data;

        // Tokens will print to console; save these tokens in .env file as directed
        console.log("\nSuccess. Use these tokens in your .env file:\n");
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
