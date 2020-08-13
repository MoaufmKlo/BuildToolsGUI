// Modules
const {app, BrowserWindow} = require("electron");
const path = require("path");

// Create window after initialization
app.whenReady().then(function() {
    const win = new BrowserWindow({
        width: 800,
        height: 950,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile("index.html");
});

// Quit when all windows are closed
app.on("window-all-closed", function() {
    app.quit();
});