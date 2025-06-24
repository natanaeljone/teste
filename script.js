// ======================
// Sons
// ======================
const clickSound = new Audio('assets/click.mp3');
const correctSound = new Audio('assets/correct.mp3');
const errorSound = new Audio('assets/error.mp3');

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

// ======================
// Dados do jogo
// ======================
const questionsEasy = [...];  // (Aqui vai o banco de perguntas fáceis)
const questionsHard = [...];  // (Aqui vai o banco de perguntas difíceis)

const surprises = [...];      // (Aqui vai o banco de surpresas)

// ======================
// Variáveis Globais
// ======================
let teams = [];
let currentRound = 1;
const totalRounds = 10;
let difficulty = 'easy';
let questionQueue = [];
let usedSurprises = {};
let teamTurnIndex = 0;
let questionIndex = 0;
let timerInterval;
let timeLeft = 90;

// ======================
// Navegação de Telas
// ======================
document.getElementById('go-to-teams-btn').onclick = () => {
  playSound(clickSound);
  showScreen('teams-screen');
};

document.getElementById('back-to-rules-btn').onclick = () => {
  playSound(clickSound);
  showScreen('rules-screen');
};

document.getElementById('back-to-teams-btn').onclick = () => {
  playSound(clickSound);
  showScreen('teams-screen');
};

document.getElementById('continue-to-difficulty-btn').onclick = () => {
  playSound(clickSound);
  showScreen('difficulty-screen');
};

// ======================
// Adicionar Equipes
// ======================
document.getElementById('add-team-btn').onclick = () => {
  playSound(clickSound);
  const name = document.getElementById('team-name-input').value.trim();
  if (name && teams.length < 5) {
    teams.push({ name, score: 0 });
    updateTeamsList();
    document.getElementById('team-name-input').value = '';
  }
};

function updateTeamsList() {
  const list = document.getElementById('teams-list');
  list.innerHTML = teams.map(t => `<p>✔️ ${t.name}</p>`).join('');
  document.getElementById('continue-to-difficulty-btn').disabled = teams.length < 2;
}

// ======================
// Escolha da Dificuldade
// ======================
document.getElementById('easy-btn').onclick = () => startGame('easy');
document.getElementById('hard-btn').onclick = () => startGame('hard');

// ======================
// Funções Principais
// ======================
function showScreen(id) {
  ['rules-screen', 'teams-screen', 'difficulty-screen', 'game-screen', 'end-screen'].forEach(screen => {
    document.getElementById(screen).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function startGame(selectedDifficulty) {
  playSound(clickSound);
  difficulty = selectedDifficulty;
  currentRound = 1;
  usedSurprises = {};
  questionQueue = generateQuestionQueue();
  teamTurnIndex = 0;
  questionIndex = 0;
  showScreen('game-screen');
  startTurn();
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function generateQuestionQueue() {
  const questionSet = difficulty === 'easy' ? [...questionsEasy] : [...questionsHard];
  const queue = [];

  for (let round = 0; round < totalRounds; round++) {
    const availableQuestions = shuffle([...questionSet]);
    const roundData = teams.map(team => ({
      team,
      questions: availableQuestions.splice(0, 3)
    }));
    queue.push(roundData);
  }
  return queue;
}

// ======================
// Controle de Turno
// ======================
function startTurn() {
  if (currentRound > totalRounds) {
    return endGame();
  }

  const round = questionQueue[currentRound - 1];
  const teamData = round[teamTurnIndex];
  const team = teamData.team;
  const question = teamData.questions[questionIndex];

  updateScoreboard();
  document.getElementById('turn-indicator').textContent = `Vez da equipe: ${team.name}`;
  document.getElementById('round-counter').textContent = `Rodada ${currentRound}/${totalRounds}`;
  document.getElementById('feedback-message').textContent = '';

  startTimer();

  document.getElementById('question-text').textContent = question.question;
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

  question.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(idx, question, btn, team);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selected, question, btn, team) {
  stopTimer();
  const correct = selected === question.answer;

  if (correct) {
    team.score += 100;
    document.getElementById('feedback-message').textContent = '✔️ Correto!';
    playSound(correctSound);
    btn.classList.add('bg-green-600');
  } else {
    document.getElementById('feedback-message').textContent = '❌ Errado!';
    playSound(errorSound);
    btn.classList.add('bg-red-600');
    const correctBtn = Array.from(document.getElementById('options-container').children)[question.answer];
    correctBtn.classList.add('bg-green-600');
  }

  disableOptions();
  setTimeout(() => nextTurn(), 2000);
}

function nextTurn() {
  teamTurnIndex++;

  if (teamTurnIndex >= teams.length) {
    teamTurnIndex = 0;
    questionIndex++;

    if (questionIndex >= 3) {
      questionIndex = 0;
      currentRound++;
      if (currentRound > totalRounds) {
        return endGame();
      }
    }
  }

  startTurn();
}

function disableOptions() {
  Array.from(document.getElementById('options-container').children).forEach(btn => btn.disabled = true);
}

// ======================
// Surpresa
// ======================
document.getElementById('surprise-card-btn').onclick = () => {
  playSound(clickSound);
  const round = questionQueue[currentRound - 1];
  const team = round[teamTurnIndex].team;

  if (usedSurprises[team.name]) {
    document.getElementById('feedback-message').textContent = '🎁 Surpresa já usada!';
    return;
  }

  const surprise = surprises[Math.floor(Math.random() * surprises.length)];
  usedSurprises[team.name] = true;

  openModal(surprise, team);
};

function openModal(surprise, team) {
  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');
  document.getElementById('modal-title').textContent = `🎁 ${surprise.name}`;
  document.getElementById('modal-description').textContent = surprise.description;
  const modalOptions = document.getElementById('modal-options');
  modalOptions.innerHTML = '';

  if (surprise.chooseTarget) {
    teams.forEach(t => {
      if (t !== team) {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = t.name;
        btn.onclick = () => {
          surprise.effect(t, team, teams);
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
}

document.getElementById('modal-close').onclick = closeModal;
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ======================
// Timer
// ======================
function startTimer() {
  timeLeft = 90;
  document.getElementById('timer').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      stopTimer();
      document.getElementById('feedback-message').textContent = '⏰ Tempo esgotado!';
      playSound(errorSound);
      disableOptions();
      setTimeout(() => nextTurn(), 2000);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ======================
// Scoreboard
// ======================
function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = teams.map(team => `
    <div class="card p-4 animate-fade">
      <h3 class="font-bold">${team.name}</h3>
      <p>${team.score} pts</p>
    </div>
  `).join('');
}

// ======================
// Fim do Jogo
// ======================
function endGame() {
  showScreen('end-screen');
  const maxScore = Math.max(...teams.map(t => t.score));
  const winners = teams.filter(t => t.score === maxScore);
  document.getElementById('winner-announcement').textContent = winners.length === 1
    ? `🏆 Vencedor: ${winners[0].name}`
    : `🏆 Empate entre: ${winners.map(w => w.name).join(', ')}`;
  document.getElementById('final-scores').innerHTML = teams.map(t => `<p>${t.name}: ${t.score} pts</p>`).join('');
}

document.getElementById('restart-btn').onclick = () => {
  playSound(clickSound);
  teams.forEach(t => t.score = 0);
  currentRound = 1;
  usedSurprises = {};
  showScreen('teams-screen');
};
