"use strict";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

/* Scroll reveal */
(function scrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => observer.observe(el));
})();

/* Hero terminal typing animation (loops) */
(function heroTerminal() {
  const screen = document.getElementById("termScreen");
  if (!screen) return;

  const promptHtml = '<span class="t-prompt">nelson:~$</span> ';
  const isEN = (document.documentElement.lang || "pt").toLowerCase().indexOf("en") === 0;
  const scripts = {
    pt: [
      { cmd: "whoami", out: ["nelson lowenhaupt junior"] },
      { cmd: "ls ~/vida", out: ["familia/  trabalho/  estudos/  hobbies/"] },
      { cmd: "cat prioridades.txt", out: ["gente antes de máquina, sempre"] },
      { cmd: "uname -a", out: ["linux rodando em tudo que aceitar um boot"] },
      { cmd: "uptime", out: ["curiosidade no ar há anos, sem reboot"] },
    ],
    en: [
      { cmd: "whoami", out: ["nelson lowenhaupt junior"] },
      { cmd: "ls ~/life", out: ["family/  work/  studies/  hobbies/"] },
      { cmd: "cat priorities.txt", out: ["people before machines, always"] },
      { cmd: "uname -a", out: ["linux running on anything that boots"] },
      { cmd: "uptime", out: ["curiosity online for years, no reboot"] },
    ],
  };
  const script = isEN ? scripts.en : scripts.pt;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (reducedMotion) {
    let html = "";
    script.forEach((step) => {
      html += promptHtml + '<span class="t-cmd">' + esc(step.cmd) + "</span>\n";
      step.out.forEach((o) => (html += '<span class="t-out">' + esc(o) + "</span>\n"));
      html += "\n";
    });
    screen.innerHTML = html.trimEnd();
    return;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let buffer = "";

  function render(activeTyping) {
    screen.innerHTML = buffer + (activeTyping || "") + '<span class="caret"></span>';
    screen.scrollTop = screen.scrollHeight;
  }

  async function typeCmd(cmd) {
    let typed = "";
    for (const ch of cmd) {
      typed += ch;
      render(promptHtml + '<span class="t-cmd">' + esc(typed) + "</span>");
      await sleep(45 + Math.random() * 55);
    }
    buffer += promptHtml + '<span class="t-cmd">' + esc(cmd) + "</span>\n";
  }

  async function printOut(lines) {
    for (const line of lines) {
      buffer += '<span class="t-out">' + esc(line) + "</span>\n";
      render();
      await sleep(260);
    }
  }

  async function loop() {
    while (true) {
      buffer = "";
      render();
      await sleep(600);
      for (const step of script) {
        await typeCmd(step.cmd);
        await sleep(220);
        await printOut(step.out);
        buffer += "\n";
        render();
        await sleep(650);
      }
      await sleep(4200);
    }
  }

  loop();
})();

/* Konami code -> beep, then the secret game */
(function konami() {
  const seq = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
  ];
  let idx = 0;

  function beepThenGo() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.value = freq;
          const t = ctx.currentTime + i * 0.12;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.13);
        });
      }
    } catch (e) {
      /* sem som, sem problema */
    }
    setTimeout(() => { window.location.href = "jogo.html"; }, 650);
  }

  window.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === seq[idx]) {
      idx++;
      if (idx === seq.length) { idx = 0; beepThenGo(); }
    } else {
      idx = key === seq[0] ? 1 : 0;
    }
  });
})();
