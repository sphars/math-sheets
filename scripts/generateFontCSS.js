const fs = require("fs").promises;
const path = require("path");

const { fonts } = require("../src/fonts.json");

/**
 * Writes a CSS file for use in importing local fonts
 * @param fonts Array of FontOption objects
 * @param filePath Path to resulting file
 */
async function createFontCSS(fonts, filePath = "./src/fonts.css") {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const cssContent = fonts
      .map((font) => {
        if (!font.url) return;

        return `@font-face {
  font-family: "${font.name}";
  src: url("${font.url}") format("${font.format}");
  font-weight: ${font.weight ? font.weight : "normal"};
  font-style: ${font.style ? font.style : "normal"};
}`;
      })
      .join("\n");

    // write to file, overwrite existing
    await fs.writeFile(filePath, cssContent + "\n", "utf-8");
    console.log(`File ${filePath} updated successfully`);
  } catch (error) {
    console.error("An error occurred writing font file: ", error);
  }
}

createFontCSS(fonts);
