const questions = [
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
    question: "Quem construiu uma arca para sobreviver ao dilúvio?",
    options: ["Abraão", "Moisés", "Noé", "Davi"],
    answer: 2
  },
];

const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const questionSection = document.getElementById('question-section');
const resultSection = document.getElementById('result-section');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreText = document.getElementById('score-text');

let currentQuestionIndex = 0;
let score = 0;

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', startGame);

function startGame() {
  startButton.classList.add('hidden');
  resultSection.classList.add('hidden');
  questionSection.classList.remove('hidden');
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  optionsContainer.innerHTML = '';

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('btn');
    button.addEventListener('click', () => selectAnswer(index));
    optionsContainer.appendChild(button);
  });

  nextButton.classList.add('hidden');
}

function selectAnswer(index) {
  const question = questions[currentQuestionIndex];
  const correct = index === question.answer;

  Array.from(optionsContainer.children).forEach((btn, i) => {
    btn.disabled = true;
    if (i === question.answer) {
      btn.classList.add('bg-green-600');
    } else if (i === index) {
      btn.classList.add(correct ? 'bg-green-600' : 'bg-red-600');
    }
  });

  if (correct) score += 1;

  nextButton.classList.remove('hidden');
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endGame();
  }
}

function endGame() {
  questionSection.classList.add('hidden');
  resultSection.classList.remove('hidden');
  scoreText.textContent = `Você acertou ${score} de ${questions.length} perguntas!`;
  startButton.classList.remove('hidden');
}
