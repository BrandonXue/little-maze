class Bot {
    constructor(maze, bot_color) {
        this.maze = maze;  // For use with 'has wall functions'
        this.row = 0;
        this.col = 0;
        this.color = bot_color;
    }

    set_trail(){
        maze.grid[this.row][this.col] ;
        
    }

    draw_trail(){ 
        maze.grid[0][0]
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
        const x = this.row*this.maze.unit_area + this.maze.offset;
        const y = this.col*this.maze.unit_area + this.maze.offset;
        stroke("orange");
        fill(this.color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .75);
    }

    erase_bot() {
        // x has to add offset = wall_thickness * 0.5
        const x = this.row*this.maze.unit_area + this.maze.offset;
        const y = this.col*this.maze.unit_area + this.maze.offset;
        stroke(this.maze.fill_color);
        fill(this.maze.fill_color);
        circle(x, y, (this.maze.unit_area-this.maze.wall_thickness) * .75);
    }
    
    move_bot() {
        // erase old bot position
        // draw a trail
        // draw the new bot position
        
    }
    
    
    place_bot(row, col) { // Places the bot on the board in starting location
        // Check if position is valid in maze
        if (row < 0 || row >= this.maze.row_count || col < 0 || col >= this.maze.col_count){
            //invalid starting location
            return -1;
        }
        // Draw the bot on the canvas
        this.draw_bot();
    }
}