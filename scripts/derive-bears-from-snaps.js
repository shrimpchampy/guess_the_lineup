#!/usr/bin/env node
/**
 * Derive "most common lineup" from Bears snap count data.
 * Highest snap count at each position = starter.
 * For multi-starter positions (WR, G, T, DE, DT, CB, S, LB), take top N.
 *
 * Usage: node scripts/derive-bears-from-snaps.js [--js]
 */

const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../data/bears_season_totals.csv");
const csv = fs.readFileSync(csvPath, "utf-8");

function parseCSVLine(line) {
  const parts = line.split(",").map((p) => p.replace(/^"|"$/g, "").trim());
  if (parts.length < 6) return null;
  return {
    season: parseInt(parts[0], 10),
    position: parts[1],
    player: parts[2],
    total_snaps: parseInt(parts[3], 10) || 0,
    offense_snaps: parseInt(parts[4], 10) || 0,
    defense_snaps: parseInt(parts[5], 10) || 0,
  };
}

const lines = csv.split("\n").filter((l) => l.trim());
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  if (row && !isNaN(row.season)) rows.push(row);
}

// Position groups: how many starters (11 personnel offense, 4-3 defense)
const OFFENSE_POSITIONS = {
  QB: { count: 1, snaps: "offense" },
  RB: { count: 1, snaps: "offense" },
  WR: { count: 3, snaps: "offense" },
  TE: { count: 1, snaps: "offense" },
  T: { count: 2, snaps: "offense" },
  G: { count: 2, snaps: "offense" },
  C: { count: 1, snaps: "offense" },
  OL: { count: 5, snaps: "offense" }, // fallback when T/G/C combined
};

const DEFENSE_POSITIONS = {
  DE: { count: 2, snaps: "defense" },
  DT: { count: 2, snaps: "defense" },
  LB: { count: 3, snaps: "defense" },
  CB: { count: 2, snaps: "defense" },
  S: { count: 2, snaps: "defense" },
};

function getTopBySnaps(players, count, snapKey) {
  return players
    .sort((a, b) => (b[snapKey] || 0) - (a[snapKey] || 0))
    .slice(0, count)
    .map((p) => p.player);
}

function buildLineup(seasonRows) {
  const offense = [];
  const defense = [];

  const byPos = {};
  for (const r of seasonRows) {
    if (!byPos[r.position]) byPos[r.position] = [];
    byPos[r.position].push(r);
  }

  // --- OFFENSE (11 personnel: QB, RB, 3 WR, 1 TE, 2 T, 2 G, C) ---
  const useOL = byPos.OL && (!byPos.T || !byPos.G) && byPos.OL.some((r) => r.offense_snaps > 100);
  const offOrder = useOL ? ["QB", "RB", "WR", "TE"] : ["QB", "RB", "WR", "TE", "T", "G", "C"];
  for (const pos of offOrder) {
    const config = OFFENSE_POSITIONS[pos];
    if (!config || !byPos[pos]) continue;
    const snapKey = config.snaps + "_snaps";
    const top = getTopBySnaps(byPos[pos], config.count, snapKey);
    for (const p of top) {
      offense.push({ player: p, pos: pos });
    }
  }
  if (useOL) {
    const ol = getTopBySnaps(byPos.OL, 5, "offense_snaps");
    for (const p of ol) offense.push({ player: p, pos: "OL" });
  }

  // --- DEFENSE ---
  // Combine DT + NT for 2 interior spots (take top 2 from combined)
  const dlInterior = [...(byPos.DT || []), ...(byPos.NT || [])];
  const topDT = getTopBySnaps(dlInterior, 2, "defense_snaps");

  const topDE = byPos.DE ? getTopBySnaps(byPos.DE, 2, "defense_snaps") : [];
  const topLB = byPos.LB ? getTopBySnaps(byPos.LB, 3, "defense_snaps") : [];

  // CB + S: use CB/S/FS/SS when available; when only DB, split top 4 DB as 2 CB + 2 S
  const cbPool = byPos.CB || [];
  const sPool = [...(byPos.FS || []), ...(byPos.SS || []), ...(byPos.S || [])];
  const dbPool = byPos.DB || [];
  let topCB, topS;
  if (cbPool.length >= 2 && sPool.length >= 2) {
    topCB = getTopBySnaps(cbPool, 2, "defense_snaps");
    topS = getTopBySnaps(sPool, 2, "defense_snaps");
  } else if (dbPool.length >= 4) {
    const top4 = getTopBySnaps(dbPool, 4, "defense_snaps");
    topCB = top4.slice(0, 2);
    topS = top4.slice(2, 4);
  } else {
    topCB = cbPool.length >= 2 ? getTopBySnaps(cbPool, 2, "defense_snaps") : getTopBySnaps([...cbPool, ...dbPool], 2, "defense_snaps");
    topS = sPool.length ? getTopBySnaps(sPool, 2, "defense_snaps") : getTopBySnaps(dbPool, 2, "defense_snaps");
  }

  const defOrder = ["DE", "DT", "LB", "CB", "S"];
  for (const p of topDE) defense.push({ player: p, pos: "DE" });
  for (const p of topDT) defense.push({ player: p, pos: "DT" });
  for (const p of topLB) defense.push({ player: p, pos: "LB" });
  for (const p of topCB) defense.push({ player: p, pos: "CB" });
  for (const p of topS) defense.push({ player: p, pos: "S" });

  return { offense, defense };
}

const bySeason = {};
for (const r of rows) {
  if (!bySeason[r.season]) bySeason[r.season] = [];
  bySeason[r.season].push(r);
}

const seasons = Object.keys(bySeason).map(Number).sort((a, b) => b - a);
const puzzles = [];
// IDs 359-384 = 2025..2013 Bears when 2025 in CSV; else 361-384 = 2024..2013
let nextId = seasons[0] >= 2025 ? 359 : 361;

for (const season of seasons) {
  const { offense, defense } = buildLineup(bySeason[season]);

  if (offense.length >= 8) {
    puzzles.push({
      id: nextId++,
      league: "NFL",
      teamName: `${season} Chicago Bears`,
      teamCode: "CHI",
      showPositionForMissing: true,
      gameLabel: "Most Common Offense (by snaps)",
      lineup: offense.map((p, i) => ({ spot: i + 1, player: p.player, pos: p.pos })),
      missingIndex: 0,
    });
  }
  if (defense.length >= 8) {
    puzzles.push({
      id: nextId++,
      league: "NFL",
      teamName: `${season} Chicago Bears`,
      teamCode: "CHI",
      showPositionForMissing: true,
      gameLabel: "Most Common Defense (by snaps)",
      lineup: defense.map((p, i) => ({ spot: i + 1, player: p.player, pos: p.pos })),
      missingIndex: 0,
    });
  }
}

function toJs(p) {
  const lineup = p.lineup
    .map((l) => `        { spot: ${l.spot}, player: "${l.player.replace(/"/g, '\\"')}", pos: "${l.pos}" }`)
    .join(",\n");
  return `    {
      id: ${p.id},
      league: "NFL",
      teamName: "${p.teamName}",
      teamCode: "CHI",
      showPositionForMissing: true,
      gameLabel: "${p.gameLabel}",
      lineup: [
${lineup}
      ],
      missingIndex: 0
    }`;
}

if (process.argv[2] === "--js") {
  console.log(puzzles.map(toJs).join(",\n"));
} else {
  console.log(JSON.stringify(puzzles, null, 2));
}
