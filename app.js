const ANSWERS = ['apple', 'brain', 'cabin', 'candy', 'chair', 'dream', 'earth', 'flame', 'grape', 'heart', 'house', 'light', 'money', 'ocean', 'paper', 'plant', 'radio', 'river', 'stone', 'table', 'tiger', 'toast', 'train', 'water', 'world'];
const WORDS = new Set([...ANSWERS, 'about', 'again', 'after', 'alarm', 'alone', 'beach', 'black', 'bloom', 'bread', 'bring', 'brown', 'cloud', 'dance', 'drink', 'early', 'enjoy', 'every', 'field', 'fresh', 'green', 'happy', 'learn', 'lemon', 'music', 'night', 'photo', 'place', 'plant', 'quiet', 'round', 'share', 'short', 'smile', 'space', 'speak', 'sweet', 'think', 'today', 'touch', 'voice', 'watch', 'young']);
const KEY_ROWS = [['q','w','e','r','t','y','u','i','o','p'], ['a','s','d','f','g','h','j','k','l'], ['enter','z','x','c','v','b','n','m','backspace']];
const MAX_GUESSES = 6;
const dateElement = document.querySelector('#date');
const boardElement = document.querySelector('#board');
const keyboardElement = document.querySelector('#keyboard');
const statusElement = document.querySelector('#status');
const answer = ANSWERS[Math.floor(new Date().getDate() % ANSWERS.length)];
let currentRow = 0;
let currentGuess = '';
let gameOver = false;
let keyStates = {};

const stats = JSON.parse(localStorage.getItem('wordle-stats') || '{"played":0,"wins":0,"streak":0}');
dateElement.textContent = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

function buildBoard() {
  boardElement.innerHTML = '';
  for (let index = 0; index < MAX_GUESSES * 5; index += 1) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = index;
    boardElement.appendChild(tile);
  }
}

function buildKeyboard() {
  keyboardElement.innerHTML = '';
  KEY_ROWS.flat().forEach((key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.key = key;
    button.textContent = key === 'backspace' ? '⌫' : key === 'enter' ? '送出' : key.toUpperCase();
    if (key === 'enter' || key === 'backspace') button.className = 'wide';
    button.setAttribute('aria-label', key);
    button.addEventListener('click', () => handleKey(key));
    keyboardElement.appendChild(button);
  });
}

function updateStats() {
  document.querySelector('#streak').textContent = stats.streak;
  document.querySelector('#played').textContent = stats.played;
  document.querySelector('#win-rate').textContent = stats.played ? `${Math.round(stats.wins / stats.played * 100)}%` : '0%';
}

function paintCurrentGuess() {
  for (let index = 0; index < 5; index += 1) {
    const tile = boardElement.children[currentRow * 5 + index];
    tile.textContent = currentGuess[index] || '';
    tile.classList.toggle('filled', Boolean(currentGuess[index]));
  }
}

function evaluateGuess() {
  const result = Array(5).fill('absent');
  const remaining = answer.split('');
  [...currentGuess].forEach((letter, index) => {
    if (letter === answer[index]) { result[index] = 'correct'; remaining[index] = null; }
  });
  [...currentGuess].forEach((letter, index) => {
    if (result[index] === 'correct') return;
    const matchIndex = remaining.indexOf(letter);
    if (matchIndex !== -1) { result[index] = 'present'; remaining[matchIndex] = null; }
  });
  return result;
}

function submitGuess() {
  if (currentGuess.length !== 5) { setStatus('還需要一個字母。'); return; }
  if (!WORDS.has(currentGuess)) { setStatus('這個單字不在字典裡。'); return; }
  const result = evaluateGuess();
  [...currentGuess].forEach((letter, index) => {
    const tile = boardElement.children[currentRow * 5 + index];
    tile.classList.add('reveal', result[index]);
    tile.addEventListener('animationend', () => tile.classList.remove('reveal'), { once: true });
    if (result[index] === 'correct' || (result[index] === 'present' && keyStates[letter] !== 'correct')) keyStates[letter] = result[index];
    else if (!keyStates[letter]) keyStates[letter] = 'absent';
  });
  updateKeyboard();
  if (currentGuess === answer) finishGame(true);
  else if (currentRow === MAX_GUESSES - 1) finishGame(false);
  else { currentRow += 1; currentGuess = ''; setStatus('再來一猜。'); }
}

function finishGame(won) {
  gameOver = true;
  stats.played += 1;
  stats.wins += won ? 1 : 0;
  stats.streak = won ? stats.streak + 1 : 0;
  localStorage.setItem('wordle-stats', JSON.stringify(stats));
  updateStats();
  setStatus(won ? `漂亮！你用了 ${currentRow + 1} 次猜中。` : `今日答案是 ${answer.toUpperCase()}。`);
}

function updateKeyboard() {
  Object.entries(keyStates).forEach(([letter, state]) => {
    const key = keyboardElement.querySelector(`[data-key="${letter}"]`);
    if (key) key.className = state;
  });
}

function setStatus(message) { statusElement.textContent = message; }
function handleKey(key) {
  if (gameOver) return;
  if (key === 'enter') submitGuess();
  else if (key === 'backspace') { currentGuess = currentGuess.slice(0, -1); paintCurrentGuess(); }
  else if (/^[a-z]$/.test(key) && currentGuess.length < 5) { currentGuess += key; paintCurrentGuess(); }
}

function newGame() { window.location.reload(); }
document.addEventListener('keydown', (event) => { if (event.key === 'Backspace') handleKey('backspace'); else if (event.key === 'Enter') handleKey('enter'); else handleKey(event.key.toLowerCase()); });
document.querySelector('#new-game').addEventListener('click', newGame);
const helpDialog = document.querySelector('#help-dialog');
document.querySelector('#help-button').addEventListener('click', () => helpDialog.showModal());
document.querySelector('#close-help').addEventListener('click', () => helpDialog.close());
buildBoard();
buildKeyboard();
updateStats();
