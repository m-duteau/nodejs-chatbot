import os
import sys
from playsound import playsound

# script_dir gets the current working director and root_dir directs to the root; audio_path then finds the \\audio\\ folder
# Alternatively, you can script_dir and root_dir and hard code the directory of the audio files manually to audio_path
# Example: audio_path = "C:\\Users\\currentuser\\ChatBot\\audio\\"
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(script_dir, ".."))
audio_path = os.path.join(root_dir, "audio")

# Function plays the audio clip with the given audio file name
def playAudioClip(audio_file_name):
    # ".mp3" denotes the file type, ".mp3" could be modified to ".wav" if using wav files, for example
    audio_file_path = os.path.join(audio_path, audio_file_name + ".mp3")
    # The audio will be played using the Python's playsound module
    playsound(audio_file_path)

if __name__ == "__main__":
    # Check that there is an argument to avoid crashing if there is none
    if len(sys.argv) < 2:
        sys.exit(1)

    # Extract the argument from bot.js to get the audio_file_name
    audio_file_name = sys.argv[1]
    # Play the audio file
    playAudioClip(audio_file_name)