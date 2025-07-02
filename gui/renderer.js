console.log("electronAPI exists?", !!window.electronAPI);
console.log("electronAPI:", window.electronAPI);

document.getElementById("credentialsForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const credentials = {
        twitchChannelUserID: document.getElementById("twitchChannelUserID")
            .value,
        twitchBotUserID: document.getElementById("twitchBotUserID").value,
        twitchClientID: document.getElementById("twitchClientID").value,
        twitchToken: document.getElementById("twitchToken").value,
        spotifyClientID: document.getElementById("spotifyClientID").value,
        spotifyClientSecret: document.getElementById("spotifyClientSecret")
            .value,
    };

    console.log("Sending creds via IPC.");
    window.electronAPI.sendCredentials(credentials);
});
