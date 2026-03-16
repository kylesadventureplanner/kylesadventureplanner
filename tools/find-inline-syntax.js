const fs = require('fs');
const path = require('path');

const files = [
  '/Users/kylechavez/WebstormProjects/Kyles_Adventure_Finder/kylesadventureplanner/index.html',
  '/Users/kylechavez/WebstormProjects/Kyles_Adventure_Finder/kylesadventureplanner/HTML Files/automation-control-panel.html'
];

for (const filePath of files) {
  const text = fs.readFileSync(filePath, 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  let scriptIndex = 0;
  let syntaxErrors = 0;

  while ((match = re.exec(text))) {
    scriptIndex += 1;
    const code = match[1] || '';
    const startLine = text.slice(0, match.index).split('\n').length;

    try {
      // Parse-only check for inline script syntax.
      new Function(code);
    } catch (error) {
      syntaxErrors += 1;
      console.log(`FILE ${path.basename(filePath)} inline#${scriptIndex} startLine=${startLine}`);
      console.log(`  ${error.message}`);
    }
  }

  console.log(`SUMMARY ${path.basename(filePath)} inlineScripts=${scriptIndex} syntaxErrors=${syntaxErrors}`);
}

