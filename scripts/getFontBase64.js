const fs = require("fs").promises;
const path = require("path");

async function getBase64(jsonFilePath) {
  try {
    // get the font files and return base64
    const jsonData = await fs.readFile(jsonFilePath, "utf-8");
    const fontData = JSON.parse(jsonData);

    // process each font
    for (const font of fontData.fonts) {
      // get the full path to the font
      console.log(font);
      if (!font.url) continue;
      const fontFilePath = path.join(path.dirname(jsonFilePath), `../public${font.url}`);

      // read font
      const fontFileData = await fs.readFile(fontFilePath);

      // convert to base64
      const base64Font = fontFileData.toString("base64");

      // add the base64 prop
      font.base64 = base64Font;
    }

    // write updated JSON
    await fs.writeFile(jsonFilePath, JSON.stringify(fontData, null, 2));
    console.log("Font data updated with base64 encoding");
  } catch (error) {
    console.error("An error occured:", error);
  }
}

const jsonFilePath = "../src/fonts.json";
getBase64(jsonFilePath);
