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

  let player = state.player;
  let center = player.pos.plus(player.size.times(0.5)).times(scale);

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
