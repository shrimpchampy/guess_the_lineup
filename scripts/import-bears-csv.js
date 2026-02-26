#!/usr/bin/env node
/**
 * Parse chicago_bears_opening_starters.csv and output puzzle objects for puzzles.js
 * Usage: node scripts/import-bears-csv.js
 */

const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../data/chicago_bears_opening_starters.csv");
const csv = fs.readFileSync(csvPath, "utf-8");

// Expand common abbreviations to full names for better game experience
const NAME_MAP = {
  "O.Zaccheaus": "Olamide Zaccheaus",
  "D.Moore": "D.J. Moore",
  "B.Jones": "Braxton Jones",
  "J.Thuney": "Joe Thuney",
  "D.Dalman": "Drew Dalman",
  "J.Jackson": "Jonah Jackson",
  "D.Wright": "Darnell Wright",
  "C.Kmet": "Cole Kmet",
  "R.Odunze": "Rome Odunze",
  "C.Williams": "Caleb Williams",
  "D.Swift": "D'Andre Swift",
  "D.Odeyingbo": "Dayo Odeyingbo",
  "G.Jarrett": "Grady Jarrett",
  "G.Dexter": "Gervon Dexter",
  "M.Sweat": "Montez Sweat",
  "T.Edmunds": "Tremaine Edmunds",
  "N.Sewell": "Noah Sewell",
  "N.Wright": "Noah Wright",
  "T.Stevenson": "Tyrique Stevenson",
  "N.McCloud": "Nick McCloud",
  "J.Brisker": "Jaquan Brisker",
  "K.Byard": "Kevin Byard",
  "K.Allen": "Keenan Allen",
  "T.Jenkins": "Teven Jenkins",
  "C.Shelton": "Coleman Shelton",
  "N.Davis": "Nate Davis",
  "G.Everett": "Gerald Everett",
  "A.Billings": "Andrew Billings",
  "D.Walker": "DeMarcus Walker",
  "T.Edwards": "T.J. Edwards",
  "K.Gordon": "Kyler Gordon",
  "T.Smith": "Terell Smith",
  "J.Johnson": "Jaylon Johnson",
  "D.Mooney": "Darnell Mooney",
  "C.Whitehair": "Cody Whitehair",
  "L.Patrick": "Lucas Patrick",
  "J.Fields": "Justin Fields",
  "K.Herbert": "Khalil Herbert",
  "C.Claypool": "Chase Claypool",
  "Y.Ngakoue": "Yannick Ngakoue",
  "Ju.Jones": "Justin Jones",
  "E.St.Brown": "Equanimeous St. Brown",
  "D.Pettis": "Dante Pettis",
  "S.Mustipher": "Sam Mustipher",
  "L.Borom": "Larry Borom",
  "D.Montgomery": "David Montgomery",
  "R.Quinn": "Robert Quinn",
  "Ju.Jones": "Justin Jones",
  "A.Blackson": "Angelo Blackson",
  "A.Muhammad": "Al-Quadin Muhammad",
  "N.Morrow": "Nicholas Morrow",
  "R.Smith": "Roquan Smith",
  "K.Vildor": "Kindle Vildor",
  "E.Jackson": "Eddie Jackson",
  "A.Robinson": "Allen Robinson",
  "J.Peters": "Jason Peters",
  "J.Daniels": "James Daniels",
  "G.Ifedi": "Germain Ifedi",
  "J.Graham": "Jimmy Graham",
  "A.Dalton": "Andy Dalton",
  "R.Quinn": "Robert Quinn",
  "B.Nichols": "Bilal Nichols",
  "A.Hicks": "Akiem Hicks",
  "K.Mack": "Khalil Mack",
  "A.Ogletree": "Alec Ogletree",
  "M.Christian": "Marqui Christian",
  "Ja.Johnson": "Jaylon Johnson",
  "Ta.Gipson": "Tashaun Gipson",
  "M.Trubisky": "Mitchell Trubisky",
  "J.Wims": "Javon Wims",
  "J.Holtz": "J.P. Holtz",
  "R.Robertson-Harris": "Roy Robertson-Harris",
  "D.Trevathan": "Danny Trevathan",
  "B.Mingo": "Barkevious Mingo",
  "K.Fuller": "Kyle Fuller",
  "C.Leno": "Charles Leno",
  "B.Massie": "Bobby Massie",
  "G.Ifedi": "Germain Ifedi",
  "J.Daniels": "James Daniels",
  "A.Shaheen": "Adam Shaheen",
  "K.Long": "Kyle Long",
  "B.Sowell": "Bradley Sowell",
  "T.Cohen": "Tarik Cohen",
  "M.Davis": "Mike Davis",
  "E.Goldman": "Eddie Goldman",
  "B.Nichols": "Bilal Nichols",
  "L.Floyd": "Leonard Floyd",
  "H.Clinton-Dix": "Ha Ha Clinton-Dix",
  "P.Amukamara": "Prince Amukamara",
  "D.Sims": "Dion Sims",
  "T.Burton": "Trey Burton",
  "E.Kush": "Eric Kush",
  "C.Leno Jr": "Charles Leno Jr.",
  "J.Howard": "Jordan Howard",
  "M.Burton": "Michael Burton",
  "A.Lynch": "Aaron Lynch",
  "N.Kwiatkoski": "Nick Kwiatkoski",
  "A.Amos": "Adrian Amos",
  "B.Callahan": "Bryce Callahan",
  "D.Thompson": "Deonte Thompson",
  "J.Sitton": "Josh Sitton",
  "T.Compton": "Tom Compton",
  "M.Glennon": "Mike Glennon",
  "Jo.Howard": "Jordan Howard",
  "K.White": "Kevin White",
  "Z.Miller": "Zach Miller",
  "W.Young": "Willie Young",
  "J.Freeman": "Jerrell Freeman",
  "Q.Demps": "Quintin Demps",
  "M.Cooper": "Marcus Cooper",
  "A.Jeffery": "Alshon Jeffery",
  "L.Paulsen": "Logan Paulsen",
  "J.Cutler": "Jay Cutler",
  "J.Langford": "Jeremy Langford",
  "P.Lasike": "Paul Lasike",
  "T.Porter": "Tracy Porter",
  "H.Jones-Quartey": "Harold Jones-Quartey",
  "J.Glenn": "Jacob Glenn",
  "E.Royal": "Eddie Royal",
  "M.Bennett": "Martellus Bennett",
  "V.Ducasse": "Vladimir Ducasse",
  "W.Montgomery": "Will Montgomery",
  "M.Slauson": "Matt Slauson",
  "J.Bushrod": "Jermon Bushrod",
  "M.Forte": "Matt Forte",
  "K.Lee": "Khari Lee",
  "Z.Miller": "Zach Miller",
  "W.Sutton": "Will Sutton",
  "J.Jenkins": "Jarvis Jenkins",
  "J.Allen": "Jared Allen",
  "S.McClellin": "Shea McClellin",
  "C.Jones": "Christian Jones",
  "P.McPhee": "Pernell McPhee",
  "A.Ball": "Alan Ball",
  "S.McManis": "Sherrick McManis",
  "A.Rolle": "Antrel Rolle",
  "B.Marshall": "Brandon Marshall",
  "R.Garza": "Roberto Garza",
  "J.Mills": "Jordan Mills",
  "J.Morgan": "Josh Morgan",
  "L.Houston": "Lamarr Houston",
  "J.Ratliff": "Jeremiah Ratliff",
  "S.Paea": "Stephen Paea",
  "L.Briggs": "Lance Briggs",
  "D.Williams": "D.J. Williams",
  "T.Jennings": "Tim Jennings",
  "C.Tillman": "Charles Tillman",
  "R.Mundy": "Ryan Mundy",
  "C.Conte": "Chris Conte",
  "S.Maneri": "Steve Maneri",
  "T.Fiammetta": "Tony Fiammetta",
  "C.Wootton": "Corey Wootton",
  "H.Melton": "Henry Melton",
  "J.Peppers": "Julius Peppers",
  "Ja.Anderson": "James Anderson",
  "M.Wright": "Major Wright",
  "J.Webb": "J'Marcus Webb",
  "C.Spencer": "Chris Spencer",
  "L.Louis": "Lance Louis",
  "G.Carimi": "Gabe Carimi",
  "K.Davis": "Kellen Davis",
  "D.Hester": "Devin Hester",
  "E.Rodriguez": "Evan Rodriguez",
  "I.Idonije": "Israel Idonije",
  "M.Toeaina": "Matt Toeaina",
  "B.Urlacher": "Brian Urlacher",
  "N.Roach": "Nick Roach",
  "R.Williams": "Roy Williams",
  "Ch.Williams": "Chris Williams",
  "E.Bennett": "Earl Bennett",
  "M.Spaeth": "Matt Spaeth",
  "C.Harris": "Chris Harris",
  "M.Wright": "Major Wright",
  "J.Knox": "Johnny Knox",
  "O.Kreutz": "Olin Kreutz",
  "F.Omiyale": "Frank Omiyale",
  "G.Olsen": "Greg Olsen",
  "D.Aromashodu": "Devin Aromashodu",
  "M.Anderson": "Mark Anderson",
  "T.Harris": "Tommie Harris",
  "A.Adams": "Anthony Adams",
  "P.Tinoisamoa": "Pisa Tinoisamoa",
  "Z.Bowman": "Zack Bowman",
  "D.Manning": "Danieal Manning",
};

function expandName(abbr, position) {
  // Position-specific overrides for same abbreviation (e.g. C.Williams = Caleb QB vs Chris OL)
  if (abbr === "C.Williams" && ["LT", "LG", "RT", "RG", "T", "G", "OL"].includes(position)) {
    return "Chris Williams";
  }
  return NAME_MAP[abbr] || abbr.replace(".", ". ");
}

const lines = csv.split("\n").filter((l) => l.trim());
const puzzles = [];
let currentYear = null;
let currentSide = null;
let offense = [];
let defense = [];
let nextId = 359;

for (const line of lines) {
  if (line.startsWith("date,")) continue;
  const parts = line.split(",");
  if (parts.length < 7) continue;
  const year = parts[1];
  const side = parts[3];
  const position = parts[4];
  const player = parts[6]?.trim();
  if (!player) continue;

  const fullName = expandName(player);

  if (side === "Offense") {
    offense.push({ position, player: fullName });
  } else {
    defense.push({ position, player: fullName });
  }
}

// Group by year - we need to handle the CSV structure
const byYear = {};
let lastYear = null;
let lastSide = null;

for (const line of lines) {
  if (line.startsWith("date,")) continue;
  const parts = line.split(",");
  if (parts.length < 7) continue;
  const year = parts[1];
  const side = parts[3];
  const position = parts[4];
  const player = parts[6]?.trim();
  if (!player) continue;

  if (!byYear[year]) byYear[year] = { Offense: [], Defense: [] };
  byYear[year][side].push({ position, player: expandName(player, position) });
}

const years = Object.keys(byYear).sort((a, b) => b - a);

for (const year of years) {
  const off = byYear[year].Offense;
  const def = byYear[year].Defense;
  if (off.length) {
    puzzles.push({
      id: nextId++,
      league: "NFL",
      teamName: `${year} Chicago Bears`,
      teamCode: "CHI",
      gameLabel: "Opening Day Offense",
      lineup: off.map((p, i) => ({ spot: i + 1, player: p.player, pos: p.position })),
      missingIndex: 0,
    });
  }
  if (def.length) {
    puzzles.push({
      id: nextId++,
      league: "NFL",
      teamName: `${year} Chicago Bears`,
      teamCode: "CHI",
      gameLabel: "Opening Day Defense",
      lineup: def.map((p, i) => ({ spot: i + 1, player: p.player, pos: p.position })),
      missingIndex: 0,
    });
  }
}

// Output as JS for puzzles.js
function toJs(p) {
  const lineup = p.lineup
    .map((l) => `        { spot: ${l.spot}, player: "${l.player.replace(/"/g, '\\"')}", pos: "${l.pos}" }`)
    .join(",\n");
  return `    {
      id: ${p.id},
      league: "NFL",
      teamName: "${p.teamName}",
      teamCode: "CHI",
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
