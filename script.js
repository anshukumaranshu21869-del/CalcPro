const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyLineEl = document.getElementById("historyLine");

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const keys = document.querySelectorAll(".key");
const memoryBtns = document.querySelectorAll("[data-memory]");

const themeToggle = document.getElementById("themeToggle");
const convertInput = document.getElementById("convertInput");
const convertType = document.getElementById("convertType");
const convertBtn = document.getElementById("convertBtn");
const convertResult = document.getElementById("convertResult");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

let expression = "";
let memoryValue = 0;
let history = [];

function updateDisplay(result = "0") {
  expressionEl.textContent = expression || "0";
  resultEl.textContent = result;
}

function safeCalculate(exp) {
  try {
    if (!exp) return "0";

    let cleanExp = exp
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/−/g, "-")
      .replace(/\^/g, "**");

    if (!/^[0-9+\-*/().% **]+$/.test(cleanExp)) {
      return "Error";
    }

    const answer = Function(`"use strict"; return (${cleanExp})`)();

    if (!Number.isFinite(answer)) return "Error";

    return Number(answer.toFixed(10)).toString();
  } catch {
    return "Error";
  }
}

function addToHistory(exp, ans) {
  if (!exp || ans === "Error") return;

  history.unshift(`${exp} = ${ans}`);
  history = history.slice(0, 20);

  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = "<li>No history yet</li>";
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function calculate() {
  const answer = safeCalculate(expression);
  updateDisplay(answer);
  historyLineEl.textContent = expression || "Ready";
  addToHistory(expression, answer);

  if (answer !== "Error") {
    expression = answer;
  }
}

function handleAction(action) {
  if (action === "clear") {
    expression = "";
    historyLineEl.textContent = "Ready";
    updateDisplay();
  }

  if (action === "delete") {
    expression = expression.slice(0, -1);
    updateDisplay();
  }

  if (action === "percent") {
    if (expression) {
      expression = `(${expression})/100`;
      calculate();
    }
  }

  if (action === "calculate") {
    calculate();
  }
}

function handleScientific(func) {
  const value = Number(safeCalculate(expression));

  if (!expression || Number.isNaN(value)) return;

  let answer = "Error";

  if (func === "sqrt") answer = Math.sqrt(value);
  if (func === "square") answer = value ** 2;
  if (func === "cube") answer = value ** 3;
  if (func === "sin") answer = Math.sin(value * Math.PI / 180);
  if (func === "cos") answer = Math.cos(value * Math.PI / 180);
  if (func === "tan") answer = Math.tan(value * Math.PI / 180);
  if (func === "log") answer = Math.log10(value);
  if (func === "ln") answer = Math.log(value);

  if (func === "factorial") {
    if (value < 0 || !Number.isInteger(value)) {
      answer = "Error";
    } else {
      answer = 1;
      for (let i = 2; i <= value; i++) answer *= i;
    }
  }

  if (answer === "Error" || !Number.isFinite(answer)) {
    updateDisplay("Error");
    return;
  }

  answer = Number(answer.toFixed(10)).toString();
  addToHistory(`${func}(${expression})`, answer);
  historyLineEl.textContent = `${func}(${expression})`;
  expression = answer;
  updateDisplay(answer);
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    const value = key.dataset.value;
    const action = key.dataset.action;
    const func = key.dataset.func;

    if (value) {
      expression += value;
      updateDisplay();
    }

    if (action) {
      handleAction(action);
    }

    if (func) {
      handleScientific(func);
    }
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.mode;

    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`${mode}Panel`).classList.add("active");
  });
});

memoryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.memory;
    const currentValue = Number(safeCalculate(expression)) || 0;

    if (type === "clear") memoryValue = 0;
    if (type === "recall") expression = memoryValue.toString();
    if (type === "add") memoryValue += currentValue;
    if (type === "subtract") memoryValue -= currentValue;

    updateDisplay(expression || "0");
    historyLineEl.textContent = `Memory: ${memoryValue}`;
  });
});

convertBtn.addEventListener("click", () => {
  const value = Number(convertInput.value);
  const type = convertType.value;

  if (Number.isNaN(value)) {
    convertResult.textContent = "Please enter a valid number";
    return;
  }

  const conversions = {
    cmToM: `${value / 100} m`,
    mToCm: `${value * 100} cm`,
    kgToG: `${value * 1000} g`,
    gToKg: `${value / 1000} kg`,
    kmToMile: `${(value * 0.621371).toFixed(4)} mile`,
    mileToKm: `${(value * 1.60934).toFixed(4)} km`
  };

  convertResult.textContent = conversions[type];
});

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
});

document.addEventListener("keydown", (e) => {
  const allowedKeys = "0123456789+-*/().";

  if (allowedKeys.includes(e.key)) {
    expression += e.key;
    updateDisplay();
  }

  if (e.key === "Enter") {
    e.preventDefault();
    calculate();
  }

  if (e.key === "Backspace") {
    expression = expression.slice(0, -1);
    updateDisplay();
  }

  if (e.key === "Escape") {
    expression = "";
    updateDisplay();
  }
});

updateDisplay();
renderHistory();
