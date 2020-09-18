var resize_counter = 0;

var resize_timeout; // variable used to store the timer

// Add an event listener to listen for window resizing
window.addEventListener('resize', function() { // Whenever window resizes
    // Clear the previous timer, preventing it from executing the function
    // that it was supposed to execute after the delay has elapsed.
    clearTimeout(resize_timeout);
    // Then set another new timer with the same delay
    resize_timeout = setTimeout(resize_maze, 250);
    // In effect, only the last resize event within 400ms
    // will call the resize_maze function
});

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