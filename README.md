# nodejs-chatbot
A chatbot that runs locally as a Node.js program with ChatGPT connection and audio playing script.

## ChatBot Basics
The ChatBot works off of the example given at https://dev.twitch.tv/docs/chat/chatbot-guide/

To enhance the ChatBot for my own personal wants, I've added a python script that will open the media player on Windows and play audio clips, functioning similar to the Blerp extension but locally.
OpenAI Integration was also added so that people within the chatroom can trigger the bot to respond to prompts for added engagement.

## Setup
You will need Python installed on your system as well as PythonShell and OpenAI within the project.

```
npm install python-shell
```

```
npm install openai
```

### Connecting to Twitch
You will need to create a second Twitch account for the bot to run through. If you want to use the same email as your regular Twitch account to register the bot, the following video was helpful for this:
https://youtu.be/6Eh3-WUokhQ?si=_43e7kP9JfhpxS93

Retrieving user IDs for your chatbot and your actual Twitch account can be done at https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/

Retrieve your client ID by registering an app at https://dev.twitch.tv/ using the bot's Twitch account.

Oauth token can be retrieved by using a link such as the following and entering your client ID in the appropriate place as well as your redirect URI (I just use localhost).
```
https://id.twitch.tv/oauth2/authorize
    ?response_type=token
    &client_id=YOURCLIENTID
    &redirect_uri=http://localhost
    &scope=user%3Aread%3Achat+user%3Awrite%3Achat
```

The page will not load as a valid page, but you will be able to locate the token within your browser's address bar.

### Playing Audio Files
Audio files should be placed in the audio/ folder and ideally be .mp3 format. Note that you will need to keep track of your audio file's exact names and enter them into the bot.js code accordingly in order to avoid crashes.

Playing audio files now utilizes Python's playsound module which alleviates the issue of the operating system's default media player interrupting gameplay when it would play a new audio file. Playsound now allows audio files to play in the background and does not interrupt gameplay. To ensure playsound will work properly, make sure your pip version is the most recent and install the playsound module oon your operating system.
```
python -m pip install --upgrade pip
```

```
pip install playsound
```

### OpenAI Integration
You will need to create an OpenAI account if attempting to use the ChatBot with it.

You will then need to go retrieve a secret key to access the API via OpenAI at https://platform.openai.com/api-keys

Subsequently, right-click the directory that houses all of the files (bot.js, audio_player.py, /audio/ folder, etc.), click "Open in Terminal" and enter the following:
```
setx OPENAI_API_KEY 'enter your secret key here'
```
This will allow the chatbot to access the OpenAI API. You may need to pay in order for access to the API to succeed when making calls, though that gpt-4o-mini is arguably cheap when just doing text prompts.

### Running The Bot
To run the bot on Windows, right-click the directory that houses all of the files (bot.js, audio_player.py, /audio/ folder, etc.) and click "Open in Terminal".
Next, simply type in the following:
```
node bot.js
```
Hit the Enter button and, voila, your bot is now monitoring your Twitch channel's chat messages and will respond accordingly!

Have fun!
