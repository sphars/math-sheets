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
  const mathProblemNodes = [];
  const footer = createPageFooter();

  // divide the problems into groups
  const problemGroups = chunkArray(problems, itemsPerPage);

  for (const group of problemGroups) {
    // create the grid element
    const grid = document.createElement("div");
    grid.classList.add("math-grid");

    // array of grid item elements
    const gridItems = [];

    // loop through the problems in the group and add it to the grid
    for (const [index, problem] of group.entries()) {
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

      gridItems.push(gridItem);
    }

    // add the items to the grid
    grid.replaceChildren(...gridItems);

    // add the grid to the grids container
    mathProblemNodes.push(grid);

    // // add a copy of the page footer
    // mathProblemNodes.push(footer.cloneNode(true));
  }

  // for (const [index, problem] of problems.entries()) {
  //   const gridItem = document.createElement("div");
  //   const preWrapper = document.createElement("div");
    
  //   const problemElement = document.createElement("pre");
  //   problemElement.classList.add("problem");

  //   let operatorChar = "";
  //   switch (problem.operator) {
  //     case "/":
  //       operatorChar = String.fromCharCode(247); // ÷ char
  //       break;
  //     case "*":
  //       operatorChar = String.fromCharCode(215); // × char
  //       break;
  //     default:
  //       operatorChar = problem.operator;
  //       break;
  //   }

  //   const line1 = ` ${problem.left}`;
  //   const line2 = `${operatorChar} ${problem.right}`;
  //   const line3 = "-".repeat(line2.length);
  //   problemElement.textContent = [line1, line2, line3].join("\n");
    
  //   const answerElement = document.createElement("pre");
  //   answerElement.classList.add("answer");
  //   if (!withAnswer) answerElement.classList.add("hidden");
  //   answerElement.textContent = problem.answer;

  //   preWrapper.appendChild(problemElement);
  //   preWrapper.appendChild(answerElement);

  //   gridItem.appendChild(preWrapper);

  //   if ((index + 1) % itemsPerPage === 0) {
  //     // add a page footer every 35 items
  //     const pageFooter = createPageFooter();

  //     // end the grid
      
  //   }

  //   gridItems.push(gridItem);
  // }

  // insert the grid into the parent container
  pageContent.replaceChildren(...mathProblemNodes);
  pageContent.appendChild(footer);
}

function createPageFooter() {
  const footerElement = document.createElement("div");
  footerElement.classList.add("page-footer", "page-break");
  footerElement.innerHTML = `Generated with <a href="#">mathsheets</a>`
  return footerElement;
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
