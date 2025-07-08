const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    sendCredentials: (creds) =>
        ipcRenderer.invoke("credentials-submitted", creds),
});
