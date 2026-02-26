#!/usr/bin/env node
/**
 * Fetches Chicago team rosters from ESPN API and generates puzzles.
 * Run: npm run fetch-puzzles
 *
 * Note: Overwrites data/puzzles.js. ESPN returns current rosters only.
 * For historical/famous lineups (e.g. 2016 Cubs), add manually — see data/PUZZLE-TEMPLATE.md
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const CHICAGO_TEAMS = [
  { sport: "baseball", league: "mlb", teamId: "16", teamName: "Chicago Cubs", teamCode: "CHC" },
  { sport: "baseball", league: "mlb", teamId: "4", teamName: "Chicago White Sox", teamCode: "CHW" },
  { sport: "basketball", league: "nba", teamId: "4", teamName: "Chicago Bulls", teamCode: "CHI" },
  { sport: "hockey", league: "nhl", teamId: "4", teamName: "Chicago Blackhawks", teamCode: "CHI" },
  { sport: "football", league: "nfl", teamId: "3", teamName: "Chicago Bears", teamCode: "CHI" },
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
    }).on("error", reject);
  });
}

function buildMLBLineup(athletes) {
  const lineup = [];
  const posOrder = ["Catchers", "Infield", "Outfield", "Designated Hitter", "Pitchers"];
  const posMap = { C: "C", "1B": "1B", "2B": "2B", "3B": "3B", SS: "SS", LF: "LF", CF: "CF", RF: "RF", DH: "DH", P: "P", SP: "P", RP: "P" };

  const byPos = {};
  for (const group of athletes) {
    const pos = group.position || "";
    if (!byPos[pos]) byPos[pos] = [];
    for (const p of group.items || []) {
      byPos[pos].push(p);
    }
  }

  for (const pos of posOrder) {
    for (const p of byPos[pos] || []) {
      if (lineup.length >= 9) break;
      const abbrev = (p.position?.abbreviation || pos?.slice(0, 2) || "?").toUpperCase();
      lineup.push({
        spot: lineup.length + 1,
        player: p.displayName || p.fullName || `${p.firstName} ${p.lastName}`,
        pos: posMap[abbrev] || abbrev,
        age: p.age,
      });
    }
  }
  return lineup.slice(0, 9);
}

function buildNBALineup(athletes) {
  const guards = [];
  const forwards = [];
  const centers = [];

  for (const p of athletes) {
    const pos = (p.position?.abbreviation || "").toUpperCase();
    const player = { name: p.displayName || p.fullName || `${p.firstName} ${p.lastName}`, pos, age: p.age };
    if (pos === "G") guards.push(player);
    else if (pos === "F") forwards.push(player);
    else if (pos === "C") centers.push(player);
  }

  const take = (arr, n) => arr.slice(0, n);
  const five = [...take(guards, 2), ...take(forwards, 2), ...take(centers, 1)];
  return five.map((p, i) => ({ spot: i + 1, player: p.name, pos: p.pos, age: p.age }));
}

function buildNHLLineup(athletes) {
  const lineup = [];
  const forwards = [];
  const defensemen = [];
  let goalie = null;

  for (const group of athletes) {
    const pos = (group.position || "").toLowerCase();
    const items = group.items || [];
    for (const p of items) {
      const player = { name: p.displayName || p.fullName || `${p.firstName} ${p.lastName}`, age: p.age };
      if (pos.includes("goalie") || pos.includes("goaltender")) goalie = player;
      else if (pos.includes("defens")) defensemen.push(player);
      else forwards.push(player);
    }
  }

  const take = (arr, n) => arr.slice(0, n);
  const fwd = take(forwards, 3).map((p, i) => ({ spot: i + 1, player: p.name, pos: "F", age: p.age }));
  const def = take(defensemen, 2).map((p, i) => ({ spot: 4 + i, player: p.name, pos: "D", age: p.age }));
  const g = goalie ? [{ spot: 6, player: goalie.name, pos: "G", age: goalie.age }] : [];
  return [...fwd, ...def, ...g];
}

function buildNFLLineup(athletes) {
  const lineup = [];
  const byPos = { QB: [], RB: [], WR: [], TE: [], OL: [] };

  for (const group of athletes) {
    const items = group.items || [];
    for (const p of items) {
      const pos = (p.position?.abbreviation || "").toUpperCase();
      const player = { name: p.displayName || p.fullName || `${p.firstName} ${p.lastName}`, pos };
      if (pos === "QB") byPos.QB.push(player);
      else if (["RB", "FB"].includes(pos)) byPos.RB.push(player);
      else if (pos === "WR") byPos.WR.push(player);
      else if (pos === "TE") byPos.TE.push(player);
      else if (["OT", "OG", "C"].includes(pos)) byPos.OL.push(player);
    }
  }

  const add = (arr, n, posLabel) => {
    for (let i = 0; i < n && arr[i]; i++) {
      lineup.push({ spot: lineup.length + 1, player: arr[i].name, pos: posLabel || arr[i].pos });
    }
  };
  add(byPos.QB, 1, "QB");
  add(byPos.RB, 2, "RB");
  add(byPos.WR, 2, "WR");
  add(byPos.TE, 1, "TE");
  add(byPos.OL, 5, "OL");
  return lineup.slice(0, 11);
}

async function fetchRoster(team) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/teams/${team.teamId}/roster`;
  const data = await fetch(url);
  const athletes = data.athletes || [];
  const season = data.season;
  return { athletes, season };
}

async function main() {
  const puzzles = [];
  let id = 300;

  for (const team of CHICAGO_TEAMS) {
    try {
      const { athletes, season } = await fetchRoster(team);
      let lineup;

      if (team.league === "mlb") lineup = buildMLBLineup(athletes);
      else if (team.league === "nba") lineup = buildNBALineup(athletes);
      else if (team.league === "nhl") lineup = buildNHLLineup(athletes);
      else if (team.league === "nfl") lineup = buildNFLLineup(athletes);
      else continue;

      if (lineup.length < 3) {
        console.warn(`Skipping ${team.teamName}: not enough players (${lineup.length})`);
        continue;
      }

      const missingIndex = Math.floor(Math.random() * lineup.length);
      const missing = lineup[missingIndex];
      if (missing.age) lineup[missingIndex] = { ...missing, age: missing.age };
      if (missing.pos) lineup[missingIndex] = { ...lineup[missingIndex], pos: missing.pos };

      const leagueLabel = { mlb: "MLB", nba: "NBA", nhl: "NHL", nfl: "NFL" }[team.league];
      const seasonLabel = season?.displayName || season?.year || new Date().getFullYear();

      puzzles.push({
        id: ++id,
        league: leagueLabel,
        teamName: `${seasonLabel} ${team.teamName}`,
        teamCode: team.teamCode,
        gameLabel: "Current Roster Lineup",
        lineup,
        missingIndex,
      });

      console.log(`✓ ${team.teamName}: ${lineup.length} players, missing: ${lineup[missingIndex].player}`);
    } catch (err) {
      console.error(`✗ ${team.teamName}: ${err.message}`);
    }
  }

  const outputPath = path.join(__dirname, "..", "data", "puzzles.js");
  const puzzlesStr = puzzles.map((p) => "  " + JSON.stringify(p, null, 2).replace(/\n/g, "\n  ")).join(",\n");
  const content = `window.MISSING_MAN = {
  MAX_GUESSES: 6,
  puzzles: [
${puzzlesStr}
  ]
};
`;

  fs.writeFileSync(outputPath, content);
  console.log(`\nWrote ${puzzles.length} puzzles to data/puzzles.js`);
}

main().catch(console.error);
