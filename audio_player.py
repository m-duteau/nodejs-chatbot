import os
import sys
from playsound import playsound

# audio_path uses os.getcwd() which gets the current working directory that this .py file is located in
# Alternatively, you can remove the os.path.join() and hard code the directory of the audio files manually
# Example: audio_path = "C:\\Users\\currentuser\\ChatBot\\audio\\"
audio_path = os.path.join(os.getcwd(), "audio")

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