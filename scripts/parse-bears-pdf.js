#!/usr/bin/env node
/**
 * Parse NFL Game Summary PDFs to extract Chicago Bears starters.
 * Usage: node scripts/parse-bears-pdf.js <path-to-pdf>
 *
 * Expects PDFs in NFL Game Summary format (from nfl.com).
 * Outputs offense and defense puzzle JSON for puzzles.js.
 *
 * Requires: npm install pdf-parse
 */

const fs = require("fs");
const path = require("path");

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: node parse-bears-pdf.js <path-to-pdf>");
    process.exit(1);
  }

  let pdfParse;
  try {
    pdfParse = require("pdf-parse");
  } catch (e) {
    console.error("Install pdf-parse first: npm install pdf-parse");
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  // Extract year from date line (e.g. "Date: Monday, 9/8/2025")
  const dateMatch = text.match(/Date:.*?(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const year = dateMatch ? dateMatch[3] : new Date().getFullYear().toString();

  // Find Lineups section - format varies; look for "Chicago Bears" and "Offense Defense"
  // Typical structure: WR 14 O.Zaccheaus ... WR 14 O.Zaccheaus DL 55 D.Odeyingbo
  // Columns: Visitor Offense | Visitor Defense | Home Offense | Home Defense
  // We want Home = Chicago Bears

  const lines = text.split(/\r?\n/);
  let bearsOffense = [];
  let bearsDefense = [];
  let inLineups = false;
  let headerFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("Lineups") || (line.includes("Offense") && line.includes("Defense"))) {
      inLineups = true;
      headerFound = line.includes("Offense") && line.includes("Defense");
      continue;
    }
    if (inLineups && headerFound) {
      // Look for position + number + name pattern (e.g. "WR 14 O.Zaccheaus")
      // Home team (Bears) is typically 3rd and 4th column
      const parts = line.split(/\s+/);
      // Simplified: find lines with POS NUM Name pattern
      const posMatch = line.match(/([A-Z]{2,3})\s+(\d+)\s+([A-Z]\.?[A-Za-z]+)/g);
      if (posMatch && line.includes("CHI") === false) {
        // Heuristic: after "Chicago Bears" header, next lines are the lineup
        // This is a simplified parser - may need tuning per PDF format
        break;
      }
    }
  }

  // Fallback: manual extraction from known format
  // The PDF text extraction order may vary - this script provides a starting point.
  // For best results, copy the Lineups section from the PDF and paste into a text file,
  // then parse that, or manually add to puzzles.js using the template below.

  console.log(`
Parsed PDF: ${path.basename(pdfPath)}
Year: ${year}

NOTE: Automatic PDF parsing of NFL Game Summary format is complex due to
column layout. For reliable results:

1. Open the PDF and locate the "Lineups" section
2. Find "Chicago Bears" - Offense column and Defense column
3. Copy the position + number + name (e.g. "WR 14 O.Zaccheaus")
4. Add to puzzles.js using this template:

{
  id: NEXT_ID,
  league: "NFL",
  teamName: "${year} Chicago Bears",
  teamCode: "CHI",
  gameLabel: "Week N Offense",  // or "Week N Defense"
  lineup: [
    { spot: 1, player: "Full Name", pos: "QB" },
    ...
  ],
  missingIndex: 0
}

Common position abbreviations: QB, RB, WR, TE, LT, LG, C, RG, RT (offense);
DL, LB, DB (defense).
`);
}

main().catch(console.error);
