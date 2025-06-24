// ================================
// Dados do jogo
// ================================
const questionsEasy = [
  {
    question: "Quem foi o primeiro homem criado por Deus?",
    options: ["Abel", "Caim", "Adão", "Noé"],
    answer: 2
  },
  {
    question: "Qual o nome da primeira mulher?",
    options: ["Sara", "Rebeca", "Eva", "Raquel"],
    answer: 2
  },
  {
    question: "Quem construiu a arca para sobreviver ao dilúvio?",
    options: ["Abraão", "Moisés", "Noé", "Davi"],
    answer: 2
  }
];

const questionsHard = [
  {
    question: "Qual apóstolo foi conhecido como 'o discípulo amado'?",
    options: ["Pedro", "João", "Tiago", "Paulo"],
    answer: 1
  },
  {
    question: "Quantos dias e noites choveu no dilúvio?",
    options: ["20", "30", "40", "50"],
    answer: 2
  },
  {
    question: "Quem foi lançado na cova dos leões?",
    options: ["Elias", "Daniel", "José", "Davi"],
    answer: 1
  }
];

const surprises = [
  { name: "Bênção Divina", description: "Sua equipe ganha 200 pontos.", effect: (team) => team.score += 200 },
  { name: "Prova de Fé", description: "Sua equipe perde 100 pontos.", effect: (team) => team.score -= 100 },
  { name: "Coleta Especial", description: "Escolha uma equipe para coletar 150 pontos.", chooseTarget: true, effect: (target) => target.score += 150 },
  { name: "O Bom Samaritano", description: "Escolha uma equipe para doar 150 pontos seus.", chooseTarget: true, effect: (target, team) => { team.score -= 150; target.score += 150; } },
  { name: "Oferta Voluntária", description: "Dê 100 pontos para quem tiver menos pontos.", effect: (team, teams) => {
    const minTeam = teams.reduce((min, t) => (t.score < min.score ? t : min), teams[0]);
    if (minTeam !== team) {
      team.score -= 100;
      minTeam.score += 100;
    }
  }},
  { name: "Jubileu", description: "Troque sua pontuação com quem estiver em primeiro lugar.", effect: (team, teams) => {
    const maxTeam = teams.reduce((max, t) => (t.score > max.score ? t : max), teams[0]);
    const temp = team.score;
    team.score = maxTeam.score;
    maxTeam.score = temp;
  }},
];

// ================================
// Variáveis do Jogo
// ================================
let teams = [];
let currentTeamIndex = 0;
let currentRound = 1;
let totalRounds = 10;
let currentQuestion = {};
let usedSurprises = {};
let timerInterval;
let timeLeft = 90;
let questionSet = [];

// ================================
// Elementos
// ================================
const rulesScreen = document.getElementById('rules-screen');
const teamsScreen = document.getElementById('teams-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const modal = document.getElementById('modal');

const scoreboard = document.getElementById('scoreboard');
const turnIndicator = document.getElementById('turn-indicator');
const roundCounter = document.getElementById('round-counter');
const timerEl = document.getElementById('timer');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackMessage = document.getElementById('feedback-message');

const winnerAnnouncement = document.getElementById('winner-announcement');
const finalScores = document.getElementById('final-scores');

const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalOptions = document.getElementById('modal-options');

// ================================
// Funções de Tela
// ================================
function showScreen(screen) {
  [rulesScreen, teamsScreen, difficultyScreen, gameScreen, endScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// ================================
// Tela de Equipes
// ================================
document.getElementById('go-to-teams-btn').onclick = () => showScreen(teamsScreen);
document.getElementById('back-to-rules-btn').onclick = () => showScreen(rulesScreen);
document.getElementById('back-to-teams-btn').onclick = () => showScreen(teamsScreen);

document.getElementById('add-team-btn').onclick = () => {
  const name = document.getElementById('team-name-input').value.trim();
  if (name && teams.length < 5) {
    teams.push({ name, score: 0 });
    updateTeamsList();
    document.getElementById('team-name-input').value = '';
  }
};

function updateTeamsList() {
  const list = document.getElementById('teams-list');
  list.innerHTML = teams.map(t => `<p>- ${t.name}</p>`).join('');
  document.getElementById('continue-to-difficulty-btn').disabled = teams.length < 2;
}

document.getElementById('continue-to-difficulty-btn').onclick = () => showScreen(difficultyScreen);

// ================================
// Tela de Dificuldade
// ================================
document.getElementById('easy-btn').onclick = () => startGame('easy');
document.getElementById('hard-btn').onclick = () => startGame('hard');

function startGame(difficulty) {
  questionSet = [...(difficulty === 'easy' ? questionsEasy : questionsHard)];
  showScreen(gameScreen);
  startRound();
}

// ================================
// Jogo Principal
// ================================
function startRound() {
  if (currentRound > totalRounds) {
    endGame();
    return;
  }
  updateScoreboard();
  feedbackMessage.textContent = '';
  roundCounter.textContent = `Rodada ${currentRound}/${totalRounds}`;
  currentTeamIndex = (currentRound - 1) % teams.length;
  startTurn();
}

function startTurn() {
  const team = teams[currentTeamIndex];
  turnIndicator.textContent = `Vez da equipe: ${team.name}`;
  startTimer();

  currentQuestion = questionSet[Math.floor(Math.random() * questionSet.length)];
  questionText.textContent = currentQuestion.question;

  optionsContainer.innerHTML = '';
  currentQuestion.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(idx, btn);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selected, btn) {
  stopTimer();
  const correct = selected === currentQuestion.answer;
  const team = teams[currentTeamIndex];

  if (correct) {
    feedbackMessage.textContent = 'Correto!';
    team.score += 100;
    btn.classList.add('bg-green-600');
  } else {
    feedbackMessage.textContent = 'Incorreto!';
    btn.classList.add('bg-red-600');
    optionsContainer.children[currentQuestion.answer].classList.add('bg-green-600');
  }

  disableOptions();
  setTimeout(nextTurn, 2000);
}

function nextTurn() {
  currentTeamIndex++;
  if (currentTeamIndex >= teams.length) {
    currentTeamIndex = 0;
    currentRound++;
  }
  startRound();
}

function disableOptions() {
  Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);
}

// ================================
// Surpresa
// ================================
document.getElementById('surprise-card-btn').onclick = () => {
  const team = teams[currentTeamIndex];
  if (usedSurprises[team.name]) {
    feedbackMessage.textContent = 'Surpresa já utilizada!';
    return;
  }

  const surprise = surprises[Math.floor(Math.random() * surprises.length)];
  usedSurprises[team.name] = true;

  modalTitle.textContent = `Surpresa: ${surprise.name}`;
  modalDescription.textContent = surprise.description;
  modalOptions.innerHTML = '';

  if (surprise.chooseTarget) {
    teams.forEach(t => {
      if (t !== team) {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = t.name;
        btn.onclick = () => {
          surprise.effect(t, team);
          closeModal();
          nextTurn();
        };
        modalOptions.appendChild(btn);
      }
    });
  } else {
    surprise.effect(team, teams);
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'OK';
    btn.onclick = () => {
      closeModal();
      nextTurn();
    };
    modalOptions.appendChild(btn);
  }

  modal.classList.remove('hidden');
};

document.getElementById('modal-close').onclick = closeModal;
function closeModal() {
  modal.classList.add('hidden');
}

// ================================
// Timer
// ================================
function startTimer() {
  timeLeft = 90;
  timerEl.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      feedbackMessage.textContent = 'Tempo esgotado!';
      disableOptions();
      setTimeout(nextTurn, 2000);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ================================
// Scoreboard
// ================================
function updateScoreboard() {
  scoreboard.innerHTML = teams.map(t => `
    <div class="card p-4">
      <h3 class="font-bold">${t.name}</h3>
      <p>${t.score} pts</p>
    </div>
  `).join('');
}

// ================================
// Fim do jogo
// ================================
function endGame() {
  showScreen(endScreen);
  const maxScore = Math.max(...teams.map(t => t.score));
  const winners = teams.filter(t => t.score === maxScore);

  if (winners.length === 1) {
    winnerAnnouncement.textContent = `Vencedor: ${winners[0].name}`;
  } else {
    winnerAnnouncement.textContent = `Empate entre: ${winners.map(w => w.name).join(', ')}`;
  }

  finalScores.innerHTML = teams.map(t => `<p>${t.name}: ${t.score} pts</p>`).join('');
}

// ================================
// Reiniciar
// ================================
document.getElementById('restart-btn').onclick = () => {
  teams.forEach(t => t.score = 0);
  currentRound = 1;
  usedSurprises = {};
  showScreen(teamsScreen);
};
