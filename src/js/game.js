"use strict";

(function snake() {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlaySub = document.getElementById("overlaySub");

  const GRID = 19;
  const CELL = canvas.width / GRID;

  let snakeBody, dir, nextDir, food, score, best, running, loopId, speed;

  best = Number(localStorage.getItem("cobrinha_best") || 0);
  bestEl.textContent = best;

  function reset() {
    snakeBody = [
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = 130;
    scoreEl.textContent = "0";
    placeFood();
  }

  function placeFood() {
    while (true) {
      const f = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
      if (!snakeBody.some((s) => s.x === f.x && s.y === f.y)) {
        food = f;
        return;
      }
    }
  }

  function draw() {
    ctx.fillStyle = "#03060a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(53,208,111,0.06)";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }

    ctx.fillStyle = "#ffcf6b";
    ctx.shadowColor = "rgba(255,207,107,0.7)";
    ctx.shadowBlur = 12;
    ctx.fillRect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8);
    ctx.shadowBlur = 0;

    snakeBody.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#5fff95" : "rgba(53,208,111,0.78)";
      ctx.fillRect(seg.x * CELL + 1.5, seg.y * CELL + 1.5, CELL - 3, CELL - 3);
    });
  }

  function step() {
    dir = nextDir;
    const head = { x: snakeBody[0].x + dir.x, y: snakeBody[0].y + dir.y };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
    const hitSelf = snakeBody.some((s) => s.x === head.x && s.y === head.y);
    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snakeBody.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem("cobrinha_best", String(best));
      }
      if (speed > 65) speed -= 4;
      placeFood();
      schedule();
    } else {
      snakeBody.pop();
    }

    draw();
  }

  function schedule() {
    clearTimeout(loopId);
    loopId = setTimeout(() => {
      if (running) {
        step();
        if (running) schedule();
      }
    }, speed);
  }

  function start() {
    reset();
    running = true;
    overlay.classList.add("hidden");
    draw();
    schedule();
  }

  function gameOver() {
    running = false;
    clearTimeout(loopId);
    overlayTitle.textContent = "game over";
    overlaySub.textContent = "pontos: " + score + " · enter / toque pra jogar de novo";
    overlay.classList.remove("hidden");
  }

  function setDir(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) {
      e.preventDefault();
    }
    if (!running && (k === "enter" || k === " ")) {
      start();
      return;
    }
    if (k === "arrowup" || k === "w") setDir(0, -1);
    else if (k === "arrowdown" || k === "s") setDir(0, 1);
    else if (k === "arrowleft" || k === "a") setDir(-1, 0);
    else if (k === "arrowright" || k === "d") setDir(1, 0);
  });

  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (!running) start();
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  overlay.addEventListener("click", () => {
    if (!running) start();
  });

  reset();
  draw();
})();
