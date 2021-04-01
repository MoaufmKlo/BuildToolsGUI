const {app, BrowserWindow} = require("electron");

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
    win.loadFile("index.html");
});

app.on("window-all-closed", function() {
    app.quit();
});