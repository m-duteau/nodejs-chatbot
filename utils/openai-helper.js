import OpenAI from "openai";

const openai = new OpenAI();

/* Function that prompts OpenAI for a response
 *  param userPrompt is the message sent to OpenAI that it will respond to
 *  param behavior will determine the OpenAI response's behavior
 *  param currentChatter is the person who sent the prompt
 */
export async function promptOpenAI(
    userPrompt,
    behavior,
    currentChatter,
    trigger
) {
    console.log(`New OpenAI prompt: ${currentChatter} says: ${userPrompt}`);
    let contentMessage;

    // Check if a shoutout is requested
    if (trigger === "gptso") {
        // Take the first word of the prompt, which should be the username being shouted out
        const firstWord = userPrompt
            .split(/\s+/)[0]
            ?.toLowerCase()
            .replace("@", "");
        // Get the username with correct casing
        const shoutoutName = await getDisplayName(firstWord);
        // Hold the message to send to OpenAI for a response
        contentMessage = `${currentChatter} has requested a shoutout for ${shoutoutName}'s Twitch channel at https://www.twitch.tv/${firstWord}`;
        console.log(`Shoutout message: ${contentMessage}`);
        // Else just take the userPrompt
    } else {
        contentMessage = `${currentChatter} says: ${userPrompt}`;
    }
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            // Content for "system" role will determine the OpenAI response behavior
            { role: "system", content: behavior },
            // Send the message to OpenAI for a response
            {
                role: "user",
                content: contentMessage,
            },
        ],
    });
    // The response is held within the content of completion's message
    return completion.choices[0].message.content;
}
