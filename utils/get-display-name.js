import axios from "axios";
import { readUserSecret } from "./config-utils.js";

// Function will get the display name of the user in regular casing via Twitch API
// ex., will return "MyUserName" instead of "myusername"
export async function getDisplayName(username) {
    try {
        const clientId = readUserSecret("TWITCH_CLIENT_ID");
        const oauthToken = readUserSecret("TWITCH_OAUTH_TOKEN");
        // Gets the requested username
        const res = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${oauthToken}`,
            },
            params: {
                login: username,
            },
        });

        const user = res.data.data[0];
        // Return the display name, else just return the regular username
        return user?.display_name || username;
    } catch (err) {
        console.error(
            "Failed to fetch display name: ",
            err.response?.data || err.message
        );
        return username;
    }
}
