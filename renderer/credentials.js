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
        spotifyRedirectUri: document.getElementById("spotifyRedirectUri").value,
    };

    console.log("Sending creds via IPC.");
    window.electronAPI.sendCredentials(credentials).then((res) => {
        if (res.success) {
            alert("Credentials saved.");
            window.location.href = "../views/index.html";
        } else {
            alert("Failed to save credentials: " + res.error);
        }
    });
});
