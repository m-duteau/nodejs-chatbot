/*
You can use different bot triggers to determine the OpenAI response's behavior
Manually enter the triggerLength by counting the characters in the trigger string, i.e., !chatbot has 8 character length
You can set triggerLength to 0 if you don't want to worry about it, but the triggerLength will ensure that the trigger string is extracted from the message being sent to OpenAI
I.e., instead of sending "!chatbot hello!" to OpenAI, "hello!" will be sent instead of triggerLengths are managed properly
ALL TRIGGERS SHOULD BE LOWERCASE
*/
export const openaiTriggers = {
    "!chatbot": {triggerLength: 8,
        behavior: "You are a helpful assistant. You must respond with 500 characters or less."
    },
    "!funnybot": {triggerLength: 9,
        behavior: "You are a funny assistant that loves cracking jokes. You must respond with 500 characters or less."
    } // <- only the last element does not need a comma, add comma if adding more bot behaviors
};