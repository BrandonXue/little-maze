const BotDirEnum = {
    "left": 0,
    "down": 1,
    "right": 2,
    "up": 3
}
Object.freeze(DirectionEnum)


class Trail_Stack {
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
     * @param {*} move_speed An integer between 1 - 20. 20 means one tile per frame. 1 means one tile per 20 frames.
     */
    constructor(maze, start_row, start_col, bot_color, move_speed) {
        this.trail = new Trail_Stack(maze.row_count * maze.col_count);

        this.maze = maze;  // For use with 'has wall functions'
        this.row = start_row;
        this.col = start_col;
        this.color = bot_color;

        // Find initial direction
        if (this.row == 0)
            this.direction = BotDirEnum.down;
        else if (this.row == maze.row_count-1)
            this.direction = BotDirEnum.up;
        else if (this.col == 0)
            this.direction = BotDirEnum.right;
        else if (this.col == maze.col_count-1)
            this.direction = BotDirEnum.left;

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
        for (move_speed; move_speed > 0; --move_speed) {
            numerator *= 2;
        }
        this.unit_movement = numerator / 256;
    }

    set_trail(prev_row, prev_col){
        //let data = maze.grid[row][col];
        //if (this.trail.top())
    }

    //passing in previous location
    draw_trail(prev_row, prev_col){ 
        //maze.grid[0][0]
    }        


  // case 1: leaving cell with trail, going into cell with trail
  //    delete the trail from cell we just left
  // case 2: leaving cell with trail, going into cell without trail
  //    don't delete the old trail
  // case 3: leaving cell with no trail, going into cell with trail
  //    nothing to delete
  // case 4: leaving cell with no trail, going into cell without trail
  //    leave a trail in cell we just left

  // trail has a direction
  // trail in each cell is just a symbol
  // 
  
    draw_bot() {
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke("orange");
        strokeWeight(0.05 * this.maze.unit_area);
        fill(this.color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .7);
    }

    /*erase_bot() {
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke(this.maze.fill_color);
        strokeWeight(0.05 * this.maze.unit_area);
        fill(this.maze.fill_color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * 0.9);
    }*/
    
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
     * @returns true if the bot is reoriented in a valid direction, false otherwise.
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
        // TODO: draw a trail

        // If the bot has arrived at the end, return
        if (this.maze.is_end_position(this.row, this.col))
            return;

        /*for (let i = 0; i <=3; i++){
            switch(i){        //  ccw +1    cw  -1
                case 0: // first check
                    this.direction = (this.direction + 1) % 4; // CCW 90
                    break;
                case 1: // second check
                    this.direction = (this.direction + 3) % 4; // CCW 270
                    break;
                case 2: // third check
                    this.direction = (this.direction + 3) % 4; // CCW 270
                    break;
                case 3: // fourth check
                    this.direction = (this.direction + 3) % 4; // CCW 270
                    break;
            }*/

            // When the bot isn't aligned with the grid yet, keeping moving in its current direction
            if ( (this.row != floor(this.row)) || (this.col != floor(this.col)) ) {
                this.walk_forward();
            }
            // Otherwise, find direction and then move forward
            else {
                this.find_direction();
                this.walk_forward();
            }
            /*switch(this.direction){                             
                case BotDirEnum.left:
                    if (!(this.maze.has_left_wall(this.row, this.col)) && this.col > 0) {
                        this.col --;
                        return;
                    }
                    break;
                case BotDirEnum.right:
                    if (!(this.maze.has_right_wall(this.row, this.col)) && this.col < this.maze.col_count-1) {
                        this.col ++;
                        return;
                    }
                    break;
                case BotDirEnum.up:
                    if (!(this.maze.has_top_wall(this.row, this.col)) && this.row > 0) {
                        this.row --;
                        return;                                        
                    }
                    break;
                case BotDirEnum.down:
                    if (!(this.maze.has_bot_wall(this.row, this.col)) && this.row < this.maze.row_count-1) {
                        this.row ++;
                        return;
                    }
                    break;
            }
            }
        }*/
    }
    
    /*place_bot(row, col) { // Places the bot on the board in starting location
        // Check if position is valid in maze
        if (row < 0 || row >= this.maze.row_count || col < 0 || col >= this.maze.col_count){
            return -1;
        }
        this.row = row;
        this.col = col;
    }*/
}