/*
Add your audio files and soundboard triggers here; include message only if desired
Ensure all files are .mp3s and do not include the .mp3 suffix
ALL TRIGGERS SHOULD BE LOWERCASE -- do not include prefixes like '!' or '$'; /utils/get-trigger-match.js handles this
*/
export const audioTriggers = {
    hello: { file: "Female Saying Hello Sound Effect", audioMessage: "Hello!" }, // message can be added if desired
    wompwomp: { file: "Sad Trombone - Sound Effect (HD)" },
    lol: { file: "Sound Effects - Sitcom Laugh" }, // <- only the last element does not need a comma, add comma if adding more sounds
};
