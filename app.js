function init() {
  const loading = document.getElementById("app-loading");
  const main = document.getElementById("app-main");
  try {
    if (!window.MISSING_MAN?.puzzles) throw new Error("Puzzle data not loaded. Check your connection.");
    const { MAX_GUESSES, puzzles } = window.MISSING_MAN;

const dayLabel = document.querySelector("#day-label");
const puzzleCard = document.querySelector("#puzzle-card");
const form = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const feedback = document.querySelector("#feedback");
const hintsBox = document.querySelector("#hints");
const shareOutput = document.querySelector("#share-output");
const copyShareBtn = document.querySelector("#copy-share");
const resetTodayBtn = document.querySelector("#reset-today");
const decadeCheckboxes = document.querySelector("#decade-checkboxes");
const teamCheckboxes = document.querySelector("#team-checkboxes");

const SETTINGS_KEY = "missing-man-chicago-decades";
const TEAMS_SETTINGS_KEY = "missing-man-chicago-teams";
const dayId = getDayId();
const storageKey = `missing-man-chicago-${dayId}`;
const state = loadState(storageKey);

// Load settings (default: all checked)
const decadeSettings = loadDecadeSettings();
const teamSettings = loadTeamSettings();

// Filter puzzles by selected decades and teams
const filteredPuzzles = getFilteredPuzzles(puzzles, decadeSettings, teamSettings);

// Resolve puzzle: use stored puzzleId (in-progress game) or day-based selection from filtered set
let puzzle = resolvePuzzle(filteredPuzzles, state, dayId);

// Randomize missing player on first load (or use stored choice)
if (state.missingIndex == null) {
  state.missingIndex = Math.floor(Math.random() * puzzle.lineup.length);
  state.puzzleId = puzzle.id;
  persistState(storageKey, state);
}
const answer = puzzle.lineup[state.missingIndex];

// Wire up settings checkboxes
setupTeamCheckboxes();
setupDecadeCheckboxes();

renderHeader();
renderLineup();
renderHints();
renderShare();
restoreFeedback();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.complete || state.guesses.length >= MAX_GUESSES) return;

  const guess = guessInput.value.trim();
  if (!guess) return;

  const isCorrect = matchesAnswer(guess, answer.player, puzzle);
  state.guesses.push({ guess, isCorrect });

  if (isCorrect) {
    state.complete = true;
    feedback.textContent = `✅ Correct — ${answer.player} was missing.`;
  } else if (state.guesses.length >= MAX_GUESSES) {
    state.complete = true;
    feedback.textContent = `❌ Out of guesses. Correct answer: ${answer.player}.`;
  } else {
    feedback.textContent = `❌ Not quite. Guess ${state.guesses.length}/${MAX_GUESSES}. Hint unlocked.`;
  }

  guessInput.value = "";
  persistState(storageKey, state);
  renderLineup();
  renderHints();
  renderShare();

  if (state.complete) {
    form.querySelector("button[type='submit']").disabled = true;
    guessInput.disabled = true;
  }
});

resetTodayBtn?.addEventListener("click", () => {
  // Dev: pick new random puzzle from filtered set + new random missing player
  if (filteredPuzzles.length === 0) {
    feedback.textContent = "Select at least one team and one decade in Settings.";
    return;
  }
  const newPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
  const newState = {
    puzzleId: newPuzzle.id,
    missingIndex: Math.floor(Math.random() * newPuzzle.lineup.length),
    guesses: [],
    complete: false
  };
  persistState(storageKey, newState);
  window.location.reload();
});

copyShareBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareOutput.textContent);
    feedback.textContent = "Copied. Paste into iMessage.";
  } catch {
    feedback.textContent = "Clipboard blocked.";
  }
});

// --- Helper functions ---

/** Day ID = days since Jan 1, 2025. From URL /day/N or from today's date. */
function getDayId() {
  const match = window.location.pathname.match(/^\/day\/(\d+)/);
  if (match) return parseInt(match[1], 10);
  const jan1 = new Date("2025-01-01T00:00:00");
  const now = new Date();
  return Math.floor((now - jan1) / (24 * 60 * 60 * 1000));
}

/** Extract year from teamName (e.g. "2016 Chicago Cubs" -> 2016). */
function getPuzzleYear(p) {
  const m = (p.teamName || "").match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

/** Get puzzles whose year and team match selected settings. */
function getFilteredPuzzles(allPuzzles, selectedDecades, selectedTeams) {
  return allPuzzles.filter((p) => {
    const teamCode = p.teamCode || "";
    if (selectedTeams.length > 0 && !selectedTeams.includes(teamCode)) return false;
    const year = getPuzzleYear(p);
    if (year == null) return selectedDecades.length === 0;
    const decade = Math.floor(year / 10) * 10;
    if (selectedDecades.length > 0 && !selectedDecades.includes(decade)) return false;
    return true;
  });
}

/** Resolve which puzzle to use: in-progress by id, or day-based from filtered set. */
function resolvePuzzle(filtered, state, dayId) {
  // If user has an in-progress game, use that puzzle (from full list)
  if (state.puzzleId != null) {
    const byId = puzzles.find((p) => p.id === state.puzzleId);
    if (byId) return byId;
  }
  // Migrate legacy puzzleIndex
  if (state.puzzleIndex != null && puzzles[state.puzzleIndex]) {
    return puzzles[state.puzzleIndex];
  }
  // Day-based selection from filtered set
  if (filtered.length === 0) return puzzles[0]; // fallback if no puzzles match
  const idx = dayId % filtered.length;
  return filtered[idx];
}

function loadDecadeSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (_) {}
  return [1970, 1980, 1990, 2000, 2010, 2020];
}

function saveDecadeSettings(decades) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(decades));
}

function loadTeamSettings() {
  try {
    const raw = localStorage.getItem(TEAMS_SETTINGS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (_) {}
  return ["CHC", "CHI"];
}

function saveTeamSettings(teams) {
  localStorage.setItem(TEAMS_SETTINGS_KEY, JSON.stringify(teams));
}

function setupTeamCheckboxes() {
  if (!teamCheckboxes) return;
  const inputs = teamCheckboxes.querySelectorAll("input[data-team]");
  inputs.forEach((input) => {
    const team = input.dataset.team;
    input.checked = teamSettings.includes(team);
    input.addEventListener("change", () => {
      const selected = Array.from(teamCheckboxes.querySelectorAll("input:checked"))
        .map((el) => el.dataset.team)
        .filter(Boolean);
      saveTeamSettings(selected);
      window.location.reload();
    });
  });
}

function setupDecadeCheckboxes() {
  if (!decadeCheckboxes) return;
  const inputs = decadeCheckboxes.querySelectorAll("input[data-decade]");
  inputs.forEach((input) => {
    const decade = parseInt(input.dataset.decade, 10);
    input.checked = decadeSettings.includes(decade);
    input.addEventListener("change", () => {
      const selected = Array.from(decadeCheckboxes.querySelectorAll("input:checked"))
        .map((el) => parseInt(el.dataset.decade, 10))
        .sort((a, b) => a - b);
      saveDecadeSettings(selected);
      // Reload to apply new filter (only if no in-progress game, or we could just reload)
      window.location.reload();
    });
  });
}

function renderHeader() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  dayLabel.textContent = `${dateStr} · ${puzzle.league} · ${puzzle.teamName}`;
}

function renderLineup() {
  const wrongGuesses = state.guesses.filter((g) => !g.isCorrect).map((g) => normalize(g.guess));
  let html = `
    <h2>${puzzle.gameLabel}</h2>
    <p class="team-badge">${puzzle.teamName}</p>
    <ul class="lineup">
  `;
  puzzle.lineup.forEach((p, i) => {
    const isMissing = i === state.missingIndex;
    const isRevealed = state.complete || wrongGuesses.includes(normalize(p.player));
    const show = isMissing ? isRevealed : true;
    const cls = isMissing ? (isRevealed ? "missing revealed" : "missing") : "";
    const showPosForMissing = puzzle.showPositionForMissing && isMissing && !isRevealed && p.pos;
    const missingText = showPosForMissing ? `${p.spot}. ??? (${p.pos})` : `${p.spot}. ???`;
    html += `<li class="${cls}">${show ? `${p.spot}. ${p.player} (${p.pos})` : missingText}</li>`;
  });
  html += "</ul>";
  puzzleCard.innerHTML = html;
}

function renderHints() {
  const wrongCount = state.guesses.filter((g) => !g.isCorrect).length;
  const missingPlayer = puzzle.lineup[state.missingIndex];
  const hints = [];
  if (wrongCount >= 1 && missingPlayer.pos) hints.push(`Position: ${missingPlayer.pos}`);
  if (wrongCount >= 2 && missingPlayer.age) hints.push(`Age: ${missingPlayer.age}`);
  if (wrongCount >= 3 && missingPlayer.tenureHint) hints.push(missingPlayer.tenureHint);
  if (wrongCount >= 4 && missingPlayer.war != null) hints.push(`WAR: ${missingPlayer.war}`);
  hintsBox.innerHTML = hints.length ? hints.map((h) => `<p class="hint">${h}</p>`).join("") : "";
}

function restoreFeedback() {
  if (state.complete) {
    const last = state.guesses[state.guesses.length - 1];
    feedback.textContent = last?.isCorrect
      ? `✅ Correct — ${answer.player} was missing.`
      : `❌ Out of guesses. Correct answer: ${answer.player}.`;
    form.querySelector("button[type='submit']").disabled = true;
    guessInput.disabled = true;
  }
}

function matchesAnswer(guess, answerPlayer, p) {
  const g = normalize(guess);
  const a = normalize(answerPlayer);
  if (g === a) return true;
  if (levenshtein(g, a) <= 2) return true;
  const parts = a.split(/\s+/);
  return parts.some((part) => part.length >= 3 && g.includes(part)) || g.includes(a);
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function loadState(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        guesses: parsed.guesses || [],
        complete: !!parsed.complete,
        missingIndex: parsed.missingIndex,
        puzzleId: parsed.puzzleId,
        puzzleIndex: parsed.puzzleIndex // legacy
      };
    }
  } catch (_) {}
  return { guesses: [], complete: false, missingIndex: undefined, puzzleId: undefined, puzzleIndex: undefined };
}

function persistState(key, state) {
  localStorage.setItem(key, JSON.stringify(state));
}

function renderShare() {
  let row = "";
  for (let i = 0; i < MAX_GUESSES; i++) {
    const g = state.guesses[i];
    row += !g ? "⬜" : g.isCorrect ? "🟩" : "🟥";
  }
  const gameUrl = window.location.origin + "/";
  const header = `Missing Man Chicago · Day ${dayId}\n`;
  shareOutput.textContent = header + row + `\n\nPlay: ${gameUrl}`;
}

    if (loading) loading.style.display = "none";
    if (main) main.style.display = "";
  } catch (e) {
    if (loading) {
      loading.innerHTML = "Failed to load. Try again or check your connection.<br><small>" + (e.message || "Error") + "</small>";
      loading.style.color = "#c41e3a";
    }
    if (main) main.style.display = "none";
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
