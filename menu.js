const window_resize_timeout = 500;
var window_resize_timer; // variable used to store the timer
var can_generate;
var trail_color;

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

function place_actors() {
    switch (game_mode) {
        case GameMode.watch:
            player = null;
            bot = new MazeBot(maze, 'yellow', 'orange', speed);
            break;
        case GameMode.play:
            bot = null;
            player = new GamePlayer(maze, 'cyan', 'pink', speed);
            break;
        case GameMode.race:
            bot = new MazeBot(maze, 'yellow', 'orange', speed);
            player = new GamePlayer(maze, 'cyan', 'pink', speed);
            break;
    }
}

function generate_maze(maze_algorithm) {
    noLoop();
    const max = row_count > col_count ? row_count : col_count;
    const unit_area = window.innerWidth * 0.5 / col_count;
    // Create a new maze object. This makes sure there is no garbage data in the path bits
    // of the grid from the previous run.

    maze = new Maze(row_count, col_count, unit_area, wall_color, background_color);
    switch (maze_algorithm) {
        case 'bsp':
            bsp_maze(maze);
            break;
        case 'k_mst':
            const bias = (slider.value() / 100);
            k_mst_maze(maze, bias);
            break;
        case 'recur_bt':
            const straightness = (slider.value() + 100) / 200;
            recur_bt_maze(maze, straightness);
            break;
    }
    place_actors();
    refit_scene();
}

function lock_speed(fixed_speed) {
    const speed_input_textbox = document.getElementById('speed-input');
    speed_input_textbox.value = fixed_speed;
    speed_input_textbox.disabled = true;
    speed = fixed_speed;
    if (player != null)
        player.notify_speed_update();
    if (bot != null)
        bot.notify_speed_update();
}

function unlock_speed() {
    const speed_input_textbox = document.getElementById('speed-input');
    speed_input_textbox.disabled = false;
    on_speed_input();
    if (player != null) // currently player is always null when this happens, might change later
        player.notify_speed_update();
    if (bot != null)
        bot.notify_speed_update();
}

function watch_on_click() {
    game_running = false;
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: none');

    game_mode = GameMode.watch; // Set the game mode to watch: watching the bot run
    unlock_speed();
    generate_maze("bsp");
}
document.getElementById('watch').addEventListener('click', watch_on_click);

function play_on_click() {
    game_running = true; // single player, allow them to move immediately
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: none');

    game_mode = GameMode.play; // Set the game mode to play: play the game solo
    lock_speed(5);
    generate_maze("bsp");
}
document.getElementById('play-mode').addEventListener('click', play_on_click);

function race_on_click() {
    game_running = false;
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: none');

    game_mode = GameMode.race; // Set the game mode to race: race against the bot
    lock_speed(5);
    generate_maze("bsp");
}
document.getElementById('race').addEventListener('click', race_on_click);

function return_to_main_on_click() {
    noLoop();
    const x = document.getElementById('main-side-panel');
    x.setAttribute('style', 'display: flex');
}
document.getElementById('return-to-main').addEventListener('click', return_to_main_on_click);

function select_bsp_maze() {
    game_running = false;
    generate_maze('bsp');
}
document.getElementById('binary-space-partition').addEventListener('click', select_bsp_maze);

function select_k_mst_maze() {
    game_running = false;
    generate_maze('k_mst');
}
document.getElementById('kruskals-mst-merge').addEventListener('click', select_k_mst_maze);

function select_recur_bt_maze() {
    game_running = false;
    generate_maze('recur_bt');
}
document.getElementById('recursive-backtracking').addEventListener('click', select_recur_bt_maze);

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

function play_button_click() {
    game_running = true;
}
document.getElementById('play-button').addEventListener('click', play_button_click);

function pause_button_click() {
    game_running = false;
}
document.getElementById('pause-button').addEventListener('click', pause_button_click);

function reset_button_click() {
    game_running = false;
    bot.reset();
}
document.getElementById('reset-button').addEventListener('click', reset_button_click);


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

    
    document.getElementsByClassName('gen-maze-op-row')[6].innerText = "“There he goes. One of God's own prototypes. A high-powered mutant of some kind never even considered for mass production. Too weird to live, and too rare to die.” ― Hunter S. Thompson";

    wall_color = 'RGB(35, 142, 35)';
    background_color = 'RGB(85, 92, 70)';
    trail_color = 'RGB(112, 24, 0)';
    maze.repaint();
}
document.getElementById('dlc').addEventListener('click', get_shrekt);

