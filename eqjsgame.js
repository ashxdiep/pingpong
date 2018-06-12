//periods are empty space
//hash characters are walls
//plus signs are lava
//O is a coin and = are blocks taht moves back and forth horizontally
// | vertically moving blobs
// v indicates dripping lava moving only down and when reaching bottom go back to top

// rules: Consists of multiple levels player must complete
// Level is completed when all coins have bee ncollected
// if player touches lava, current lefel is restored to starting position

let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

class Level{
  constructor(plan){
    //trim removes whitespace at the start and end of the plan string
    //this allows each plan to start with a new line
    //remaining string is split on newline characters, each line is spread into an array
    //producing arrays of characters
    let rows = plan.trim().split("\n").map(l => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    //this is for the moving elements from the background grid
    this.startActors = [];

    //to create these moving characeters, map over rows and then their content
    //positions in the game will be stored as pairs of coordinateds with top left
    //being o,o and each backgroudn square being 1 unit high and wide
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) =>{
        let type = levelChars[ch];
        if (typeof type == 'string') return type;
        this.startActors.push(
          type.create(new Vec(x, y), ch));
        return 'empty';
      });
    });
  }
}

class State {
  constructor(level, actors, status){
    this.level = level;
    this.actors = actors;
    //this will switch to lost or won when game has ended
    this.status = status;
  }

  static start(level){
    return new State(level, level.startActors, "playing");
  }

  get player(){
    return this.actors.find(a => a.type == "player");
  }
}

//Actor objects: represent current position and state of a given moving element in game 
