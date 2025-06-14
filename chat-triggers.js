// Add different triggers that will send messages to the chat via the bot
// ALL TRIGGERS MUST BE LOWERCASE
export const chatTriggers = {
    "!commands": {chatMessage: "Check out currently available commands at https://www.twitch.tv/YourBotChannel/about"},
    "!discord": {chatMessage: "Join the channel's Discord server at https://discord.gg/YourInviteCode to stay connected to the community"},
    "!hyped": {chatMessage: "TwitchConHYPE"}
};