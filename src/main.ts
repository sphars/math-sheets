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
const fonts: Font[] = fontsData.fonts.sort((a, b) => a.name.localeCompare(b.name));
const itemsPerPage = 35;
let generatedProblems: Problem[] = [];

// --- Elements
const page = document.getElementById("page");
const pageContent = document.getElementById("page-content");
const inputForm = document.getElementById("input-form") as HTMLFormElement;
const withAnswersCheckbox = document.getElementById("with-answers") as HTMLInputElement;
const formSubmitButton = document.getElementById("form-submit") as HTMLButtonElement;
const printButton = document.getElementById("print-button") as HTMLButtonElement;
const pdfButton = document.getElementById("pdf-button") as HTMLButtonElement;
const numProblemsInput = document.getElementById("num-problems") as HTMLInputElement;
const pagesNote = document.getElementById("pages");
const fontSelect = document.getElementById("font-select") as HTMLSelectElement;
const withHeaderCheckbox = document.getElementById("with-header") as HTMLInputElement;
const logoArea = document.querySelector<HTMLAnchorElement>("#logo")!;

// --- Event listeners
window.addEventListener("DOMContentLoaded", (event) => {
  // setup the font select
  fonts.forEach((font) => {
    const opt = document.createElement("option") as HTMLOptionElement;
    if (font.name === "Default") opt.selected = true;
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

numProblemsInput?.addEventListener("change", (event) => {
  updatePagesNote();
});

fontSelect?.addEventListener("change", (event) => {
  setCSSVariable(
    document.documentElement,
    "--font-mono",
    fonts.find((font) => font.name === fontSelect.value)?.family!
  );
});

withHeaderCheckbox?.addEventListener("click", (event: any) => {
  const pageHeader = document.getElementById("page-header");

  if (event.target?.checked) {
    pageHeader?.classList.remove("hidden");
  } else {
    pageHeader?.classList.add("hidden");
  }
});

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

  generatedProblems.length = 0;
  generatedProblems = generateMathProblems(options);
  writeProblems(generatedProblems, withAnswersCheckbox.checked);
  setCSSVariable(
    document.documentElement,
    "--font-mono",
    fonts.find((font) => font.name === fontSelect.value)?.family!
  );

  page?.classList.remove("d-none");
});

printButton?.addEventListener("click", () => {
  if (!pageContent?.hasChildNodes()) return;
  let currTitle = document.title;
  document.title = withAnswersCheckbox.checked ? "math-sheets_answers" : "math-sheets";
  window.print();
  document.title = currTitle;
});

pdfButton?.addEventListener("click", () => {
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

function updatePagesNote() {
  const pages = getNumPages(+numProblemsInput.value);
  if (pagesNote)
    pagesNote.textContent = `${pages} page${pages === 1 ? "" : "s"} (${itemsPerPage} problems per page)`;
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
    let operands = getOperands(options);
    let answer = getAnswer(operands[0], operands[1], options.operator);

    if (options.intsOnly) {
      do {
        operands = getOperands(options);
        answer = getAnswer(operands[0], operands[1], options.operator);
      } while (!Number.isInteger(answer));
    }

    generatedProblems.push({
      left: operands[0],
      right: operands[1],
      operator: options.operator,
      answer: answer
    });
  }

  return generatedProblems;
}

function writeProblems(problems: Problem[], withAnswer: boolean = false) {
  const problemGroups = chunkArray(problems, itemsPerPage);

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

  const footer = createPageFooter();
  if (pageContent) pageContent.innerHTML = mathProblemNodes.join("") + footer;
}

function createPageFooter(): string {
  return `
    <div class="page-footer page-break">
      Generated with <a href="#">mathsheets</a>
    </div>
  `;
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
  const spaceToAdd =
    Math.max(problem.left.toString().length, problem.right.toString().length) + 2 - line2.length;
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

  console.log(doc.getFontList());

  // TODO: create new fonts
  // note that chrome's internal PDF viewer doesn't render the correct Courier font on linux...
  doc.setFont("courier");
  doc.setFontSize(16);

  // add header
  if (withHeaderCheckbox.checked) {
    doc.text("NAME: ______________", 12, 12, { align: "left" });
    doc.text("DATE: ______________", doc.internal.pageSize.getWidth() - 12, 12, { align: "right" });
  }

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
      0: { halign: "right", cellPadding: { right: 6 } },
      1: { halign: "right", cellPadding: { right: 6 } },
      2: { halign: "right", cellPadding: { right: 6 } },
      3: { halign: "right", cellPadding: { right: 6 } },
      4: { halign: "right", cellPadding: { right: 6 } }
    },
    styles: {
      halign: "center",
      valign: "middle",
      font: "Courier",
      fontSize: 18,
      minCellHeight: 36,
      minCellWidth: 24,
      textColor: "black"
    },
    theme: "plain",
    margin: { horizontal: 20, vertical: 20 },
    didDrawPage: (data) => {
      // footer
      let footer = `Created with Math Sheets - %WEBSITE%`;
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      doc.setFontSize(10);
      doc.setFont("Helvetica");
      doc.text(footer, 12, pageHeight - 8);

      const pageNum = doc.getNumberOfPages().toString();
      doc.text(pageNum, pageWidth - 10, pageHeight - 8, { align: "right" });
    }
  });

  doc.save(`math-sheet${withAnswersCheckbox.checked ? "_answers" : ""}.pdf`);
}
