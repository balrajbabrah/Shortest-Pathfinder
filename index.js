// class Node {
//   constructor(id, status) {
//     this.id = id;
//     this.status = status;
//     this.weight = 0;
//   }
// }

class Grid {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.gridArray = [];
    this.startDrag = false;
    this.targetDrag = false;
    this.pressDown = false;
    this.wallRestoreStart = false;
    this.wallIdStart = null;
    this.wallRestoreTarget = false;
    this.wallIdTarget = null;
    this.weightRestoreStart = false;
    this.weightIdStart = null;
    this.weightRestoreTarget = false;
    this.weightIdTarget = null;
    // this.weight10RestoreStart = false;
    // this.weight10IdStart = null;
    // this.weight10RestoreTarget = false;
    // this.weight10IdTaregt = null;
    // this.weight20RestoreStart = false;
    // this.weight20IdStart = null;
    // this.weight20RestoreTarget = false;
    // this.weight20IdTaregt = null;
    // this.weight30RestoreStart = false;
    // this.weight30IdStart = null;
    // this.weight30RestoreTarget = false;
    // this.weight30IdTaregt = null;
    this.algorithm = null;
    this.algorithmOngoing = false;
    this.speed = 10;
    this.algorithmUpdate = false;
    this.obstructionType = null;//
  }
}

class Queue extends Array {
  enqueue(val) {
    this.push(val);
  }

  dequeue() {
    if (this.length > 0) {
      this.shift();
    }
  }

  front() {
    if (this.length > 0) {
      return this[0];
    }
  }

  empty() {
    return this.length === 0;
  }
}

// class Node {
//   constructor(value, priority) {
//     this.value = value;
//     this.priority = priority;
//   }
// }

class PriorityQueue extends Array {
  // constructor() {
  //   values = [];
  // }

  swap(index1, index2) {
    let temp = this[index1];
    this[index1] = this[index2];
    this[index2] = temp;
  }

  bubbleUp() {
    let index = this.length - 1;

    while(index > 0) {
      let parent = Math.floor((index - 1) / 2);

      if(this[parent][1] > this[index][1]) {
        this.swap(parent, index);
        index = parent;
      } else {
        break;
      }
    }
  }

  bubbleDown() {
    let parent = 0;
    let len = this.length;
    let curPriority = this[parent][1];

    while(true) {
      let leftChild = parent * 2 + 1;
      let rightChild = parent * 2 + 2;
      let leftChildPriority, rightChildPriority;
      let indexToSwap = null;

      if(leftChild < len) {
        leftChildPriority = this[leftChild][1];
        if(leftChildPriority < curPriority) {
          indexToSwap = leftChild;
        }
      }

      if(rightChild < len) {
        rightChildPriority = this[rightChild][1];
        if((indexToSwap === null && rightChildPriority < curPriority) || (indexToSwap !== null && rightChildPriority < leftChildPriority)) {
          indexToSwap = rightChild;
        }
      }

      if(indexToSwap === null) {
        break;
      }

      this.swap(parent, indexToSwap);
      parent = indexToSwap;
    }
  }

  enqueue(val) {
    this.push(val);
    this.bubbleUp();
  }

  dequeue() {
    if(this.length > 0) {
      this.swap(0, this.length - 1);
      this.pop();
      if(this.length > 0) {
        this.bubbleDown();
      }
    }
  }

  top() {
    if(this.length > 0) {
      return this[0];
    }
  }

  empty() {
    return this.length === 0;
  }
}

Grid.prototype.init = function() {
  this.createGrid();

  start = document.querySelector(".start");
  target = document.querySelector(".target");
  document.querySelector("#wallSetter").style.display = "";
  document.querySelector("#weightSetter").style.display = "none";
  this.obstructionType = "wall";

  this.addEventListeners();
}

Grid.prototype.createGrid = function() {
  let grid = this;
  let gridHtml = "";

  for (let r = 0; r < grid.height; r++) {
    let rowHtml = `<tr id="row ${r}">`;
    // let rowArray = [];

    for (let c = 0; c < grid.width; c++) {
      let newNode, newNodeId = `${r}-${c}`, newNodeClass;

      if (r === Math.floor(grid.height / 2) && c === Math.floor(grid.width / 4)) {
        newNodeClass = "start";
      } else if (r === Math.floor(grid.height / 2) && c === Math.floor(3 * grid.width / 4)) {
        newNodeClass = "target";
      } else {
        newNodeClass = "unvisited";
      }

      // newNode = new Node(newNodeId, newNodeClass);
      // rowArray.push(newNode);
      rowHtml += `<td id="${newNodeId}" class="${newNodeClass}" ></td>`;
    }

    // this.gridArray.push(rowArray);
    gridHtml += `${rowHtml}</tr>`;
  }

  document.getElementById("grid").innerHTML = gridHtml;
}

Grid.prototype.addEventListeners = function() {
  let grid = this;

  for (let r = 0; r < grid.height; r++) {
    for (let c = 0; c < grid.width; c++) {
      let curId = `${r}-${c}`;
      let curElement = document.getElementById(curId);

      curElement.addEventListener("mousedown", function(e) {
        e.preventDefault();
        if (!grid.algorithmOngoing) {
          if (!grid.targetDrag && !grid.startDrag && e.target.classList.contains("start")) {
            grid.startDrag = true;
            e.target.classList.add("unvisited");
          } else if (!grid.startDrag && !grid.targetDrag && e.target.classList.contains("target")) {
            grid.targetDrag = true;
            e.target.classList.add("unvisited");
          } else if (!grid.startDrag && !grid.targetDrag && e.target !== start && e.target !== target) {
            if (!grid.pressDown) {
              grid.pressDown = true;

              if(grid.obstructionType === "wall") {
                if(e.target.classList.contains("wall")) {
                  e.target.classList = ["unvisited"];
                } else {
                  e.target.classList = ["wall"];
                }
              }
              else if(grid.obstructionType === "weight") {
                if(e.target.classList.contains("weight")) {
                  e.target.classList = ["unvisited"];
                }
                else {
                  e.target.classList = ["weight"];
                }
              }

              // else if(grid.obstructionType === "weight10") {
              //   if(e.target.classList.contains("weight10")) {
              //     e.target.classList = ["unvisited"];
              //   }
              //   else {
              //     e.target.classList = ["weight10"];
              //   }
              // }
              // else if(grid.obstructionType === "weight20") {
              //   if(e.target.classList.contains("weight20")) {
              //     e.target.classList = ["unvisited"];
              //   }
              //   else {
              //     e.target.classList = ["weight20"];
              //   }
              // }
              // else if(grid.obstructionType === "weight30") {
              //   if(e.target.classList.contains("weight30")) {
              //     e.target.classList = ["unvisited"];
              //   }
              //   else {
              //     e.target.classList = ["weight30"];
              //   }
              // }

            }
          }
        }
      });

      curElement.addEventListener("mouseup", function(e) {
        e.preventDefault();
        if (!grid.algorithmOngoing) {
          if (grid.startDrag && e.target !== target) {
            grid.startDrag = false;
            e.target.classList.remove("unvisited");
            e.target.classList.add("start");
            start = e.target;
          } else if (grid.targetDrag && e.target !== start) {
            grid.targetDrag = false;
            e.target.classList.remove("unvisited");
            e.target.classList.add("target");
            target = e.target;
          } else if (grid.pressDown) {
            grid.pressDown = false;
          }
        }
      });

      curElement.addEventListener("mouseenter", function(e) {
        e.preventDefault();
        if (!grid.algorithmOngoing) {
          if (grid.startDrag && e.target !== target) {

            e.target.classList.add("start");
            start = e.target;

            if (e.target.classList.contains("wall")) {
              e.target.classList.remove("wall");
              grid.wallRestoreStart = true;
              grid.wallIdStart = e.target;
            }
            else if(e.target.classList.contains("weight")) {
              e.target.classList.remove("weight");
              grid.weightRestoreStart = true;
              grid.weightIdStart = e.target;
            }

            // else if(e.target.classList.contains("weight10")) {
            //   e.target.classList.remove("weight10");
            //   grid.weight10RestoreStart = true;
            //   grid.weight10IdStart = e.target;
            // }
            // else if(e.target.classList.contains("weight20")) {
            //   e.target.classList.remove("weight20");
            //   grid.weight20RestoreStart = true;
            //   grid.weight20IdStart = e.target;
            // }
            // else if(e.target.classList.contains("weight30")) {
            //   e.target.classList.remove("weight30");
            //   grid.weight30RestoreStart = true;
            //   grid.weight30IdStart = e.target;
            // }

            if (grid.algorithmUpdate) {
              if(grid.algorithm === "bfs") {
                instantBfs();
              } else if(grid.algorithm === "djk") {
                instantDjk();
              }
            }
          } else if (grid.targetDrag && e.target !== start) {

            e.target.classList.add("target");
            target = e.target;

            if (e.target.classList.contains("wall")) {
              e.target.classList.remove("wall");
              grid.wallRestoreTarget = true;
              grid.wallIdTarget = e.target;
            }
            else if(e.target.classList.contains("weight")) {
              e.target.classList.remove("weight");
              grid.weightRestoreTarget = true;
              grid.weightIdTarget = e.target;
            }
            // else if(e.target.classList.contains("weight10")) {
            //   e.target.classList.remove("weight10");
            //   grid.weight10RestoreTarget = true;
            //   grid.weight10IdTaregt = e.target;
            // }
            // else if(e.target.classList.contains("weight20")) {
            //   e.target.classList.remove("weight20");
            //   grid.weight20RestoreTarget = true;
            //   grid.weight20IdTaregt = e.target;
            // }
            // else if(e.target.classList.contains("weight30")) {
            //   e.target.classList.remove("weight30");
            //   grid.weight30RestoreTarget = true;
            //   grid.weight30IdTaregt = e.target;
            // }

            if (grid.algorithmUpdate) {
              if(grid.algorithm === "bfs") {
                instantBfs();
              } else if(grid.algorithm === "djk") {
                instantDjk();
              }
            }
          } else if (grid.pressDown && e.target !== start && e.target !== target) {
            if(grid.obstructionType === "wall") {
              if(e.target.classList.contains("wall")) {
                e.target.classList = ["unvisited"];
              } else {
                e.target.classList = ["wall"];
              }
            }
            else if(grid.obstructionType === "weight") {
              if(e.target.classList.contains("weight")) {
                e.target.classList = ["unvisited"];
              }
              else {
                e.target.classList = ["weight"];
              }
            }
          }

        }
      });

      curElement.addEventListener("mouseleave", function(e) {
        e.preventDefault();
        if (!grid.algorithmOngoing) {
          if (grid.startDrag && e.target !== target) {
            e.target.classList.remove("start");
            if (grid.wallRestoreStart) {
              grid.wallIdStart.classList = ["wall"];
              grid.wallRestoreStart = false;
            }
            else if(grid.weightRestoreStart) {
              grid.weightIdStart.classList = ["weight"];
              grid.weightRestoreStart = false;
            }
            else {
              e.target.classList = ["unvisited"];
            }
          } else if (grid.targetDrag && e.target !== start) {
            e.target.classList.remove("target");
            if (grid.wallRestoreTarget) {
              grid.wallIdTarget.classList = ["wall"];
              grid.wallRestoreTarget = false;
            }
            else if(grid.weightRestoreTarget) {
              grid.weightIdTarget.classList = ["weight"];
              grid.weightRestoreTarget = false;
            }
            else {
              e.target.classList = ["unvisited"];
            }
          }
        }
      });

    }
  }

  document.querySelector("#switchToWall").addEventListener("click", function() {
    if(!grid.algorithmOngoing) {
      switchObstruction("wall");
    }
  });

  document.querySelector("#switchToWeight").addEventListener("click", function() {
    if(!grid.algorithmOngoing && grid.algorithm !== "bfs") {
      switchObstruction("weight");
    }
  });

  document.querySelector("#clearBoard").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.clearBoard();
      grid.algorithmUpdate = false;
    }
  });

  document.querySelector("#clearWalls").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.clearWalls();
      // grid.algorithmUpdate = false;
    }
  });

  document.querySelector("#clearWeights").addEventListener("click", function() {
    if(!grid.algorithmOngoing) {
      grid.clearWeights();
    }
  });

  document.querySelector("#clearPath").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.clearPath();
      grid.algorithmUpdate = false;
    }
  });

  //  Algorithms
  document.querySelector("#bfs").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.algorithm = "bfs";
      grid.clearWeights();
      switchObstruction("wall");
    }
  });

  document.querySelector("#djk").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.algorithm = "djk";
    }
  });

  document.querySelector("#astar").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.algorithm = "astar";
    }
  });

  //  Mazes
  document.querySelector("#recursiveDivision").addEventListener("click", function() {
    if(!grid.algorithmOngoing) {
      grid.algorithmOngoing = true;
      recursiveDivision();
    }
  });

  document.querySelector("#randomMaze").addEventListener("click", function() {
    if(!grid.algorithmOngoing) {
      grid.algorithmOngoing = true;
      randomMaze();
    }
  });

  document.querySelector("#randomWeightMaze").addEventListener("click", function() {
    if(!grid.algorithmOngoing && grid.algorithm !== "bfs") {
      grid.algorithmOngoing = true;
      randomWeightMaze();
    }
  });

  //  Start Button
  document.querySelector("#startAlgo").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      if (grid.algorithm != null) {
        grid.clearPath();
        grid.algorithmOngoing = true;
      }
      if (grid.algorithm === "bfs") {
        bfs();
      } else if (grid.algorithm === "djk") {
        djk();
      } else if (grid.algorithm === "astar") {
        astar();
      }
    }
  });

  //  Animation speed
  document.querySelector("#animationSpeed").addEventListener("change", function() {
    grid.speed = 100 - parseFloat(animationSpeed.value);
  });
}

Grid.prototype.clearBoard = function() {
  grid.init();
}

Grid.prototype.clearWalls = function() {
  let grid = this;
  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      let curId = `${row}-${col}`;
      let curElement = document.getElementById(curId);
      if(curElement.classList.contains("wall")) {
        curElement.classList = ["unvisited"];
      }
    }
  }
  grid.wallRestoreStart = false;
  grid.wallRestoreTarget = false;
}

Grid.prototype.clearWeights = function() {
  let grid = this;
  for(let row = 0; row < grid.height; row++) {
    for(let col = 0; col < grid.width; col++) {
      let curId = `${row}-${col}`;
      let curElement = document.getElementById(curId);
      if(curElement.classList.contains("weight")) {
        curElement.classList = ["unvisited"];
      }
    }
  }
  grid.weightRestoreStart = false;
  grid.weightRestoreTarget = false;
};

Grid.prototype.clearPath = function() {
  let grid = this;

  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      let curId = `${row}-${col}`;
      let curElement = document.getElementById(curId);

      if(curElement === start) {
        curElement.classList = ["start"];
      } else if(curElement === target) {
        curElement.classList = ["target"];
      } else if(curElement.classList.contains("wall")) {
        curElement.classList.remove("visited");
        curElement.classList.remove("search");
        curElement.classList.remove("instantSearch");
        curElement.classList.remove("path");
        curElement.classList.remove("instantPath");
      } else if(curElement.classList.contains("weight")) {
        curElement.classList.remove("visited");
        curElement.classList.remove("search");
        curElement.classList.remove("instantSearch");
        curElement.classList.remove("path");
        curElement.classList.remove("instantPath");
      } else if (curElement.classList.contains("visited")) {
        curElement.classList = ["unvisited"];
      }
    }
  }
}

Grid.prototype.getNode = function(x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  let curId = `${x}-${y}`;
  return document.getElementById(curId);
}

// Algorithms

let parent = {};
let toAnimate = [];
let path = [];
let dis = [];
let startId, targetID, startNode, targetNode;

function animateSearch(index) {
  setTimeout(function() {
    if (index === toAnimate.length) {
      grid.algorithmOngoing = false;
      grid.algorithmUpdate = true;
      return;
    } else if (toAnimate[index] === target) {
      toAnimate[index].classList.add("search");
      findPath();
      return;
    }
    toAnimate[index].classList.add("search");
    animateSearch(index + 1);
  }, grid.speed);
}

function findPath() {

  while (path[path.length - 1] != start.id) {
    path.push(parent[path[path.length - 1]]);
  }

  animatePath(path.length - 1);
}

function animatePath(index) {
  setTimeout(function() {
    if (index < 0) {
      grid.algorithmOngoing = false;
      grid.algorithmUpdate = true;
      return;
    }
    document.getElementById(path[index]).classList.add("path");
    animatePath(index - 1);
  }, grid.speed);
}

function instantFindPath() {

  while (path[path.length - 1] != start.id) {
    path.push(parent[path[path.length - 1]]);
  }

  for (let i = path.length - 1; i >= 0; i--) {
    document.getElementById(path[i]).classList.add("instantPath");
  }
}

function instantSearch(index) {
  while(index < toAnimate.length) {
    toAnimate[index].classList.add("instantSearch");
    if(toAnimate[index] === target) {
      break;
    }

    index++;
  }

  if(index !== toAnimate.length) {
    instantFindPath();
  }
}

// BFS

function bfs() {

  q.splice(0, q.length);
  startId = start.id;
  targetId = target.id;
  startNode = startId.split("-");
  targetNode = targetId.split("-");

  q.enqueue(startNode);

  const dir = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];

  parent = {};
  toAnimate = [];
  path = [];

  while (!q.empty()) {

    let [x, y] = q.front();
    let parId = `${x}-${y}`;
    let parElement = document.getElementById(parId);

    x = parseInt(x);
    y = parseInt(y);

    toAnimate.push(parElement);

    q.dequeue();

    if (parElement === target) {
      path.push(parId);
      break;
    }

    for (let i = 0; i < 4; i++) {

      let dx = x + dir[i][0];
      let dy = y + dir[i][1];

      if (dx < 0 || dy < 0 || dx == grid.height || dy == grid.width) {
        continue;
      }
      curId = `${dx}-${dy}`;
      curElement = document.getElementById(curId);

      if (curElement.classList.contains("wall") || curElement.classList.contains("visited")) {
        continue;
      }

      let curNode = curId.split("-");

      parent[curId] = parId;

      q.enqueue(curNode);

      if (curElement === target) {
        break;
      }

      curElement.classList.remove("unvisited");
      curElement.classList.add("visited");

    }
  }

  animateSearch(0);
}

function instantBfs() {

  grid.clearPath();

  q.splice(0, q.length);
  startId = start.id;
  targetId = target.id;
  startNode = startId.split("-");
  targetNode = targetId.split("-");

  q.enqueue(startNode);

  const dir = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];

  parent = {};
  toAnimate = [];
  path = []

  while (!q.empty()) {

    let [x, y] = q.front();
    let parId = `${x}-${y}`;
    let parElement = document.getElementById(parId);

    x = Number(x);
    y = Number(y);

    parElement.classList.add("instantSearch");

    q.dequeue();

    if (parElement === target) {
      path.push(parId);
      break;
    }

    for (let i = 0; i < 4; i++) {

      let dx = x + dir[i][0];
      let dy = y + dir[i][1];

      if (dx < 0 || dy < 0 || dx == grid.height || dy == grid.width) {
        continue;
      }
      curId = `${dx}-${dy}`;
      curElement = document.getElementById(curId);

      if (curElement.classList.contains("wall") || curElement.classList.contains("visited")) {
        continue;
      }

      let curNode = curId.split("-");

      parent[curId] = parId;

      if (curNode === targetNode) {
        break;
      }

      q.enqueue(curNode);

      curElement.classList.remove("unvisited");
      curElement.classList.add("visited");

    }
  }

  if (path.length == 1) {
    instantFindPath();
  }
}

// Djikstra

function djk() {

  pq.splice(0, pq.length);
  pq.enqueue([start.id, 0]);

  dis = [];
  parent = {};
  toAnimate = [];
  path = [];

  for(let row = 0; row < grid.height; row++) {
    let rowArray = [];
    for(let col = 0; col < grid.width; col++) {
      rowArray.push(Number.MAX_SAFE_INTEGER);
    }
    dis.push(rowArray);
  }

  let [startX, startY] = start.id.split("-");
  startX = parseInt(startX);
  startY = parseInt(startY);

  dis[startX][startY] = 0;

  const dir = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];

  while(!pq.empty()) {
    let [parId, parWeight] = pq.top();
    pq.dequeue();

    let [x, y] = parId.split("-");
    x = parseInt(x);
    y = parseInt(y);

    if(parWeight > dis[x][y]) {
      continue;
    }

    let parElement = document.getElementById(parId);
    toAnimate.push(parElement);

    for (let i = 0; i < 4; i++) {

      let dx = x + dir[i][0];
      let dy = y + dir[i][1];

      if (dx < 0 || dy < 0 || dx == grid.height || dy == grid.width) {
        continue;
      }
      curId = `${dx}-${dy}`;
      curElement = document.getElementById(curId);

      if (curElement.classList.contains("wall")) {
        continue;
      }

      let cost = 1;

      if(curElement.classList.contains("weight")) {
        cost = 10;
      }

      if(dis[dx][dy] > dis[x][y] + cost) {
        dis[dx][dy] = dis[x][y] + cost;
        parent[curId] = parId;

        pq.enqueue([curId, dis[dx][dy]]);
      }

      curElement.classList.remove("unvisited");
      curElement.classList.add("visited");

    }
  }

  path.push(target.id);
  animateSearch(0);
}

function instantDjk() {

  grid.clearPath();

  pq.splice(0, pq.length);
  pq.enqueue([start.id, 0]);

  dis = [];
  parent = {};
  toAnimate = [];
  path = [];

  for(let row = 0; row < grid.height; row++) {
    let rowArray = [];
    for(let col = 0; col < grid.width; col++) {
      rowArray.push(Number.MAX_SAFE_INTEGER);
    }
    dis.push(rowArray);
  }

  let [startX, startY] = start.id.split("-");
  startX = parseInt(startX);
  startY = parseInt(startY);

  dis[startX][startY] = 0;

  const dir = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];

  while(!pq.empty()) {
    let [parId, parWeight] = pq.top();
    pq.dequeue();

    let [x, y] = parId.split("-");
    x = parseInt(x);
    y = parseInt(y);

    if(parWeight > dis[x][y]) {
      continue;
    }

    let parElement = document.getElementById(parId);
    toAnimate.push(parElement);
    // parElement.classList.add("instantSearch");

    for (let i = 0; i < 4; i++) {

      let dx = x + dir[i][0];
      let dy = y + dir[i][1];

      if (dx < 0 || dy < 0 || dx == grid.height || dy == grid.width) {
        continue;
      }
      curId = `${dx}-${dy}`;
      curElement = document.getElementById(curId);

      if (curElement.classList.contains("wall")) {
        continue;
      }

      let cost = 1;

      if(curElement.classList.contains("weight")) {
        cost = 10;
      }

      if(dis[dx][dy] > dis[x][y] + cost) {
        dis[dx][dy] = dis[x][y] + cost;
        parent[curId] = parId;

        pq.enqueue([curId, dis[dx][dy]]);
      }

      curElement.classList.remove("unvisited");
      curElement.classList.add("visited");

    }
  }

  path.push(target.id);
  instantSearch(0);
  // instantFindPath();
  // animateSearch(0);
}

// Mazes

function animateMaze(index) {
  setTimeout(function() {
    if(index === toAnimate.length) {
      grid.algorithmOngoing = false;
      // console.log("Algortihm over");
      return;
    }
    document.getElementById(toAnimate[index]).classList = ["wall"];
    animateMaze(index + 1);
  }, grid.speed);
}

function getRandomInt(val) {
  return Math.floor(Math.random() * val);
}

function recursiveDivision() {
  grid.init();

  if(grid.width % 2) {
    border(0, Math.floor(grid.width / 2), Math.floor(grid.width / 2));
  }
  else {
    border(0, Math.floor(grid.width / 2 - 1), Math.floor(grid.width / 2));
  }

  toAnimate = [];

  function border(row, lCol, rCol) {
    if(grid.height < 5 || grid.width < 5) {
      console.log("Too small to divide");
      grid.algorithmOngoing = false;
      return;
    }
    setTimeout(function() {
      if(lCol > rCol) {
        divide(2, Math.floor(grid.height - 3), 2, Math.floor(grid.width - 3));
        animateMaze(0);
        return;
      }

      let a = grid.getNode(row, lCol);
      let b = grid.getNode(row, rCol);

      a.classList = ["wall"];
      if(b != a) {
        b.classList = ["wall"];
      }

      if(row == 0) {
        if(lCol > 0) {
          border(row, lCol - 1, rCol + 1);
        } else {
          border(row + 1, lCol, rCol);
        }
      } else if(row < grid.height - 1) {
        border(row + 1, lCol, rCol);
      } else {
        border(row, lCol + 1, rCol - 1);
      }
    }, grid.speed);
  }

  function wallType(height, width) {
    if(width > height) {
      return 1; // Vertical
    } else if(width < height) {
      return 0; // Horizontal
    } else {
      return Math.floor(Math.random() * 2);
    }
  }

  function divide(top, bottom, left, right) {
    if(top > bottom || left > right) {
      return;
    }

    let width = right - left;
    let height = bottom - top;

    let typeOfWall = wallType(height, width);

    if(typeOfWall === 0) {  // Horizontal

      let possibleWallRows = [];
      let possiblePassage = [];

      for(let row = top; row <= bottom; row += 2) {
        possibleWallRows.push(row);
      }

      for(let col = left - 1; col <= right + 1; col += 2) {
        possiblePassage.push(col);
      }

      let wallRowIndex = Math.floor(Math.random() * possibleWallRows.length);
      let wallRow = possibleWallRows[wallRowIndex];

      let passageIndex = Math.floor(Math.random() * possiblePassage.length);
      let passage = possiblePassage[passageIndex];

      for(let col = left - 1; col <= right + 1; col++) {
        let curId = `${wallRow}-${col}`;
        if(col === passage || curId === start.id || curId === target.id) {
          continue;
        }
        toAnimate.push(curId);
      }

      divide(top, wallRow - 2, left, right, wallRow, passage);
      divide(wallRow + 2, bottom, left, right, wallRow, passage);

    } else {  // Vertical

      let possibleWallCol = [];
      let possiblePassage = [];
      for(let col = left; col <= right; col += 2) {
        possibleWallCol.push(col);
      }

      for(let row = top - 1; row <= bottom + 1; row += 2) {
        possiblePassage.push(row);
      }

      let wallColIndex = Math.floor(Math.random() * possibleWallCol.length);
      let wallCol = possibleWallCol[wallColIndex];

      let passageIndex = Math.floor(Math.random() * possiblePassage.length);
      let passage = possiblePassage[passageIndex];

      for(let row = top - 1; row <= bottom + 1; row++) {
        let curId = `${row}-${wallCol}`;
        if(row === passage || curId === start.id || curId === target.id) {
          continue;
        }
        toAnimate.push(curId);
      }

      divide(top, bottom, left, wallCol - 2, passage, wallCol);
      divide(top, bottom, wallCol + 2, right, passage, wallCol);

    }
  }
}

function randomMaze() {
  // grid.init();
  start.classList = ["start"];
  target.classList = ["target"];
  grid.wallRestoreStart = false;
  grid.wallRestoreTarget = false;
  grid.weightRestoreStart = false;
  grid.weightRestoreTarget = false;
  // grid.algorithmOngoing = false;
  grid.algorithmUpdate = false;

  for(let row = 0; row < grid.height; row++) {
    for(let col = 0; col < grid.width; col++) {
      let curId = `${row}-${col}`;
      if(curId === start.id || curId === target.id) {
        continue;
      }
      if(getRandomInt(100) < 25) {
        document.getElementById(curId).classList = ["wall"];
      } else {
        document.getElementById(curId).classList = ["unvisited"];
      }
    }
  }

  grid.algorithmOngoing = false;
}

function randomWeightMaze() {

  start.classList = ["start"];
  target.classList = ["target"];
  grid.wallRestoreStart = false;
  grid.wallRestoreTarget = false;
  grid.weightRestoreStart = false;
  grid.weightRestoreTarget = false;
  // grid.algorithmOngoing = false;
  grid.algorithmUpdate = false;

  for(let row = 0; row < grid.height; row++) {
    for(let col = 0; col < grid.width; col++) {
      let curId = `${row}-${col}`;
      if(curId === start.id || curId === target.id) {
        continue;
      }
      if(getRandomInt(100) < 25) {
        document.getElementById(curId).classList = ["weight"];
      } else {
        document.getElementById(curId).classList = ["unvisited"];
      }
    }
  }

  grid.algorithmOngoing = false;
}



function switchObstruction(switchTo) {
  let wall = document.querySelector("#wallSetter");
  let weight = document.querySelector("#weightSetter");

  if(switchTo === "wall") {
    weight.style.display = "none";
    wall.style.display = "";
    grid.obstructionType = "wall";
  }
  else {
    wall.style.display = "none";
    weight.style.display = "";
    grid.obstructionType = "weight";
  }
}

//  Initialization

let height = Math.floor((innerHeight - document.body.clientHeight) / 24);
let width = Math.floor(innerWidth / 26);

let grid = new Grid(height, width);
let start = null;
let target = null;
let q = new Queue();
let pq = new PriorityQueue();

grid.init();
