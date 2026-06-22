# Typo Disk

A typing speed (WPM) app built with HTML, CSS, and JavaScript.
Open `index.html` in any browser — no install needed.

## File Structure

typo-disk/
├── index.html          # Main page
├── css/
│   └── style.css       # All colours, layout, keyboard, modal styles
├── js/
│   ├── levels.js       # Built-in lesson levels — add more here
│   ├── auth.js         # Login / register / logout (localStorage)
│   ├── leaderboard.js  # Score sharing and leaderboard (localStorage)
│   └── app.js          # Core game logic, keyboard, custom lessons
└── README.md

## How to Run

Open `index.html` in a browser. No server or install required.

## Features

- WPM, accuracy, and time tracking
- On-screen keyboard that highlights as you type
- User accounts (register / login / logout) stored locally
- Leaderboard — share scores and compare with others on the same device
- Custom lessons via .txt file upload or drag & drop

## Adding Built-in Levels

Open `js/levels.js` and add to the array:

  { number: 2, name: "Easy", text: "your text here" },

## Customising Colours

All colours are in `css/style.css`:
  #e94560  — red/pink  (buttons, errors)
  #4ecca3  — teal/green (correct chars, result)
  #1a1a2e  — dark navy background
  #16213e  — panel / modal background
  #0f3460  — key / input background

## Notes on Accounts & Leaderboard

Accounts and scores are saved in the browser's localStorage.
They are specific to the browser and device being used.
Clearing browser data will reset all accounts and scores.
