// ===========================
// Banco de Perguntas
// ===========================
const questionsEasy = [
  { question: "Quem foi o primeiro homem criado por Deus?", options: ["Abel", "Caim", "Adão", "Noé"], answer: 2 },
  { question: "Qual o nome da primeira mulher?", options: ["Sara", "Rebeca", "Eva", "Raquel"], answer: 2 },
  { question: "Quem construiu a arca para sobreviver ao dilúvio?", options: ["Abraão", "Moisés", "Noé", "Davi"], answer: 2 },
  { question: "Quem foi engolido por um grande peixe?", options: ["Jonas", "Pedro", "Elias", "Paulo"], answer: 0 },
  { question: "Quem recebeu os Dez Mandamentos?", options: ["Abraão", "Moisés", "Josué", "Salomão"], answer: 1 },
  { question: "Quem venceu o gigante Golias?", options: ["Elias", "Davi", "Saul", "Sansão"], answer: 1 },
  { question: "Quem interpretou os sonhos do faraó?", options: ["Moisés", "José", "Daniel", "Samuel"], answer: 1 },
  { question: "Quantos livros tem o Novo Testamento?", options: ["39", "27", "66", "24"], answer: 1 },
  { question: "Quem derrubou os muros de Jericó?", options: ["Josué", "Moisés", "Davi", "Abraão"], answer: 0 },
  { question: "Quantos dias Deus levou para criar o mundo?", options: ["7", "6", "5", "8"], answer: 1 }
];

const questionsHard = [
  { question: "Quem escreveu o livro de Apocalipse?", options: ["Paulo", "João", "Pedro", "Tiago"], answer: 1 },
  { question: "Quem traiu Jesus com um beijo?", options: ["Pedro", "Judas", "João", "Tomé"], answer: 1 },
  { question: "Quem foi lançado na cova dos leões?", options: ["Elias", "Daniel", "José", "Davi"], answer: 1 },
  { question: "Quantos dias e noites choveu no dilúvio?", options: ["20", "30", "40", "50"], answer: 2 },
  { question: "Qual profeta desafiou os profetas de Baal?", options: ["Elias", "Eliseu", "Jeremias", "Isaías"], answer: 0 },
  { question: "Quem foi arrebatado sem morrer?", options: ["Moisés", "Elias", "Enoque", "Josué"], answer: 2 },
  { question: "Onde Jesus fez seu primeiro milagre?", options: ["Belém", "Jerusalém", "Canaã", "Galileia"], answer: 2 },
  { question: "Qual era o nome da mãe de Samuel?", options: ["Ana", "Rute", "Maria", "Sara"], answer: 0 },
  { question: "Quem foi o rei mais sábio da Bíblia?", options: ["Davi", "Salomão", "Saul", "Josias"], answer: 1 },
  { question: "Quantos livros há no Antigo Testamento?", options: ["27", "39", "66", "40"], answer: 1 }
];

// ===========================
// Surpresas
// ===========================
const surprises = [
  { name: "Bênção Divina", description: "Sua equipe ganha 200 pontos.", effect: (team) => team.score += 200 },
  { name: "Prova de Fé", description: "Sua equipe perde 100 pontos.", effect: (team) => team.score -= 100 },
  { name: "Coleta Especial", description: "Escolha uma equipe para ganhar 150 pontos.", chooseTarget: true, effect: (target) => target.score += 150 },
  { name: "O Bom Samaritano", description: "Doe 150 pontos seus para outra equipe.", chooseTarget: true, effect: (target, team) => { team.score -= 150; target.score += 150; }},
  { name: "Oferta Voluntária", description: "Dê 100 pontos para quem tiver menos pontos.", effect: (team, teams) => {
    const minTeam = teams.reduce((min, t) => t.score < min.score ? t : min, teams[0]);
    if (minTeam !== team) {
      team.score -= 100;
      minTeam.score += 100;
    }
  }},
  { name: "Jubileu", description: "Troque sua pontuação com quem estiver em primeiro.", effect: (team, teams) => {
    const maxTeam = teams.reduce((max, t) => t.score > max.score ? t : max, teams[0]);
    const temp = team.score;
    team.score = maxTeam.score;
    maxTeam.score = temp;
  }}
];

// ===========================
// Variáveis Globais
// ===========================
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

// ===========================
// Utilitários
// ===========================
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ===========================
// Gerar Fila de Perguntas
// ===========================
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

// ===========================
// Navegação de Telas
// ===========================
function showScreen(id) {
  ['rules-screen', 'teams-screen', 'difficulty-screen', 'game-screen', 'end-screen'].forEach(screen => {
    document.getElementById(screen).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

// ===========================
// Começar Jogo
// ===========================
function startGame(selectedDifficulty) {
  difficulty = selectedDifficulty;
  currentRound = 1;
  usedSurprises = {};
  questionQueue = generateQuestionQueue();
  teamTurnIndex = 0;
  questionIndex = 0;
  showScreen('game-screen');
  startTurn();
}

// ===========================
// Turno de Perguntas
// ===========================
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
    btn.classList.add('bg-green-600');
  } else {
    document.getElementById('feedback-message').textContent = '❌ Errado!';
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

// ===========================
// Surpresa
// ===========================
document.getElementById('surprise-card-btn').onclick = () => {
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

// ===========================
// Timer
// ===========================
function startTimer() {
  timeLeft = 90;
  document.getElementById('timer').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      stopTimer();
      document.getElementById('feedback-message').textContent = '⏰ Tempo esgotado!';
      disableOptions();
      setTimeout(() => nextTurn(), 2000);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ===========================
// Scoreboard
// ===========================
function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = teams.map(team => `
    <div class="card p-4">
      <h3 class="font-bold">${team.name}</h3>
      <p>${team.score} pts</p>
    </div>
  `).join('');
}

// ===========================
// Fim do Jogo
// ===========================
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
  teams.forEach(t => t.score = 0);
  currentRound = 1;
  usedSurprises = {};
  showScreen('teams-screen');
};
