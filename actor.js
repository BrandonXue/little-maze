/**
 * Brandon Xue          brandonx@csu.fullerton.edu
 * Ernesto Hoogkkirk    Ernesto_Hooghkirk@csu.fullerton.edu
 * Ryan Martinez        rmartinez72@csu.fullerton.edu
 * 
 * Last maintained (YYMMDD): 200920
 * 
 * This file contains code for the actors (bot and player).
 * 
 * Our bot follows a very simple left-hand rule when completing the maze.
 * The bot leaves behind a trail which is pushed to a custom TrailStack class.
 * 
 * The player appears in the "play" and "race" game-modes, and can be controlled
 * using the arrow keys on the keyboard. Key inputs are stored in a buffer, and
 * the player unit prioritizes the last pressed key for more intuitive control.
 * 
 * Both actors store information about the maze that allows them to reset to their
 * starting positions.
 */



/**
 * ActorDirection is used to simplify the rotation of the bot.
 * The direction can be easily changed by addition and treating
 * the addition as happening on a mathematical ring.
 */
const ActorDirection = {
    "left": 0,
    "down": 1,
    "right": 2,
    "up": 3,
    "none": 4
};
Object.freeze(ActorDirection);

/**
 * More readable keyboard codeKeys
 */
const KeyboardCodeKeys = {
    "left": 37,
    "up": 38,
    "right": 39,
    "down": 40
};
Object.freeze(KeyboardCodeKeys);



/**
 * An unsigned integer stack with a fixed capacity.
 */
class TrailStack {
    /**
     * @param {Number} total_cells Integer maximum number of cells in the grid
     */
    constructor(total_cells) {
        this.count = 0;
        if (total_cells < 256) { // 2^8
            this.route_stack = new Uint8Array(total_cells);
        } else if (total_cells < 65536) { // 2^16
            this.route_stack = new Uint16Array(total_cells);
        } else if (total_cells < 4294967296) { // 2^32
            this.route_stack = new Uint32Array(total_cells);
        } else {
            this.route_stack = new Array(total_cells);
        }
    }

    /**
     * Push to stack
     * @param {Number} cell_index Must be unsigned nonnegative integer between 0 and total_cells
     */
    push(cell_index) {
        this.route_stack[(this.count)++] = cell_index; 
    }

    /**
     * Pop an unsigned integer off the stack
     */
    pop() {
        return this.route_stack[--(this.count)];
    }

    /**
     * Peek the top element without removing it
     */
    top() {
        if (this.count > 0)
            return this.route_stack[this.count-1];
        return -1;
    }

    get_count() {
        return this.count;
    }
}



/**
 * The maze-runner bot.
 */
class MazeBot {
    /**
     * Initialize a bot that runs mazes by following the left-hand rule.
     * @param {Maze} maze A reference to the Maze object that the bot will run in
     * @param {String} inner_color The color of the bot
     * @param {String} outline_color The color of the bot's outline
     * @param {Number} move_speed An integer between 1 - 8. 8 means one tile per frame.
     */
    constructor(maze, inner_color, outline_color, move_speed) {
        this.trail = new TrailStack(maze.row_count * maze.col_count);

        this.maze = maze;  // For use with 'has wall functions'
        this.row = maze.start_row;
        this.col = maze.start_col;
        this.prev_row = this.row;
        this.prev_col = this.col;
        this.inner_color = inner_color;
        this.outline_color = outline_color;
        this.speed_update = false;

        // Find initial direction
        this.find_initial_direction();

        // Speed can be an integer from 1 - 8
        this.calc_unit_movement(move_speed);
    }

    /**
     * Calculate the unit movement that the bot must perform every frame.
     * This guarantees the bot will realign with a grid cell while performing smooth movement.
     * @param {Number} move_speed Integer between 1 and 8.
     */
    calc_unit_movement(move_speed) {
        this.speed_update = false;
        // Speed can be an integer from 1 - 8
        move_speed = floor(move_speed); // Make sure it's an integer
        if (move_speed < 1) // Make sure it's within bounds
            move_speed = 1;
        if (move_speed > 8)
            move_speed = 8;
        // Unit movement will be a multiple of 1/256th of a grid tile
        // We do this because unit_movement must be rational and not have too many decimal places
        // Or the bot will never align with the grid again through addition
        let numerator = 1;
        for (move_speed; move_speed > 0; --move_speed)
            numerator *= 2;
        this.unit_movement = numerator / 256;
    }

    /**
     * Used to alert the bot that the global variable speed has been updated.
     * The bot will update its speed the next time it is aligned with the grid.
     */
    notify_speed_update() {
        this.speed_update = true;
    }

    /**
     * Find the starting direction for the bot. This is provided by the maze.
     */
    find_initial_direction() {
        this.direction = maze.start_dir;
    }

    /**
     * Put the bot back into the maze's starting cell and make it face the correct
     * starting direction.
     */
    reset() {
        // Clear all path data by using the path stack
        while (this.trail.get_count() > 0) {
            const index = this.trail.pop();
            const col = index % this.maze.col_count;
            const row = floor(index / this.maze.col_count);
            this.maze.set_trail_bits(row, col, 0b00000000);
        }
        // Clear path stack
        //this.trail = new TrailStack(this.maze.row_count * this.maze.col_count);
        // Get starting position + direction 
        this.row = this.maze.start_row;
        this.col = this.maze.start_col;
        this.prev_row = this.row;
        this.prev_col = this.col;
        this.find_initial_direction();
    }

    /**
     * Adds a trail segment to our trail stack.
     * Precondition: The bot must be aligned with the grid (row and col are integers).
     */ 
    set_trail(){
        const prev_trail_dat = (this.maze.grid[this.prev_row][this.prev_col]) >>> 4; 
        const curr_trail_dat = (this.maze.grid[this.row][this.col]) >>> 4;
        const prev_has_trail = prev_trail_dat != 0;
        const curr_has_trail = curr_trail_dat != 0;

        if (prev_has_trail) {
            if (curr_has_trail) { // case 1: leaving cell with trail, going into cell with trail
                this.maze.set_trail_bits(this.prev_row, this.prev_col, 0b00000000); // delete the trail from cell we just left
                this.trail.pop();
                // erase the tail in current cell that's pointing towards the old trail piece
            } else { // case 2: leaving cell with trail, going into cell without trail
                this.maze.set_trail_bits(this.row, this.col, 0b11110000); // set a trail in current cell
                const index = this.col + this.row * this.maze.col_count;
                this.trail.push(index); // push current cell to stack
                // instead, add a tail towards new trail
            }
        } else { // prev doesn't have trail
            if (curr_has_trail) {// case 3: leaving cell with no trail, going into cell with trail
                // This state is no longer reachable because we always have a trail under us
                let x;
                // erase the tail in current cell that's pointing towards the old trail piece
            } else { // case 4: leaving cell with no trail, going into cell without trail
                this.maze.set_trail_bits(this.prev_row, this.prev_col, 0b11110000); // leave a trail in cell we just left
                const index = this.col + this.row * this.maze.col_count;
                this.trail.push(index);
                // add a tail towards the current cell
            }
        }
    }
    
    /**
     * Check if the bot is facing a wall based on its current direction.
     * @returns True if the bot is facing a wall, false otherwise.
     */
    is_facing_wall() {
        switch(this.direction){                             
            case ActorDirection.left:
                return this.maze.has_left_wall(this.row, this.col);
            case ActorDirection.right:
                return this.maze.has_right_wall(this.row, this.col);
            case ActorDirection.up:
                return this.maze.has_top_wall(this.row, this.col);
            case ActorDirection.down:
                return this.maze.has_bot_wall(this.row, this.col);
        }
    }

    /**
     * Find a valid direction for the bot to move in.
     * @returns True if the bot is reoriented in a valid direction, false otherwise.
     */
    find_direction() {
        this.direction = (this.direction + 1) % 4; // CCW 90
        if (!this.is_facing_wall())
            return true;
        this.direction = (this.direction + 3) % 4; // CCW 270
        if (!this.is_facing_wall())
            return true;
        this.direction = (this.direction + 3) % 4; // CCW 270
        if (!this.is_facing_wall())
            return true;
        this.direction = (this.direction + 3) % 4; // CCW 270
        if (!this.is_facing_wall())
            return true;
        // If all four sides have walls
        console.log("Oops, an error occurred and the bot thinks it's trapped!");
        return false;
    }

    /**
     * Walks the bot forward in the direction it's facing by a unit_movement of distance.
     * Precondition: The bot must be able to move in the direction it is facing.
     * This function performs no safety checks.
     */
    walk_forward() {
        switch(this.direction){                             
            case ActorDirection.left:
                this.col -= (this.unit_movement);
                return;
            case ActorDirection.right:
                this.col += (this.unit_movement);
                return;
            case ActorDirection.up: 
                this.row -= (this.unit_movement);
                return;     
            case ActorDirection.down:
                this.row += (this.unit_movement);
                return;
        }
    }

    /**
     * Perform one frame's worth of bot movement actions. If the bot has
     * reached the end of the maze, the method returns immediately.
     * If the bot is not aligned with the grid, keep moving in current direction.
     * If the bot is aligned with the grid, check for a speed update, re-orient
     * direction, and move once.
     */
    move() {
        // If the bot has arrived at the end, return
        if (this.maze.is_end_position(this.row, this.col))
            return;

        // When the bot isn't aligned with the grid yet, keeping moving in its current direction
        if ( (this.row != floor(this.row)) || (this.col != floor(this.col)) ) {
            this.walk_forward();
        }
        // Otherwise, find direction and then move forward
        else {
            // If global speed has changed, recalculate bot's unit movement
            if (this.speed_update)
                this.calc_unit_movement(speed);
            this.set_trail();
            this.prev_row = this.row;
            this.prev_col = this.col;
            this.find_direction();
            this.walk_forward();
        }
    }

    /**
     * Paint the current trail to the canvas.
     */
    paint_trail(){
        const stack = this.trail.route_stack;
        for (let i = 0; i < this.trail.get_count(); ++i) {
            const col = stack[i] % this.maze.col_count;
            const row = floor(stack[i] / this.maze.col_count);
            const x = (col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
            const y = (row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
            stroke(trail_color);
            strokeWeight(0.05 * this.maze.unit_area);
            fill(trail_color);
            circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .5);
        }
    }
  
    /**
     * Paint the bot on the canvas.
     */
    paint() {
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke("clear"); // workaround for p5 bug where color doesn't change
        fill("clear"); // unless it is set to something different
        strokeWeight(0.05 * this.maze.unit_area);
        stroke(this.outline_color);
        fill(this.inner_color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .7);
    }
}



/**
 * The player unit that may be controlled by the keyboard.
 */
class GamePlayer {
    /**
     * Initialize a player unit that can explore the maze.
     * @param {Maze} maze A reference to the Maze object that the unit will run in
     * @param {String} inner_color The color of the unit
     * @param {String} outline_color The color of the unit's outline
     * @param {Number} move_speed An integer between 1 - 8. 8 means one tile per frame.
     */
    constructor(maze, inner_color, outline_color, move_speed) {
        this.maze = maze;  // For use with 'has wall functions'
        this.row = maze.start_row;
        this.col = maze.start_col;
        this.inner_color = inner_color;
        this.outline_color = outline_color;
        this.speed_update = false;
        this.direction_buffer = [];

        // Find initial direction
        this.find_initial_direction();

        // Speed can be an integer from 1 - 8
        this.calc_unit_movement(move_speed);
    }

    /**
     * Calculate the unit movement that the bot must perform every frame.
     * This guarantees the bot will realign with a grid cell while performing smooth movement.
     * @param {Number} move_speed Integer between 1 and 8.
     */
    calc_unit_movement(move_speed) {
        this.speed_update = false;
        // Speed can be an integer from 1 - 8
        move_speed = floor(move_speed); // Make sure it's an integer
        if (move_speed < 1) // Make sure it's within bounds
            move_speed = 1;
        if (move_speed > 8)
            move_speed = 8;
        // Unit movement will be a multiple of 1/256th of a grid tile
        // We do this because unit_movement must be rational and not have too many decimal places
        // Or the bot will never align with the grid again through addition
        let numerator = 1;
        for (move_speed; move_speed > 0; --move_speed)
            numerator *= 2;
        this.unit_movement = numerator / 256;
    }

    /**
     * Used to alert the bot that the global variable speed has been updated.
     * The bot will update its speed the next time it is aligned with the grid.
     */
    notify_speed_update() {
        this.speed_update = true;
    }

    /**
     * Convert maze's start direction from ActorDirection into keyboard codekeys
     * and store it in the bot. Initial direction is only useful if we want the
     * player to have a sprite and face the corrent starting direction.
     * Otherwise it has no impact on movement.
     */
    find_initial_direction() {
        switch (maze.start_dir) {
            case ActorDirection.left:
                this.direction = KeyboardCodeKeys.left;
                break;
            case ActorDirection.right:
                this.direction = KeyboardCodeKeys.right;
                break;
            case ActorDirection.up:
                this.direction = KeyboardCodeKeys.up;
                break;
            case ActorDirection.down:
                this.direction = KeyboardCodeKeys.down;
                break;
        }
    }

    /**
     * Put the bot back into the maze's starting cell and make it face the correct
     * starting direction.
     */
    reset() {
        // Get starting position + direction 
        this.row = this.maze.start_row;
        this.col = this.maze.start_col;
        this.find_initial_direction();
    }
  
    /**
     * Paint the player unit onto the canvas.
     */
    paint() {
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke("clear"); // workaround for p5 bug where color doesn't change
        fill("clear"); // unless it is set to something different
        strokeWeight(0.05 * this.maze.unit_area);
        stroke(this.outline_color);
        fill(this.inner_color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .7);
    }
    
    /**
     * Check if the unit is facing a wall based on its current direction,
     * and also check if it's facing the entrance or exit.
     * @returns True if the bot is facing a wall, false otherwise.
     */
    is_facing_wall_or_portal() {
        switch(this.direction){                             
            case KeyboardCodeKeys.left:
                return this.maze.has_left_wall(this.row, this.col)
                    || (this.col == 0);
            case KeyboardCodeKeys.right:
                return this.maze.has_right_wall(this.row, this.col)
                    || (this.col == this.maze.col_count-1);
            case KeyboardCodeKeys.up:
                return this.maze.has_top_wall(this.row, this.col)
                    || (this.row == 0);
            case KeyboardCodeKeys.down:
                return this.maze.has_bot_wall(this.row, this.col)
                    || (this.row == this.maze.row_count-1);
        }
    }

    /**
     * Find the most recent keypress in the direction stack.
     * @returns True if the bot is reoriented in a valid direction, false otherwise.
     */
    find_direction() {
        if (this.direction_buffer.length == 0)
            this.direction = ActorDirection.none;
        else
            this.direction = this.direction_buffer[0];
    }

    /**
     * Walks the bot forward in the direction it's facing by a unit_movement of distance.
     * Precondition: The bot must be able to move in the direction it is facing.
     * This function performs no safety checks.
     */
    walk_forward() {
        switch(this.direction){                             
            case KeyboardCodeKeys.left:
                this.col -= (this.unit_movement);
                return;
            case KeyboardCodeKeys.right:
                this.col += (this.unit_movement);
                return;
            case KeyboardCodeKeys.up: 
                this.row -= (this.unit_movement);
                return;     
            case KeyboardCodeKeys.down:
                this.row += (this.unit_movement);
                return;
            case ActorDirection.none:
                return;
        }
    }

    /**
     * Called by event listeners when specific keyboard keys are pressed.
     * @param {Number} key_code The standardized integer keyCode
     */
    key_down(key_code) {
        // If key already down and isn't the top of stack, move it to top of stack
        const index = this.direction_buffer.indexOf(key_code);
        if (index > 0) {
            const temp = this.direction_buffer[index];
            this.direction_buffer[index] = this.direction_buffer[0];
            this.direction_buffer[0] = temp;
        } else if (index == -1) { // else if key isn't found, add key to top of stack (front)
            this.direction_buffer.splice(0, 0, key_code);
        }

    }

    /**
     * Called by event listeners when specific keyboard keys are released.
     * @param {Number} key_code The standardized integer keyCode
     */
    key_up(key_code) {
        // Find the key that we just released and remove it
        const index = this.direction_buffer.indexOf(key_code);
        if (index != -1) {
            this.direction_buffer.splice(index, 1);
        }
    }

    /**
     * Move the player based on key presses. The player will keep moving until it
     * re-aligns with the grid again to prevent alignment headaches.
     */
    move() {
        // When not aligned with the grid, try moving in its current direction
        if ( (this.row != floor(this.row)) || (this.col != floor(this.col)) ) {
            this.walk_forward();
        }
        // Otherwise, find direction and then move forward
        else {
            // If global speed has changed, recalculate bot's unit movement
            if (this.speed_update)
                this.calc_unit_movement(speed);
            this.find_direction();
            if (!this.is_facing_wall_or_portal())
                this.walk_forward();
        }
    }
}

/**
 * Add listeners for keydown events to aid player control.
 */
window.onkeydown = e => {
    switch (e.keyCode) {
        // left, up, right, down are prevented from scrolling the page and sent to the player unit
        case 37: case 38: case 39: case 40:
            e.preventDefault();
            if (player != null) {
                player.key_down(e.keyCode);
            }
            break;
        // Spacebar is prevented from scrolling the page
        case 32: 
            e.preventDefault();
            break;
        // Other keys have no associated action
        default:
            break;
    }
}

/**
 * Add listeners for keyup events so that keyboard actions can be cleared.
 */
window.onkeyup = e => {
    if (player != null)
        player.key_up(e.keyCode);
}