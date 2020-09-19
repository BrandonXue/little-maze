const resize_timeout_duration = 250;
const bot_reset_timeout_duration = 500;
const text_timeout_duration = 100;
var resize_timeout; // variable used to store the timer
var bot_reset_timeout;
var text_input_timeout;
var can_generate;

function resize_maze() {
    not_generating = false;
    // Recalculate the unit area and wall thickness
    const unit_area = window.innerWidth * 0.5 / col_count;
    maze.resize(unit_area);

    // Recalculate canvas dimensions and resize canvas
    const width = (maze.col_count * maze.unit_area) + maze.wall_thickness;
    const height = (maze.row_count * maze.unit_area) + maze.wall_thickness;

    canvas.resize(width, height);
    maze_buff = createGraphics(width, height);
    maze.repaint();
    not_generating = true;
}

// Add an event listener to listen for window resizing
window.addEventListener('resize', function() { // Whenever window resizes
    // Clear the previous timer, preventing it from executing the function
    // that it was supposed to execute after the delay has elapsed.
    clearTimeout(resize_timeout);
    // Then set another new timer with the same delay
    resize_timeout = setTimeout(resize_maze, resize_timeout_duration);
    // In effect, only the last resize event within 400ms
    // will call the resize_maze function
});


function play() {
    console.log("test menu");
}
document.getElementById("play-mode").addEventListener("click", play);

function watch() {
    console.log("icles");
}
document.getElementById("watch").addEventListener("click", watch);

function race() {
    alert("This feature is coming soon!");
}
document.getElementById("race").addEventListener("click", race);

function generate_maze(maze_algorithm) {
    not_generating = false;
    const unit_area = window.innerWidth * 0.5 / col_count;
    // Create a new maze object. This makes sure there is no garbage data in the path bits
    // of the grid from the previous run.
    maze = new Maze(row_count, col_count, unit_area, wall_color, background_color);
    switch (maze_algorithm) {
        case "bsp":
            bsp_maze(maze);
            break;
        case "k_msp":
            k_mst_maze(maze, 0);
            break;
        case "recur_bt":
            recur_bt_maze(maze, 0.4);
            break;
    }
    resize_maze();
    not_generating = true;
}

function enable_bot_movement() {
    bot_may_move = true;
}

function select_bsp_maze() {
    bot_may_move = false;
    game_running = false;
    bot = null;
    generate_maze("bsp");
    bot = new Bot(maze, "yellow", speed);
    clearTimeout(bot_reset_timeout);
    bot_reset_timeout = setTimeout(enable_bot_movement, bot_reset_timeout_duration);
}
document.getElementById("binary-space-partition").addEventListener("click", select_bsp_maze);

function select_k_mst_maze() {
    bot_may_move = false;
    game_running = false;
    bot = null;
    generate_maze("k_msp");
    bot = new Bot(maze, "yellow", speed);
    clearTimeout(bot_reset_timeout);
    bot_reset_timeout = setTimeout(enable_bot_movement, bot_reset_timeout_duration);
}
document.getElementById("kruskals-mst-merge").addEventListener("click", select_k_mst_maze);

function select_recur_bt_maze() {
    bot_may_move = false;
    game_running = false;
    generate_maze("recur_bt");
    bot = new Bot(maze, "yellow", speed);
    clearTimeout(bot_reset_timeout);
    bot_reset_timeout = setTimeout(enable_bot_movement, bot_reset_timeout_duration);
}
document.getElementById("recursive-backtracking").addEventListener("click", select_recur_bt_maze);

function row_input_update() {
    const row_input = document.getElementById("rows-input").value;
    if (!isNaN(row_input)) {
        let row_input_int = parseInt(row_input, 10);
        if (row_input_int < 5)
            row_input_int = 5;
        if (row_input_int > 100)
            row_input_int = 100;
        row_count = row_input_int;
    }
}
document.getElementById("rows-input").addEventListener("input", row_input_update);

function col_input_update() {
    const col_input = document.getElementById("cols-input").value;
    if (!isNaN(col_input)) {
        let col_input_int = parseInt(col_input, 10);
        if (col_input_int < 5)
            col_input_int = 5;
        if (col_input_int > 100)
            col_input_int = 100;
        col_count = col_input_int;
    }
}
document.getElementById("cols-input").addEventListener("input", col_input_update);

function speed_input_update() {
    const speed_input = document.getElementById("speed-input").value;
    if (!isNaN(speed_input)) {
        let speed_input_int = parseInt(speed_input, 10);
        if (speed_input_int < 1)
            speed_input_int = 1;
        if (speed_input_int > 8)
            speed_input_int = 8;
        speed = speed_input_int;
    }
}
document.getElementById("speed-input").addEventListener("input", speed_input_update);

function play_button_click() {
    if (not_generating)
        game_running = true;
}
document.getElementById("play-button").addEventListener("click", play_button_click);


function pause_button_click() {
    game_running = false;
}
document.getElementById("pause-button").addEventListener("click", pause_button_click);


function reset_button_click() {
    game_running = false;
    bot_may_move = false; // disable bot movement
    bot.reset();
    // Timeout before renabling movement
    clearTimeout(bot_reset_timeout);
    bot_reset_timeout = setTimeout(enable_bot_movement, bot_reset_timeout_duration);
}
document.getElementById("reset-button").addEventListener("click", reset_button_click);
