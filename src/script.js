let mathProblemsList = [];
const mathProblemsContainer = document.getElementById("math-problems");

const inputForm = document.getElementById("inputForm");
inputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputs = inputForm.elements;

  mathProblemsList = [];
  
  generateMathProblems(inputs["minInput"].value, inputs["maxInput"].value, inputs["numProblems"].value, inputs["operator"].value);
  writeProblems(inputs["withAnswers"].checked);
});

const formSubmitButton = document.getElementById("formSubmit");

function generateRandInt(min, max) {
  // integers only for now
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function getAnswer(leftOperand, rightOperand, operator) {
  let answer;
  switch (operator) {
    case "+":
      answer = leftOperand + rightOperand;
      break;
    case "-":
      answer = leftOperand - rightOperand;
      break;
    case "*":
      answer = leftOperand * rightOperand;
      break;
    case "/":
      answer = leftOperand / rightOperand;
      break;  
    default:
      throw new Error('Unsupported operator');
  }
  return answer;
}

function generateMathProblems(min, max, numProblems, operator) {
  // const min = operator === '/' ? 1 : 0; // quick 'n dirty way to avoid divide by zero
  // const max = Math.pow(10, numDigits) - 1;

  for (let i = 0; i < numProblems; i++) {
    const leftOperand = generateRandInt(min, max);
    const rightOperand = generateRandInt(min, max);
    const answer = getAnswer(leftOperand, rightOperand, operator);
    
    mathProblemsList.push({
      left: leftOperand,
      right: rightOperand,
      operator: operator,
      answer: answer
    });
  }

  console.log(mathProblemsList);
}

function writeProblems(withAnswer = false) {
  let listElements = [];
  for (let problem of mathProblemsList) {
    const problemElement = document.createElement("li");
    problemElement.innerText = `${problem.left} ${problem.operator === '*' ? String.fromCharCode(215) : problem.operator} ${problem.right} = ${withAnswer ? problem.answer : "_____"}`;
    listElements.push(problemElement);
  }
  mathProblemsContainer.replaceChildren(...listElements);
}
