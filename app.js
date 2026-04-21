const spinBtn = document.getElementById("spinBtn");
const detailsBtn = document.getElementById("detailsBtn");
const backBtn = document.getElementById("backBtn");
const mapBtn = document.getElementById("mapBtn");

const rsvpForm = document.getElementById("rsvpForm");
const rsvpSuccess = document.getElementById("rsvpSuccess");
const guestNameInput = document.getElementById("guestName");

const countdownMain = document.getElementById("countdownMain");
const countdownDetails = document.getElementById("countdownDetails");

const reel1 = document.getElementById("reel1");
const reel2 = document.getElementById("reel2");
const reel3 = document.getElementById("reel3");

const resultBlock = document.getElementById("resultBlock");
const slotScreen = document.getElementById("slotScreen");
const detailsScreen = document.getElementById("detailsScreen");

const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");

const RSVP_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbz0a4DJrh5YpwsNXrD_Cl5QtQaixOCWAP_qqNNCaJeQP9p2ASN8mddh3weetIUM6vZT/exec";

const WEDDING_DATE = new Date("2026-08-29T17:00:00");

const steps = [
  ["💍", "💍", "💍"],
  ["❤️", "💍", "❤️"],
  ["🕊", "💍", "🕊"],
  ["❤️", "❤️", "❤️"]
];

const allSymbols = ["💍", "❤️", "🕊", "✨", "🥂"];

let isSpinning = false;
let clickLoop = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();
  initReels();
});

function updateCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;

  let text = "";

  if (diff <= 0) {
    text = "Сегодня наш день 💍";
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    text = `До свадьбы осталось ${days} дн. ${hours} ч. ${minutes} мин.`;
  }

  if (countdownMain) countdownMain.textContent = text;
  if (countdownDetails) countdownDetails.textContent = text;
}

updateCountdown();
setInterval(updateCountdown, 60000);

function getItemHeight() {
  const frame = document.querySelector(".reel-frame");
  return frame ? frame.clientHeight : 136;
}

function setReelSingle(reel, symbol) {
  const itemHeight = getItemHeight();
  reel.innerHTML = `<div class="symbol" style="height:${itemHeight}px">${symbol}</div>`;
  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
}

function initReels() {
  setReelSingle(reel1, "💍");
  setReelSingle(reel2, "💍");
  setReelSingle(reel3, "💍");
}
initReels();

function vibrate(pattern = [40]) {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      if (Array.isArray(pattern) && pattern.length >= 3) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
      }
      return;
    } catch (e) {}
  }

  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.03) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!window.__audioCtx) {
    window.__audioCtx = new AudioContextClass();
  }

  const audioCtx = window.__audioCtx;

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration / 1000
  );

  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playStartSound() {
  playTone(220, 100, "triangle", 0.04);
  setTimeout(() => playTone(260, 120, "triangle", 0.03), 90);
}

function playWinSound() {
  playTone(520, 160, "sine", 0.05);
  setTimeout(() => playTone(660, 180, "sine", 0.045), 120);
  setTimeout(() => playTone(880, 220, "sine", 0.04), 240);
}

function playClickSound() {
  playTone(1400, 28, "square", 0.015);
}

function startClickLoop() {
  stopClickLoop();
  clickLoop = setInterval(() => {
    playClickSound();
  }, 90);
}

function stopClickLoop() {
  if (clickLoop) {
    clearInterval(clickLoop);
    clickLoop = null;
  }
}

function createReelItems(finalSymbol, count = 16) {
  const items = [];
  for (let i = 0; i < count - 1; i++) {
    items.push(allSymbols[Math.floor(Math.random() * allSymbols.length)]);
  }
  items.push(finalSymbol);
  return items;
}

function buildReel(reel, finalSymbol) {
  const itemHeight = getItemHeight();
  const items = createReelItems(finalSymbol);

  reel.innerHTML = items
    .map(symbol => `<div class="symbol" style="height:${itemHeight}px">${symbol}</div>`)
    .join("");

  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  reel.offsetHeight;

  return (items.length - 1) * itemHeight;
}

function spinTo(reel, symbol, duration, delay = 0) {
  const offset = buildReel(reel, symbol);

  setTimeout(() => {
    reel.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    reel.style.transform = `translateY(-${offset}px)`;
  }, delay);

  return delay + duration;
}

function animateStep(stepSymbols, baseDelay = 0) {
  const t1 = spinTo(reel1, stepSymbols[0], 430, baseDelay);
  const t2 = spinTo(reel2, stepSymbols[1], 560, baseDelay + 70);
  const t3 = spinTo(reel3, stepSymbols[2], 700, baseDelay + 140);
  return Math.max(t1, t2, t3);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function switchScreen(showDetails) {
  slotScreen.classList.toggle("active", !showDetails);
  detailsScreen.classList.toggle("active", showDetails);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function launchConfetti(duration = 1800) {
  const particles = [];
  const colors = ["#ffffff", "#f4d6cf", "#e8b06d", "#e76a4d", "#6f7f32", "#f7f2ea"];

  for (let i = 0; i < 180; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.2,
      r: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 8 + 2,
      vy: Math.random() * 2 + 1,
      alpha: 1,
      rotate: Math.random() * 0.2
    });
  }

  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed + p.vy;
      p.speed *= 0.985;
      p.alpha *= 0.986;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate * elapsed * 0.02);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.8);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
}

async function startSpin() {
  if (isSpinning) return;
  isSpinning = true;

  spinBtn.disabled = true;
  resultBlock.classList.add("hidden");

  vibrate([40, 40, 70]);
  playStartSound();
  startClickLoop();

  try {
    for (const step of steps) {
      const endTime = animateStep(step);
      await delay(endTime + 80);
      playClickSound();
    }
  } finally {
    stopClickLoop();
  }

  vibrate([90, 40, 120]);
  playWinSound();
  launchConfetti();

  await delay(180);
  resultBlock.classList.remove("hidden");

  spinBtn.disabled = false;
  isSpinning = false;
}

spinBtn.addEventListener("click", startSpin);

detailsBtn.addEventListener("click", () => {
  switchScreen(true);
});

backBtn.addEventListener("click", () => {
  switchScreen(false);
});

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Hill&Valley, Samananca Orhei MD, MD-3550, Teleșeu, Moldova");

mapBtn.addEventListener("click", () => {
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
    window.Telegram.WebApp.openLink(mapUrl);
  } else {
    window.open(mapUrl, "_blank");
  }
});

if (
  guestNameInput &&
  window.Telegram &&
  window.Telegram.WebApp &&
  window.Telegram.WebApp.initDataUnsafe &&
  window.Telegram.WebApp.initDataUnsafe.user
) {
  const user = window.Telegram.WebApp.initDataUnsafe.user;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  if (fullName) {
    guestNameInput.value = fullName;
  }
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправляем...";

    const formData = new FormData(rsvpForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      rsvpForm.classList.add("hidden");
      rsvpSuccess.classList.remove("hidden");
    } catch (err) {
      alert("Не удалось отправить ответ. Попробуйте ещё раз.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить ответ";
    }
  });
}
