class Node {
  constructor(id, status) {
    this.id = id;
    this.status = status;
  }
}

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
    this.algorithm = null;
    this.algorithmOngoing = false;
    this.speed = 20;
    this.algorithmUpdate = false;
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

Grid.prototype.init = function() {
  this.createGrid();
  start = document.querySelector(".start");
  target = document.querySelector(".target");
  this.addEventListeners();
}

Grid.prototype.createGrid = function() {
  let grid = this;
  let gridHtml = "";

  for (let r = 0; r < grid.height; r++) {
    let rowHtml = `<tr id="row ${r}">`;
    let rowArray = [];

    for (let c = 0; c < grid.width; c++) {
      let newNode, newNodeId = `${r}-${c}`,
        newNodeClass;

      if (r === Math.floor(grid.height / 2) && c === Math.floor(grid.width / 4)) {
        newNodeClass = "start";
      } else if (r === Math.floor(grid.height / 2) && c === Math.floor(3 * grid.width / 4)) {
        newNodeClass = "target";
      } else {
        newNodeClass = "unvisited";
      }

      newNode = new Node(newNodeId, newNodeClass);
      rowArray.push(newNode);
      rowHtml += `<td id="${newNodeId}" class="${newNodeClass}" ></td>`;
    }

    this.gridArray.push(rowArray);
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


              if(e.target.classList.contains("wall")) {
                e.target.classList.remove("wall");
              } else {
                e.target.classList = ["wall"];
              }
              // e.target.classList.toggle("wall");
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

            if (grid.algorithmUpdate) {
              instantBfs();
            }
          } else if (grid.targetDrag && e.target !== start) {

            e.target.classList.add("target");
            target = e.target;

            if (e.target.classList.contains("wall")) {
              e.target.classList.remove("wall");
              grid.wallRestoreTarget = true;
              grid.wallIdTarget = e.target;
            }

            if (grid.algorithmUpdate) {
              instantBfs();
            }
          } else if (grid.pressDown && e.target !== start && e.target !== target) {
            // e.target.classList.toggle("wall");
            if(e.target.classList.contains("wall")) {
              e.target.classList.remove("wall");
            } else {
              e.target.classList = ["wall"];
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
              grid.wallIdStart.classList.add("wall");
              grid.wallRestoreStart = false;
            }
          } else if (grid.targetDrag && e.target !== start) {
            e.target.classList.remove("target");
            if (grid.wallRestoreTarget) {
              grid.wallIdTarget.classList.add("wall");
              grid.wallRestoreTarget = false;
            }
          }
        }
      });

    }
  }

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

  document.querySelector("#clearPath").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.clearPath();
      grid.algorithmUpdate = false;
    }
  });

  document.querySelector("#bfs").addEventListener("click", function() {
    if (!grid.algorithmOngoing) {
      grid.algorithm = "bfs";
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
}

Grid.prototype.clearBoard = function() {
  grid.init();
};

Grid.prototype.clearWalls = function() {
  let grid = this;
  for (let row = 0; row < grid.height; row++) {
    for (let col = 0; col < grid.width; col++) {
      let curId = `${row}-${col}`;
      let curElement = document.getElementById(curId);
      curElement.classList.remove("wall");
    }
  }
  grid.wallRestoreStart = false;
  grid.wallRestoreTarget = false;
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
        curElement.classList = ["wall"];
      } else if (curElement.classList.contains("visited")) {
        curElement.classList = ["unvisited"];
      }
    }
  }
};

// Algorithms

let parent = {};
let toAnimate = [];
let path = [];
let startId, targetID, startNode, targetNode;

function animateSearch(index, speed) {
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
    animateSearch(index + 1, speed);
  }, speed);
}

function findPath() {

  while (path[path.length - 1] != startId) {
    path.push(parent[path[path.length - 1]]);
  }

  animatePath(path.length - 1, 40);
}

function animatePath(index, speed) {
  setTimeout(function() {
    if (index < 0) {
      grid.algorithmOngoing = false;
      grid.algorithmUpdate = true;
      return;
    }
    document.getElementById(path[index]).classList.add("path");
    animatePath(index - 1, speed);
  }, speed);
}

function instantFindPath() {

  while (path[path.length - 1] != startId) {
    path.push(parent[path[path.length - 1]]);
  }

  for (let i = path.length - 1; i >= 0; i--) {
    document.getElementById(path[i]).classList.add("instantPath");
  }
}

// BFS

function bfs(speed = grid.speed) {

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

    x = Number(x);
    y = Number(y);

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

      if (curNode === targetNode) {
        break;
      }

      q.enqueue(curNode);

      curElement.classList.remove("unvisited");
      curElement.classList.add("visited");

    }
  }

  animateSearch(0, speed);
}

// Instant BFS

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

let height = Math.floor((innerHeight - document.body.clientHeight) / 24);
let width = Math.floor(innerWidth / 26);

let grid = new Grid(height, width);
let start = null;
let target = null;
let q = new Queue();

grid.init();
