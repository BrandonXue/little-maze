const window_resize_timeout = 250;
const bot_reset_timeout = 500;
const speed_input_timeout = 100;
var window_resize_timer; // variable used to store the timer
var bot_reset_timer;
var speed_input_timer;
var can_generate;
var trail_color;

function on_window_resize() {
    not_generating = false;
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
    not_generating = true;
}

// Add an event listener to listen for window resizing
window.addEventListener('resize', function() { // Whenever window resizes
    // Clear the previous timer, preventing it from executing the function
    // that it was supposed to execute after the delay has elapsed.
    clearTimeout(window_resize_timer);
    // Then set another new timer with the same delay
    window_resize_timer = setTimeout(on_window_resize, window_resize_timeout);
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
    const max = row_count > col_count ? row_count : col_count;
    const unit_area = window.innerWidth * 0.5 / col_count;
    // Create a new maze object. This makes sure there is no garbage data in the path bits
    // of the grid from the previous run.
    maze = new Maze(row_count, col_count, unit_area, wall_color, background_color);
    switch (maze_algorithm) {
        case "bsp":
            bsp_maze(maze);
            break;
        case "k_mst":
            k_mst_maze(maze, 0);
            break;
        case "recur_bt":
            recur_bt_maze(maze, 0.4);
            break;
    }
    on_window_resize();
    not_generating = true;
}

function enable_bot_movement() {
    bot_may_move = true;
}

function select_bsp_maze() {
    bot_may_move = false;
    game_running = false;
    generate_maze("bsp");
    delete bot;
    bot = new Bot(maze, "yellow", speed);
    clearTimeout(bot_reset_timer);
    bot_reset_timer = setTimeout(enable_bot_movement, bot_reset_timeout);
}
document.getElementById("binary-space-partition").addEventListener("click", select_bsp_maze);

function select_k_mst_maze() {
    bot_may_move = false;
    game_running = false;
    generate_maze("k_mst");
    bot = new Bot(maze, "yellow", speed);
    clearTimeout(bot_reset_timer);
    bot_reset_timer = setTimeout(enable_bot_movement, bot_reset_timeout);
}
document.getElementById("kruskals-mst-merge").addEventListener("click", select_k_mst_maze);

function select_recur_bt_maze() {
    bot_may_move = false;
    game_running = false;
    generate_maze("recur_bt");
    bot = new Bot(maze, "yellow", speed);
    clearTimeout(bot_reset_timer);
    bot_reset_timer = setTimeout(enable_bot_movement, bot_reset_timeout);
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
        if (speed_input == "")
            return;
        let speed_input_int = parseInt(speed_input, 10);
        if (speed_input_int < 1)
            return;
        if (speed_input_int > 8)
            speed_input_int = 8;
        speed = speed_input_int;
        bot.notify_speed_update();
    }
}
function speed_text_changed() {
    //console.log("using debounce")
    clearTimeout(speed_input_timer);
    speed_input_timer = setTimeout(speed_input_update, speed_input_timeout);
}
document.getElementById("speed-input").addEventListener("input", speed_text_changed);

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
    clearTimeout(bot_reset_timer);
    bot_reset_timer = setTimeout(enable_bot_movement, bot_reset_timeout);
}
document.getElementById("reset-button").addEventListener("click", reset_button_click);


function get_shrekt() {
    console.log("You're in mah swamp now.")
    x = document.getElementById('site-wrapper-div');
    x.setAttribute("style", 'background-color: rgb(114,135,0)');

    let options = document.querySelectorAll('[class="options-pane-inner"]');
    options.forEach(
        (elem) => {
            elem.setAttribute("style", 'background-color: rgb(114,135,0)');
    });
    
    options = document.querySelectorAll('[class="box-label"]');
    options.forEach(
        (elem) => {
            elem.setAttribute("style", 'background-color: rgb(191, 213, 160)');
    });

    options = document.querySelectorAll('[class="box-label-top"]');
    options.forEach(
        (elem) => {
            elem.setAttribute("style", 'background-color: rgb(191, 213, 160)');
    });
    
    options = document.querySelectorAll('[class="options-pane-outer"]');
    options.forEach(
        (elem) => {
            elem.setAttribute("style", 'background-color: rgb(191, 213, 160)');
    });

    x = document.getElementById('bottom-right-label');
    x.setAttribute("style", 'background-color: rgb(191, 213, 160)');

    document.getElementById('title').innerHTML = "You're in mah swamp now!";

    document.getElementById('bottom-right-label').innerText = "..you're an all star.";
    document.getElementsByClassName('box-label')[3].innerText = "Hey now,";

    
    document.getElementsByClassName('gen-maze-op-row')[6].innerText = "“There he goes. One of God's own prototypes. A high-powered mutant of some kind never even considered for mass production. Too weird to live, and too rare to die.” ― Hunter S. Thompson";

    wall_color = "RGB(35, 142, 35)";
    background_color = "RGB(85, 92, 70)";
    trail_color = "#701800";
    maze.repaint();
    //document.getElementById('bottom-right-label').setAttribute("style", 'background-color: white');

    //const option_panes = document.getElementsByClassName('options-pane-inner');
    
    /*option_panes.s
    for (let i = 0; i < option_panes.length; ++i) {
        s = option_panes[i];
        s.setAttribute("style", 'background-color: rgb(114,135,0)');
    }*/
    //.style.background_color = "Lime";
    //document.getElementsByClassName('site-wrapper')[0].style.background_color = "Lime";
    // var x;
    // try{
    //     x = document.getElementById('site-wrapper-div');
    //    //x = document.querySelector('[class = "site-wrapper"]');
    //     x.setAttribute("style", 'background-color: lime');
    //    //x = document.getElementById('site-wrapper-div');
    //    //x.className = "site-wrapper-update";
    //    //console.log(x);
    // }
    // catch{
    //     console.log("doesnt work");
    // }

}
document.getElementById("dlc").addEventListener("click", get_shrekt);