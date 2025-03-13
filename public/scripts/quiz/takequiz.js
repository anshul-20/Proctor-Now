const questionContainer = document.querySelector(".quiz__question-container");
const prevBtn = document.querySelector(".quiz__prev-button");
const nextBtn = document.querySelector(".quiz__next-button");
const questionCount = document.querySelector(".quiz__question-count");
const goToQuestionContainer = document.querySelector(
  ".quiz__go-to-question__container"
);
const goToQuestionButton = document.querySelector(
  ".quiz__go-to-question__button"
);
const goToQuestionModal = document.querySelector(
  ".quiz__go-to-question__modal"
);
const goToQuestionContent = goToQuestionModal.querySelector(
  ".quiz__go-to-question__modal__content"
);
const goToQuestionCloseButton = document.querySelector(
  ".quiz__go-to-question__modal__close"
);
const timeContainer = document.querySelector(".quiz__time");
const quizStatsContainer = document.querySelector(".quiz__stats");
const submitBtn = document.querySelector(".quiz__submit-button");
let currentQuestionIndex = 0;
const userAnswersWithQuestion = questions.map((question) => ({
  ...question,
  userAnswer: -1,
}));

_examData.totalTimeTakenByUser = _examData.timeLimit * 60;

const createQuestionHtml = (question) => {
  return `
         
            <div class="quiz__question-container__question__container">
              <h1 class="quiz__question-container__question">Q${
                currentQuestionIndex + 1
              }- ${question.question}</h1>
            </div>

        
        <ol class="quiz__question-container__option__container">

        <li class="quiz__question-container__option quiz__question-container__option-a" onclick="handleUserAnswer(this)" id='0' style="background-color: ${
          question.userAnswer === 0 ? "hsl(166, 67%, 51%)" : "white"
        }">${question.options[0]}</li>
        <li class="quiz__question-container__option quiz__question-container__option-b" onclick="handleUserAnswer(this)" id='1' style="background-color: ${
          question.userAnswer === 1 ? "hsl(166, 67%, 51%)" : "white"
        }">${question.options[1]}</li>
        <li class="quiz__question-container__option quiz__question-container__option-c" onclick="handleUserAnswer(this)" id='2' style="background-color: ${
          question.userAnswer === 2 ? "hsl(166, 67%, 51%)" : "white"
        }">${question.options[2]}</li>
        <li class="quiz__question-container__option quiz__question-container__option-d" onclick="handleUserAnswer(this)" id='3' style="background-color: ${
          question.userAnswer === 3 ? "hsl(166, 67%, 51%)" : "white"
        }">${question.options[3]}</li>
        </ol>
    `;
};

const createQuizStats = (questions) => {
  const attempted = questions.filter((question) => question.userAnswer !== -1);
  return `
    <h3>Question ${currentQuestionIndex + 1} of ${questions.length}</h3>
    <h3>Attempted ${attempted.length} of ${questions.length}</h3>
  
  `;
};

const createGoToQuestionGrid = (questions, selectedQuestionIndex) => {
  return questions
    .map((question, index) => {
      return `<button class="quiz__go-to-question__button button" onclick="goToQuestion(this)" id=${index} style="border:2px solid ${
        selectedQuestionIndex === index ? "hsl(166, 67%, 51%)" : "black"
      };background-color:${
        question.userAnswer === -1 ? "white" : "hsl(166, 67%, 51%)"
      }">${index + 1}</button>`;
    })
    .join(" ");
};

const goToQuestion = (e) => {
  currentQuestionIndex = parseInt(e.id);
  goToQuestionModal.style.display = "none";
  injectQuestion(questions[currentQuestionIndex]);
};

const handleUserAnswer = (e) => {
  const currentQuestion = userAnswersWithQuestion[currentQuestionIndex];

  console.log(currentQuestion.correctAnswer);

  if (
    currentQuestion.userAnswer !== -1 &&
    currentQuestion.userAnswer === parseInt(e.id)
  ) {
    return;
  }

  userAnswersWithQuestion[currentQuestionIndex].userAnswer = parseInt(e.id);
  injectQuestion(userAnswersWithQuestion[currentQuestionIndex]);
};

const parseTime = (timeInSeconds) => {
  let h = Math.floor(timeInSeconds / 3600);
  let m = Math.floor((timeInSeconds % 3600) / 60);
  let s = Math.floor((timeInSeconds % 3600) % 60);

  if (h < 10) {
    h = `0${h}`;
  }
  if (m < 10) {
    m = `0${m}`;
  }
  if (s < 10) {
    s = `0${s}`;
  }

  return `${h}:${m}:${s}`;
};

const handleTime = () => {
  let timeRemaining = _examData.timeLimit * 60;
  const interval = setInterval(() => {
    timeRemaining -= 1;
    _examData.totalTimeTakenByUser--;
    const timeHtml = `
    <h4>${parseTime(timeRemaining)}</h4> 
    <progress class="progress is-primary" style="width:100%;background-color:gray;" value="${timeRemaining}" max="${
      _examData.timeLimit * 60
    }">15%</progress> 
    `;
    timeContainer.innerHTML = timeHtml;

    if (timeRemaining <= 0) {
      clearInterval(interval);
      submitQuiz(_examData, userAnswersWithQuestion);
    }
  }, 1000);
  timeContainer.innerHTML = parseTime(timeRemaining);
};

prevBtn.addEventListener("click", (e) => {
  if (currentQuestionIndex <= 0) {
    return console.log("don't have any questions (previous)");
  }

  currentQuestionIndex--;
  console.log(currentQuestionIndex);
  injectQuestion(userAnswersWithQuestion[currentQuestionIndex]);
});

nextBtn.addEventListener("click", (e) => {
  if (currentQuestionIndex >= questions.length - 1) {
    console.log("we don't have questions anymore");
    return;
  }

  currentQuestionIndex++;
  injectQuestion(userAnswersWithQuestion[currentQuestionIndex]);
  return;
});

goToQuestionButton.addEventListener("click", (e) => {
  goToQuestionContent.innerHTML = createGoToQuestionGrid(
    userAnswersWithQuestion,
    currentQuestionIndex
  );
  goToQuestionModal.style.display = "block";
});

goToQuestionCloseButton.addEventListener("click", (e) => {
  goToQuestionModal.style.display = "none";
});

const closeGoToQuestionModal = () => {
  goToQuestionModal.style.display = "none";
};

const injectQuestion = (question) => {
  questionContainer.innerHTML = createQuestionHtml(question);

  goToQuestionContent.innerHTML = createGoToQuestionGrid(
    userAnswersWithQuestion,
    currentQuestionIndex
  );
  quizStatsContainer.innerHTML = createQuizStats(userAnswersWithQuestion);
};

handleTime();
injectQuestion(userAnswersWithQuestion[currentQuestionIndex]);

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  swal({
    title: `Are you sure?`,
    icon: `warning`,
    buttons: true,
    dangerMode: true,
  }).then((willSubmit) => {
    if (!willSubmit) {
      return;
    }

    submitQuiz(_examData, userAnswersWithQuestion);
  });
});

function submitQuiz(_examData, userAnswersWithQuestion) {
  const data = {
    examId: _examData.id,
    totalTimeTakenByUser: _examData.totalTimeTakenByUser,
    userAnswers: userAnswersWithQuestion.map((question) => ({
      id: question.id,
      userAnswer: question.userAnswer,
    })),
  };

  fetch(`/home/quiz/report`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response) {
        window.location.href = response.url;
      }
    })
    .catch((err) => {
      console.log(err, "frontend");
    });
}
