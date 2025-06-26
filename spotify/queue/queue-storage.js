import fs from "fs";
import path from "path";

const queuePath = path.resolve("spotify", "queue", "queue.json");

// Ensure the file exists
if (!fs.existsSync(queuePath)) {
    fs.writeFileSync(queuePath, JSON.stringify([]));
}

// Gets the current queue from queue.json if queue.json exists and is non-empty
function getQueue() {
    // queue.json does not exist, return empty array
    if (!fs.existsSync(queuePath)) {
        return [];
    }

    const content = fs.readFileSync(queuePath, "utf-8").trim();

    // queue.json empty, return empty array
    if (!content) {
        return [];
    }

    // Return the content of queue.json
    try {
        return JSON.parse(content);
    } catch (err) {
        // queue.json is corrupted, return empty array
        console.warn("Corrupted queue.json: ", err.message);
        return [];
    }
}

/*
 * Adds a song to the queue
 * params track and username are written to queue.json
 */
function addToQueue(track, username) {
    // Get the queue
    const queue = getQueue();
    // Add the track, username to the queue
    queue.push({ track, username });
    // Update queue.json
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
}

// Removes the first element from queue.json
function removeFirstFromQueue() {
    // Get the queue
    const queue = getQueue();
    // Remove first element and save it
    const removed = queue.shift();
    // Write new shifted array to queue.json
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    // Return the removed track/username
    return removed;
}

// Gets the first five entries in queue.json
function peekQueue(limit = 5) {
    return getQueue().slice(0, limit);
}

// Clears queue.json
function clearQueue() {
    fs.writeFileSync(queuePath, "[]", "utf-8");
    console.log("Queue cleared.");
}

export { getQueue, addToQueue, removeFirstFromQueue, peekQueue, clearQueue };
