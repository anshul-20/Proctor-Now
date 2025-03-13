const addButton = document.querySelector(".question__add-button");
const questionContainer = document.querySelector(".quiz-questions");
const quizForm = document.querySelector(".add-quiz");

const questionsHTML = `


      <div class="field is-vertical">
          <label class="label" for="quiz-questions__question-input">Question</label>
          <div class="field-body">
            <div class="field">
              <p class="control">
                <input
                  name="question"
                  class="input quiz-questions__question"
                  id="quiz-questions__question-input"
                  type="text"
                  placeholder="Enter question"
                  required
                />
              </p>
            </div>
          </div>
        </div>

        <div class="columns">
        <div class="column">
        <div class="field is-vertical">
          <label class="label" for="quiz-questions__option-one-input">Option 1</label>
          <div class="field-body">
            <div class="field">
              <p class="control">
                <input
                  name="option"
                  class="input quiz-questions__option"
                  id="quiz-questions__option-one-input"
                  type="text"
                  placeholder="Enter option"
                  required
                />
              </p>
            </div>
          </div>
        </div>
        </div>

        
        <div class="column">
        <div class="field is-vertical">
          <label class="label" for="quiz-questions__option-two-input">Option 2</label>
          <div class="field-body">
            <div class="field">
              <p class="control">
                <input
                  name="option"
                  class="input quiz-questions__option"
                  id="quiz-questions__option-two-input"
                  type="text"
                  placeholder="Enter option"
                  required
                />
              </p>
            </div>
          </div>
        </div>
        </div>


        <div class="column">
        <div class="field is-vertical">
          <label class="label" for="quiz-questions__option-three-input">Option 3</label>
          <div class="field-body">
            <div class="field">
              <p class="control">
                <input
                  name="option"
                  class="input quiz-questions__option"
                  id="quiz-questions__option-three-input"
                  type="text"
                  placeholder="Enter option"
                  required
                />
              </p>
            </div>
          </div>
        </div>
        </div>



        <div class="column">
        <div class="field is-vertical">
          <label class="label" for="quiz-questions__option-four-input">Option 4</label>
          <div class="field-body">
            <div class="field">
              <p class="control">
                <input
                  name="option"
                  class="input quiz-questions__option"
                  id="quiz-questions__option-four-input"
                  type="text"
                  placeholder="Enter option"
                  required
                />
              </p>
            </div>
          </div>
        </div>
        </div>
        

        </div>


        <div class="field is-vertical mb-6">
            <label class="label" for="quiz-questions__correct-answer-input">Correct Answer</label>
            <div class="select" style="width:100%">
              <select required name="option-correct" class="quiz-questions__correct-answer" style="width:100%">
                <option value="0">1</option>
                <option value="1">2</option>
                <option value="2">3</option>
                <option value="3">4</option>
              </select>
            </div>
          </div>
      
  `;

const buttonHtml = (id) => `
      <button
      class="button is-danger is-block is-medium"
      type="button"
      onclick="removeQuestion(${id})">Remove</button>

      <hr />
  `;

const firstQuestionElement = document.createElement("div");
firstQuestionElement.setAttribute("class", "quiz-questions__container");
firstQuestionElement.id = `quiz-questions__container--1`;

firstQuestionElement.innerHTML = questionsHTML;

questionContainer.appendChild(firstQuestionElement);

let id = 2;
addButton.addEventListener("click", (e) => {
  e.preventDefault();
  const div = document.createElement("div");
  div.setAttribute("class", "quiz-questions__container");
  div.id = `quiz-questions__container--${id}`;

  div.innerHTML = questionsHTML + buttonHtml(id);

  questionContainer.appendChild(div);
  id++;
});
const removeQuestion = (id) => {
  const container = document.getElementById(`quiz-questions__container--${id}`);

  if (id === 1) {
    return;
  }
  container.remove();
};

quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("handlesubmit");

  const title = quizForm.querySelector(".add-quiz__title").value;
  const description = quizForm.querySelector(".add-quiz__description").value;
  const startingDate = quizForm.querySelector(".add-quiz__starting-date").value;
  const endingDate = quizForm.querySelector(".add-quiz__ending-date").value;
  const timeLimit = quizForm.querySelector(".add-quiz__time-limit").value;
  const semester = quizForm.querySelector(".add-quiz__semester").value;
  const negativeMarksPerQuestion = quizForm.querySelector(
    ".add-quiz__negative-marks-per-question"
  ).value;
  const marksPerQuestion = quizForm.querySelector(
    ".add-quiz__marks-per-question"
  ).value;
  const subject = quizForm.querySelector(".add-quiz__subject").value;
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

    return {
      question,
      options: options.map((option) => option.value),
      correctAnswer,
      correctAnswerIndex,
    };
  });

  const quiz = {
    title,
    description,
    questions,
    subject,
    semester: parseInt(semester),
    negativeMarksPerQuestion,
    marksPerQuestion,
    startingDate,
    endingDate,
    timeLimit,
  };

  const response = await fetch(`/quiz/add/callback`, {
    method: "post",
    body: JSON.stringify(quiz),
    headers: {
      "content-type": "Application/json",
    },
    redirect: "follow",
  }).catch((err) => {
    console.log(err, "error in frontend");
  });

  if (response) {
    window.location.href = response.url;
    return;
  }
});
