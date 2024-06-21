const esbuild = require("esbuild");
const fs = require("fs-extra");
//const path = require("path");

async function build() {

  // Build JS from TS
  await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/bundle.js",
    target: ["es2022"],
    format: "esm"
  });

  // Copy HTML and CSS files
  await fs.copy("src/index.html", "dist/index.html");
  await fs.copy("src/style.css", "dist/style.css");

  console.log("Build complete");
}

build.catch(() => process.exit(1));