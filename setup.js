/**
 * Brandon Xue, Ernesto Hoogkkirk, Ryan Martinez
 * 
 * This file contains the definitions for the P5 setup() and draw().
 * (TODO: We may want to add menu functionality here)
 */

// Global variables used in Prof's program. May become obsolete later:
var g_frame_cnt = 0; // Setup a P5 display-frame counter, to do anim
var g_frame_mod = 24; // Update ever 'mod' frames.

/**
 * Called by the P5 library when the program starts.
 * Check reference for more info: https://p5js.org/reference/#/p5/setup
 */
function setup() { // P5 Setup Function
    const row_count = 40;
    const col_count = 40;
    const unit_area = 15;
    const wall_thickness = 3;

    // Calculate canvas dimensions and create canvas
    const width = (col_count * unit_area) + wall_thickness;
    const height = (row_count * unit_area) + wall_thickness;
    createCanvas(width, height);
    
    // Note: Maze will try to paint the canvas, it must be instantiated after createCanvas
    var maze = new Maze(row_count, col_count, wall_thickness, unit_area);

    // Use binary space partitioning to create the maze
    //bsp_maze(maze);

    // Use Kruskal's Algorithm with random joins to create the maze
    //k_msp_maze(maze);

    // Use recursive backtracking to create the the maze
    recur_bt_maze(maze, 0.4);
}

/**
 * Part of the P5 library.
 * Called directly after setup in each frame of the program. The frame-rate
 * can be adjusted via frameRate(). draw() is called automatically and should
 * never be called explicitly.
 * For more infor see reference: https://p5js.org/reference/#/p5/draw
 */
function draw() {  // P5 Frame Re-draw Fcn, Called for Every Frame.
    g_frame_cnt = (g_frame_cnt+1) % g_frame_mod;
    if (0 == g_frame_cnt % g_frame_mod) {
        return;
    }
}


/**
 * The following functions have been left as stubs for testing purposes.
 * We may use them for reference in the near future.
 */

function keyPressed() {
    console.log("Detected key press.");
}

function mousePressed() {
    console.log("Detected mouse click.");
}
