/**
 * Brandon Xue          brandonx@csu.fullerton.edu
 * Ernesto Hoogkkirk    Ernesto_Hooghkirk@csu.fullerton.edu
 * Ryan Martinez        rmartinez72@csu.fullerton.edu
 * 
 * Last maintained (YYMMDD): 200920
 * 
 * This file contains the definitions for the P5 setup() and draw() as well
 * as other primary game-related functions.
 * 
 * Primary functions include setting up the game scene, and coordinating
 * the tasks performed in every frame of the main event loop.
 * 
 * For graphics, we use multiple graphics buffer objects to separate
 * different visual components of our program. The maze is redrawn to the
 * scene in every frame, and other actors and components are drawn next.
 */
/*jshint esversion: 6 */


 /**
  * Gamemode codes in human readable format.
  */
const GameMode = {
    "watch": 0,
    "play": 1,
    "race": 2
};
Object.freeze(GameMode);

// Global Graphics and UI Objects
var canvas; // The P5 canvas object
var maze_buff; // Graphics buffer for drawing the maze
var slider; // The maze customization slider

// Global Game Objects
var maze;
var bot;
var player;

// Flags
var game_running;

// Variables
var game_mode;
var row_count;          // Number of rows in the maze
var col_count;          // Number of columns in the maze
var speed;

var wall_color;             // Color of the maze's walls
var background_color;       // Color of the maze's background
var trail_color;            // Color of the bot's trail
var bot_color;              // Color of the bot's body
var bot_outline_color;      // Color of the outline around the bot
var player_color;           // Color of the player's body
var player_outline_color;   // Color of the outline around the player



/**
 * P5 uses preload() to load any resources before calling setup(),
 * then begins calling draw() every frame.
 */

/**
 * Called by the P5 library when the program starts.
 * Check reference for more info: https://p5js.org/reference/#/p5/setup
 */
function setup() { // P5 Setup Function
    slider = createSlider(-100, 100, 0);
    slider.parent('slider-div');
    slider.style('width', '16vw');

    frameRate(60);

    // Set maze related defaults
    game_mode = GameMode.watch;
    row_count = 40;
    col_count = 40;
    speed = 5;

    // Set default colors
    wall_color = 'white';
    background_color = 'black';
    trail_color = 'red';
    bot_color = 'yellow';
    bot_outline_color = 'orange';
    player_color = 'cyan';
    player_outline_color = 'pink';

    // Calculate maze and canvas dimensions and create objects
    const unit_area = window.innerWidth * 0.5 / col_count;
    const wall_thickness = unit_area/4;
    const width = (col_count * unit_area) + wall_thickness;
    const height = (row_count * unit_area) + wall_thickness;
    canvas = createCanvas(width, height);
    canvas.parent('canvas-div');
    maze_buff = createGraphics(width, height);
    
    // Note: Maze will try to paint the canvas, it must be instantiated after createCanvas
    // Use binary space partitioning as the default first maze 
    set_scene('bsp');
    game_running = true; // For demo purposes, the game starts as running
}

/**
 * Part of the P5 library.
 * Called directly after setup in each frame of the program. The frame-rate
 * can be adjusted via frameRate(). draw() is called automatically and should
 * never be called explicitly.
 * For more infor see reference: https://p5js.org/reference/#/p5/draw
 */
function draw() {  // P5 Frame Re-draw Fcn, Called for Every Frame.
    switch (game_mode) {
        case GameMode.watch:
            watch_mode_draw_tasks();
            break;
        case GameMode.play:
            play_mode_draw_tasks();
            break;
        case GameMode.race:
            race_mode_draw_tasks();
            break;
    }
}

/**
 * The action sequence for the watch mode game loop.
 */
function watch_mode_draw_tasks() {
    image(maze_buff, 0, 0); // Paint the maze
    if (game_running) {
        bot.move(); // Move the bot
    }
    bot.paint_trail(); // Draw the path that the bot has set
    bot.paint(); // Draw the bot itself
}

/**
 * The action sequence for the play mode game loop.
 */
function play_mode_draw_tasks() {
    image(maze_buff, 0, 0); // Paint the maze
    if (game_running) {
        player.move(); // Move the player
    }
    player.paint(); // Draw the player
}

/**
 * The action sequence for the race mode game loop. The player takes
 * priority over the bot and is draw above the bot.
 */
function race_mode_draw_tasks() {
    image(maze_buff, 0, 0); // Paint the maze
    if (game_running) {
        player.move(); // Move the player
        bot.move(); // Move the bot
    }
    bot.paint(); // Draw bot first so it doesn't interfere with player
    player.paint(); // Draw the player last so they are on top
}

/**
 * Place actors into the maze. All actors that are unused are set to null.
 */
function place_actors() {
    switch (game_mode) {
        case GameMode.watch:
            player = null;
            bot = new MazeBot(maze, bot_color, bot_outline_color, speed);
            break;
        case GameMode.play:
            bot = null;
            player = new GamePlayer(maze, player_color, player_outline_color, speed);
            break;
        case GameMode.race:
            bot = new MazeBot(maze, bot_color, bot_outline_color, speed);
            player = new GamePlayer(maze, player_color, player_outline_color, speed);
            break;
        default:
            bot = null;
            player = null;
    }
}

/** 
 * Set the game scene by generating the maze based on specifications,
 * and also setting the actors corresponding to the game mode.
 * 
 * This function will temporarily disable the game loop.
 */
function set_scene(maze_algorithm) {
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
    refit_scene(); // Loop will restart after refit_scene
}

/**
 * Lock the speed of the units to a specific value and disable the text box.
 * @param {Number} fixed_speed A valid integer unit speed
 */
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

/**
 * Unlock the speed for user modification and also grab the number that is
 * currently in the text box.
 */
function unlock_speed() {
    const speed_input_textbox = document.getElementById('speed-input');
    speed_input_textbox.disabled = false;
    on_speed_input();
    if (player != null) // currently player is always null when this happens, might change later
        player.notify_speed_update();
    if (bot != null)
        bot.notify_speed_update();
}