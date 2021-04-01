// Modules
const {app, BrowserWindow} = require("electron");

// Create window after initialization
app.whenReady().then(function() {
    const win = new BrowserWindow({
        width: 600,
        minWidth: 600,
        height: 790,
        minHeight: 790,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.removeMenu();
    win.webContents.openDevTools();
    win.loadFile("index.html");
});

// Quit when all windows are closed
app.on("window-all-closed", function() {
    app.quit();
});