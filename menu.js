/**
 * Brandon Xue          brandonx@csu.fullerton.edu
 * Ernesto Hoogkkirk    Ernesto_Hooghkirk@csu.fullerton.edu
 * Ryan Martinez        rmartinez72@csu.fullerton.edu
 * 
 * Last maintained (YYMMDD): 200920
 * 
 * This file contains code for handling UI onclick events and window resizing,
 * and other menu related functionality.
 * 
 * There is also a function for a little (not so little) easter egg.
 */



const window_resize_timeout = 500; // Delay for debouncing window resize events
var window_resize_timer; // variable used to store window debouncing timer

/**
 * Recalculate the best-fitting canvas size, update the maze
 * with the new measurements so its draw functions work properly,
 * and repaint the maze.
 * 
 * This function will temporarily disable the game loop.
 */
function refit_scene() {
    noLoop();
    // Recalculate the unit area and wall thickness
    const max = row_count > col_count ? row_count : col_count;
    const unit_area = window.innerWidth * 0.5 / col_count;
    maze.resize(unit_area);

    // Recalculate canvas dimensions and resize canvas
    const width = (maze.col_count * maze.unit_area) + maze.wall_thickness;
    const height = (maze.row_count * maze.unit_area) + maze.wall_thickness;

    canvas.resize(width, height);
    maze_buff = createGraphics(width, height);
    maze.repaint();
    loop();
}

// Add an event listener to listen for window resizing
window.addEventListener('resize', function() { // Whenever window resizes
    // Clear the previous timer, preventing it from executing the function
    // that it was supposed to execute after the delay has elapsed.
    clearTimeout(window_resize_timer);
    // Then set another new timer with the same delay
    window_resize_timer = setTimeout(refit_scene, window_resize_timeout);
});

/**
 * Called when the watch button on the main menu is clicked.
 * Hides the main menu, enters watch mode with the game paused.
 */
function watch_on_click() {
    game_running = false;
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: none');

    game_mode = GameMode.watch; // Set the game mode to watch: watching the bot run
    unlock_speed();
    set_scene("bsp");
}
document.getElementById('watch').addEventListener('click', watch_on_click);

/**
 * Called when the play button on the main menu is clicked.
 * Hides the main menu, enters play mode with the game running.
 */
function play_on_click() {
    game_running = true; // single player, allow them to move immediately
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: none');

    game_mode = GameMode.play; // Set the game mode to play: play the game solo
    lock_speed(5);
    set_scene("bsp");
}
document.getElementById('play-mode').addEventListener('click', play_on_click);

/**
 * Called when the race button on the main menu is clicked.
 * Hides the main menu, enters race mode with the game paused.
 * This gives the player some time to prepare.
 */
function race_on_click() {
    game_running = false;
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: none');

    game_mode = GameMode.race; // Set the game mode to race: race against the bot
    lock_speed(5);
    set_scene("bsp");
}
document.getElementById('race').addEventListener('click', race_on_click);

/**
 * Open up the main menu again.
 * Disables the game loop.
 */
function return_to_main_on_click() {
    noLoop();
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: flex');
}
document.getElementById('return-to-main').addEventListener('click', return_to_main_on_click);

/**
 * Called when the Binary Space Partition button is clicked.
 * Sets a new scene using the requested algorithm.
 */
function select_bsp_maze() {
    game_running = false;
    set_scene('bsp');
}
document.getElementById('binary-space-partition').addEventListener('click', select_bsp_maze);

/**
 * Called when the Kruskal's MST Merge button is clicked.
 * Sets a new scene using the requested algorithm.
 */
function select_k_mst_maze() {
    game_running = false;
    set_scene('k_mst');
}
document.getElementById('kruskals-mst-merge').addEventListener('click', select_k_mst_maze);

/**
 * Called when the Recursive Backtracking button is clicked.
 * Sets a new scene using the requested algorithm.
 */
function select_recur_bt_maze() {
    game_running = false;
    set_scene('recur_bt');
}
document.getElementById('recursive-backtracking').addEventListener('click', select_recur_bt_maze);

/**
 * Called when an input event is detected on the rows text box.
 */
function row_input_update() {
    const row_input = document.getElementById('rows-input').value;
    if (!isNaN(row_input)) {
        let row_input_int = parseInt(row_input, 10);
        if (row_input_int < 5)
            row_input_int = 5;
        if (row_input_int > 100)
            row_input_int = 100;
        row_count = row_input_int;
    }
}
document.getElementById('rows-input').addEventListener('input', row_input_update);

/**
 * Called when an input event is detected on the columns text box.
 */
function col_input_update() {
    const col_input = document.getElementById('cols-input').value;
    if (!isNaN(col_input)) {
        let col_input_int = parseInt(col_input, 10);
        if (col_input_int < 5)
            col_input_int = 5;
        if (col_input_int > 100)
            col_input_int = 100;
        col_count = col_input_int;
    }
}
document.getElementById('cols-input').addEventListener('input', col_input_update);

/**
 * Called when an input event is detected on the speed text box.
 * This will notify all actors on the scene of the new speed.
 */
function on_speed_input() {
    const speed_input = document.getElementById('speed-input').value;
    if (!isNaN(speed_input)) {
        if (speed_input == "")
            return;
        let speed_input_int = parseInt(speed_input, 10);
        if (speed_input_int < 1)
            return;
        if (speed_input_int > 8)
            speed_input_int = 8;
        speed = speed_input_int;
        if (player != null)
            player.notify_speed_update();
        if (bot != null)
            bot.notify_speed_update();
    }
}
document.getElementById('speed-input').addEventListener('input', on_speed_input);

/**
 * On triangle play button click, run the game.
 */
function play_button_click() {
    game_running = true;
}
document.getElementById('play-button').addEventListener('click', play_button_click);

/**
 * On pause button click, pause the game.
 */
function pause_button_click() {
    game_running = false;
}
document.getElementById('pause-button').addEventListener('click', pause_button_click);

/**
 * On reset button click, reset all actors on the scene and pause the game.
 */
function reset_button_click() {
    game_running = false;
    if (player != null)
        player.reset();
    if (bot != null)
        bot.reset();
}
document.getElementById('reset-button').addEventListener('click', reset_button_click);

/**
 * Hmm, what might this be?
 */
function get_shrekt() {
    let x = document.getElementById('site-wrapper-div');
    x.setAttribute('style', 'background-color: rgb(114,135,0)');

    let options = document.querySelectorAll('[class="options-pane-inner"]');
    options.forEach(
        (elem) => {
            elem.setAttribute('style', 'background-color: rgb(114,135,0)');
    });
    
    options = document.querySelectorAll('[class="box-label"]');
    options.forEach(
        (elem) => {
            elem.setAttribute('style', 'background-color: rgb(191, 213, 160)');
    });

    options = document.querySelectorAll('[class="box-label-top"]');
    options.forEach(
        (elem) => {
            elem.setAttribute('style', 'background-color: rgb(191, 213, 160)');
    });
    
    options = document.querySelectorAll('[class="options-pane-outer"]');
    options.forEach(
        (elem) => {
            elem.setAttribute('style', 'background-color: rgb(191, 213, 160)');
    });

    x = document.getElementById('bottom-right-label');
    x.setAttribute('style', 'background-color: rgb(191, 213, 160)');

    document.getElementById('title').innerHTML = "You're in mah swamp now!";

    document.getElementById('bottom-right-label').innerText = "..you're an all star.";
    document.getElementsByClassName('box-label')[3].innerText = "Hey now,";

    document.getElementsByClassName('gen-maze-op-row')[6].innerText =
        "“There he goes. One of God's own prototypes." +
        " A high-powered mutant of some kind never even considered for mass production." +
        " Too weird to live, and too rare to die.” ― Hunter S. Thompson";

    wall_color = 'RGB(35, 142, 35)';
    background_color = 'RGB(85, 92, 70)';
    trail_color = 'RGB(112, 24, 0)';
    maze.repaint();
}
document.getElementById('dlc').addEventListener('click', get_shrekt);