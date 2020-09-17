const BotDirEnum = {
    "left": 0,
    "down": 1,
    "right": 2,
    "up": 3
}
Object.freeze(DirectionEnum)


class Bot {
    constructor(maze, bot_color, init_direction) {
        this.maze = maze;  // For use with 'has wall functions'
        this.row = 0;
        this.col = 0;
        this.color = bot_color;
        this.direction = init_direction;
    }

    set_trail(prev_row, prev_col){
        //let data = maze.grid[row][col];
        
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
  // train in each cell is just a symbol
  // 
  
    draw_bot() {
        // x has to add offset = wall_thickness * 0.5 
        //this.row / this.col
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke("orange");
        strokeWeight(0.05 * this.maze.unit_area);
        fill(this.color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .7);
    }

    erase_bot() {
        // x has to add offset = wall_thickness * 0.5
        const x = (this.col * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        const y = (this.row * this.maze.unit_area) + this.maze.offset + (0.5 * this.maze.unit_area);
        stroke(this.maze.fill_color);
        strokeWeight(0.07 * this.maze.unit_area);
        fill(this.maze.fill_color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .7);
    }
    

    move_bot() {
        // erase old bot position
        // draw a trail
        // draw the new bot position
        // "left": 0,
        // "down": 1,
        // "right": 2,
        // "up": 3

        // If the bot has arrive at the end, return
        if (this.maze.is_end_position(this.row, this.col))
            return;
            
        for (let i = 0; i <=3; i++){
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
            }

            switch(this.direction){                             
                case BotDirEnum.left: //0000 LRTB                                                        // <-O
                    if (!(this.maze.has_left_wall(this.row, this.col)) && this.col > 0){
                        this.erase_bot();
                        this.col --;
                        //calculate if we need to draw or remove trail
                        this.draw_bot();
                        return;
                        //finished moving return
                    }
                    break;
                case BotDirEnum.right: //0000 LRTB                                                         // O->
                    if (!(this.maze.has_right_wall(this.row, this.col)) && this.col < this.maze.col_count-1){
                        this.erase_bot();
                        this.col ++;
                        this.draw_bot();
                        return;
                    }
                    break;
                case BotDirEnum.up: //0000 LRTB                                                            //  ^
                    if (!(this.maze.has_top_wall(this.row, this.col)) && this.row > 0){                    //  |
                        this.erase_bot();                                                                  //  O
                        this.row --;                                        
                        this.draw_bot();
                        return;                                        
                    }
                    break;
                case BotDirEnum.down: //0000 LRTB                                                               //  O
                    if (!(this.maze.has_bot_wall(this.row, this.col)) && this.row < this.maze.row_count-1){     //  |
                        this.erase_bot();                                                                       //  v
                        this.row ++;                                        
                        this.draw_bot();
                        return;
                    }
                    break;
            }
        }
    }
    
    place_bot(row, col) { // Places the bot on the board in starting location
        // Check if position is valid in maze
        if (row < 0 || row >= this.maze.row_count || col < 0 || col >= this.maze.col_count){
            //invalid starting location
            return -1;
        }
        this.row = row;
        this.col = col;
        // Draw the bot on the canvas
        this.draw_bot();
        //this.erase_bot();
    }
}