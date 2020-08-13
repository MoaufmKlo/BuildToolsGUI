// Modules
const {app, BrowserWindow} = require("electron");

// Create window after initialization
app.whenReady().then(function() {
    const win = new BrowserWindow({
        width: 800,
        height: 950,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.removeMenu();
    win.loadFile("index.html");
});

// Quit when all windows are closed
app.on("window-all-closed", function() {
    app.quit();
});