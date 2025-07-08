document.getElementById("startBot").addEventListener("click", () => {
    const spotifyEnabled = document.getElementById("spotifyEnabled").checked;
    console.log("Starting bot, Spotify enabled: ", spotifyEnabled);

    window.electronAPI.startBot({ spotifyEnabled });
});

document.getElementById("editChat").addEventListener("click", () => {
    window.location.href = "../views/triggers.html?type=chat";
});

document.getElementById("editAudio").addEventListener("click", () => {
    window.location.href = "../views/triggers.html?type=audio";
});

document.getElementById("editOpenAI").addEventListener("click", () => {
    window.location.href = "../views/triggers.html?type=openai";
});

document.getElementById("editPrefixes").addEventListener("click", () => {
    window.location.href = "../views/triggers.html?type=prefixes";
});
