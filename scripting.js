const arena = document.getElementById('arena');
const arenaIcon = document.getElementById('arena-icon');
const arenaMsg = document.getElementById('arena-msg');
const arenaSub = document.getElementById('arena-sub');
const statLast = document.getElementById('stat-last');
const statBest = document.getElementById('stat-best');
const statAvg = document.getElementById('stat-avg');
const historyRow = document.getElementById('history-row');
const btnReset = document.getElementById('btn-reset');
 
const ROUNDS = 5;
const MIN_WAIT = 1000;
const MAX_WAIT = 4000;
 
let state = 'idle';
let startTime = null;
let waitTimer = null;
let times = [];
let history = [];
 
function setState(s) {
  state = s;
  arena.className = `state-${s}`;
}
 
function formatMs(ms) {
  return ms < 1000 ? `${ms}` : `${(ms / 1000).toFixed(2)}s`;
}
 
function updateStats() {
  if (times.length === 0) return;
 
  const last = times[times.length - 1];
  const best = Math.min(...times);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
 
  statLast.textContent = last;
  statBest.textContent = best;
  statAvg.textContent = avg;
 
  statLast.classList.toggle('highlight', true);
  setTimeout(() => statLast.classList.remove('highlight'), 600);
}
 
function addHistoryDot(ms) {
  history.push(ms);
  const dot = document.createElement('div');
  dot.className = 'history-dot';
  dot.textContent = ms < 1000 ? `${ms}` : `${(ms / 1000).toFixed(1)}`;
 
  if (ms < 250) dot.classList.add('fast');
  else if (ms < 400) dot.classList.add('ok');
  else dot.classList.add('slow');
 
  historyRow.appendChild(dot);
}
 
function showIdle() {
  setState('idle');
  arenaIcon.textContent = '⚡';
  arenaMsg.textContent = 'Click to start';
  arenaSub.textContent = `Round ${times.length + 1} of ${ROUNDS}`;
}
 
function showWaiting() {
  setState('waiting');
  arenaIcon.textContent = '👁';
  arenaMsg.textContent = 'Wait...';
  arenaSub.textContent = 'Don\'t click yet';
 
  const delay = MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT);
  waitTimer = setTimeout(showGo, delay);
}
 
function showGo() {
  setState('go');
  arenaIcon.textContent = '🟢';
  arenaMsg.textContent = 'NOW!';
  arenaSub.textContent = 'Click as fast as you can';
  startTime = performance.now();
  arena.classList.add('flash');
  setTimeout(() => arena.classList.remove('flash'), 150);
}
 
function showResult(ms) {
  setState('result');
 
  const rating = ms < 200 ? '⚡ Superhuman' : ms < 300 ? '🔥 Fast' : ms < 450 ? '👍 Good' : '🐢 Slow';
 
  arenaIcon.textContent = '';
 
  const timeEl = document.createElement('div');
  timeEl.className = 'result-time';
  timeEl.textContent = ms;
 
  const unitEl = document.createElement('div');
  unitEl.className = 'result-unit';
  unitEl.textContent = 'milliseconds';
 
  arenaMsg.innerHTML = '';
  arenaMsg.appendChild(timeEl);
  arenaMsg.appendChild(unitEl);
 
  arenaSub.textContent = `${rating} — click to continue`;
}
 
function showFinal() {
  setState('result');
  const best = Math.min(...times);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
 
  arenaIcon.textContent = '🏁';
  arenaMsg.innerHTML = `<div style="font-size: clamp(24px,5vw,36px); color: var(--accent)">Done!</div>`;
  arenaSub.innerHTML = `Best: <strong style="color:var(--accent)">${best}ms</strong> &nbsp;·&nbsp; Avg: <strong>${avg}ms</strong><br><span style="font-size:10px;opacity:0.5">Click reset to play again</span>`;
  btnReset.style.display = 'inline-block';
}
 
function showEarlyPenalty() {
  clearTimeout(waitTimer);
  setState('waiting');
  arenaIcon.textContent = '❌';
  arenaMsg.textContent = 'Too early!';
  arenaSub.textContent = 'Patience... click to retry';
  arena.classList.add('early-flash');
  setTimeout(() => arena.classList.remove('early-flash'), 350);
  state = 'penalty';
}
 
function handleClick() {
  if (state === 'idle') {
    showWaiting();
  } else if (state === 'waiting') {
    showEarlyPenalty();
  } else if (state === 'penalty') {
    showWaiting();
  } else if (state === 'go') {
    const ms = Math.round(performance.now() - startTime);
    times.push(ms);
    addHistoryDot(ms);
    updateStats();
 
    if (times.length >= ROUNDS) {
      showResult(ms);
      setTimeout(showFinal, 1400);
    } else {
      showResult(ms);
    }
  } else if (state === 'result') {
    if (times.length < ROUNDS) {
      showWaiting();
    }
  }
}
 
function reset() {
  times = [];
  history = [];
  historyRow.innerHTML = '';
  statLast.textContent = '--';
  statBest.textContent = '--';
  statAvg.textContent = '--';
  btnReset.style.display = 'none';
  arenaMsg.innerHTML = '';
  clearTimeout(waitTimer);
  showIdle();
}
 
arena.addEventListener('click', handleClick);
btnReset.addEventListener('click', (e) => {
  e.stopPropagation();
  reset();
});
 
showIdle();