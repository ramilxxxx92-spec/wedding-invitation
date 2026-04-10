const spinBtn = document.getElementById("spinBtn");
const scheduleBtn = document.getElementById("scheduleBtn");
const backBtn = document.getElementById("backBtn");

const resultBlock = document.getElementById("resultBlock");
const slotScreen = document.getElementById("slotScreen");
const scheduleScreen = document.getElementById("scheduleScreen");

spinBtn.addEventListener("click", () => {
  resultBlock.classList.remove("hidden");
});

scheduleBtn.addEventListener("click", () => {
  slotScreen.classList.remove("active");
  scheduleScreen.classList.add("active");
});

backBtn.addEventListener("click", () => {
  scheduleScreen.classList.remove("active");
  slotScreen.classList.add("active");
});
