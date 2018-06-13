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

//track the state of a running game
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
//conform to the same interface
//update method: compute new state and position after a given time step ( moving in response to arrow keys)
//type property: player, coin, or lava
//create: creates an actor: coordinates of character and the character itself


//Vec class: position asn size of startActors//times method:scales a vector by a given number
//(useful to multiply a speed vector)
class Vec{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  plus(other){
    return new Vec(this.x + other.x, this.y + other.y);
  }
  times(factor){
    return new Vec(this.x * factor, this.y * factor);
  }
}

/******PLAYER CLASS *****/
//Has speed to stimulate gravity and such
class Player {
  constructor (pos, speed){
    this.pos = pos;
    this.speed = speed;
  }

  get type (){
    return "player";
  }

  //because player is 1.5 squares hight, inital position is set to be
  //half a square above the position where the @ character appeared
  static create (pos){
    return new Player (pos.plus(new Vec (0, -0.5)), new Vec (0,0));
  }
}

//size is same for all players, so it is a protoype
Player.prototype.size = new Vec (0.8, 1.5);

/***** LAVA CLASS *****/
//dynamic lava moves along at its current speed until it hits an obstacle
//can either drip (start at beginning) or bounce (invert and bounce to other direction)

class Lava{
  constructor (pos, speed, reset){
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get type(){ return "lava"; }

  static create (pos, ch){
    if (ch == "="){
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v"){
      return new Lava(pos, new Vec (0,3), pos);
    }
  }
}

Lava.prototype.size = new Vec(1, 1);
