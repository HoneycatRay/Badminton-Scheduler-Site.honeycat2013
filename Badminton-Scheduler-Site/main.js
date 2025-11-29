import { db } from './firebase-config.js';
import { ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 取得房間代碼
let roomCode = prompt("請輸入房間代碼（或留空自動生成）") || Math.random().toString(36).substr(2, 6);
const roomRef = ref(db, 'rooms/' + roomCode);

// 全域變數
let players = [];
let teams = [];
let courtCount = 1;
let currentMatchIndex = 0;

// 生成房間或讀取現有資料
get(roomRef).then(snapshot => {
  if (!snapshot.exists()) {
    set(roomRef, {
      players: [],
      teams: [],
      courts: {},
      currentMatchIndex: 0
    });
  } else {
    const data = snapshot.val();
    players = data.players || [];
    teams = data.teams || [];
    currentMatchIndex = data.currentMatchIndex || 0;
    courtCount = Object.keys(data.courts || {}).length || 1;
    renderTeams();
    renderCourts(data.courts || {});
  }
});

// 兩兩分組
window.generateTeams = function() {
  let input = document.getElementById("playerList").value;
  players = input.split(/\n+/).map(x => x.trim()).filter(x => x);

  teams = [];
  for (let i = 0; i < players.length; i += 2) {
    teams.push(players.slice(i, i + 2));
  }

  courtCount = parseInt(document.getElementById("courtCount").value);
  let courts = {};
  for (let i = 1; i <= courtCount; i++) {
    courts['court'+i] = {teamA: teams[(i-1)*2] ? teams[(i-1)*2].join(" & ") : "", 
                          teamB: teams[(i-1)*2+1] ? teams[(i-1)*2+1].join(" & ") : "", 
                          winner: null};
  }

  // 更新 Firebase
  set(roomRef, {
    players: players,
    teams: teams,
    courts: courts,
    currentMatchIndex: 0
  });

  renderTeams();
  renderCourts(courts);
};

// 跳過分組
window.skipGrouping = function() {
  alert("已跳過分組");
};

// 記錄勝負
window.recordWinner = function(courtKey, winnerTeam) {
  const courtRef = ref(db, 'rooms/' + roomCode + '/courts/' + courtKey);
  update(courtRef, { winner: winnerTeam });

  // 自動換下一組（簡單輪組）
  currentMatchIndex++;
  update(ref(db, 'rooms/' + roomCode), { currentMatchIndex });
};

// 監聽 Firebase 更新
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  players = data.players || [];
  teams = data.teams || [];
  currentMatchIndex = data.currentMatchIndex || 0;

  renderTeams();
  renderCourts(data.courts || {});
});

// 渲染分組
function renderTeams() {
  document.getElementById("teams").innerHTML =
    teams.map((t, i) => `<div>隊 ${i+1}: ${t.join(" & ")}</div>`).join("");
}

// 渲染場地
function renderCourts(courts) {
  let html = "";
  for (const key in courts) {
    let c = courts[key];
    html += `<div>
      <strong>${key}</strong>：
      ${c.teamA} vs ${c.teamB} |
      勝者：${c.winner || "尚未"} 
      <button onclick="recordWinner('${key}','${c.teamA}')">${c.teamA} 勝</button>
      <button onclick="recordWinner('${key}','${c.teamB}')">${c.teamB} 勝</button>
    </div>`;
  }
  document.getElementById("courts").innerHTML = html;
}
