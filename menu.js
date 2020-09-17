function play() {
    console.log("test menu");
}

function watch() {
    console.log("icles");
}

function race() {
    alert("This feature is coming soon!");
}

document.getElementById("watch").addEventListener("click", watch);
document.getElementById("play").addEventListener("click", play);
document.getElementById("race").addEventListener("click", race);