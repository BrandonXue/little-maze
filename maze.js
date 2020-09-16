/**
 * Brandon Xue, Ernesto Hoogkkirk, Ryan Martinez
 * 
 * This file contains the maze class and maze generation algorithms.
 * The maze class encapsulates the grid data (where walls are),
 * as well as functions for setting walls, drawing walls to the canvas,
 * and checking for walls. (TODO: Might add bot or path tracking.)
 * 
 * The maze algorithms are not part of the maze class. They must be able
 * to take a Maze object and modify its grid using Maze methods.
 */

class Maze {
    /**
     * @param {Number} rows Integer. Number of rows in matrix.
     * @param {Number} cols Integer. Number of columns in matrix.
     * @param {Number} w_weight Integer. Thickness of walls in pixels.
     * @param {Number} unit Integer. Unit area of the grid.
     */
    constructor(rows, cols, w_weight, unit) {
        this.row_count = rows;
        this.col_count = cols;
        this.wall_thickness = w_weight;
        this.offset = this.wall_thickness * 0.5;
        this.unit_area = unit;
        this.wall_color = "white";
        this.fill_color = "black";

        /* The grid is an array of uint arrays. The lowest order 4 bits of the uint array
           are used to track the walls that surround that cell. The bits are LRTB,
           where left: 1000, right: 0100, top: 0010, bottom: 0001 */ 
        this.grid = Array(this.row_count);
        for (let row = 0; row < this.row_count; ++row)
            this.grid[row] = new Uint8Array(this.col_count);

        this.fill_background();
    }

    /**
     * Fills the maze grid area with the background color specified by this.fill_color
     */
    fill_background() {
        const width = (this.col_count * this.unit_area) + this.wall_thickness;
        const height = (this.row_count * this.unit_area) + this.wall_thickness;
        fill(this.fill_color);
        rect(0, 0, width, height);
    }

    /**
     * Repaint the entire maze.
     * This can be used when colors have been changed.
     */
    repaint() {
        this.fill_background();
        // Go over all cells in the grid and repaint their left and top walls
        for (let row = 0; row < this.row_count; ++row) {
            for (let col = 0; col < this.col_count; ++col) {
                if (this.has_left_wall(row, col))
                    this.vertical_wall(col-1, col, row, row, true);
                else
                    this.vertical_wall(col-1, col, row, row, false);
                if (this.has_top_wall(row, col))
                    this.horizontal_wall(col, col, row-1, row, true);
                else
                    this.horizontal_wall(col, col, row-1, row, false);
            }
        }
        // Then go over the right column to do its right wall
        for (let row = 0; row < this.row_count; ++row) {
            if (this.has_right_wall(row, this.col_count-1))
                this.vertical_wall(this.col_count-1, this.col_count, row, row, true);
            else
                this.vertical_wall(this.col_count-1, this.col_count, row, row, false);
        }
        // And go over the bottom row to do its bottom wall
        for (let col = 0; col < this.col_count; ++col) {
            if (this.has_bot_wall(this.row_count-1, col))
                this.horizontal_wall(col, col, this.row_count-1, this.row_count, true);
            else
                this.horizontal_wall(col, col, this.row_count-1, this.row_count, false);
        }
    }

    /**
     * Draw a wall on the canvas, or draw a hole.
     * @param {Number} left_col The column index that is directly left of the desired wall.
     *      If you want a wall on the left perimeter, pass the imaginary column index of -1.
     * @param {Number} right_col The column index that is directly right of the desired wall.
     *      If you want a wall on the right perimeter, pass the imaginary column index equal
     *      to the last valid column index + 1.
     * @param {Number} start_row The row index where the continuous wall starts.
     * @param {Number} end_row The row index where the continuous wall ends.
     *      Use the same index as start_row to signify a wall segment of length 1.
     * @param {Boolean} val True to draw a wall, false to draw a hole.
     */
    draw_vertical_wall(left_col, right_col, start_row, end_row, val) {
        if (val)
            stroke(this.wall_color);
        else
            stroke(this.fill_color);

        strokeWeight(this.wall_thickness);

        // Improper arguments
        if ((left_col + 1) != right_col)
            console.log("Error: draw_vertical_wall: left and right not adjacent.");
        if ((start_row > end_row))
            console.log("Error: draw_vertical_wall: end row must be >= start row.");

        const x = right_col * this.unit_area;
        if (val) {
            line(x + this.offset, (start_row * this.unit_area), // x1, y1
                 x + this.offset, ((end_row+1) * this.unit_area) + this.wall_thickness); // x2, y2
        } else { // Shorten holes slightly
            line(x + this.offset, (start_row * this.unit_area) + (2 * this.offset), // x1, y1
                 x + this.offset, (end_row+1) * this.unit_area); // x2, y2
        }
    }

    /**
     * Set a wall in the matrix, or set a hole.
     * Note: Code is repeated to reduce comparisons in loops; redundancy is intentional.
     * These functions are expected to be a "hot spot" within our program.
     * @param {Number} left_col The column index that is directly left of the desired wall.
     *      If you want a wall on the left perimeter, pass the imaginary column index of -1.
     * @param {Number} right_col The column index that is directly right of the desired wall.
     *      If you want a wall on the right perimeter, pass the imaginary column index equal
     *      to the number of columns in the maze.
     * @param {Number} start_row The row index where the continuous wall starts.
     * @param {Number} end_row The row index where the continuous wall ends.
     *      Use the same index as start_row to signify a wall segment of length 1.
     * @param {Boolean} val True to set a wall in the matrix, false to set a hole.
     */
    set_vertical_wall(left_col, right_col, start_row, end_row, val) {
        // Left perimeter
        if ((left_col == -1) && (right_col == 0)) {
            if (val) {
                for (let segment = start_row; segment <= end_row; ++segment)
                    this.grid[segment][right_col] |= WallEnum.left;
            } else {
                for (let segment = start_row; segment <= end_row; ++segment)
                    this.grid[segment][right_col] &= ~WallEnum.left;
            }
        } 
        // Right perimeter wall
        else if ((left_col == this.col_count-1) && (right_col == this.col_count)) {
            if (val) {
                for (let segment = start_row; segment <= end_row; ++segment)
                    this.grid[segment][left_col] |= WallEnum.right;
            } else {
                for (let segment = start_row; segment <= end_row; ++segment)
                    this.grid[segment][left_col] &= ~WallEnum.right;
            }
        }
        // Internal wall
        else if ((left_col + 1) == right_col) {
            if (val) {
                for (let segment = start_row; segment <= end_row; ++segment) {
                    this.grid[segment][left_col] |= WallEnum.right;
                    this.grid[segment][right_col] |= WallEnum.left;
                }
            } else {
                for (let segment = start_row; segment <= end_row; ++segment) {
                    this.grid[segment][left_col] &= ~WallEnum.right;
                    this.grid[segment][right_col] &= ~WallEnum.left;
                }
            }
        }
        else {
            console.log("Error: set_vertical_wall: left and right not adjacent.");
        }
    }

    /**
     * @param {Number} start_col The column index where the continuous wall starts.
     * @param {Number} end_col The column index where the continuous wall ends.
     *      Use the same index as start_col to signify a wall segment of length 1.
     * @param {Number} top_row The row index that is directly above the desired wall.
     *      If you want a wall on the top perimeter, pass the imaginary row index of -1.
     * @param {Number} bot_row The row index that is directly below the desired wall.
     *      If you want a wall on the right perimeter, pass the imaginary row index equal
     *      to the number of rows in the maze.
     * @param {Boolean} val True to draw a wall, false to draw a hole.
     */
    draw_horizontal_wall(start_col, end_col, top_row, bot_row, val) {
        if (val)
            stroke(this.wall_color);
        else
            stroke(this.fill_color);
        strokeWeight(this.wall_thickness);

        // Improper arguments
        if ((top_row + 1) != bot_row)
            console.log("Error: draw_horizontal_wall: top and bot not adjacent.");
        if ((start_col > end_col))
            console.log("Error: draw_horizontal_wall: end col must be >= start col.");

        const y = bot_row * this.unit_area;
        if (val) {
            line((start_col * this.unit_area), y + this.offset, // x1, y1
                 (end_col+1) * this.unit_area + this.wall_thickness, y + this.offset); // x2, y2
        } else { // Shorten holes slightly
            line((start_col * this.unit_area) + (2 * this.offset), y + this.offset, // x1, y1
                ((end_col+1) * this.unit_area), y + this.offset); // x2, y2
        }
    }

    /**
     * @param {Number} start_col The column index where the continuous wall starts.
     * @param {Number} end_col The column index where the continuous wall ends.
     *      Use the same index as start_col to signify a wall segment of length 1.
     * @param {Number} top_row The row index that is directly above the desired wall.
     *      If you want a wall on the top perimeter, pass the imaginary row index of -1.
     * @param {Number} bot_row The row index that is directly below the desired wall.
     *      If you want a wall on the right perimeter, pass the imaginary row index equal
     *      to the number of rows in the maze.
     * @param {Boolean} val True to set a wall in the matrix, false to set a hole.
     */
    set_horizontal_wall(start_col, end_col, top_row, bot_row, val) {
        // Top perimeter wall
        if ((top_row == -1) && (bot_row == 0)) {
            if (val) {
                for (let segment = start_col; segment <= end_col; ++segment)
                    this.grid[bot_row][segment] |= WallEnum.top;
            } else {
                for (let segment = start_col; segment <= end_col; ++segment)
                    this.grid[bot_row][segment] &= ~WallEnum.top;
            }
        } 
        // Bottom perimeter wall
        else if ((top_row == this.row_count-1) && (bot_row == this.row_count)) {
            if (val) {
                for (let segment = start_col; segment <= end_col; ++segment)
                    this.grid[top_row][segment] |= WallEnum.bot;
            } else {
                for (let segment = start_col; segment <= end_col; ++segment)
                    this.grid[top_row][segment] &= ~WallEnum.bot;
            }
        }
        // Internal wall
        else if ((top_row + 1) == bot_row) {
            if (val) {
                for (let segment = start_col; segment <= end_col; ++segment) {
                    this.grid[top_row][segment] |= WallEnum.bot;
                    this.grid[bot_row][segment] |= WallEnum.top;
                }
            } else {
                for (let segment = start_col; segment <= end_col; ++segment) {
                    this.grid[top_row][segment] &= ~WallEnum.bot;
                    this.grid[bot_row][segment] &= ~WallEnum.top;
                }
            }
        }
        else {
            console.log("Error: set_horizontal_wall: top and bot not adjacent.");
        }
    }

    /**
     * Draws and sets a horizontal wall.
     */
    horizontal_wall(start_col, end_col, top_row, bot_row, val) {
        this.set_horizontal_wall(start_col, end_col, top_row, bot_row, val);
        this.draw_horizontal_wall(start_col, end_col, top_row, bot_row, val);
    }

    /**
     * Draws and sets a vertical wall.
     */
    vertical_wall(left_col, right_col, start_row, end_row, val) {
        this.set_vertical_wall(left_col, right_col, start_row, end_row, val);
        this.draw_vertical_wall(left_col, right_col, start_row, end_row, val);
    }

    /**
     * Check if the cell at the given row and column has a left wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_left_wall(row, col) {
        return (this.grid[row][col] & WallEnum.left) ? true: false;
    }

    /**
     * Check if the cell at the given row and column has a right wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_right_wall(row, col) {
        return (this.grid[row][col] & WallEnum.right) ? true : false;
    }

    /**
     * Check if the cell at the given row and column has a top wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_top_wall(row, col) {
        return (this.grid[row][col] & WallEnum.top) ? true : false;
    }

    /**
     * Check if the cell at the given row and column has a bottom wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_bot_wall(row, col) {
        return (this.grid[row][col] & WallEnum.bot) ? true : false;
    }
}          

/**
 * Creates a perimeter around the maze.
 * @param {Maze} maze The Maze object to be modified
 */
function create_perimeter(maze) {
    maze.vertical_wall(-1, 0, 0, maze.row_count-1, true); // Left
    maze.vertical_wall(maze.col_count-1, maze.col_count, 0, maze.row_count-1, true); // Right
    maze.horizontal_wall(0, maze.col_count-1, -1, 0, true);  // Top
    maze.horizontal_wall(0, maze.col_count-1, maze.row_count-1, maze.row_count, true);  // Bot
}

/**
 * Creates a hole somewhere along the perimeter of the maze.
 * @param {Maze} maze The Maze object to be modified
 */
function create_ent_ext(maze) {
    /** Randomly create entrance and exit **/
    if (rand_int(0, 1)) { // Entrance and exit are on left and right perimeter walls
        const h1 = rand_int(0, maze.row_count-1); // Random index for hole 1
        const h2 = rand_int(0, maze.row_count-1); // Random index for hole 2
        maze.vertical_wall(-1, 0, h1, h1, false); // Left
        maze.vertical_wall(maze.col_count-1, maze.col_count, h2, h2, false); // Right
    } else { // Entrance and exit are on top and bottom perimeter walls
        const h1 = rand_int(0, maze.col_count-1); // Random index for hole 1
        const h2 = rand_int(0, maze.col_count-1); // Random index for hole 2
        maze.horizontal_wall(h1, h1, -1, 0, false);  // Top
        maze.horizontal_wall(h2, h2, maze.row_count-1, maze.row_count, false);  // Bot
    }
}

/**
 * Creates walls in the maze through binary space partitioning, and also
 * draws the walls on the canvas. The maze will have a perimeter with a
 * random entrance and exit chosen on opposite edges of the perimeter.
 * @param {Maze} maze A Maze object that needs to have its walls modified.
 */
function bsp_maze(maze) {
    strokeCap(SQUARE);
    // Create perimeter
    create_perimeter(maze);
    // Create entrance and exit
    create_ent_ext(maze);
    /** Create internal walls via recursive partition **/
    // Use a random starting direction for the initial partition
    const random_dir = random() >= 0.5 ? DirectionEnum.horizontal : DirectionEnum.vertical;
    binary_space_partition(0, maze.row_count-1, 0, maze.col_count-1, 0.5, random_dir, maze);
}

/**
 * Recursive binary space partition maze generator.
 * @param {Number} left_col The left column index of the current partition.
 * @param {Number} right_col The right column index of the current partition.
 * @param {Number} top_row The top row index of the current partition.
 * @param {Number} bot_row The bottom row index of the current partition.
 * @param {DirectionEnum} dir Used to keep track of the parent partition's splitting orientation.
 * @param {Maze} maze A reference to the maze object to be modified
 */
function binary_space_partition(left_col, right_col, top_row, bot_row, hole_pref, dir, maze) {
    const d_width = right_col - left_col;
    const d_height = bot_row - top_row;

    // Base case: this region cannot be partitioned
    if (d_width == 0 && d_height == 0) 
        return;

    let wall_dir; // The orientation of the new wall to be generated (vertical or horizontal?)
    if (d_width == 0) // If width is 0, we cannot create a vertical wall, so it must be horizontal
        wall_dir = DirectionEnum.horizontal;
    else if (d_height == 0) // Else if height is 0, we cannot create a horizontal wall, so it must be vertical
        wall_dir = DirectionEnum.vertical;
    else { // Else we can partition in either direction
        // Bias towards keeping the partition square
        let cutoff = (d_height / (d_height + d_width)); // cutoff higher if area = tall, lower if area = wide
        // Unless it's a very small partition already. Then try to make longer corridors
        if (cutoff > 0.5 && d_height < 6) {
            cutoff = 0.35;
        } else if (cutoff < 0.5 && d_width < 6) {
            cutoff = 0.65;
        }
        wall_dir = random() >= cutoff ? DirectionEnum.vertical : DirectionEnum.horizontal;
    }

    // If parent partition was in a different direction, reset hole pref
    if (dir != wall_dir)
        hole_pref = 0.5;

    if (wall_dir == DirectionEnum.horizontal) { // horizontal wall
        // Choose the wall and hole
        const wall_choice = floor(clt_random() * d_height) + top_row; // The row just above the proposed wall
        let hole_choice;
        if (dir == wall_dir && random() < 0.95) {
            if (((wall_choice - top_row) % 2) == 0)
                hole_choice = (hole_pref ? left_col : right_col);
            else
                hole_choice = (hole_pref ? right_col : left_col);
        } else {
            hole_choice = rand_int(left_col, right_col); // A hole on the new wall
        }
        // Remember the hole preference to make snaky paths
        if (hole_choice > (left_col + right_col) / 2) {
            hole_pref = true;
        } else if ((hole_choice < (left_col + right_col) / 2)) {
            hole_pref = false;
        } else {
            hole_pref = !hole_pref;
        }
        // Create the wall and hole
        maze.horizontal_wall(left_col, right_col, wall_choice, wall_choice+1, true);
        maze.horizontal_wall(hole_choice, hole_choice, wall_choice, wall_choice+1, false);
        // Recursively partition
        binary_space_partition(left_col, right_col, top_row, wall_choice, hole_pref, wall_dir, maze);
        binary_space_partition(left_col, right_col, wall_choice+1, bot_row, hole_pref, wall_dir, maze);
    } else { // vertical wall
        // Choose the wall and hole
        const wall_choice = floor(clt_random() * d_width) + left_col; // The col just left of proposed wall
        let hole_choice;
        if (dir == wall_dir && random() < 0.95) {
            if (((wall_choice - left_col) % 2) == 0)
                hole_choice = (hole_pref ? top_row : bot_row);
            else 
                hole_choice = (hole_pref ? bot_row : top_row);
        } else {
            hole_choice = rand_int(top_row, bot_row); // A hole on the new wall
        }
        // Remember the hole preference to make snaky paths
        if (hole_choice > (top_row+ bot_row) / 2)
            hole_pref = true;
        else if (hole_choice < (top_row+ bot_row) / 2){
            hole_pref = false;
        } else {
            hole_pref = !hole_pref;
        }
        // Create the wall and hole
        maze.vertical_wall(wall_choice, wall_choice+1, top_row, bot_row, true);
        maze.vertical_wall(wall_choice, wall_choice+1, hole_choice, hole_choice, false);
        // Recursively partition
        binary_space_partition(left_col, wall_choice, top_row, bot_row, hole_pref, wall_dir, maze);
        binary_space_partition(wall_choice+1, right_col, top_row, bot_row, hole_pref, wall_dir, maze);
    }
}

function k_msp_maze(maze) {
    strokeCap(SQUARE);
    // Fill the entire grid with walls
    for (let i = -1; i < maze.col_count; ++i)
        maze.vertical_wall(i, i+1, 0, maze.row_count-1, true); // Left
    for (let i = -1; i < maze.row_count; ++i)
        maze.horizontal_wall(0, maze.col_count-1, i, i+1, true);  // Top

    // Create entrance and exit
    create_ent_ext(maze);
        
    // Create a new disjoint set with one set for each cell in the maze grid
    const total_cells = maze.row_count * maze.col_count;
    const total_edges = (2 * maze.row_count * maze.col_count) - maze.row_count - maze.col_count;
    const cell_sets = new DisjointSet(total_cells);
    let edge_sequence;
    if (total_edges < 256) { // 2^8
        edge_sequence = new Uint8Array(total_edges);
    } else if (total_edges < 65536) { // 2^16
        edge_sequence = new Uint16Array(total_edges);
    } else if (total_edges < 4294967296) { // 2^32
        edge_sequence = new Uint32Array(total_edges);
    } else {
        edge_sequence = new Array(total_edges);
    }
    
    // Initialize a sequence of all of the edges starting from the left-most
    // column on each row and going right. Only enumerate left and top walls
    // for each cell, skipping the top walls of row 0 and left walls of col 0.
    let count = 0;
    for (let i = 0; i < total_cells; ++i) {
        // If we're not in the left column, push left walls
        if ((i % maze.col_count) != 0)
            edge_sequence[count++] = 2 * i;

        // If we're not in the top row, push top walls
        if (i >= maze.col_count)
            edge_sequence[count++] = (2 * i) + 1;
    }

    // While we have more than one set
    // Iterate over all edges and delete if possible
    while (cell_sets.num_sets > 1) {
        const i = floor(random() * count);
        const is_top = (edge_sequence[i] % 2) != 0;
        const grid_index1 = floor(edge_sequence[i] / 2);
        const grid_index2 = is_top ? grid_index1 - maze.col_count : grid_index1-1;
        const deleted = cell_sets.try_join_trees(grid_index1, grid_index2);
        if (deleted) {
            // Horizontal walls
            if (is_top) {
                const row_above = floor(grid_index2 / maze.col_count);
                const row_below = row_above + 1;
                const column = grid_index1 % maze.col_count;
                maze.horizontal_wall(column, column, row_above, row_below, false);
            }
            // Vertical walls
            else {
                const col_left = floor(grid_index2 % maze.col_count);
                const col_right = col_left + 1;
                const row = floor(grid_index1 / maze.col_count);
                maze.vertical_wall(col_left, col_right, row, row, false);
            }
        }
        // Remove the edge from the array.
        // If it is deleted, we no longer need to track it.
        // If it couldn't be deleted, we will never need to check if it can be deleted again.
        // since uint arrays dont support splice, we can just swap with the last element and decrement count.
        edge_sequence[i] = edge_sequence[--count];
    }
}

function recur_bt_maze(maze, straightness) {
    strokeCap(SQUARE);
    // Fill the entire grid with walls
    for (let i = -1; i < maze.col_count; ++i)
        maze.vertical_wall(i, i+1, 0, maze.row_count-1, true); // Left
    for (let i = -1; i < maze.row_count; ++i)
        maze.horizontal_wall(0, maze.col_count-1, i, i+1, true);  // Top

    // Create entrance and exit
    create_ent_ext(maze);

    const total_cells = maze.row_count * maze.col_count;
    let visited_set = new HashSet(total_cells);

    let path_stack;
    if (total_cells < 64) { // 2^6     we need to assume 2 bits are used to store direction
        path_stack = new Uint8Array(total_cells);
    } else if (total_cells < 16384) { // 2^14
        path_stack = new Uint16Array(total_cells);
    } else if (total_cells < 1073741824) { // 2^30
        path_stack = new Uint32Array(total_cells);
    } else {
        path_stack = new Array(total_cells);
    }

    let unexplored = total_cells; // Keep track of number of unexplored cells
    let count = 0; // Keep track of number of elements in the stack

    const first = rand_int(0, total_cells-1) // A random cell to be added into the path stack
    const first_row = floor(first / maze.col_count);
    const first_col = first % maze.col_count;
    visited_set.insert(first);
    path_stack[count] = (first << 2); // Shift by 2 to make room for storing direction
    ++count; --unexplored;
    
    while (unexplored > 0) {
        // Check all directions around the maze and push valid ones into "valid"
        const front_index = path_stack[count-1] >>> 2; // right shift to get rid of direction bits
                                                       // make sure using 0 fill right shift
        const front_row = floor(front_index / maze.col_count);
        const front_col = front_index % maze.col_count;
        const valid = new Array();
        // Make sure not to include perimeter walls
        if ( (front_col > 0) && !visited_set.contains(front_index - 1) )
            valid.push(DirectionEnum.left);
        if ( (front_col < (maze.col_count-1)) && !visited_set.contains(front_index + 1) )
            valid.push(DirectionEnum.right);
        if ( (front_row > 0) && !visited_set.contains(front_index - maze.col_count) )
            valid.push(DirectionEnum.up);
        if ( (front_row < (maze.row_count-1)) && !visited_set.contains(front_index + maze.col_count) )
            valid.push(DirectionEnum.down);
        // If there are no valid directions, pop from stack
        if (valid.length == 0) {
            --count;
            if (count == 0) {
                console.log("out of bounds");
                return;
            }
        } else { // Else, we must visit a new node

            // See if the previous direction is still valid
            const prev_direction = path_stack[count-2] & 0b11;
            let found = -1;
            for (let i = 0; i < valid.length; ++i) {
                if (valid[i] == prev_direction) {
                    found = i;
                    break;
                }
            }
            // If it's valid, and we pass an RNG check, then we go in the same direction again
            if (found > -1 && random() < straightness)
                valid[0] = valid[found];
            // Otherwise, pick a random valid direction
            else
                valid[0] = valid[ rand_int(0, valid.length-1) ];
            
            --unexplored; // Decrement unexplored nodes
            path_stack[count-1] &= ~(0b11); // Clear the direction in the current node first
            let new_cell;

            // Go in the first direction in our valid array
            switch (valid[0]) {
                case DirectionEnum.left:
                    maze.vertical_wall(front_col-1, front_col, front_row, front_row, false);
                    path_stack[count-1] |= DirectionEnum.left; // Set direction travelled as left
                    new_cell = front_index - 1; // Find the index of the cell to the left of current
                    break;
                case DirectionEnum.right:
                    maze.vertical_wall(front_col, front_col+1, front_row, front_row, false);
                    path_stack[count-1] |= DirectionEnum.right; // Set direction travelled as right
                    new_cell = front_index + 1; // Find the index of the cell to the right of current
                    break;
                case DirectionEnum.up:
                    maze.horizontal_wall(front_col, front_col, front_row-1, front_row, false);
                    path_stack[count-1] |= DirectionEnum.up; // Set direction travelled as up
                    new_cell = front_index - maze.col_count; // Find the index of the cell above current
                    break;
                case DirectionEnum.down:
                    maze.horizontal_wall(front_col, front_col, front_row, front_row+1, false);
                    path_stack[count-1] |= DirectionEnum.down; // Set direction travelled as down
                    new_cell = front_index + maze.col_count; // Find the index of the cell below current
                    break;
            }

            // Then add the new cell into the stack, make sure to left shift making room for 2 direction bits
            path_stack[count++] = new_cell << 2;
            // Also add new_cell into set, no need to shift for this one
            visited_set.insert(new_cell);
        }
    }
}