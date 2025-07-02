const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    sendCredentials: (creds) =>
        ipcRenderer.send("credentials-submitted", creds),
});
