import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// Function will get the display name of the user in regular casing via Twitch API
// ex., will return "MyUserName" instead of "myusername"
export async function getDisplayName(username) {
    try {
        const res = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`,
            },
            params: {
                login: username,
            },
        });

        const user = res.data.data[0];
        return user?.display_name || username;
    } catch (err) {
        console.error(
            "Failed to fetch display name: ",
            err.response?.data || err.message
        );
        return username;
    }
}
