/*
You can use different bot triggers to determine the OpenAI response's behavior
ALL TRIGGERS SHOULD BE LOWERCASE -- do not include prefixes like '!' or '$'; /utils/get-trigger-match.js handles this
*/
export const openaiTriggers = {
    "chatbot": {behavior: "You are a helpful assistant. You must respond with 500 characters or less."},
    "funnybot": {behavior: "You are a funny assistant that loves cracking jokes. You must respond with 500 characters or less."} // <- only the last element does not need a comma, add comma if adding more bot behaviors
};