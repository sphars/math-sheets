# Math Sheets

Generate PDF worksheets of simple math problems in the browser.

Inspired by the worksheets my dad printed off for my siblings and I during the summer breaks. I'm recreating this purely by memory; all I remember is that it was a grid of math problems, printed on a dot matrix printer. Not sure what he created his sheets in (likely QBasic or VisualBasic as this was late 1990s), so my attempt is to recreate this as close as possible, using modern web technologies.

Built with HTML, CSS and Typescript and Vite in (more than) a few hours. I'm also using this as an exercise to learn newer web technologies (like TS and Vite). Is this overkill? Yes. Was it worth it? TBD (but likely yes).

## Features

For generating the problems, there's several configuration options:

- Choose from the 4 operators to generate problems for, or use a mix of operators
- Set the min/max operand values (0-1000 inclusive, may adjust)
  - The two operand min/max values can be set independently
  - For division problems, the second operand is regenerated if it's 0 to avoid divide by zero problems
- Set the number of problems to generate
  - Currently I'm creating the PDF so that it fits 24 problems (4x6) per page, which may change
- Set the operand order (highest or lowest first)
- Option to not have negative answers, which overrides operand order to highest first (helpful with subtraction problems)
- Option to use long division notation in displaying problems
- Option to make answers be integers only (for division problems)
  - If unselected, then answers are rounded to 3 decimal places where needed
- Configuration options and resulting problems can be saved by using the same URL
  - When the problems are generated, you can click the `Save Config` button to rewrite the current URL with parameters that specify which options are set and their respective values
  - When returning to the site with the same URL, the problems generated will be the same, handled by the `seed` value in the form. A different seed will generate different problems
- Throwback wallpaper! 
  - Wallpaper is randomly chosen on first visit and reloads
  - The Select menu below the windows can change the background, saving the choice in localStorage for future visits


For generating the PDFs, there's a couple options to change:

- Set the font used in the generated PDF
  - If something fails, this will fall back to using the default Courier font
- Add the header to the first page
  - Header is simply `NAME: ________ DATE: ______`, like back in school
- Show the answers on the page (like an answer sheet)

## Status

It's at the MVP stage right now with basic functionality available.

There are a couple features still in-progress:

- Allow multiple operators, instead of one or all

See [ISSUES](https://github.com/sphars/math-sheets/issues) for details about upcoming features.

## Development

This site is built with Typescript and Vite. Only requirement is Node v22+. To run locally, clone the repo, then

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

My dad, for making us kids do math during summer breaks. This was the inspiration for this project. Thanks Dad!

### Design

- [98.css](https://jdan.github.io/98.css/) for the awesome CSS library
- [Windows Wallpaper Wiki](https://windowswallpaper.miraheze.org/wiki/Windows_95) (and Microsoft, I guess) for the Windows 98 background tiles

### Dependencies

- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for using tables in the PDF

### Fonts

- [Glyphr Studio](https://www.glyphrstudio.com/) for font editing (project file in repo root)
- [Dotrice](https://www.1001fonts.com/dotrice-font.html) (dot matrix style font) by Paul Flo Williams, modified by me to add some additional characters:
  - Division Sign `÷`
  - Multiplication Sign `×`
- [Chivo Mono](https://fonts.google.com/specimen/Chivo+Mono)
- [Courier](https://github.com/dse/font-og-courier)
- [Inconsolata](https://fonts.google.com/specimen/Inconsolata)
- [Noto Sans Mono](https://fonts.google.com/specimen/Noto+Sans+Mono)
- [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono)
- [Space Mono](https://fonts.google.com/specimen/Space+Mono)
- [Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex)
