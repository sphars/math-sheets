// --- Imports
import "@fontsource-variable/roboto-flex";
import "98.css/dist/98.css";
import "./style.css";
import "./fonts.css";
import fontsData from "./fonts.json";
import { Problem, GeneratorOptions, Font } from "./interfaces";
import { SeededRNG, generateRandomSeed } from "./generator";

// --- Library Imports
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

// --- Script vars
const tileImages = import.meta.glob<{ default: string }>("./tiles/*.png", { eager: true });
const tileImageUrls = Object.values(tileImages).map((module) => module.default);
const operators = ["+", "-", "*", "/"];
const fonts: Font[] = fontsData.fonts.sort((a, b) => a.name.localeCompare(b.name));
const problemsPerPage = 20;
let generatedProblems: Problem[] = [];

// --- Elements
const page = document.getElementById("page") as HTMLDivElement;
const pageContent = document.getElementById("page-content") as HTMLDivElement;
const inputForm = document.getElementById("input-form") as HTMLFormElement;
const statusPages = document.getElementById("status-pages");

// --- Inputs
const numProblemsInput = document.getElementById("num-problems") as HTMLInputElement;
const seedInput = document.getElementById("seed") as HTMLInputElement;
const fontSelect = document.getElementById("font-select") as HTMLSelectElement;
const withHeaderCheckbox = document.getElementById("with-header") as HTMLInputElement;
const withAnswersCheckbox = document.getElementById("with-answers") as HTMLInputElement;
const bgSwitcher = document.querySelector("#bg-switcher select") as HTMLSelectElement;

// --- Buttons
const reseedButton = document.getElementById("reseed") as HTMLButtonElement;
const pdfButton = document.getElementById("pdf-button") as HTMLButtonElement;
const saveConfigButton = document.querySelector("#save-config") as HTMLButtonElement;
const windowButtons = document.querySelectorAll(".title-bar-controls button");

// --- Dialogs
const creditsButton = document.querySelector("#credits") as HTMLButtonElement;
const creditsDialog = document.querySelector("dialog") as HTMLDialogElement;
const creditsDialogCloseButton = document.querySelectorAll("dialog button") as unknown as HTMLButtonElement[];

// --- Event listeners
window.addEventListener("DOMContentLoaded", (event) => {
  numProblemsInput.defaultValue = problemsPerPage.toString();

  // check if there are URL parameters
  const loadedOptions: GeneratorOptions = getOptionsFromURL();
  setFormValues(loadedOptions);

  // setup the font select
  fonts.forEach((font) => {
    const opt = document.createElement("option") as HTMLOptionElement;
    if (font.name === "Dotrice") opt.text = `${font.name} (Dot Matrix)`;
    else opt.text = font.name;
    opt.value = font.name;
    if (font.name === loadedOptions.fontSelect) opt.selected = true;
    fontSelect.add(opt);
  });

  // setup the bg switcher
  tileImageUrls.forEach((tile: string) => {
    const opt = document.createElement("option") as HTMLOptionElement;
    opt.value = tile;

    // get just the name of the file sans extension and hash from vite build step
    const text = tile.split("/").pop()!.replace(".png", "").split("-")[0];
    opt.text = text;

    // check if it's already selected
    const currentTile = getBodyBackground();
    opt.selected = currentTile.includes(tile) ? true : false;
    bgSwitcher.add(opt);
  });

  setPrintPreviewFont();
  updatePagesNote();
});

windowButtons.forEach((element) => {
  element.addEventListener("click", () => {
    console.log("Sorry, this doesn't do anything. Yet.");
  });
});

numProblemsInput.addEventListener("change", updatePagesNote);

fontSelect.addEventListener("change", setPrintPreviewFont);

bgSwitcher.addEventListener("change", (event: Event) => {
  const element = event.target as HTMLInputElement;
  localStorage.setItem("bg", element.value);
  setBodyBackground();
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

reseedButton.addEventListener("click", (e) => {
  seedInput.value = generateRandomSeed().toString();
});

creditsButton.addEventListener("click", (e) => {
  creditsDialog.showModal();
});

creditsDialogCloseButton.forEach((button) => {
  button.addEventListener("click", () => {
    creditsDialog.close();
  });
});

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputData = new FormData(inputForm);

  const options: GeneratorOptions = {
    seed: inputData.get("seed") as unknown as number, // TODO: generate a new seed if not present
    operator: inputData.get("operator") as string,
    leftMin: inputData.get("left-min") as unknown as number,
    leftMax: inputData.get("left-max") as unknown as number,
    rightMin: inputData.get("right-min") as unknown as number,
    rightMax: inputData.get("right-max") as unknown as number,
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
  setPrintPreviewFont();
  pdfButton.removeAttribute("disabled");
  page!.classList.remove("d-none");
});

inputForm.addEventListener("reset", () => {
  // clear out the generated problems
  generatedProblems.length = 0;
  page!.classList.add("d-none");
  page!.parentElement!.style.border = "none";
  pdfButton.setAttribute("disabled", "disabled");

  // manually reset some values
  seedInput.defaultValue = generateRandomSeed().toString();
  seedInput.value = seedInput.defaultValue;
  numProblemsInput.value = numProblemsInput.defaultValue;
  updatePagesNote();
  setURLParameters(true);
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

saveConfigButton.addEventListener("click", () => {
  setURLParameters();
});

// --- Apply
// logoArea.innerHTML = `<img src="${logo}" class="logo" alt="Math Sheets logo" />`;

// --- Functions
function setFormValues(options: GeneratorOptions) {
  for (const [key, value] of Object.entries(options)) {
    // simple map of GeneratorOption key to form name
    const inputName =
      {
        leftMin: "left-min",
        leftMax: "left-max",
        rightMin: "right-min",
        rightMax: "right-max",
        numProblems: "num-problems",
        descOrder: "desc-order",
        noNegatives: "no-negatives",
        intsOnly: "ints-only",
        fontSelect: "font-select"
      }[key] || key;

    const formElement = inputForm.elements.namedItem(inputName) as HTMLInputElement;
    if (formElement) {
      switch (formElement.type) {
        case "checkbox":
          formElement.checked = value;
          break;
        default:
          formElement.value = value;
          break;
      }
    }
  }
}

function getBodyBackground() {
  return window.getComputedStyle(document.querySelector("body")!).backgroundImage;
}

function setBodyBackground() {
  let bgImage = "unset";
  const storedBg = localStorage.getItem("bg");

  if (!storedBg) {
    const randomIndex = generateRandInt(0, tileImageUrls.length - 1);
    bgImage = `url(${tileImageUrls[randomIndex]})`;
  } else if (storedBg !== "none") {
    bgImage = `url(${storedBg})`;
  }

  // document.body.style.backgroundImage = `url(${url})`;
  document.body.style.backgroundImage = bgImage;
}

function setPrintPreviewFont() {
  const font = fonts.find((font) => font.name === fontSelect.value);
  const family = font?.family ? font.family : "monospace";
  setCSSVariable(document.documentElement, "--font-monospace", family);
}

function setCSSVariable(element: HTMLElement, variable: string, value: string) {
  element.style.setProperty(variable, value);
}

function getNumPages(numProblems: number) {
  return Math.ceil((numProblems - problemsPerPage) / problemsPerPage) + 1;
}

function showPageHeader() {
  const pageHeader = document.getElementById("page-header");

  withHeaderCheckbox.checked ? pageHeader?.classList.remove("hidden") : pageHeader?.classList.add("hidden");
}

function updatePagesNote() {
  const numProblems = +numProblemsInput.value;
  const pages = getNumPages(numProblems);
  if (statusPages) {
    let statProbs = `${numProblems < problemsPerPage ? numProblems : problemsPerPage} problems per page`;
    statusPages.textContent = `${pages} page${pages === 1 ? "" : "s"}, ${statProbs}`;
  }
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

function getOperands(options: GeneratorOptions, rng: SeededRNG) {
  const leftOperand = rng.nextInt(options.leftMin, options.leftMax);
  const rightOperand = rng.nextInt(options.rightMin, options.rightMax);

  let operands = [leftOperand, rightOperand];

  // biggest number first for subtracting
  if (options.noNegatives || options.descOrder) {
    operands.sort((a, b) => b - a);
  }

  // avoid divide by zero
  if (options.operator === "/" && operands[1] === 0) {
    operands[1] = rng.nextInt(1, options.rightMax);
  }

  return operands;
}

function generateMathProblems(options: GeneratorOptions): Problem[] {
  const rng = new SeededRNG(options.seed);

  for (let i = 0; i < options.numProblems; i++) {
    // copy the form options
    const optionsCopy = JSON.parse(JSON.stringify(options)) as GeneratorOptions;

    // if operator = mix, need to randomize which operator to use
    optionsCopy.operator = options.operator === "mix" ? operators[rng.nextInt(0, 3)] : options.operator;

    let operands = getOperands(optionsCopy, rng);
    let answer = getAnswer(operands[0], operands[1], optionsCopy.operator);

    if (options.intsOnly) {
      do {
        operands = getOperands(options, rng);
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
  const problemGroups = chunkArray(problems, problemsPerPage); // chunk into groups of {{problemsPerPage}}

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

async function generatePDF(problems: Problem[]) {
  // create a US letter PDF
  const doc = new jsPDF({
    orientation: "portrait",
    format: "letter"
  });

  // add custom font
  const selectedFont = fonts.find((font) => font.name === fontSelect.value);
  try {
    let fontContent: string;
    fontContent = await loadFontContent(`/fonts/${selectedFont?.file!}`);
    doc.addFileToVFS(selectedFont?.file!, fontContent);
    doc.addFont(selectedFont?.file!, selectedFont?.name!, selectedFont?.style || "normal");
    doc.setFont(selectedFont?.name!);
  } catch (error) {
    doc.setFont("Courier");
  }

  // add header
  if (withHeaderCheckbox.checked) {
    doc.setFontSize(14);
    doc.text("Name: __________________", 10, 14, { align: "left" });
    doc.text("Date: ______________", doc.internal.pageSize.getWidth() - 10, 14, { align: "right" });
  }

  doc.setFontSize(16);

  const columns = ["", "", "", ""];
  let data: string[] = [];

  // prepare table data
  problems.forEach((problem, index) => {
    const formattedProblem = writeSingleProblem(problem, withAnswersCheckbox.checked);
    data.push(formattedProblem);
  });

  while (data.length < columns.length) {
    // "pad" the data so that a miniumum number of columns is met
    data.push("");
  }

  const chunkedData = chunkArray(data, columns.length);

  // create the table
  autoTable(doc, {
    body: chunkedData,
    columnStyles: {
      0: { halign: "right", cellPadding: { right: 12 } },
      1: { halign: "right", cellPadding: { right: 12 } },
      2: { halign: "right", cellPadding: { right: 12 } },
      3: { halign: "right", cellPadding: { right: 12 } }
    },
    styles: {
      halign: "center",
      valign: "middle",
      minCellHeight: 46,
      minCellWidth: 28,
      font: doc.getFont().fontName,
      fontSize: 16,
      textColor: "black"
    },
    theme: "plain", // no grid lines
    margin: { vertical: 22, horizontal: 16 },
    didDrawPage: (data) => {
      // footer
      let footer = `Created with mathsheets.net`;
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      doc.setFontSize(9);
      doc.setFont("Helvetica");
      doc.textWithLink(footer, 12, pageHeight - 8, { url: "https://www.mathsheets.net" });

      const pageNum = doc.getNumberOfPages().toString();
      doc.text(pageNum, pageWidth - 8, pageHeight - 8, { align: "right" });
    }
  });

  doc.save(`math-sheet${withAnswersCheckbox.checked ? "_answers" : ""}.pdf`);
}

function setURLParameters(reset: Boolean = false) {
  const formData = new FormData(inputForm);
  formData.append("font-select", fontSelect.value); // TODO: add font as a saved value?
  const searchParams = new URLSearchParams(formData as any).toString();

  let newURL = `${window.location.pathname}`;

  if (!reset) {
    newURL += `?${searchParams}`;
  }

  window.history.pushState({ path: newURL }, "", newURL);
}

function getOptionsFromURL(): GeneratorOptions {
  const params = new URLSearchParams(window.location.search);

  // return a GeneratorOptions object with either the values from the params or default values
  return {
    seed: parseInt(params.get("seed") || generateRandomSeed().toString(), 10),
    operator: params.get("operator") || "+",
    leftMin: parseInt(params.get("left-min") || "0"),
    leftMax: parseInt(params.get("lef-max") || "100"),
    rightMin: parseInt(params.get("right-min") || "0"),
    rightMax: parseInt(params.get("right-max") || "100"),
    numProblems: parseInt(params.get("num-problems") || problemsPerPage.toString(), 10),
    descOrder: params.get("desc-order") ? params.get("desc-order") === "on" : false,
    noNegatives: params.get("no-negatives") ? params.get("no-negatives") === "on" : false,
    intsOnly: params.get("ints-only") ? params.get("ints-only") === "on" : false,
    fontSelect: params.get("font-select") || "Courier"
  };
}

/**
 * Load font content and return as a base64 encoded string
 */
async function loadFontContent(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`status: ${response.status}`);
    }
    const fontBuffer = await response.arrayBuffer();
    const base64font = btoa(new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
    return base64font;
  } catch (error) {
    console.error("Error loading font file: ", error);
    throw error;
  }
}

setBodyBackground();
