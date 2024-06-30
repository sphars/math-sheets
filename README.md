# Math Sheets

Generate simple math worksheets in the browser for printing or whatever.

Inspired by the worksheets my dad printed off for my siblings and I during the summer breaks. I'm recreating this purely by memory; all I remember is that it was a grid of math problems, printed on a dot matrix printer. Not sure what he created his sheets in (likely QBasic or VisualBasic as this was late 1990s), so my attempt is to recreate this as close as possible, using modern web technologies.

Built with HTML, CSS and Typescript and Vite in (more than) a few hours. I'm also using this as an exercise to learn newer web technologies (like TS and Vite).

## Features

For generating the problems, there's several configuration options:

- Choose from the 4 operators to generate problems for (using a mix is WIP)
- Set the min/max operand values (0-1000 inclusive, may adjust)
  - For division problems, the second operand is regenerated if it's 0 to avoid divide by zero problems
- Set the number of problems to generate
  - Currently I'm creating the PDF so that it fits 35 problems (5x7) per page. May adjust this
- Option to set the operand order (highest or lowest first)
- Option to not have negative numbers, which overrides operand order to highest first (helpful with subtraction problems)
- Option to make answers be integers only (for division problems)
  - If unselected, then answers are rounded to 3 decimal places
- (WIP) Option to change the division notation to long division

For generating the PDFs, there's a couple options to change:

- (WIP) Set the font to one of several monospace fonts (see below)
- Add the header to the first page
  - Header is simply `NAME: ________ DATE: ______`, like back in school
- Show the answers on the page (an answer sheet)

## Status

It's at the MVP stage right now, with a couple features still in-progress:

- Use alternative notations, such as the long-division notation
- Creating problems with randomly chosen operators
- Better styling
- Saving config via URL parameters
- Using custom fonts in the PDF (currently only renders with Courier)

See [ISSUES](https://github.com/sphars/math-sheets/issues) for more details.

## Development

This site is built with Typescript and Vite. Only requirement is Node v20+. To run locally, clone the repo, then

```
cd math-sheets
npm install
npm run dev
```

The production build is just a static site. To build, run

```
npm run build
```

and the output `./dist` directory can be deployed where ever you'd like. See the `.github/workflows/deploy.yml` file for an example GitHub pages deployment.

## Credits

### Dependencies

- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for using tables in the PDF

### Fonts

- [Dotrice](https://www.1001fonts.com/dotrice-font.html) (dot matrix style font) by Paul Flo Williams, modified by me to add some additional characters:
  - Division Sign `÷`
  - Multiplication Sign `×`
- [Courier](https://github.com/dse/font-og-courier)
- [Noto Sans Mono](https://fonts.google.com/specimen/Noto+Sans+Mono)
- [Chivo Mono](https://fonts.google.com/specimen/Chivo+Mono)
- [Inconsolata](https://fonts.google.com/specimen/Inconsolata)
- [Space Mono](https://fonts.google.com/specimen/Space+Mono)
- [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono)
- [Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex)

### Other

- [Glyphr Studio](https://www.glyphrstudio.com/) for font editing
- My dad for making us kids do math during summer breaks
