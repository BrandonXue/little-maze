/**
 * Brandon Xue, Ernesto Hoogkkirk, Ryan Martinez
 * 
 * This file contains the definitions for the P5 setup() and draw().
 * P5 uses preload() to load any resources before calling setup(),
 * then begins calling draw() every frame.
 * 
 * We use multiple graphics buffer objects (created by createGraphics())
 * to separate the different visual components of our program.
 */

const GameMode = {
    "watch": 0,
    "play": 1,
    "race": 2
};
Object.freeze(GameMode);

// Global Graphics Objects
var canvas; // The P5 canvas object
var maze_buff; // Graphics buffer for drawing the maze

// Global Maze Related
var maze;
var bot;
var player;
var game_running;

// Variables
var new_row_count;
var new_col_count;
var row_count;
var col_count;
var wall_color;
var background_color;
var speed;
var slider;
var game_mode;

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
    new_row_count = row_count = 40;
    new_col_count = col_count = 40;
    wall_color = "white";
    background_color = "black";
    trail_color = "red";
    speed = 5;
    const unit_area = window.innerWidth * 0.5 / col_count;
    const wall_thickness = unit_area/4;

    // Calculate canvas dimensions and create canvas
    const width = (col_count * unit_area) + wall_thickness;
    const height = (row_count * unit_area) + wall_thickness;
    canvas = createCanvas(width, height);
    canvas.parent('canvas-div');
    maze_buff = createGraphics(width, height);
    
    // Note: Maze will try to paint the canvas, it must be instantiated after createCanvas
    //maze = new Maze(row_count, col_count, unit_area, wall_color, background_color);

    // Use binary space partitioning as the default first maze 
    select_bsp_maze();

    game_running = true;
}

/**
 * Part of the P5 library.
 * Called directly after setup in each frame of the program. The frame-rate
 * can be adjusted via frameRate(). draw() is called automatically and should
 * never be called explicitly.
 * For more infor see reference: https://p5js.org/reference/#/p5/draw
 */
function draw() {  // P5 Frame Re-draw Fcn, Called for Every Frame.
    // Render order:
    // Maze first
    // Trail second
    // Bot and/or player third
    image(maze_buff, 0, 0); // Paint the maze
    if (game_running)
        bot.move_bot(); // Move the bot
    bot.draw_trail(); // Draw the path that the bot has set
    bot.draw_bot(); // Draw the bot itself
}