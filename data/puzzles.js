export const MAX_GUESSES = 6;

export const puzzles = [
  {
    id: 301,
    league: "MLB",
    teamName: "2016 Chicago Cubs",
    teamCode: "CHC",
    gameLabel: "Opening Day Lineup",
    lineup: [
      { spot: 1, player: "Dexter Fowler", pos: "CF" },
      { spot: 2, player: "Kris Bryant", pos: "3B" },
      { spot: 3, player: "Anthony Rizzo", pos: "1B" },
      { spot: 4, player: "Ben Zobrist", pos: "2B" },
      {
        spot: 5,
        player: "Jorge Soler",
        pos: "LF",
        bats: "R",
        war: 0.2,
        age: 24,
        tenureHint: "Traded by the Cubs during their 2016 title season."
      },
      { spot: 6, player: "Jason Heyward", pos: "RF" },
      { spot: 7, player: "Addison Russell", pos: "SS" },
      { spot: 8, player: "Miguel Montero", pos: "C" },
      { spot: 9, player: "Jon Lester", pos: "P" }
    ],
    missingIndex: 4
  },
  {
    id: 302,
    league: "MLB",
    teamName: "2005 Chicago White Sox",
    teamCode: "CWS",
    gameLabel: "Opening Day Lineup",
    lineup: [
      { spot: 1, player: "Scott Podsednik", pos: "LF" },
      { spot: 2, player: "Tadahito Iguchi", pos: "2B" },
      { spot: 3, player: "Jermaine Dye", pos: "RF" },
      { spot: 4, player: "Paul Konerko", pos: "1B" },
      {
        spot: 5,
        player: "A.J. Pierzynski",
        pos: "C",
        bats: "L",
        war: 2.5,
        age: 28,
        tenureHint: "A key catcher on the 2005 World Series team."
      },
      { spot: 6, player: "Joe Crede", pos: "3B" },
      { spot: 7, player: "Juan Uribe", pos: "SS" },
      { spot: 8, player: "Aaron Rowand", pos: "CF" },
      { spot: 9, player: "Mark Buehrle", pos: "P" }
    ],
    missingIndex: 4
  },
  {
    id: 303,
    league: "NBA",
    teamName: "1995-96 Chicago Bulls",
    teamCode: "CHI",
    gameLabel: "Opening Night Starters",
    lineup: [
      { spot: 1, player: "Ron Harper", pos: "PG" },
      { spot: 2, player: "Michael Jordan", pos: "SG" },
      { spot: 3, player: "Scottie Pippen", pos: "SF" },
      {
        spot: 4,
        player: "Dennis Rodman",
        pos: "PF",
        bats: "N/A",
        war: "17.5 WS",
        age: 34,
        tenureHint: "Known as 'The Worm' and elite rebounder."
      },
      { spot: 5, player: "Luc Longley", pos: "C" }
    ],
    missingIndex: 3
  },
  {
    id: 304,
    league: "NFL",
    teamName: "1985 Chicago Bears",
    teamCode: "CHI",
    gameLabel: "Week 1 Skill Position Starters",
    lineup: [
      { spot: 1, player: "Jim McMahon", pos: "QB" },
      {
        spot: 2,
        player: "Walter Payton",
        pos: "RB",
        bats: "N/A",
        war: "N/A",
        age: 31,
        tenureHint: "Hall of Fame running back known as 'Sweetness'."
      },
      { spot: 3, player: "Matt Suhey", pos: "FB" },
      { spot: 4, player: "Willie Gault", pos: "WR" },
      { spot: 5, player: "Dennis McKinnon", pos: "WR" },
      { spot: 6, player: "Emery Moorehead", pos: "TE" }
    ],
    missingIndex: 1
  },
  {
    id: 305,
    league: "NHL",
    teamName: "2010 Chicago Blackhawks",
    teamCode: "CHI",
    gameLabel: "Opening Night Top Unit",
    lineup: [
      { spot: 1, player: "Jonathan Toews", pos: "C" },
      { spot: 2, player: "Patrick Kane", pos: "RW" },
      {
        spot: 3,
        player: "Patrick Sharp",
        pos: "LW",
        bats: "L",
        war: "N/A",
        age: 28,
        tenureHint: "40-goal scorer during the Hawks' title era."
      },
      { spot: 4, player: "Duncan Keith", pos: "D" },
      { spot: 5, player: "Brent Seabrook", pos: "D" },
      { spot: 6, player: "Antti Niemi", pos: "G" }
    ],
    missingIndex: 2
  }
];

