// --- Imports
import "./style.css";
import logo from "./assets/logo.svg";
import { Problem, GeneratorOptions, Font } from "./interfaces";
import fontsData from "./fonts.json";

// --- Library Imports
import "@fontsource-variable/roboto-flex";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

// --- Script vars
const operators = ["+", "-", "*", "/"];
const fonts: Font[] = fontsData.fonts.sort((a, b) => a.name.localeCompare(b.name));
const itemsPerPage = 35;
let generatedProblems: Problem[] = [];

// --- Elements
const page = document.getElementById("page") as HTMLDivElement;
const pageContent = document.getElementById("page-content") as HTMLDivElement;
const inputForm = document.getElementById("input-form") as HTMLFormElement;
const pagesNote = document.getElementById("pages");
const logoArea = document.querySelector<HTMLAnchorElement>("#logo")!;

// --- Inputs
const numProblemsInput = document.getElementById("num-problems") as HTMLInputElement;
const fontSelect = document.getElementById("font-select") as HTMLSelectElement;
const withHeaderCheckbox = document.getElementById("with-header") as HTMLInputElement;
const withAnswersCheckbox = document.getElementById("with-answers") as HTMLInputElement;

// --- Buttons
const formSubmitButton = document.getElementById("form-submit") as HTMLButtonElement;
// const printButton = document.getElementById("print-button") as HTMLButtonElement;
const pdfButton = document.getElementById("pdf-button") as HTMLButtonElement;

// --- Event listeners
window.addEventListener("DOMContentLoaded", (event) => {
  // setup the font select
  fonts.forEach((font) => {
    const opt = document.createElement("option") as HTMLOptionElement;
    if (font.name === "Courier") opt.selected = true;
    (opt.value = font.name), (opt.text = font.name);
    fontSelect.add(opt);
  });

  setCSSVariable(
    document.documentElement,
    "--font-mono",
    fonts.find((font) => font.name === fontSelect.value)?.family!
  );
  updatePagesNote();
});

numProblemsInput.addEventListener("change", (event) => {
  updatePagesNote();
});

fontSelect.addEventListener("change", (event) => {
  setCSSVariable(
    document.documentElement,
    "--font-mono",
    fonts.find((font) => font.name === fontSelect.value)?.family!
  );
});

withHeaderCheckbox.addEventListener("click", showPageHeader);

withAnswersCheckbox.addEventListener("click", (event: any) => {
  const answerElements = pageContent?.querySelectorAll("pre.answer");

  if (event.target?.checked) {
    answerElements?.forEach((element) => element.classList.remove("hidden"));
  } else {
    answerElements?.forEach((element) => element.classList.add("hidden"));
  }
});

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputData = new FormData(inputForm);

  const options: GeneratorOptions = {
    operator: inputData.get("operator") as string,
    min: inputData.get("min-input") as unknown as number,
    max: inputData.get("max-input") as unknown as number,
    numProblems: inputData.get("num-problems") as unknown as number,
    descOrder: inputData.get("desc-order") as unknown as boolean,
    noNegatives: inputData.get("no-negatives") as unknown as boolean,
    intsOnly: inputData.get("ints-only") as unknown as boolean,
    fontSelect: inputData.get("font-select") as string
  };

  showPageHeader();

  generatedProblems.length = 0;
  generatedProblems = generateMathProblems(options);
  writeProblems(generatedProblems, withAnswersCheckbox.checked);
  setCSSVariable(
    document.documentElement,
    "--font-mono",
    fonts.find((font) => font.name === fontSelect.value)?.family!
  );

  pdfButton.classList.remove("disabled");
  page!.classList.remove("d-none");
  page!.parentElement!.style.border = "1px solid #888";
});

// printButton.addEventListener("click", () => {
//   if (!pageContent?.hasChildNodes()) return;
//   let currTitle = document.title;
//   document.title = withAnswersCheckbox.checked ? "math-sheets_answers" : "math-sheets";
//   window.print();
//   document.title = currTitle;
// });

pdfButton.addEventListener("click", () => {
  if (generatedProblems.length === 0) return;
  generatePDF(generatedProblems);
});

// --- Apply
// logoArea.innerHTML = `<img src="${logo}" class="logo" alt="Math Sheets logo" />`;

// --- Functions
function setCSSVariable(element: HTMLElement, variable: string, value: string) {
  element.style.setProperty(variable, value);
}

function getNumPages(numProblems: number) {
  return Math.ceil((numProblems - itemsPerPage) / itemsPerPage) + 1;
}

function showPageHeader() {
  const pageHeader = document.getElementById("page-header");

  withHeaderCheckbox.checked ? pageHeader?.classList.remove("hidden") : pageHeader?.classList.add("hidden");
}

function updatePagesNote() {
  const pages = getNumPages(+numProblemsInput.value);
  if (pagesNote)
    pagesNote.textContent =
      `${pages} page${pages === 1 ? "" : "s"}, ` +
      `${+numProblemsInput.value < itemsPerPage ? +numProblemsInput.value : itemsPerPage} problems per page`;
}

function generateRandInt(min: number, max: number) {
  // integers only for now
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function getAnswer(left: number, right: number, operator: string) {
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
      throw new Error("Unsupported operator");
  }
  return answer;
}

function getOperands(options: GeneratorOptions) {
  const leftOperand = generateRandInt(options.min, options.max);
  const rightOperand = generateRandInt(options.min, options.max);

  let operands = [leftOperand, rightOperand];

  // biggest number first for subtracting
  if (options.noNegatives || options.descOrder) {
    operands.sort((a, b) => b - a);
  }

  // avoid divide by zero
  if (options.operator === "/" && operands[1] === 0) {
    operands[1] = generateRandInt(1, options.max);
  }

  return operands;
}

function generateMathProblems(options: GeneratorOptions) {
  for (let i = 0; i < options.numProblems; i++) {
    // copy the form options
    const optionsCopy = JSON.parse(JSON.stringify(options)) as GeneratorOptions;

    // if operator = mix, need to randomize which operator to use
    optionsCopy.operator = options.operator === "mix" ? operators[generateRandInt(0, 3)] : options.operator;

    let operands = getOperands(optionsCopy);
    let answer = getAnswer(operands[0], operands[1], optionsCopy.operator);

    if (options.intsOnly) {
      do {
        operands = getOperands(options);
        answer = getAnswer(operands[0], operands[1], optionsCopy.operator);
      } while (!Number.isInteger(answer));
    }

    generatedProblems.push({
      left: operands[0],
      right: operands[1],
      operator: optionsCopy.operator,
      answer: answer
    });
  }

  return generatedProblems;
}

function writeProblems(problems: Problem[], withAnswer: boolean = false) {
  const problemGroups = chunkArray(problems, itemsPerPage); // chunk into groups of 35 (one page)

  const mathProblemNodes = problemGroups.map((group) => {
    const gridItems = group
      .map((problem) => {
        const probStr = writeSingleProblem(problem); // don't get the answer here, it'll be added separately

        return `
        <div class="grid-item">
          <div class="pre-wrapper">
            <pre class="problem">${probStr}</pre>
            <pre class="answer ${withAnswer ? "" : "hidden"}">${problem.answer}</pre>
          </div>
        </div>
      `;
      })
      .join("");

    // TODO: remo
    return `<div class="math-grid">${gridItems}</div>`;
  });

  if (pageContent) pageContent.innerHTML = mathProblemNodes.join("");
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function writeSingleProblem(problem: Problem, withAnswer: boolean = false) {
  // write the individual lines of the problem, with padding as needed
  const operatorChar =
    {
      "/": "÷",
      "*": "×"
    }[problem.operator] || problem.operator;

  let line1 = `${problem.left}`;
  let line2 = `${operatorChar} ${problem.right}`;
  const spaceToAdd = Math.max(problem.left.toString().length, problem.right.toString().length) + 2 - line2.length;
  if (spaceToAdd > 0) {
    line2 = `${operatorChar}${" ".repeat(spaceToAdd)}${problem.right}`;
  }

  const line3 = "-".repeat(Math.max(line1.length, line2.length));

  if (!withAnswer) {
    return `${line1}\n${line2}\n${line3}`;
  } else {
    return `${line1}\n${line2}\n${line3}\n${problem.answer}`;
  }
}

function generatePDF(problems: Problem[]) {
  const doc = new jsPDF();

  // add header
  if (withHeaderCheckbox.checked) {
    doc.setFont("Helvetica");
    doc.setFontSize(14);
    doc.text("Name: __________________", 8, 14, { align: "left" });
    doc.text("Date: ______________", doc.internal.pageSize.getWidth() - 8, 14, { align: "right" });
  }

  // TODO: create new fonts
  // note that chrome's internal PDF viewer doesn't render the correct Courier font...
  doc.setFont("Courier");
  doc.setFontSize(16);

  const columns = ["", "", "", "", ""];
  let data: string[] = [];

  // prepare table data
  problems.forEach((problem, index) => {
    const formattedProblem = writeSingleProblem(problem, withAnswersCheckbox.checked);
    data.push(formattedProblem);
  });

  const chunkedData = chunkArray(data, 5);

  doc.setFont("courier");
  autoTable(doc, {
    body: chunkedData,
    columnStyles: {
      0: { halign: "right", cellPadding: { right: 10 } },
      1: { halign: "right", cellPadding: { right: 10 } },
      2: { halign: "right", cellPadding: { right: 10 } },
      3: { halign: "right", cellPadding: { right: 10 } },
      4: { halign: "right", cellPadding: { right: 10 } }
    },
    styles: {
      halign: "center",
      valign: "middle",
      font: "Courier",
      fontSize: 16,
      minCellHeight: 36,
      minCellWidth: 26,
      textColor: "black"
    },
    theme: "plain",
    margin: { horizontal: 16, vertical: 22 },
    didDrawPage: (data) => {
      // footer
      let footer = `Created with Math Sheets %WEBSITE_URL%`;
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      doc.setFontSize(9);
      doc.setFont("Helvetica");
      doc.textWithLink(footer, 10, pageHeight - 8, { url: "https://github.com/sphars/math-sheets" });

      const pageNum = doc.getNumberOfPages().toString();
      doc.text(pageNum, pageWidth - 8, pageHeight - 8, { align: "right" });
    }
  });

  doc.save(`math-sheet${withAnswersCheckbox.checked ? "_answers" : ""}.pdf`);
}
