const fs = require('fs');
try {
  const src = fs.readFileSync('/Users/kylechavez/WebstormProjects/kylesadventureplanner/JS Files/nature-challenge-tab-system.js', 'utf8');
  new Function(src);
  process.stdout.write('SYNTAX_OK\n');
  process.exit(0);
} catch (e) {
  process.stderr.write('SYNTAX_ERR: ' + e.message + '\n');
  process.exit(1);
}

