var resize_counter = 0;

function resize_maze() {
    // Recalculate the unit area and wall thickness
    const unit_area = window.innerWidth * 0.5 / col_count;
    maze.resize(unit_area);

    // Recalculate canvas dimensions and resize canvas
    const width = (maze.col_count * maze.unit_area) + maze.wall_thickness;
    const height = (maze.row_count * maze.unit_area) + maze.wall_thickness;

    canvas.resize(width, height);
    maze_buff = createGraphics(width, height);
    maze.repaint();
}

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
document.getElementById("play").addEventListener("click", play);

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
    setTimeout(enable_bot_movement, 500);
}
document.getElementById("binary-space-partition").addEventListener("click", select_bsp_maze);

function select_k_mst_maze() {
    bot_may_move = false;
    game_running = false;
    bot = null;
    generate_maze("k_msp");
    bot = new Bot(maze, "yellow", speed);
    setTimeout(enable_bot_movement, 500);
}
document.getElementById("kruskals-mst-merge").addEventListener("click", select_k_mst_maze);

function select_recur_bt_maze() {
    bot_may_move = false;
    game_running = false;
    generate_maze("recur_bt");
    bot = new Bot(maze, "yellow", speed);
    setTimeout(enable_bot_movement, 500);
}
document.getElementById("recursive-backtracking").addEventListener("click", select_recur_bt_maze);