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
var row_count;
var col_count;

/**
 * Called by the P5 library when the program starts.
 * Check reference for more info: https://p5js.org/reference/#/p5/setup
 */
function setup() { // P5 Setup Function
    frameRate(60);
    row_count = 40;
    col_count = 40;
    const unit_area = window.innerWidth * 0.5 / col_count;
    const wall_thickness = unit_area/3;


    // Calculate canvas dimensions and create canvas
    const width = (col_count * unit_area) + wall_thickness;
    const height = (row_count * unit_area) + wall_thickness;
    canvas = createCanvas(width, height);
    maze_buff = createGraphics(width, height);
    canvas.parent("canvas-div");
    
    // Note: Maze will try to paint the canvas, it must be instantiated after createCanvas
    maze = new Maze(row_count, col_count, wall_thickness, unit_area, "white", "black");

    // Use binary space partitioning to create the maze
    //bsp_maze(maze);

    // Use Kruskal's Algorithm with random joins to create the maze
    k_msp_maze(maze, 0);

    // Use recursive backtracking to create the the maze
    //recur_bt_maze(maze, 0.4);

    bot = new Bot(maze, "yellow", 5); // pacman:)
}

/**
 * Part of the P5 library.
 * Called directly after setup in each frame of the program. The frame-rate
 * can be adjusted via frameRate(). draw() is called automatically and should
 * never be called explicitly.
 * For more infor see reference: https://p5js.org/reference/#/p5/draw
 */
function draw() {  // P5 Frame Re-draw Fcn, Called for Every Frame.
    image(maze_buff, 0, 0);

    bot.move_bot();
    bot.draw_trail();
    bot.draw_bot();
    
    /*bot_frame_count = (bot_frame_count + 1) % bot_frame_mod; // Increment bot frames on a ring
    if (bot_frame_count == 0) { // Every move_bot_mod frames, this is true
        bot.move_bot();
    }*/
}

function resize_maze() {
    console.log("called")
    // Recalculate the unit area and wall thickness
    const unit_area = window.innerWidth * 0.5 / col_count;
    maze.resize(unit_area);
    const wall_thickness = unit_area/3;
    const offset = 0.5 * wall_thickness;
    maze.repaint();

    // Recalculate canvas dimensions and resize canvas
    const width = (col_count * unit_area) + wall_thickness;
    const height = (row_count * unit_area) + wall_thickness;

    resizeCanvas(width, height);
}
 
/**
 * The following functions have been left as stubs for testing purposes.
 * We may use them for reference in the near future.
 */

/*function keyPressed() {
    console.log("Detected key press.");
}*

function mousePressed() {
    console.log("Detected mouse click.");
}*/
