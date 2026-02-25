import { MAX_GUESSES, puzzles } from "/data/puzzles.js";

const resetTodayBtn = document.querySelector("#reset-today");
const dayLabel = document.querySelector("#day-label");
const puzzleCard = document.querySelector("#puzzle-card");
const form = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const playerOptions = document.querySelector("#player-options");
const feedback = document.querySelector("#feedback");
const hintsBox = document.querySelector("#hints");
const shareOutput = document.querySelector("#share-output");
const copyShareBtn = document.querySelector("#copy-share");

const dayId = getDayId();
const puzzle = findPuzzle(dayId);
const answer = puzzle.lineup[puzzle.missingIndex];
const storageKey = `missing-man-chicago-${dayId}`;
const state = loadState(storageKey);

renderHeader();
renderLineup();
renderAutocomplete();
renderHints();
renderShare();
restoreFeedback();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (state.complete || state.guesses.length >= MAX_GUESSES) {
    return;
  }

  const guess = guessInput.value.trim();
  if (!guess) {
    return;
  }

  const isCorrect = matchesAnswer(guess, answer.player, puzzle);
  state.guesses.push({ guess, isCorrect });

  if (isCorrect) {
    state.complete = true;
    feedback.textContent = `✅ Correct — ${answer.player} was missing.`;
    feedback.style.color = "#3ddc97";
  } else if (state.guesses.length >= MAX_GUESSES) {
    state.complete = true;
    feedback.textContent = `❌ Out of guesses. Correct answer: ${answer.player}.`;
    feedback.style.color = "#ff7d7d";
  } else {
    feedback.textContent = `❌ Not quite. Guess ${state.guesses.length}/${MAX_GUESSES}. Hint unlocked.`;
    feedback.style.color = "#ffd166";
  }

  guessInput.value = "";
  persistState(storageKey, state);
  renderHints();
  renderShare();

  if (state.complete) {
    form.querySelector("button").disabled = true;
    guessInput.disabled = true;
  }
});

copyShareBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareOutput.textContent);
    feedback.textContent = "Copied. Paste into iMessage or your group text.";
  } catch {
    feedback.textContent = "Clipboard blocked. Long press the result block to copy.";
  }
});

function getDayId() {
  const pathMatch = window.location.pathname.match(/\/day\/(\d+)/);
  if (pathMatch) {
    return Number(pathMatch[1]);
  }

  const today = new Date();
  const epoch = Date.UTC(2025, 0, 1);
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(1, Math.floor((utcToday - epoch) / 86400000) + 1);
}

function findPuzzle(id) {
  const exact = puzzles.find((entry) => entry.id === id);
  if (exact) {
    return exact;
  }

  return puzzles[(id - 1) % puzzles.length];
}

function renderHeader() {
  dayLabel.textContent = `Day ${dayId} • ${puzzle.teamName}`;
}

function renderLineup() {
  const items = puzzle.lineup
    .map((slot, index) => {
      if (index === puzzle.missingIndex) {
        return `<li><strong>${slot.spot}️⃣</strong> <span class="missing">❓❓❓</span> — ${slot.pos}</li>`;
      }
      return `<li><strong>${slot.spot}️⃣</strong> ${slot.player} — ${slot.pos}</li>`;
    })
    .join("");

  puzzleCard.innerHTML = `
    <div class="lineup-meta">
      <span class="pill">${puzzle.league}</span>
      <span class="pill">${puzzle.teamCode}</span>
      <span class="pill soft">${puzzle.gameLabel}</span>
      <span class="pill soft">${Math.max(0, MAX_GUESSES - state.guesses.length)} guesses left</span>
    </div>
    <ol class="lineup">${items}</ol>
  `;
}

function renderAutocomplete() {
  const names = new Set(puzzles.flatMap((entry) => entry.lineup.map((slot) => slot.player)));
  playerOptions.innerHTML = [...names].map((name) => `<option value="${name}"></option>`).join("");
}

function renderHints() {
  const hintCount = Math.min(state.guesses.filter((guess) => !guess.isCorrect).length, 5);
  const hints = [
    `Position: ${answer.pos}`,
    `League: ${puzzle.league}`,
    `Season value: ${answer.war ?? "N/A"}`,
    `Tenure note: ${answer.tenureHint ?? "N/A"}`,
    `Age at game time: ${answer.age ?? "N/A"}`
  ];

  hintsBox.innerHTML = hints
    .map((hint, index) => `<p>${index < hintCount ? `💡 ${hint}` : "🔒 Hint locked"}</p>`)
    .join("");

  renderLineup();
}

function restoreFeedback() {
  if (!state.guesses.length) {
    return;
  }

  const solvedGuess = state.guesses.find((guess) => guess.isCorrect);
  if (solvedGuess) {
    feedback.textContent = `✅ Solved in ${state.guesses.length} guess${state.guesses.length > 1 ? "es" : ""}.`;
    feedback.style.color = "#3ddc97";
    form.querySelector("button").disabled = true;
    guessInput.disabled = true;
    return;
  }

  if (state.complete) {
    feedback.textContent = `❌ Out of guesses. Correct answer: ${answer.player}.`;
    feedback.style.color = "#ff7d7d";
    form.querySelector("button").disabled = true;
    guessInput.disabled = true;
  }
}

function matchesAnswer(guess, fullName, currentPuzzle) {
  const guessNorm = normalize(guess);
  const answerNorm = normalize(fullName);

  if (guessNorm === answerNorm) {
    return true;
  }

  const answerLast = answerNorm.split(" ").at(-1);
  if (guessNorm === answerLast && isUniqueLastName(answerLast, currentPuzzle)) {
    return true;
  }

  return levenshtein(guessNorm, answerNorm) <= 1;
}

function isUniqueLastName(lastName, currentPuzzle) {
  const hits = currentPuzzle.lineup.filter((slot) => {
    const token = normalize(slot.player).split(" ").at(-1);
    return token === lastName;
  });

  return hits.length === 1;
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function loadState(key) {
  const fallback = { guesses: [], complete: false };

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.guesses)) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

function persistState(key, nextState) {
  localStorage.setItem(key, JSON.stringify(nextState));
}

function renderShare() {
  if (!state.guesses.length) {
    return;
  }

  const blocks = state.guesses.map((guess) => (guess.isCorrect ? "🟩" : "🟥")).join("");
  const solved = state.guesses.some((guess) => guess.isCorrect);
  const score = solved ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;

  shareOutput.textContent = `Missing Man Chicago 🏆\nDay ${dayId}\n${puzzle.teamCode} • ${puzzle.league}\n${blocks}\n(${score})`;
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    grid[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    grid[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      grid[i][j] = Math.min(grid[i - 1][j] + 1, grid[i][j - 1] + 1, grid[i - 1][j - 1] + cost);
    }
  }

  return grid[a.length][b.length];
}

