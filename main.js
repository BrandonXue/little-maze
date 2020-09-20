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

// Global Rendering Related
var bot_frame_count = 0; // Use a counter to keep track of which frame we're on for bot movement
var bot_frame_mod = 8; // Update bot position every this amount of frames.

// Global Graphics Objects
var canvas; // The P5 canvas object
var maze_buff; // Graphics buffer for drawing the maze

// Global Maze Related
var maze;
var bot;
var not_generating; // flag to disable drawing while maze generates
var bot_may_move;
var game_running;

// Variables
var new_row_count;
var new_col_count;
var row_count;
var col_count;
var wall_color;
var background_color;
var speed;


/**
 * Called by the P5 library when the program starts.
 * Check reference for more info: https://p5js.org/reference/#/p5/setup
 */
function setup() { // P5 Setup Function
    frameRate(60);
    new_row_count = row_count = 40;
    new_col_count = col_count = 40;
    wall_color = "white";
    background_color = "black";
    trail_color = "red";
    speed = 5;
    bot_may_move = true;
    const unit_area = window.innerWidth * 0.5 / col_count;
    const wall_thickness = unit_area/4;

    // Calculate canvas dimensions and create canvas
    const width = (col_count * unit_area) + wall_thickness;
    const height = (row_count * unit_area) + wall_thickness;
    canvas = createCanvas(width, height);
    canvas.parent("canvas-div");
    maze_buff = createGraphics(width, height);
    
    // Note: Maze will try to paint the canvas, it must be instantiated after createCanvas
    //maze = new Maze(row_count, col_count, unit_area, wall_color, background_color);

    // Use binary space partitioning as the default first maze 
    select_bsp_maze();

    //bot = new Bot(maze, "yellow", speed); // pacman:)
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
    // Override Priority high to low:
    // Make sure maze isn't generating
        // If all above are true, render maze
        // If all above are true, render bot and trail
    // Make sure bot may move -- this flag is used by the maze generator
    // Make sure game isn't stopped -- this flag is controlled by the user
        // If all above are true, move bot

    // Render order:
    // Maze first
    // Trail second
    // Bot third

    if (not_generating) {
        image(maze_buff, 0, 0); // Paint the maze
        if (game_running && bot_may_move)
            bot.move_bot(); // Move the bot
        bot.draw_trail(); // Draw the path that the bot has set
        bot.draw_bot(); // Draw the bot itself
        //console.log(bot.color);
    }
}