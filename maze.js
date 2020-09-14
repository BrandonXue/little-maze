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
        this.unit_area = unit;
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
            stroke("white");
        else
            stroke("black");
        strokeWeight(this.wall_thickness);

        // Improper arguments
        if ((left_col + 1) != right_col)
            console.log("Error: draw_vertical_wall: left and right not adjacent.");
        if ((start_row > end_row))
            console.log("Error: draw_vertical_wall: end row must be >= start row.");

        let x = right_col * this.unit_area;
        if (val) {
            line(x, start_row * this.unit_area, // x1, y1
                 x, (end_row+1) * this.unit_area); // x2, y2
        } else { // Shorten holes slightly
            line(x, (start_row * this.unit_area) + this.wall_thickness, // x1, y1
                x, (end_row+1) * this.unit_area) - this.wall_thickness; // x2, y2
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
        else {
            if (val) {
                for (let segment = start_row; segment <= end_row; ++segment) {
                    if (val) {
                        this.grid[segment][left_col] |= WallEnum.right;
                        this.grid[segment][right_col] |= WallEnum.left;
                    } else {
                        this.grid[segment][left_col] &= ~WallEnum.right;
                        this.grid[segment][right_col] &= ~WallEnum.left;
                    }
                }
            }
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
            stroke("white");
        else
            stroke("black");
        strokeWeight(this.wall_thickness);

        // Improper arguments
        if ((top_row + 1) != bot_row)
            console.log("Error: draw_horizontal_wall: top and bot not adjacent.");
        if ((start_col > end_col))
            console.log("Error: draw_horizontal_wall: end col must be >= start col.");

        let y = bot_row * this.unit_area;
        if (val) {
            line(start_col * this.unit_area, y, // x1, y1
                 (end_col+1) * this.unit_area, y); // x2, y2
        } else { // Shorten holes slightly
            line((start_col * this.unit_area) + this.wall_thickness, y, // x1, y1
                ((end_col+1) * this.unit_area) - this.wall_thickness, y); // x2, y2
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
                    this.grid[top_row][segment] |= WallEnum.bottom;
            } else {
                for (let segment = start_row; segment <= end_row; ++segment)
                    this.grid[top_row][segment] &= ~WallEnum.bottom;
            }
        }
        // Internal wall
        else {
            if (val) {
                for (let segment = start_col; segment <= end_col; ++segment) {
                    if (val) {
                        this.grid[top_row][segment] |= WallEnum.bottom;
                        this.grid[bot_row][segment] |= WallEnum.top;
                    } else {
                        this.grid[top_row][segment] &= ~WallEnum.bottom;
                        this.grid[bot_row][segment] &= ~WallEnum.top;
                    }
                }
            }
        }
    }

    /**
     * Check if the cell at the given row and column has a left wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_left_wall(row, col) {
        return this.grid[row][col] & WallEnum.left;
    }

    /**
     * Check if the cell at the given row and column has a right wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_right_wall(row, col) {
        return this.grid[row][col] & WallEnum.right;
    }

    /**
     * Check if the cell at the given row and column has a top wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_left_wall(row, col) {
        return this.grid[row][col] & WallEnum.top;
    }

    /**
     * Check if the cell at the given row and column has a bottom wall.
     * @param {Number} row Integer row index.
     * @param {Number} col Integer column index.
     */
    has_left_wall(row, col) {
        return this.grid[row][col] & WallEnum.bottom;
    }
}          


/**
 * Easy to use function to begin the recursive binary space partition
 */
function bsp_maze(maze) {
    // Create perimeter
    maze.set_vertical_wall(-1, 0, 0, maze.row_count-1, true); // Left
    maze.draw_vertical_wall(-1, 0, 0, maze.row_count-1, true)
    maze.set_vertical_wall(maze.col_count-1, maze.col_count, 0, maze.row_count-1, true);
    maze.draw_vertical_wall(maze.col_count-1, maze.col_count, 0, maze.row_count-1, true);
    maze.set_horizontal_wall(0, maze.col_count-1, -1, 0, true);  // Top
    maze.draw_horizontal_wall(0, maze.col_count-1, -1, 0, true);
    maze.set_horizontal_wall(0, maze.col_count-1, maze.row_count-1, maze.row_count, true);  // Bot
    maze.draw_horizontal_wall(0, maze.col_count-1, maze.row_count-1, maze.row_count, true)

    //Create entrance and exit
    /** TODO **/

    //Create internal walls via recursive partition
    binary_space_partition(0, maze.row_count-1, 0, maze.col_count-1, DirectionEnum.vertical, maze);
}

/**
 * Binary space partition maze generator.
 * @param {Number} left_col The left column index of the current partition.
 * @param {Number} right_col The right column index of the current partition.
 * @param {Number} top_row The top row index of the current partition.
 * @param {Number} bot_row The bottom row index of the current partition.
 * @param {DirectionEnum} dir Used to keep track of the parent partition's splitting orientation.
 * @param {Maze} maze A reference to the maze object to be modified
 */
function binary_space_partition(left_col, right_col, top_row, bot_row, dir, maze) {
    let d_width = right_col - left_col;
    let d_height = bot_row - top_row;

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
        let wall_choice = floor(random() * d_height) + top_row; // Choose the row just above the proposed wall
        let hole_choice = rand_int(left_col, right_col); // Choose a hole on the new wall
        // Set the wall in the matrix and draw the wall on the canvas
        maze.set_horizontal_wall(left_col, right_col, wall_choice, wall_choice+1, true);
        maze.draw_horizontal_wall(left_col, right_col, wall_choice, wall_choice+1, true);
        // Punch a hole out
        maze.set_horizontal_wall(hole_choice, hole_choice, wall_choice, wall_choice+1, false);
        maze.draw_horizontal_wall(hole_choice, hole_choice, wall_choice, wall_choice+1, false);
        // Recursively partition
        binary_space_partition(left_col, right_col, top_row, wall_choice, wall_dir, maze);
        binary_space_partition(left_col, right_col, wall_choice+1, bot_row, wall_dir, maze);
    } else { // vertical wall
        // Choose the wall and hole
        let wall_choice = floor(random() * d_width) + left_col; // Choose the col just left of proposed wall
        let hole_choice = rand_int(top_row, bot_row); // Choose a hole on the new wall
        // Set the wall in the matrix and draw the wall on the canvas
        maze.set_vertical_wall(wall_choice, wall_choice+1, top_row, bot_row, true);
        maze.draw_vertical_wall(wall_choice, wall_choice+1, top_row, bot_row, true);
        // Punch a hole out
        maze.set_vertical_wall(wall_choice, wall_choice+1, hole_choice, hole_choice, false);
        maze.draw_vertical_wall(wall_choice, wall_choice+1, hole_choice, hole_choice, false);
        // Recursively partition
        binary_space_partition(left_col, wall_choice, top_row, bot_row, wall_dir, maze);
        binary_space_partition(wall_choice+1, right_col, top_row, bot_row, wall_dir, maze);
    }
}