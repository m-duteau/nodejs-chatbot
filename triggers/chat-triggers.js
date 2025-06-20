// Add different triggers that will send messages to the chat via the bot
// ALL TRIGGERS SHOULD BE LOWERCASE -- do not include prefixes like '!' or '$'; /utils/get-trigger-match.js handles this
export const chatTriggers = {
    commands: {
        chatMessage:
            "Check out currently available commands at https://www.twitch.tv/YourBotChannel/about",
    },
    discord: {
        chatMessage:
            "Join the channel's Discord server at https://discord.gg/YourInviteCode to stay connected to the community",
    },
    lurk: {
        chatMessage:
            "We'll miss your kind words, but thanks for supporting the stream!",
    },
    hyped: { chatMessage: "TwitchConHYPE" }, // <- only the last element does not need a comma, add comma if adding more sounds
};
