// --- Script vars
const itemsPerPage = 35;
const fontFamilies = {
  system: "'Nimbus Mono PS', 'Courier New', Consolas, monospace",
  noto: "'Noto Sans Mono', monospace",
  dotrice: "'Dotrice', monospace",
  roboto: "'Roboto Mono', monospace"
}

// --- Elements
const page = document.getElementById("page");
const pageContent = document.getElementById("page-content");
const inputForm = document.getElementById("input-form");
const showAnswersCheckbox = document.getElementById("show-answers");
const formSubmitButton = document.getElementById("form-submit");
const printButton = document.getElementById("print-button");
const numProblemsInput = document.getElementById("num-problems");
const pagesNote = document.getElementById("pages");
const fontSelect = document.getElementById("font-select");
const withHeaderCheckbox = document.getElementById("with-header");


// --- Event listeners
window.addEventListener("DOMContentLoaded", (event) => {
  setCSSVariable(document.documentElement, '--font-mono', fontFamilies[fontSelect.value]);
  updatePagesNote();
});

numProblemsInput.addEventListener("change", (event) => {
  updatePagesNote();
});

fontSelect.addEventListener("change", (event) => {
  setCSSVariable(document.documentElement, '--font-mono', fontFamilies[fontSelect.value]);
});

withHeaderCheckbox.addEventListener("click", (event) => {
  const pageHeader = document.getElementById("page-header");

  if (event.target.checked) {
    pageHeader.classList.remove("hidden");  
  } else {
    pageHeader.classList.add("hidden");
  }
});

showAnswersCheckbox.addEventListener("click", (event) => {
  const answerElements = pageContent.querySelectorAll("pre.answer");

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
    intsOnly: inputs["ints-only"].checked,
    fontSelect: inputs["font-select"].value
  }

  const problems = generateMathProblems(options);
  writeProblems(problems, showAnswersCheckbox.checked);
  setCSSVariable(document.documentElement, "--font-mono", fontFamilies[options.fontSelect]);
  page.classList.remove("d-none");
});

printButton.addEventListener("click", () => {
  if (!pageContent.hasChildNodes()) return;
  let currTitle = document.title;
  document.title = showAnswersCheckbox.checked ? "math-sheets_answers" : "math-sheets";
  window.print();
  document.title = currTitle;
})

// --- Functions
function setCSSVariable(element, variable, value) {
  element.style.setProperty(variable, value);
}

function getNumPages(numProblems) {
  return Math.ceil((numProblems - itemsPerPage) / itemsPerPage) + 1;
}

function updatePagesNote() {
  const pages = getNumPages(numProblemsInput.value);
  pagesNote.textContent = `${pages} page${pages === 1 ? "" : "s"} (${itemsPerPage} problems per page)`;
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
      // round to 3 decimal places
      answer = +answer.toFixed(3);
      break;  
    default:
      throw new Error('Unsupported operator');
  }
  return answer;
}

function getOperands(options){
  const leftOperand = generateRandInt(options.min, options.max);
  const rightOperand = generateRandInt(options.min, options.max);
  
  let operands = [leftOperand, rightOperand];

  // biggest number first for subtracting
  if (options.noNegatives || options.descOrder) {
    operands.sort((a, b) => (b - a)); 
  }

  // avoid divide by zero
  if (options.operator === "/" && operands[1] === 0) {
    operands[1] = generateRandInt(1, options.max);
  }

  return operands;
}

function generateMathProblems(options) {
  let problems = [];

  for (let i = 0; i < options.numProblems; i++) {
    let operands = getOperands(options);
    let answer = getAnswer(operands[0], operands[1], options.operator);

    if (options.intsOnly) {
      do {
        operands = getOperands(options);
        answer = getAnswer(operands[0], operands[1], options.operator);
      } while (!Number.isInteger(answer));
    }

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
  const problemGroups = chunkArray(problems, itemsPerPage);

  const mathProblemNodes = problemGroups.map(group => {
    const gridItems = group.map(problem => {
      const operatorChar = {
        '/': '÷',
        '*': '×'
      }[problem.operator] || problem.operator;
      
      // write the individual lines of the problem, with padding as needed
      let line1 = `${problem.left}`;
      let line2 = `${operatorChar} ${problem.right}`;
      const spaceToAdd = Math.max(problem.left.toString().length, problem.right.toString().length) + 2 - line2.length;
      if (spaceToAdd > 0) {
        line2 = `${operatorChar}${" ".repeat(spaceToAdd)}${problem.right}`;
      }

      const line3 = "-".repeat(Math.max(line1.length, line2.length));

      return `
        <div class="grid-item">
          <div class="pre-wrapper">
            <pre class="problem">${line1}\n${line2}\n${line3}</pre>
            <pre class="answer ${withAnswer ? '' : 'hidden'}">${problem.answer}</pre>
          </div>
        </div>
      `
    }).join("");

    return `<div class="math-grid">${gridItems}</div>`;
  });

  const footer = createPageFooter();
  pageContent.innerHTML = mathProblemNodes.join("") + footer;
}

function createPageFooter() {
 return `
    <div class="page-footer page-break">
      Generated with <a href="#">mathsheets</a>
    </div>
  `
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
