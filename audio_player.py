import os
import sys

# Enter the directory where your audio files are located.
# Ideally this will be within the directory that houses the ChatBot files.
# Example: audio_path = "C:/Users/currentuser/ChatBot/audio/"
audio_path = "ENTER YOUR DIRECTORY PATH HERE"

# Function plays the audio clip with the given audio file name
def playAudioClip(audio_file_name):
    # ".mp3" denotes the file type, ".mp3" could be modified to ".wav" if using wav files, for example
    audio_file_path = audio_path + audio_file_name + ".mp3"
    # The audio will be played using the operating system's default media player
    os.startfile(audio_file_path)

if __name__ == "__main__":
    # Extract the argument from bot.js to get the audio_file_name
    audio_file_name = sys.argv[1]
    # Play the audio file
    playAudioClip(audio_file_name)