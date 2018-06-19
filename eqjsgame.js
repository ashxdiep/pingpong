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

/***** COIN ACTORS CLASS *****/
//Given a wobble: slight vertical back
//stores a base position as well as wobble property that tracks phase of bounce
//these determine the coin's actual position

class Coin {
  constructor(pos, basePos, wobble){
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get type(){ return "coin"; }

  static create(pos){
    let basePos = pos.plus(new Vec(0.2, 0.1));

    //Math.sin gives us a wave form, don't want coins to move up and down
    //synchronously, so multiply by a random number to give random starting
    //position of the wave
    return new Coin(basePos, basePos, Math.random()* Math.PI * 2);
  }
}

Coin.prototype.size = new Vec(0.6, 0.6);

//define levelChars objects that maps plan characters to backgroudn grid types
//or actor classes
const levelChars = {
  ".": "empty", "#": "wall", "+" : "lava",
  "@": Player, "o": Coin, "=": Lava, "|": Lava, "v": Lava
};

let simpleLevel = new Level(simpleLevelPlan);
console.log(`${simpleLevel.width} by ${simpleLevel.height}`)



//encapsulation of drawing code is done by defining display object (displays level and state)
// use a style sheet to set the actual colors and other fixed properties of the elements

//creating an element and give it some attributes and child nodes
function elt(name, attrs, ...children){
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)){
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children){
    dom.appendChild(child);
  }
  return dom;
}

//display created by giving it a parent element to which is should append
//itself and a level object
class DOMdisplay{
  constructor(parent, level){
    this.dom = elt("div", {class: "game"}, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear(){ this.dom.remove(); }
}

const scale = 20;

//background drawn as a table element
//each row of grid is turned into a table row element
//strings are used as class names for the table cell td elements
//triple dot operator is used to passs arrays of child nodes to elt as separate arguments
function drawGrid(level){
  return elt("table", {
    class: "background",
    style: `width: ${level.width * scale }px`
  }, ...level.rows.map(row =>
    let("tr", {style: `height: ${scale}px`},
    ...row.map(type => elt("td", {class: type})))
  ));
}


//drawing each actor by creating a DOM elements
//setting element's position and size based on actor's properties
//values bultipled by scale to go from game units to pixels
function drawActors(actors) {
  return elt("div", {}, ...actors.map(actor => {
    let rect = elt("div", {class: `actor ${actor.type}`});
    rect.style.width = `${actor.size.x * scale}px`;
    rect.style.height = `${actor.size.y * scale}px`;
    rect.style.left = `${actor.pos.x * scale}px`;
    rect.style.top = `${actor.pos.y * scale}px`;
    return rect;
  }));
}

//asdding current status as class name, we can style the player when the game
//is lost or won.
DOMDisplay.prototype.syncState = function(state){
  if (this.actorLayer) this.actorLayer.remove();
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  //can't always assume that level fits into the viewport
  //if level is protruding outside viewport, we scroll that viewport to make sure player is in center
  this.scrollPlayerIntoView(state);
}

//find player's position and update the wrapping element's scroll position
//manipulat scrolllLeft and scrollTop properties
DOMDisplay.prototype.scrollPlayerIntoView = function(state){
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let margin = width / 3;

  //viewport
  let left = this.dom.scrollLeft, right = left + width;
  let top = this.dom.scrollTop, bottom = top + height;

  //finding coordinates adn then translating it to pixels
  let player = state.player;
  let center = player.pos.plus(player.size.times(0.5)).times(scale);

  //now we make sure that the player position isn't outside of the allowed range
  if (center.x < left + margin){
    this.dom.scrollLeft = center.x - margin;
  } else if (center.x > right. - margin){
    this.dom.scrollLeft = center.x + margin - width;
  }

  if (center.y < top + margin){
    this.dom.scrollTop = center.y - margin;
  } else if (center.y > botton - margin){
    this.dom.scrollTop = center.y + margin - height;
  }
}



/****** COLLISION AND MOVEMENT ******/


//Method tells us whether a rectangle touches a grid element of the given type
Level.prototype.touches = function(pos, size, type){
  //computes the set of grid squares the the body overlaps
  //get the range of backgroudn squares the box touches
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  //loop over block of grid squares foudn by rounding the coordinates
  // return true if a matching square is found
  for ( var y = yStart; y < yEnd; y++){
    for (var x = xStart; x < xEnd; x++){
      let isOutisde = x < 0 || x >= this.width || y < 0  || y >= this.height;
      let here = isOutside ? "wall" : this.rows[y][x];
      if (here == type) return true;
    }
    return false;
  }
}

//This will figure out whether the player is touching lava

//method is passed a time step and data strucute that tells it which keys are being held down
State.prototype.update = function(time, keys){
  //produce array of updated actors
  let actors = this.actors.map(actor => actor.update(time, this, keys));
  let newState = new State(this.level, actors, this.status);

  //if game over, no processing has to be done
  if (newState.status != "playing") return newState;

  //see if touching lava
  let player = newState.player;
  if (this.level.touches(player.pos, player.size, "lava")){
    return new State (this.level, actors, "lost");
  }

  //overlap beetween actors : (both overlap along x-axis and y-axis)
  for (let actor of actors){
    if (actor != player && overlap(actor, player)){
      newState = actor.collide(newState);
    }
  }
  return newState;
};

//checking for overlap
function overlap(actor1, actors2){
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
         actor1.pos.x < actor2.pos.x + actor2.size.x &&
         actor1.pos.y + actor1.size.y > actor2.pos.y &&
         actor1.pos.y < actor2.pos.y + actor2.size.y;
}

//if does overlap, check collision rules
//touching lava: lost
// touching coins: vanish coins
// if last coin touched: win level
Lava.prototype.collide = function(state){
  return new State(state.level, state.actors, "lost");
};

Coin.prototype.collide = function(state){
  let filtered = state.actors.filter(a => a != this);
  let status = state.status;
  if (!filtered.some(a => a.type == "coin" )) status = "won";
  return new State(state.level, filtered, status);
};

//Actor update methods take arguments the time step, state object, and keys obj
// lava actor type ignores key objects
Lava.protoype.update = function(time, state){
  let newPos = this.pos.plus(this.speed.times(time));
  if(!state.level.touches(newPos, this.size, "wall")){
    return new Lava(newPos, this.size, "wall")){
      return new Lava (newPos, this.speed, this.reset);
    } else if (this.reset){
      return new Lava(this.reset, this.speed, this.reset);
    } else {
      return new Lava(this.pos, this.speed.times(-1));
    }
  };
}

//coins use update method to wobble: ignore collisions with grid since
//the are simply wobbling around inside of own square
const wobbleSpeed = 8, wobbleDist = 0.07;
Coin.prototype.update = function(time){
  let wobble = this.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Coin (this.basePos.plus(new Vec(0, wobblePos)), this.basePos, wobble);
}


//Player motion: hitting floor should not prevent horizontal motion
// hitting wall should not stop falling or jumping

const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

Player.prototype.update = function(time, state, keys){
  //horizontal motional based of left and right arrow keys
  // if no wall blocking, this is used otherwise old position kept
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed = playerXSpeed;
  if (keys.ArrowRight) xSpeed += playerXSpeed;
  let pos = this.pos;
  let movedX = pos.plus(new Vec(xSpeed * time, 0));
  if (!state.level.touches(movedX, this.size, "wall")){
    pos = movedX;
  }

  // vertical speed accounts gravity
  let ySpeed = this.speed.y + time * gravity;
  let movedY = pos.plus(new Vec(0, ySpeed * time));
  if (!state.level.touches(movedY, this.size, "wall")){
    pos = movedY;
    //something bottom of us
  } else if (keys.ArrowUp && ySpeed > 0){
    ySpeed = -jumpSpeed;
    // else bumped into something
  } else {
    ySpeed = 0;
  }
  return new Player(pos, new Vec(xSpeed, ySpeed));
};
