const dialog = require("electron").remote.dialog;
const nativeTheme = require("electron").remote.nativeTheme;
const systemPreferences = require("electron").remote.systemPreferences;

var download = require("download");

const https = require('https');
const fs = require('fs');

const spawn = require("child_process").spawn;

class CustomSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        let style = document.createElement('style');
        style.textContent = `
    :host {
        display: inline-block;
        position: relative;
        width: auto;
        min-width: 150px;
        height: auto;
        background: rgb(var(--background-secondary));
        padding: 0;
        margin: 0 0 10px 0;
        line-height: 2rem;
        font-size: 0.9rem;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    :host::before {
        content: "\u25be";
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        width: 2rem;
        height: 2rem;
        text-align: center;
        font-size: 1.5rem;
        pointer-events: none;
    }
    
    :host > span {
        display: block;
        position: relative;
        padding: 0 2rem 0 20px;
        cursor: pointer;
        height: 2rem;
        line-height: 2rem;
        text-transform: capitalize;
        font-weight: 400;
        color: rgb(var(--color-accent));
    }
    
    :host > div {
        display: block;
        position: absolute;
        z-index: 2;
        width: 100%;
        height: auto;
        box-sizing: border-box;
        border-radius: 4px;
        background: rgba(var(--background-secondary), 1);
        padding: 0;
        left: 0;
        top: 100%;
        max-height: 300px;
        overflow-x: hidden;
        overflow-y: auto;
        transition: all 0.1s ease;
        
        pointer-events: none;
        opacity: 0;
    }
    
    :host([active]) > div {
        pointer-events: auto;
        opacity: 1;
        top: calc(100% + 5px);
    }
    
    :host > div a {
        display: block;
        position: relative;
        width: 100%;
        height: 2rem;
        line-height: 2rem;
        padding: 0 1rem;
        box-sizing: border-box;
        color: rgb(var(--color-primary));
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
    }
    
    :host > div a:hover {
        padding: 0 1rem 0 1.1rem;
        color: rgb(var(--color-accent));
    }
    `;

        let selectedText = document.createElement('span');
        let optionsContainer = document.createElement('div');

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(selectedText);
        this.shadowRoot.appendChild(optionsContainer);

        selectedText.addEventListener('click', (e) => {
            if (this.hasAttribute('active')) {
                this.removeAttribute('active');
            } else {
                this.setAttribute('active', '');
            }
        });
    }

    connectedCallback() {
        const options = this.querySelectorAll('option');
        this.innerHTML = '';
        this.shadowRoot.querySelector('span').innerText = options[0].innerText || "default";
        this.setAttribute('value', options[0].getAttribute('value'));

        for (let x = 0; x < options.length; x++) {
            let option = document.createElement('a');
            option.setAttribute('value', options[x].getAttribute('value'));
            option.innerText = options[x].innerText;
            option.addEventListener('click', (e) => {
                this.setAttribute('value', options[x].getAttribute('value'));
                this.shadowRoot.querySelector('span').innerText = options[x].innerText;
                this.removeAttribute('active');
            });
            this.shadowRoot.querySelector('div').appendChild(option);
        }
    }
}

class CustomLog extends HTMLElement {
    log(val) {
        let logElement = document.createElement('span');
        let today = new Date(),
                h = today.getHours(),
                m = today.getMinutes(),
                s = today.getSeconds();
        let timestamp = h + ":" + m + ":" + s;
        logElement.innerHTML = `<a>${timestamp}: </a>${val.replace(/<[^>]*>?/gm, '')}`;
        this.shadowRoot.appendChild(logElement);
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        let style = document.createElement('style');
        style.textContent = `
    :host {
        display: block;
        position: relative;
        width: 100%;
        min-height: 200px;
        padding: 1rem;
        margin: 0 0 20px 0;
        box-sizing: border-box;
        background: rgb(var(--background-secondary));
        color: rgb(var(--color-primary));
        overflow-x: hidden;
        overflow-y: auto;
        border-radius: 4px;
    }
    
    :host > span {
        display: block;
        line-height: 1.5rem;
        user-select: text;
    }
    
    :host > span a {
        color: rgb(var(--color-accent));
    }
    `;

        this.shadowRoot.appendChild(style);
    }
}

customElements.define('custom-select', CustomSelect);
customElements.define('custom-log', CustomLog);

const logElement = document.querySelector('custom-log');
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");

logElement.log("BuildToolsGUI Started.")

document.getElementById("selectDirectory").onclick = function () {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(function (path) {
        if (path.canceled == false) {
            window.downloadPath = path.filePaths[0];
            logElement.log("Directory Selected: " + path.filePaths[0].toString());
        }
    });
}

document.getElementById("build").onclick = async function () {
    if (window.downloadPath) {
        document.getElementById("build").classList.add("disabled");
        logElement.log("Downloading BuildTools");

        await download("https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar", window.downloadPath.replace(/\|_/g, "/"));

        var child = spawn("java", ["-jar", window.downloadPath.replace(/\|_/g, "/") + "/BuildTools.jar", "--rev", document.getElementById("versions").getAttribute('value')], {
            cwd: window.downloadPath.replace(/\|_/g, "/")
        });

        logElement.log("Building...");

        child.stdout.on('data', function (data) {
            if (data.toString().includes("Success! Everything completed")) {
                logElement.log("🎉 " + data.toString());
                document.getElementById("build").classList.remove("disabled");
            } else {
                logElement.log(data.toString());
            }

            if (data.toString().includes("Loading BuildTools version:")) {
                progress.innerText = "5%";
                progressBar.style.width = "5%";
            }

            if (data.toString().includes("git version")) {
                progress.innerText = "10%";
                progressBar.style.width = "10%";
            }

            if (data.toString().includes("Patching with Block.patch") || data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\DragonControllerHover.class")) {
                progress.innerText = "25%";
                progressBar.style.width = "25%";
            }

            if (data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\EnchantmentSweeping.class")) {
                progress.innerText = "35%";
                progressBar.style.width = "35%";
            }

            if (data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\TileEntityCommand$1.class")) {
                progress.innerText = "40%";
                progressBar.style.width = "40%";
            }

            if (data.toString().includes("Patching with PathfinderGoalNearestAttackableTarget.patch") || data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\ArgumentVectorPosition.class")) {
                progress.innerText = "50%";
                progressBar.style.width = "50%";
            }

            if (data.toString().includes("Applying patches to Spigot-API") || data.toString().includes("Decompiling class net/minecraft/server/WorldMap")) {
                progress.innerText = "60%";
                progressBar.style.width = "60%";
            }

            if (data.toString().includes("Applying: Plug WorldMap Memory Leak") || data.toString().includes("INFO:  Decompiling class net/minecraft/server/TagsItem")) {
                progress.innerText = "75%";
                progressBar.style.width = "75%";
            }

            if (data.toString().includes("*** Spigot patches applied!") || data.toString().includes("INFO:  Decompiling class net/minecraft/server/PacketPlayInVehicleMove")) {
                progress.innerText = "80%";
                progressBar.style.width = "80%";
            }

            if (data.toString().includes("Success! Everything completed")) {
                progress.innerText = "100%";
                progressBar.style.width = "100%";
            }

            logElement.scrollTop = logElement.scrollHeight;
        });

        child.on("exit", function () {
            child = null;
        });
    } else {
        logElement.log("Awaiting selection");
        logElement.log("No folder selected");
    }
}