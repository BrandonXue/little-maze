const BotDirEnum = {
    "left": 0,
    "down": 1,
    "right": 2,
    "up": 3
}
Object.freeze(DirectionEnum)

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

    push(cell_index) {
        this.route_stack[(this.count)++] = cell_index; 
    }

    pop() {
        return this.route_stack[--(this.count)];
    }

    top() {
        if (this.count > 0)
            return this.route_stack[this.count-1];
        return -1;
    }

    get_count() {
        return this.count;
    }
}

class Bot {
    /**
     * Initialize a bot that runs mazes by following the left-hand rule.
     * @param {Maze} maze A reference to the Maze object that the bot will run in
     * @param {String} bot_color The color of the bot
     * @param {BotDirEnum} init_direction The starting direction. Must be pointing away from exit.
     * @param {Number} move_speed An integer between 1 - 20. 20 means one tile per frame.
     *      1 means one tile per 20 frames.
     */
    constructor(maze, bot_color, move_speed) {
        this.trail = new TrailStack(maze.row_count * maze.col_count);

        this.maze = maze;  // For use with 'has wall functions'
        this.row = maze.start_row;
        this.col = maze.start_col;
        this.prev_row = this.row;
        this.prev_col = this.col;
        this.color = bot_color;
        this.speed_update = false;

        // Find initial direction
        this.find_initial_direction();

        // Speed can be an integer from 1 - 8
        this.calc_unit_movement(move_speed);
    }

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

    find_initial_direction() {
        this.direction = maze.start_dir;
    }

    /**
     * Adds a trail segment to our trail stack.
     * Precondition:
     * @param {Number} prev_row 
     * @param {Number} prev_col 
     */ 
    set_trail(prev_row, prev_col){
        const prev_trail_dat = (this.maze.grid[prev_row][prev_col]) >>> 4; 
        const curr_trail_dat = (this.maze.grid[this.row][this.col]) >>> 4;
        const prev_has_trail = prev_trail_dat != 0;
        const curr_has_trail = curr_trail_dat != 0;

        if (prev_has_trail) {
            if (curr_has_trail) { // case 1: leaving cell with trail, going into cell with trail
                this.maze.set_trail_bits(prev_row, prev_col, 0b00000000); // delete the trail from cell we just left
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
                this.maze.set_trail_bits(prev_row, prev_col, 0b11110000); // leave a trail in cell we just left
                const index = this.col + this.row * this.maze.col_count;
                this.trail.push(index);
                // add a tail towards the current cell
            }
        }


        // trail has a direction
        // trail in each cell is just a symbol
        //let data = maze.grid[row][col];
        //if (this.trail.top())
    }

    //passing in previous location
    draw_trail(prev_row, prev_col){
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
  
    draw_bot() {
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke("clear"); // workaround for p5 bug where color doesn't change
        fill("clear"); // unless it is set to something different
        strokeWeight(0.05 * this.maze.unit_area);
        stroke("orange");
        fill(this.color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .7);
    }
    
    /**
     * Check if the bot is facing a wall based on its current direction.
     * @returns True if the bot is facing a wall, false otherwise.
     */
    is_facing_wall() {
        switch(this.direction){                             
            case BotDirEnum.left:
                return this.maze.has_left_wall(this.row, this.col);
            case BotDirEnum.right:
                return this.maze.has_right_wall(this.row, this.col);
            case BotDirEnum.up:
                return this.maze.has_top_wall(this.row, this.col);
            case BotDirEnum.down:
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
            case BotDirEnum.left:
                this.col -= (this.unit_movement);
                return;
            case BotDirEnum.right:
                this.col += (this.unit_movement);
                return;
            case BotDirEnum.up: 
                this.row -= (this.unit_movement);
                return;     
            case BotDirEnum.down:
                this.row += (this.unit_movement);
                return;
        }
    }

    move_bot() {
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
            this.set_trail(this.prev_row, this.prev_col);
            this.prev_row = this.row;
            this.prev_col = this.col;
            this.find_direction();
            this.walk_forward();
        }
    }
}