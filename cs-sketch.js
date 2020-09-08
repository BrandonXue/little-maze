// cs-sketch.js; P5 key animation fcns.  // CF p5js.org/reference
// Time-stamp: <2020-09-08 00:15:00 Brandon Xue>

// Global variables used in Prof's program. May become obsolete later:
// Make global g_canvas JS 'object': a key-value 'dictionary'.
var g_canvas = { cell_size:10, wid:64, hgt:48 }; // JS Global var, w canvas size info.
var g_frame_cnt = 0; // Setup a P5 display-frame counter, to do anim
var g_frame_mod = 24; // Update ever 'mod' frames.
var g_stop = 0; // Go by default.


var maze_rows = 40;
var maze_cols = 40;
var g_unit = 15;
var w_weight = 2;
var maze;

const DirectionEnum = {"vertical":0, "horizontal":1}
Object.freeze(DirectionEnum)

// Wall Enum allows for easy bit manipulation
const WallEnum = {"left":8, "right":4, "top":2, "bottom":1}
Object.freeze(WallEnum)

/**
 * Called by the P5 library when the program starts.
 * Check reference for more info: https://p5js.org/reference/#/p5/setup
 */
function setup() { // P5 Setup Function
    let width = (maze_cols * g_unit) + w_weight;
    let height = (maze_rows * g_unit) + w_weight;
    createCanvas(width, height);

    // Unsigned 8-bit int matrix, we will store walls in the lower order 4 bits
    // The order of the walls is LRTB (left right, top, bottom)
    // and possibly state flags in the higher order 4 bits
    maze = Array(maze_rows);
    for (let row = 0; row < maze_rows; ++row)
        maze[row] = new Uint8Array(maze_cols);
    
    // Use the binary space partition to create the maze
    bsp_maze();

}

/**
 * Draw a wall on the canvas, or draw a hole. Note that the parameters
 * are wall indices and not cell indices.
 * @param {Number} l_wall_i The left wall-index.
 * @param {Number} r_wall_i The right wall-index. If vertical wall, this equals l_wall_i.
 * @param {Number} t_wall_i The top wall-index.
 * @param {Number} b_wall_i The bottom wall-index. If horizontal, this equals t_wall_i.
 * @param {Boolean} val True to draw wall, false to draw hole.
 */
function draw_wall(l_wall_i, r_wall_i, t_wall_i, b_wall_i, val) {
    if (val)
        stroke("white");
    else
        stroke("black");
    strokeWeight(w_weight);
    line(l_wall_i * g_unit, t_wall_i * g_unit, r_wall_i * g_unit, b_wall_i * g_unit);
}

/**
 * Set wall information bits in the maze matrix. Note that the parameters
 * are wall indices and not cell indices.
 * @param {Number} l_wall_i The left cell-index.
 * @param {Number} r_wall_i The right cell-index. If vertical, this equals l_wall_i
 * @param {Number} t_wall_i The top cell-index.
 * @param {Number} b_wall_i The bottom cell-index. If horizontal, this equals t_wall_i.
 * @param {Boolean} val True to set a wall, false to set a hole.
 */
function set_wall(l_wall_i, r_wall_i, t_wall_i, b_wall_i, val) {
    if (l_wall_i == r_wall_i) { // The wall is vertical
        let left_cell_col = l_wall_i - 1;
        let right_cell_col = l_wall_i;
        for (let segment = t_wall_i; segment <= b_wall_i; ++segment) {
            if (val) { // Set wall to true (create a wall)
                maze[segment][left_cell_col] |= WallEnum.right;
                maze[segment][right_cell_col] |= WallEnum.left;
            } else { // Set wall to false (create a hole / break a wall)
                maze[segment][left_cell_col] &= ~(WallEnum.right);
                maze[segment][right_cell_col] &= ~(WallEnum.left);
            }
        }
    } else if (t_wall_i == b_wall_i) { // The wall is horizontal
        let top_cell_row = t_wall_i -1;
        let bot_cell_row = t_wall_i;
        for (let segment = l_wall_i; segment <= r_wall_i; ++segment) {
            if (val) { // Set wall to true (create a wall)
                maze[top_cell_row][segment] |= WallEnum.bottom;
                maze[bot_cell_row][segment] |= WallEnum.top;
            } else { // Set wall to false (create a hole / break a wall)
                maze[top_cell_row][segment] &= ~(WallEnum.bottom);
                maze[bot_cell_row][segment] &= ~(WallEnum.top);
            }
        }
    } else {
        console.log("Error: set_wall()");
    }
}

/**
 * Easy to use function to begin the recursive binary space partition
 */
function bsp_maze() {
    binary_space_partition(0, maze_cols-1, 0, maze_rows-1, DirectionEnum.vertical);
}

/**
 * Binary space partition maze generator.
 * @param {Number} left_i The left column cell-index of the current partition.
 * @param {Number} right_i The right column cell-index of the current partition.
 * @param {Number} top_i The top row cell-index of the current partition.
 * @param {Number} bot_i The bottom row cell-index of the current partition.
 * @param {DirectionEnum} dir Used to keep track of the parent partition's splitting orientation.
 */
function binary_space_partition(left_i, right_i, top_i, bot_i, dir) {
    let d_width = right_i - left_i;
    let d_height = bot_i - top_i;
    // Base case: this region cannot be partitioned
    if (d_width == 0 && d_height == 0) 
        return;

    let wall_dir; // The orientation of the new wall to be generated (vertical or horizontal?)
    if (d_width == 0) // If width is 0, we cannot create a vertical wall, so it must be horizontal
        wall_dir = DirectionEnum.horizontal;
    else if (d_height == 0) // Else if height is 0, we cannot create a horizontal wall, so it must be vertical
        wall_dir = DirectionEnum.vertical;
    else { // Else we can partition either way
        // Currently alternating, but previously tried randomizing
        wall_dir = (dir == DirectionEnum.vertical ? DirectionEnum.horizontal : DirectionEnum.vertical);
        //wall_dir = random() >= 0.5 ? DirectionEnum.horizontal : DirectionEnum.vertical;
    }

    if (wall_dir == DirectionEnum.horizontal) { // horizontal wall
        // Choose the wall and hole
        let wall_choice = floor(random() * d_height) + 1 + top_i;
        let hole_choice = floor(random() * (d_width + 1)) + left_i; 
        //console.log("partition:",left_i, right_i, top_i, bot_i, "dir:", dir, "wall_choice:", wall_choice);
        // Set the wall in the matrix and draw the wall on the canvas
        set_wall(left_i, right_i, wall_choice, wall_choice, true);
        draw_wall(left_i, right_i+1, wall_choice, wall_choice, true);
        // Punch a hole out
        set_wall(hole_choice, hole_choice, wall_choice, wall_choice, false);
        draw_wall(hole_choice, hole_choice+1, wall_choice, wall_choice, false);
        // Recursively partition
        binary_space_partition(left_i, right_i, top_i, wall_choice-1, wall_dir);
        binary_space_partition(left_i, right_i, wall_choice, bot_i, wall_dir);
    } else { // vertical wall
        // Choose the wall and hole
        let wall_choice = floor(random() * d_width) + 1 + left_i;
        let hole_choice = floor(random() * (d_height + 1)) + top_i;
        // Set the wall in the matrix and draw the wall on the canvas
        set_wall(wall_choice, wall_choice, top_i, bot_i, true);
        draw_wall(wall_choice, wall_choice, top_i, bot_i+1, true);
        // Punch a hole out
        set_wall(wall_choice, wall_choice, hole_choice, hole_choice, false);
        draw_wall(wall_choice, wall_choice, hole_choice, hole_choice+1, false);
        // Recursively partition
        binary_space_partition(left_i, wall_choice-1, top_i, bot_i, wall_dir);
        binary_space_partition(wall_choice, right_i, top_i, bot_i, wall_dir);
    }
}

/** draw_grid: Draw a fancy grid with major & minor lines, and major row/col numbers.
 *  @param rminor   the number of pixels per minor line
 *  @param rmajor   the number of pixels per major line
 *  @param rstroke  the color of the border line
 *  @param rfill    the fill color of the cell
 */
function draw_grid(rminor, rmajor, rstroke, rfill) {
    stroke(rstroke);
    fill(rfill);
    let sz = g_canvas.cell_size;
    let width = g_canvas.wid*sz;
    let height = g_canvas.hgt*sz
    for (var ix = 0; ix < width; ix += rminor) {
        let big_linep = (ix % rmajor == 0);
        let line_wgt = 1;
        if (big_linep) line_wgt = 2;
        strokeWeight(line_wgt);
        line(ix, 0, ix, height);
        strokeWeight(1);
        if (ix % rmajor == 0)
            text(ix, ix, 10);
    }
    for (var iy = 0; iy < height; iy += rminor) {
        let big_linep = (iy % rmajor == 0);
        let line_wgt = 1;
        if (big_linep)
            line_wgt = 2;
        strokeWeight(line_wgt);
        line(0, iy, width, iy);
        strokeWeight(1);
        if (iy % rmajor == 0)
            text( iy, 0, iy + 10 );
    }
}

var g_bot = {dir:3, x:20, y:20, color:100}; // Dir is 0..7 clock, w 0 up.
var g_box = {t:1, hgt:47, l:1, wid:63}; // Box in which bot can move.

function move_bot(dir) {
    let dx = 0;
    let dy = 0;
    switch (dir) { // Convert dir to x,y deltas: dir = clock w 0=Up,2=Rt,4=Dn,6=Left.
        case 0 : {          dy = -1;    break; }
        case 1 : {dx = 1;   dy = -1;    break; }
        case 2 : {dx = 1;               break; }
        case 3 : {dx = 1;   dy = 1;     break; }
        case 4 : {          dy = 1;     break; }
        case 5 : {dx = -1;  dy = 1;     break; }
        case 6 : {dx = -1;              break; }
        case 7 : {dx = -1;  dy = -1;     break; }
    }
    let x = (dx + g_bot.x + g_box.wid) % g_box.wid; // Move-x.  Ensure positive b4 mod.
    let y = (dy + g_bot.y + g_box.hgt) % g_box.hgt; // Ditto y.
    let color =  100 + (1 + g_bot.color) % 156; // Incr color in nice range.
    g_bot.x = x; // Update bot x.
    g_bot.y = y;
    g_bot.dir = dir;
    g_bot.color = color;
    //console.log( "bot x,y,dir,clr = " + x + "," + y + "," + dir + "," +  color );
}

function draw_bot() // Convert bot pox to grid pos & draw bot.
{
    let sz = g_canvas.cell_size;
    let sz2 = sz / 2;
    let x = 1+ g_bot.x*sz; // Set x one pixel inside the sz-by-sz cell.
    let y = 1+ g_bot.y*sz;
    let big = sz -2; // Stay inside cell walls.
    // Fill 'color': its a keystring, or a hexstring like "#5F", etc.  See P5 docs.
    fill("#" + g_bot.color); // Concat string, auto-convert the number to string.
    //console.log( "x,y,big = " + x + "," + y + "," + big );
    let acolors = get(x + sz2, y + sz2); // Get cell interior pixel color [RGBA] array.
    let pix = acolors[0] + acolors[1] + acolors[2];
    //console.log( "acolors,pix = " + acolors + ", " + pix );

    // (*) Here is how to detect what's at the pixel location.  See P5 docs for fancier...
    if (0 != pix) {
        fill(0);
        stroke(0);
    } // Turn off color of prior bot-visited cell.
    else {
        stroke('white');
    } // Else Bot visiting this cell, so color it.

    // Paint the cell.
    rect(x, y, big, big);
}

function draw_update() { // Update our display.
    //console.log( "g_frame_cnt = " + g_frame_cnt );
    let dir = (round(8 * random())); // Change direction at random; brownian motion.
    move_bot(dir);
    draw_bot();
}

/**
 * Part of the P5 library.
 * Called directly after setup in each frame of the program. The frame-rate
 * can be adjusted via frameRate(). draw() is called automatically and should
 * never be called explicitly.
 * For more infor see reference: https://p5js.org/reference/#/p5/draw
 */
function draw() {  // P5 Frame Re-draw Fcn, Called for Every Frame.
    ++g_frame_cnt;
    if (0 == g_frame_cnt % g_frame_mod) {
        if (!g_stop)
            draw_update();
    }
}

function keyPressed() {
    g_stop = ! g_stop;
}

function mousePressed() {
    let x = mouseX;
    let y = mouseY;
    //console.log( "mouse x,y = " + x + "," + y );
    let sz = g_canvas.cell_size;
    let gridx = round( (x-0.5) / sz );
    let gridy = round( (y-0.5) / sz );
    //console.log( "grid x,y = " + gridx + "," + gridy );
    //console.log( "box wid,hgt = " + g_box.wid + "," + g_box.hgt );
    g_bot.x = gridx + g_box.wid; // Ensure its positive.
    //console.log( "bot x = " + g_bot.x );
    g_bot.x %= g_box.wid; // Wrap to fit box.
    g_bot.y = gridy + g_box.hgt;
    //console.log( "bot y = " + g_bot.y );
    g_bot.y %= g_box.hgt;
    //console.log( "bot x,y = " + g_bot.x + "," + g_bot.y );
    draw_bot();
}
