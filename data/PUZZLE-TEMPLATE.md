# Adding Puzzles Manually

Edit `puzzles.js` and add objects to the `puzzles` array. Copy this template:

```javascript
{
  id: 302,
  league: "MLB",           // MLB | NBA | NHL | NFL
  teamName: "2016 Chicago Cubs",
  teamCode: "CHC",         // CHC, CHW, CHI
  gameLabel: "Opening Day Lineup",
  lineup: [
    { spot: 1, player: "Player Name", pos: "CF" },
    { spot: 2, player: "Player Name", pos: "3B" },
    // ... more players
    {
      spot: 5,
      player: "Missing Player",
      pos: "LF",
      age: 24,                                    // optional, hint #2
      tenureHint: "Traded during 2016 season.",   // optional, hint #3
      war: 0.2                                    // optional, hint #4
    }
  ],
  missingIndex: 4   // 0-based index of the missing player
}
```

**Hint order:** 1st wrong → position, 2nd → age, 3rd → tenureHint, 4th → war

**Sources for lineups:**
- Baseball Reference (baseball-reference.com)
- Basketball Reference
- Hockey Reference
- Pro Football Reference

**Chicago Bears (NFL):** Use NFL Game Summary PDFs from nfl.com. Extract the Lineups section for the HOME team (Chicago Bears). Create separate puzzles for Offense and Defense. Example teamName: "2025 Chicago Bears", gameLabel: "Week 1 Offense" or "Week 1 Defense".
