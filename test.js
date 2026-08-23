function updateStats() {
  document.querySelector('#streak').textContent = stats.streak;
  document.querySelector('#played').textContent = stats.played;
  document.querySelector('#win-rate').textContent = stats.played ? `${Math.round(stats.wins / stats.played * 100)}%` : '0%';
}