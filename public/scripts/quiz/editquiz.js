const addQuestionBtn = document.querySelector(".question__add-button");
const editQuizQuestionsContainer = document.querySelector(
  ".edit-quiz__questions"
);

const checkNoOfQuestions = () => {
  return [...document.querySelectorAll(".quiz-questions__container")].length;
};
const removedQuestions = [];

const getQuestionHtml = (question) => {
  const isCorrectAnswer = (index) => question.correctAnswer === index;
  console.log(question.id);
  const html = `
    <input
      type="text"
      placeholder="enter a question"
      name="question"
      class="quiz-questions__question"
      value='${question.question}'
      required
    />
    
    <input
      type="text"
      placeholder="option 1"
      name="option"
      class="quiz-questions__option"
      value='${question.options[0]}'
      required
    />

    <input
      type="text"
      placeholder="option 2"
      name="option"
      class="quiz-questions__option"
      
      value='${question.options[1]}'
      required
    />
    <input
      type="text"
      placeholder="option 3"
      name="option"
      class="quiz-questions__option"
      value='${question.options[2]}'
      required
    />
    <input
      type="text"
      placeholder="option 4"
      name="option"
      class="quiz-questions__option"
      value='${question.options[3]}'
      required
    />
    <select required name="option-correct"
    placeholder="correct option"
    class="quiz-questions__correct-answer">
      <option value="0" selected=${isCorrectAnswer(0) ? true : false}>a</option>
      <option value="1" selected=${isCorrectAnswer(1) ? true : false}>b</option>
      <option value="2" selected=${isCorrectAnswer(2) ? true : false}>c</option>
      <option value="3" selected=${isCorrectAnswer(3) ? true : false}>d</option>
    </select>

    <button onclick="removeQuestion(this)" type="button" id='${
      question.id
    }'>remove</button>
    
   
`;

  return html;
};

const addAllStoredQuestions = () => {
  questions.map((question) => {
    const div = document.createElement("div");
    div.classList.add(
      ...[
        "quiz-questions__container",
        "quiz-questions__container--stored-question",
        `quiz-questions__container--${question.id}`,
      ]
    );

    div.id = question.id;
    console.log("allallstoredQuestions", question.id);

    div.innerHTML = getQuestionHtml(question);
    editQuizQuestionsContainer.appendChild(div);
  });
};

addQuestionBtn.addEventListener("click", (e) => {
  const clientQuestionId = window.crypto.randomUUID();
  const div = document.createElement("div");
  div.classList.add(
    ...[
      "quiz-questions__container",
      "quiz-questions__container--new-question",
      `quiz-questions__container--${clientQuestionId}`,
    ]
  );
  div.id = clientQuestionId;
  div.innerHTML = getQuestionHtml({
    id: clientQuestionId,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  editQuizQuestionsContainer.appendChild(div);
});

function removeQuestion(e) {
  if (checkNoOfQuestions() <= 1) {
    return;
  }

  const container = document.querySelector(
    `.quiz-questions__container--${e.id}`
  );

  const question = container.querySelector(".quiz-questions__question").value;
  const options = [...container.querySelectorAll(".quiz-questions__option")];
  const correctAnswerIndex = parseInt(
    container.querySelector(".quiz-questions__correct-answer").value
  );
  const correctAnswer = options[correctAnswerIndex].value;
  if (
    container.classList.contains("quiz-questions__container--stored-question")
  ) {
    removedQuestions.push({
      id: e.id,
      question,
      correctAnswer,
      correctAnswerIndex,
      options: options.map((option) => option.value),
    });
  }

  container.remove();
  console.log(removedQuestions);
}

const getAllQuizDetails = () => {
  const quizForm = document.querySelector(".edit-quiz");
  const title = quizForm.querySelector(".edit-quiz__title").value;
  const description = quizForm.querySelector(".edit-quiz__description").value;
  const startingDate = quizForm.querySelector(
    ".edit-quiz__starting-date"
  ).value;
  const endingDate = quizForm.querySelector(".edit-quiz__ending-date").value;
  const timeLimit = quizForm.querySelector(".edit-quiz__time-limit").value;
  const negativeMarksPerQuestion = quizForm.querySelector(
    ".edit-quiz__negative-marks-per-question"
  ).value;
  const marksPerQuestion = quizForm.querySelector(
    ".edit-quiz__marks-per-question"
  ).value;
  const subject = quizForm.querySelector(".edit-quiz__subject").value;
  const questionContainer = [
    ...document.querySelectorAll(".quiz-questions__container"),
  ];

  const questions = questionContainer.map((questionDiv) => {
    const question = questionDiv.querySelector(
      ".quiz-questions__question"
    ).value;
    const options = [
      ...questionDiv.querySelectorAll(".quiz-questions__option"),
    ];
    const correctAnswerIndex = parseInt(
      questionDiv.querySelector(".quiz-questions__correct-answer").value
    );
    const correctAnswer = options[correctAnswerIndex].value;
    const isNewQuestion = questionDiv.classList.contains(
      "quiz-questions__container--new-question"
    );

    return {
      id: window.crypto.randomUUID(),
      question,
      options: options.map((option) => option.value),
      correctAnswer,
      correctAnswerIndex,
      isNewQuestion,
    };
  });

  console.log(quizForm);

  const quiz = {
    id: quizForm.id,
    title,
    description,
    questions,
    subject,
    negativeMarksPerQuestion,
    marksPerQuestion,
    startingDate,
    endingDate,
    timeLimit,
    removedQuestions,
  };

  return quiz;
};

addAllStoredQuestions();

const quizForm = document.querySelector(".edit-quiz");

quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const quizDetails = getAllQuizDetails();

  console.log(quizDetails);
  const response = await fetch("/quiz/edit/callback", {
    method: "POST",
    body: JSON.stringify(quizDetails),
    headers: {
      "content-type": "application/json",
    },
  });

  if (response) {
    window.location.href = response.url;
  }
});
