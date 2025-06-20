import OpenAI from "openai";

const openai = new OpenAI();

/* Function that prompts OpenAI for a response
 *  param userPrompt is the message sent to OpenAI that it will respond to
 *  param behavior will determine the OpenAI response's behavior
 *  param currentChatter is the person who sent the prompt
 */
export async function promptOpenAI(userPrompt, behavior, currentChatter) {
    console.log(`New OpenAI prompt: ${currentChatter} says: ${userPrompt}`);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            // Content for "system" role will determine the OpenAI response behavior
            { role: "system", content: behavior },
            // Send the message from userPrompt param to OpenAI for a response
            {
                role: "user",
                content: `${currentChatter} says: ${userPrompt}`,
            },
        ],
    });
    // The response is held within the content of completion's message
    return completion.choices[0].message.content;
}
