                                                                // can add or remove trigger prefixes here
export function getTriggerMatch(message, triggerMap, prefixes = ['$', '!']) {
    // iterate through prefixes
    for (const prefix of prefixes) {
        if (message.startsWith(prefix)) {
            // remove the prefix
            const key = message.slice(prefix.length).trim();
            if (triggerMap[key]) {
                // data is returned when a key is found
                return { key, data: triggerMap[key], prefix };
            }
        }
    }
    return null;
}