// --- Script vars
const itemsPerPage = 35;

// --- Elements
const page = document.getElementById("page");
const mathProblemsContainer = document.getElementById("math-problems");
const inputForm = document.getElementById("input-form");
const showAnswersCheckbox = document.getElementById("show-answers");
const formSubmitButton = document.getElementById("form-submit");
const printButton = document.getElementById("print-button");
const numProblemsInput = document.getElementById("num-problems");
const pagesNote = document.getElementById("pages");


// --- Event listeners
window.addEventListener("DOMContentLoaded", (event) => {
  updatePagesNote();
});

numProblemsInput.addEventListener("change", (event) => {
  updatePagesNote();
});

showAnswersCheckbox.addEventListener("click", (event) => {
  const answerElements = mathProblemsContainer.querySelectorAll("pre.answer");

  if (event.target.checked) {
    answerElements.forEach(element => element.classList.remove("hidden"));
  } else {
    answerElements.forEach(element => element.classList.add("hidden"));
  }
});

inputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputs = inputForm.elements;

  mathProblemsList = [];
  
  const options = {
    operator: inputs["operator"].value,
    min: inputs["min-input"].value,
    max: inputs["max-input"].value,
    numProblems: inputs["num-problems"].value,
    descOrder: inputs["desc-order"].checked,
    noNegatives: inputs["no-negatives"].checked,
    indsOnly: inputs["ints-only"].checked
  }

  page.classList.remove("hidden");
  // mathProblemsContainer.classList.add("outline");
  const problems = generateMathProblems(options);
  writeProblems(problems, showAnswersCheckbox.checked);
});

printButton.addEventListener("click", () => {
  if (!mathProblemsContainer.hasChildNodes()) return;
  let currTitle = document.title;
  document.title = showAnswersCheckbox.checked ? "math-sheets_answers" : "math-sheets";
  window.print();
  document.title = currTitle;
})

// --- Functions
function getNumPages(numProblems) {
  return Math.ceil((numProblems - itemsPerPage) / itemsPerPage) + 1;
}

function updatePagesNote() {
  const pages = getNumPages(numProblemsInput.value);
  pagesNote.textContent = `${pages} page${pages === 1 ? "" : "s"} (max. ${itemsPerPage} problems per page)`;
}

function generateRandInt(min, max) {
  // integers only for now
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function getAnswer(left, right, operator) {
  let answer;
  switch (operator) {
    case "+":
      answer = left + right;
      break;
    case "-":
      answer = left - right;
      break;
    case "*":
      answer = left * right;
      break;
    case "/":
      answer = left / right;
      // TODO: round it to two decimal places if it's not whole
      answer = answer.toFixed(2);
      break;  
    default:
      throw new Error('Unsupported operator');
  }
  return answer;
}

function generateMathProblems(options) {
  let problems = [];

  for (let i = 0; i < options.numProblems; i++) {
    const leftOperand = generateRandInt(options.min, options.max);
    const rightOperand = generateRandInt(options.min, options.max);
    
    let operands = [leftOperand, rightOperand];

    // biggest number first for subtracting
    if (options.noNegatives || options.descOrder) {
      operands.sort((a, b) => (b - a)); 
    }

    // avoid divide by zero
    if (options.operator === "/" && operands[1] === 0) {
      console.log(i, ": DIVISION BY ZERO!", operands);
      operands[1] = generateRandInt(1, options.max);
    }

    const answer = getAnswer(operands[0], operands[1], options.operator);
    
    problems.push({
      left: operands[0],
      right: operands[1],
      operator: options.operator,
      answer: answer
    });
  }

  return problems;
}

function writeProblems(problems, withAnswer = false) {
  const gridItems = [];

  for (const [index, problem] of problems.entries()) {
    const gridItem = document.createElement("div");
    const preWrapper = document.createElement("div");
    
    const problemElement = document.createElement("pre");
    problemElement.classList.add("problem");

    let operatorChar = "";
    switch (problem.operator) {
      case "/":
        operatorChar = String.fromCharCode(247); // ÷ char
        break;
      case "*":
        operatorChar = String.fromCharCode(215); // × char
        break;
      default:
        operatorChar = problem.operator;
        break;
    }

    const line1 = ` ${problem.left}`;
    const line2 = `${operatorChar} ${problem.right}`;
    const line3 = "-".repeat(line2.length);
    problemElement.textContent = [line1, line2, line3].join("\n");
    
    const answerElement = document.createElement("pre");
    answerElement.classList.add("answer");
    if (!withAnswer) answerElement.classList.add("hidden");
    answerElement.textContent = problem.answer;

    preWrapper.appendChild(problemElement);
    preWrapper.appendChild(answerElement);

    gridItem.appendChild(preWrapper);

    if ((index + 1) % itemsPerPage === 0) {
      // add a page break every 30 items
      gridItem.classList.add("page-break");
    }

    gridItems.push(gridItem);
  }

  mathProblemsContainer.replaceChildren(...gridItems);
}
