# nodejs-chatbot

A chatbot that runs locally as a Node.js program with ChatGPT connection and audio playing script. The repository serves as a baseline for what can be done with the chatbot; users are encouraged to modify the bot.js script as they see fit to implement their own unique commands and features.

The module for playing audio files serves as a free alternative for other audio clip player services, such that viewers of the stream can input commands that will play a sound clip.

Calls to OpenAI's ChatGPT-4o mini are also implemented so that users may send prompts to the bot, where the bot will subsequently send ChatGPT's response to the prompt as a chat message within the streamer's chat.

A Spotify module has also been added that allows chatters to queue songs and display the currently playing song when a Spotify client is playing music on stream.

The overall goal of this project is to inspire users to customize a bot that suits the needs of their streaming chat while also encouraging and retaining viewer engagement. Beyond that, it is also an exercise in growing my skill set as a software developer.

## ChatBot Basics

The ChatBot works off of the example given at https://dev.twitch.tv/docs/chat/chatbot-guide/

To enhance the ChatBot for my own personal wants, I've added a python script that will open the media player on Windows and play audio clips, functioning similar to the Blerp extension but locally.
OpenAI Integration was also added so that people within the chatroom can trigger the bot to respond to prompts for added engagement.

## Setup

Right click on the folder housing all of the files and enter the following:

```
npm install
```

All dependencies should be installed from the package.json; if there is trouble installing external modules like python-shell, openai, or dotenv, run the following:

```
npm install python-shell openai dotenv
```

### Connecting to Twitch

You will need to create a second Twitch account for the bot to run through. If you want to use the same email as your regular Twitch account to register the bot, the following video was helpful for this:
https://youtu.be/6Eh3-WUokhQ?si=_43e7kP9JfhpxS93

Retrieving user IDs for your chatbot and your actual Twitch account can be done at https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/

Retrieve your client ID by registering an app at https://dev.twitch.tv/ using the bot's Twitch account.

Oauth token can be retrieved by using a link such as the following and entering your client ID in the appropriate place as well as your redirect URI (I just use localhost). You must be signed into Twitch AS THE BOT ACCOUNT in order to retrieve the token, not your regular Twitch account that the bot is being run for.

```
https://id.twitch.tv/oauth2/authorize
    ?response_type=token
    &client_id=YOURCLIENTID
    &redirect_uri=http://localhost
    &scope=user%3Aread%3Achat+user%3Awrite%3Achat+user%3Aread%3Aemail+user%3Aread%3Asubscriptions
```

This link is also provided in oauthtokenlink.txt in order to easily copy and paste it, but you will need to enter your client ID in the appropriate section.

The page will not load as a valid page, but you will be able to locate the token within your browser's address bar.

### Connecting to Spotify

To use the Spotify module, you will be required to have an existing premium subscription on your Spotify account. If this is the case, you can head to https://developer.spotify.com/ and register an application so that you can access the Spotify API. You will receive a Client ID and a Client Secret that you will need.

### botcredentials.env.example

You will enter your necessary credentials in this file for both Twitch and Spotify, such as the bot channel's ID, your channel's ID, client IDs for both Twitch and Spotify, client secret for Spotify, and the OAuth token for Twitch. There is also a section for a Spotify access token and refresh token; you can leave these as is until you get to the next step and retrieve these tokens. After entering this information, rename the file to to just ".env" (no quotes) before running the bot or any other node function.

### /spotify/auth/spotify-auth-init.js

After entering the necessary credentials and renaming the .env example to just ".env", you will need to find the /auth/ folder within the /spotify/ folder. Right-click the /auth/ folder and select "Open in Terminal" and run the following code:

```
node spotify-auth-init.js
```

When successful, this action will give you an access token and a refresh token for your Spotify credentials. Add these values into your .env file.

### OpenAI Integration

You will need to create an OpenAI account if attempting to use the ChatBot with it.

You will then need to go retrieve a secret key to access the API via OpenAI at https://platform.openai.com/api-keys

Subsequently, right-click the directory that houses all of the files (bot.js, audio_player.py, /audio/ folder, etc.), click "Open in Terminal" and enter the following:

```
setx OPENAI_API_KEY 'enter your secret key here'
```

This will allow the chatbot to access the OpenAI API. You may need to pay in order for access to the API to succeed when making calls, though that gpt-4o-mini is arguably cheap when just doing text prompts.

## Using The Bot

### Chat Commands

Different chat command triggers will be housed in /triggers/chat-triggers.js; this file is mainly for command triggers that respond with a chat message. I.e., typing "!commands" in the Twitch chat will cause the bot to respond with a link to the bot's Twitch channel's About section where you can list the bot's command triggers for reference. You can add different command triggers and associated chatMessages that will be sent as responses as you see fit.

### Playing Audio Files

Audio files should be placed in the /audio/ folder and ideally be .mp3 format. Note that you will need to keep track of your audio file's exact names and enter them into the bot.js code accordingly in order to avoid crashes.

Playing audio files utilizes Python's playsound module which alleviates the issue of the operating system's default media player interrupting gameplay when it would play a new audio file. Playsound allows audio files to play in the background and does not interrupt gameplay. If you have issues after doing the initial npm install, make sure your pip version is the most recent and install the playsound module on your operating system.

```
python -m pip install --upgrade pip
```

```
pip install playsound
```

### Managing Audio Trigger Phrases and Files

The file titled /triggers/audio-trigger.js will house all of the audio command triggers and their associated audio files. You can add new commands as you see fit so long as audio files have been added to the /audio/ folder.

It is important that all trigger phrases remain lowercase, as the handleWebSocketMessage function will convert all messages read from Twitch chat to lowercase. Please be certain that you are copying .mp3 file names EXACTLY as you have stored them in the /audio/ folder within /triggers/audio-trigger.js objects' {file: "audiofilenamehere"} in order to avoid any crashes or unintended behaviors and do not include the .mp3 suffix.

Also note that there is a file named export-audio-triggers.js; if you add many audio files and triggers such that it is difficult to keep track of them all to copy to your bot's Twitch channel About page, you can run the following code when right-clicking the /triggers/ folder in your explorer and clicking "Open in Terminal":

```
node export-audio-triggers.js
```

This will output a .txt file that contains all of the audio triggers you are using into the /triggers/ folder, each on their own line. This makes copying and pasting them much easier.

### Using OpenAI Triggers

The file titled /triggers/openai-triggers.js will house the OpenAI command triggers and behaviors. By adding new objects to this file, you can have multiple different behaviors that the OpenAI will respond with depending on the command trigger that is used. Use this as you see fit in order to switch up the OpenAI's personality when responding to prompts.

### Using Spotify Triggers

The file titled /triggers/spotify-triggers.js will house the Spotify command triggers with some notes on what actions these triggers perform. Regular users can use the !songrequest/!sr and !nowplaying/!np commands to either queue a song or show the currently playing song. Triggers that skip songs, turn the Spotify module on and off, or add or remove requesters' names from the currently playing song message are only available to authorized users. If you go to /spotify/controller/spotify-controller.js you can better analyze how these triggers work.

Also in this file, there is an array called

```
const authorizedUsers = ["yourusername", "moderatorusername"];
```

Enter your username (ALL LOWERCASE) in quotes as shown to declare yourself as an authorized user. You can also add others' usernames by separating with commas as shown (last username entered does not need a comma) in order to granted other trusted people with the privileges of certain actions. If you want these actions solely in your control, just declare it as

```
const authorizedUsers = "yourusername";
```

### Command Processing

In bot.js, all messages are sent to processCommand() where the message will be analyzed for a command trigger. You can assess this process in /handlers/command-processor.js and dictate how the bot handles certain commands. However, I recommend leaving this alone if you are not familiar with javascript programming.

## Running The Bot

To run the bot on Windows after carefully considering all the previous steps, right-click the directory that houses all of the files (bot.js, package.json, /audio/ folder, etc.) and click "Open in Terminal".
Next, simply type in the following:

```
node bot.js
```

Hit the Enter button and, voila, your bot is now monitoring your Twitch channel's chat messages and will respond accordingly!

Have fun!
