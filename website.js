const dialog = require("electron").remote.dialog;
const nativeTheme = require("electron").remote.nativeTheme;
const systemPreferences = require("electron").remote.systemPreferences;

var download = require("download");

const https = require('https');
const fs = require('fs');

const spawn = require("child_process").spawn;

document.getElementById("selectDirectory").onclick = function() {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(function(path) {
        if(path.canceled == false) {
            window.downloadPath = path.filePaths[0];
        }
    });
}

document.getElementById("build").onclick = async function() {
    if(window.downloadPath) {
        document.getElementById("build").classList.add("siimple-btn--disabled");
        document.getElementById("output").innerHTML = "Downloading BuildTools";

        await download("https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar", window.downloadPath.replace(/\|_/g, "/"));

        var child = spawn("java", ["-jar", window.downloadPath.replace(/\|_/g, "/") + "/BuildTools.jar", "--rev", document.getElementById("versions").value], {
            cwd: window.downloadPath.replace(/\|_/g, "/")
        });

        document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + "\nBuilding";

        child.stdout.on('data', function(data) {
            if(data.toString().includes("Success! Everything completed")) {
                document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + "\n🎉 " + data.toString();
                document.getElementById("build").classList.remove("siimple-btn--disabled");
                document.getElementById("progress").classList.add("siimple-progress--success");
            } else {
                document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + "\n" + data.toString();
            }

            if(data.toString().includes("Loading BuildTools version:")) document.getElementById("progress").style.width = "5%";
            if(data.toString().includes("git version")) document.getElementById("progress").style.width = "10%";

            if(data.toString().includes("Patching with Block.patch")) document.getElementById("progress").style.width = "25%";
            if(data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\DragonControllerHover.class")) document.getElementById("progress").style.width = "25%";

            if(data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\EnchantmentSweeping.class")) document.getElementById("progress").style.width = "35%";
            if(data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\TileEntityCommand$1.class")) document.getElementById("progress").style.width = "40%";

            if(data.toString().includes("Patching with PathfinderGoalNearestAttackableTarget.patch")) document.getElementById("progress").style.width = "50%";
            if(data.toString().includes("Extracted: work\decompile-ee3ecae0\classes\net\minecraft\server\ArgumentVectorPosition.class")) document.getElementById("progress").style.width = "50%";

            if(data.toString().includes("Applying patches to Spigot-API")) document.getElementById("progress").style.width = "60%";
            if(data.toString().includes("Decompiling class net/minecraft/server/WorldMap")) document.getElementById("progress").style.width = "60%";

            if(data.toString().includes("Applying: Plug WorldMap Memory Leak")) document.getElementById("progress").style.width = "75%";
            if(data.toString().includes("INFO:  Decompiling class net/minecraft/server/TagsItem")) document.getElementById("progress").style.width = "75%";


            if(data.toString().includes("*** Spigot patches applied!")) document.getElementById("progress").style.width = "80%";
            if(data.toString().includes("INFO:  Decompiling class net/minecraft/server/PacketPlayInVehicleMove")) document.getElementById("progress").style.width = "80%";

            if(data.toString().includes("Success! Everything completed")) document.getElementById("progress").style.width = "100%";

            document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
        });

        child.on("exit", function() {
            child = null;
        });
    } else {
        document.getElementById("output").innerHTML = "Awaiting selection\nNo folder selected";
    }
}

nativeTheme.on("updated", function() {
    changeColorTheme();
});

function changeColorTheme() {
    if(!nativeTheme.shouldUseDarkColors) {
        document.body.style.color = "";
        document.body.style.backgroundColor = "";
        document.getElementById("header").classList.add("siimple-h2");
        document.getElementById("header").classList.remove("siimple-h2--dark");
        document.getElementById("versions").classList.add("siimple-select");
        document.getElementById("versions").classList.remove("siimple-select--dark");
        document.getElementById("output").classList.add("siimple-textarea");
        document.getElementById("output").classList.remove("siimple-textarea--dark");
        document.getElementById("progressbar").classList.add("siimple-progress");
        document.getElementById("progressbar").classList.remove("siimple-progress--dark");
    } else {
        document.body.style.color = "white";
        document.body.style.backgroundColor = "#121212";
        document.getElementById("header").classList.remove("siimple-h2");
        document.getElementById("header").classList.add("siimple-h2--dark");
        document.getElementById("versions").classList.remove("siimple-select");
        document.getElementById("versions").classList.add("siimple-select--dark");
        document.getElementById("output").classList.remove("siimple-textarea");
        document.getElementById("output").classList.add("siimple-textarea--dark");
        document.getElementById("progressbar").classList.remove("siimple-progress");
        document.getElementById("progressbar").classList.add("siimple-progress--dark");
    }
}

document.onload = changeColorTheme();