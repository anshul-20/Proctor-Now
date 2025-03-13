console.log(_reportData);

const questionContainer = document.querySelector(".quiz__question-container");
const performanceContainer = document.querySelector(
  ".report__performance__container"
);

const createQuestionHtml = (question, currentQuestionIndex) => {
  const isNotAnswered = question.userAnswer === -1;
  const isCorrect = (index) => {
    if (question.userAnswer === index && question.correctAnswer === index) {
      return true;
    }

    return false;
  };
  return `
         
            <div class="quiz__question-container__question__container">
              <h1 class="quiz__question-container__question">Q${
                currentQuestionIndex + 1
              }- ${question.question}</h1>
            </div>

        
        <ol class="quiz__question-container__option__container">

        <li class="quiz__question-container__option quiz__question-container__option-a" onclick="handleUserAnswer(this)" id='0' style="background-color: ${
          isNotAnswered ? "white" : isCorrect(0) ? "hsl(166, 67%, 51%)" : "red"
        }">${question.options[0]}</li>
        <li class="quiz__question-container__option quiz__question-container__option-b" onclick="handleUserAnswer(this)" id='1' style="background-color: ${
          isNotAnswered ? "white" : isCorrect(1) ? "hsl(166, 67%, 51%)" : "red"
        }">${question.options[1]}</li>
        <li class="quiz__question-container__option quiz__question-container__option-c" onclick="handleUserAnswer(this)" id='2' style="background-color: ${
          isNotAnswered ? "white" : isCorrect(2) ? "hsl(166, 67%, 51%)" : "red"
        }">${question.options[2]}</li>
        <li class="quiz__question-container__option quiz__question-container__option-d" onclick="handleUserAnswer(this)" id='3' style="background-color: ${
          isNotAnswered ? "white" : isCorrect(3) ? "hsl(166, 67%, 51%)" : "red"
        }">${question.options[3]}</li>
        </ol>
    `;
};

const generateReport = (
  question,
  currentQuestionIndex,
  { marksPerQuestion, negativeMarksPerQuestion }
) => {
  const hasUserAnswered = question.userAnswer !== -1;
  const hasUserAnsweredCorrectly =
    question.userAnswer === question.correctAnswer;
  let options;

  if (!hasUserAnswered) {
    options = `
    <ol class="quiz__question-container__option__container">
           <li class="quiz__question-container__option quiz__question-container__option-a" onclick="handleUserAnswer(this)" id='0' style="background-color: hsl(166, 67%, 51%);">${
             question.options[question.correctAnswer]
           }</li>
           <span class="tag is-light is-size-6 mb-3"><p>Not Answered</p></span>
           <span class="tag is-light is-size-6"><p>0 Marks</p></span>
    </ol>
           `;
  } else if (hasUserAnswered && hasUserAnsweredCorrectly) {
    options = `
      <ol class="quiz__question-container__option__container">
             <li class="quiz__question-container__option quiz__question-container__option-a" onclick="handleUserAnswer(this)" id='0' style="background-color: hsl(166, 67%, 51%);">${
               question.options[question.userAnswer]
             }</li>
             <span class="tag is-success is-size-6 mb-3"><p>Correct Answer</p></span> 
             <span class="tag is-success is-size-6"><p>+${marksPerQuestion} Marks</p></span> 
        </ol>
             `;
  } else {
    options = `
      <ol class="quiz__question-container__option__container">
               <li class="quiz__question-container__option quiz__question-container__option-a" onclick="handleUserAnswer(this)" id='0' style="background-color: hsl(166, 67%, 51%);">${
                 question.options[question.correctAnswer]
               }</li>
               <li class="quiz__question-container__option quiz__question-container__option-a" onclick="handleUserAnswer(this)" id='0' style="background-color: red;">${
                 question.options[question.userAnswer]
               }</li>
               <span class="tag is-danger is-size-6 mb-3"><p>Incorrect Answer</p></span>
               <span class="tag is-danger is-size-6"><p>-${negativeMarksPerQuestion} Marks</p></span>
        </ol>
               `;
  }

  return `
    <div class="quiz__question-container__question__container">
        <h1 class="quiz__question-container__question">Q${
          currentQuestionIndex + 1
        }- ${question.question}</h1>
    </div> 

    ${options}


    `;
};

const generateQuizPerformanceReport = (quizPerformance) => {
  console.log(quizPerformance);
  const {
    totalCorrectAnswers,
    totalIncorrectAnswers,
    totalMarks,
    totalNotAnswered,
    totalQuestions,
    testCompletedInString,
    testCompletedIn,
    timeLimit,
  } = quizPerformance;
  return `
  <h3>Total Correct Answers: ${totalCorrectAnswers} / ${totalQuestions}</h3>
  <progress class="progress" value="${totalCorrectAnswers}" max="${totalQuestions}"></progress>

  <h3>Total Incorrect Answers: ${totalIncorrectAnswers} / ${totalQuestions}</h3>
  <progress class="progress" value="${totalIncorrectAnswers}" max="${totalQuestions}"></progress>

  <h3>Total Not Answered: ${totalNotAnswered} / ${totalQuestions}</h3>
  <progress class="progress" value="${totalNotAnswered}" max="${totalQuestions}"></progress>

  <h3>Time Taken: ${testCompletedInString}</h3>
  <progress class="progress" value="${testCompletedIn}" max="${
    timeLimit * 60
  }"></progress>
 
  
  `;
};

function injectData(_reportData) {
  const { questions, quizMarksDetails } = JSON.parse(_reportData);
  questionContainer.innerHTML = questions.map((question, index) =>
    generateReport(question, index, quizMarksDetails)
  );

  performanceContainer.innerHTML =
    generateQuizPerformanceReport(quizMarksDetails);
}

injectData(_reportData.data);
