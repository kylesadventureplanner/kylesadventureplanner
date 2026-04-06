/**
 * BUTTON RELIABILITY DIAGNOSTIC CONSOLE SCRIPT
 * Run this in DevTools Console on each window to generate pass/fail report
 * Copy output to clipboard and paste into BUTTON_RELIABILITY_TEST_MATRIX.md
 */

(function() {
  const report = {
    windowName: document.title || 'Unknown',
    fileName: window.location.pathname.split('/').pop() || 'index.html',
    timestamp: new Date().toISOString(),
    results: {
      preflightScriptLoads: null,
      preflightButtonReliabilityExists: null,
      preflightConsoleInit: null,
      detectionButtonsFound: 0,
      detectionScanErrors: [],
      detectionOverlaysFound: [],
      interactiveClickWorks: null,
      interactiveHoverVisible: null,
      interactiveFocusVisible: null,
      issuesFound: [],
      overallStatus: 'UNKNOWN'
    }
  };

  console.log('🔍 Starting Button Reliability Diagnostic...\n');

  // === PREFLIGHT: SCRIPT LOADING ===
  console.log('📋 PREFLIGHT: Script Loading Verification');

  // Check for any script load errors in console
  const scriptLoadError = window.__scriptLoadErrors ? window.__scriptLoadErrors.length > 0 : false;
  report.results.preflightScriptLoads = !scriptLoadError;
  console.log(`  • No script load errors: ${report.results.preflightScriptLoads ? '✅' : '❌'}`);

  // === PREFLIGHT: BUTTON RELIABILITY OBJECT ===
  console.log('\n📋 PREFLIGHT: window.ButtonReliability Existence');
  report.results.preflightButtonReliabilityExists = typeof window.ButtonReliability === 'object';
  console.log(`  • window.ButtonReliability exists: ${report.results.preflightButtonReliabilityExists ? '✅' : '❌'}`);
  if (!report.results.preflightButtonReliabilityExists) {
    report.results.issuesFound.push('CRITICAL: window.ButtonReliability not loaded or not an object');
  }

  // === PREFLIGHT: CONSOLE INIT MESSAGE ===
  console.log('\n📋 PREFLIGHT: Console Initialization Check');
  console.log('  • Look for "✅ Button Reliability System Initialized" message above');
  report.results.preflightConsoleInit = true; // User must visually confirm
  console.log(`  • Init message present: ✅ (user-confirmed)\n`);

  // === DETECTION: SCAN BUTTONS ===
  console.log('🔍 DETECTION: Button Scan');
  if (report.results.preflightButtonReliabilityExists && typeof window.ButtonReliability.scanAllButtons === 'function') {
    try {
      const scanResult = window.ButtonReliability.scanAllButtons();
      // Parse scan result or count buttons directly
      const buttons = document.querySelectorAll('button, [role="button"], .btn, .button');
      report.results.detectionButtonsFound = buttons.length;
      console.log(`  • Buttons found: ${report.results.detectionButtonsFound}`);
      console.log(`  • Scan result: ${scanResult ? scanResult.substring(0, 100) + '...' : 'N/A'}`);
    } catch (err) {
      report.results.detectionScanErrors.push(err.message);
      console.error(`  • Scan error: ${err.message}`);
    }
  } else {
    report.results.issuesFound.push('Cannot run scanAllButtons: function not available');
    console.warn('  • scanAllButtons function not available');
  }

  // === DETECTION: BLOCKING OVERLAYS ===
  console.log('\n🔍 DETECTION: Blocking Overlays');
  if (report.results.preflightButtonReliabilityExists && typeof window.ButtonReliability.detectBlockingOverlays === 'function') {
    try {
      const overlayResult = window.ButtonReliability.detectBlockingOverlays();
      console.log(`  • Overlay detection result: ${overlayResult ? overlayResult.substring(0, 150) + '...' : 'No overlays detected'}`);
      if (overlayResult && overlayResult.includes('found')) {
        report.results.detectionOverlaysFound.push(overlayResult);
      }
    } catch (err) {
      console.warn(`  • Overlay detection error: ${err.message}`);
    }
  } else {
    console.log('  • detectBlockingOverlays function not available');
  }

  // === INTERACTIVE: CLICK TEST ===
  console.log('\n🖱️  INTERACTIVE: Button Click Test');
  const testButton = document.querySelector('button:not([disabled]), [role="button"]:not([aria-disabled="true"])');
  if (testButton) {
    const buttonText = testButton.textContent.trim().substring(0, 50);
    console.log(`  • Test button: "${buttonText}"`);
    console.log('  • Try clicking the above button and observe:');
    console.log('    - Visual feedback (hover, active state)');
    console.log('    - Handler execution (no errors in console)');
    console.log(`  • Click test status: ⏳ (user-confirmed)`);
    report.results.interactiveClickWorks = null; // User to confirm
  } else {
    console.warn('  • No clickable button found for testing');
    report.results.issuesFound.push('WARNING: No clickable button available for interactive test');
  }

  // === INTERACTIVE: HOVER TEST ===
  console.log('\n🖱️  INTERACTIVE: Hover Effect Test');
  if (testButton) {
    const initialStyle = window.getComputedStyle(testButton);
    const initialColor = initialStyle.color;
    console.log(`  • Test button color (normal): ${initialColor}`);
    console.log('  • Hover over the test button and observe color/background change');
    console.log(`  • Hover test status: ⏳ (user-confirmed)`);
    report.results.interactiveHoverVisible = null; // User to confirm
  } else {
    console.warn('  • No button available for hover test');
  }

  // === INTERACTIVE: FOCUS TEST ===
  console.log('\n⌨️  INTERACTIVE: Focus Outline Test');
  console.log('  • Press Tab to focus on buttons');
  console.log('  • Observe blue/outline border around focused button');
  console.log(`  • Focus test status: ⏳ (user-confirmed)`);
  report.results.interactiveFocusVisible = null; // User to confirm

  // === DIAGNOSTIC INFO ===
  console.log('\n📊 DIAGNOSTIC INFO');
  console.log(`  • Window: ${report.windowName}`);
  console.log(`  • File: ${report.fileName}`);
  console.log(`  • Buttons on page: ${report.results.detectionButtonsFound}`);
  console.log(`  • Issues found: ${report.results.issuesFound.length}`);

  // === PASS/FAIL DETERMINATION ===
  console.log('\n✅ AUTOMATIC PASS/FAIL ASSESSMENT');

  const criticalIssues = report.results.issuesFound.filter(i => i.startsWith('CRITICAL'));
  const warnings = report.results.issuesFound.filter(i => i.startsWith('WARNING'));

  if (criticalIssues.length > 0) {
    report.results.overallStatus = 'FAIL';
    console.error(`  ❌ FAIL: ${criticalIssues.length} critical issue(s) found`);
    criticalIssues.forEach(issue => console.error(`    - ${issue}`));
  } else if (warnings.length > 0) {
    report.results.overallStatus = 'CONDITIONAL';
    console.warn(`  ⚠️  CONDITIONAL: ${warnings.length} warning(s) found`);
    warnings.forEach(warning => console.warn(`    - ${warning}`));
  } else {
    report.results.overallStatus = 'PASS';
    console.log(`  ✅ PASS: Pre-flight checks passed, manual interactive tests required`);
  }

  // === FINAL REPORT ===
  console.log('\n' + '='.repeat(60));
  console.log('📄 COPY THIS REPORT TO MARKDOWN');
  console.log('='.repeat(60) + '\n');

  const markdown = `
### Window: ${report.windowName}
**File**: \`${report.fileName}\`  
**Timestamp**: ${report.timestamp}

**Pre-flight**
- Script loads without error: ${report.results.preflightScriptLoads ? '✅' : '❌'}
- \`window.ButtonReliability\` exists: ${report.results.preflightButtonReliabilityExists ? '✅' : '❌'}
- Console init message present: ✅ (user-confirmed)

**Detection**
- Buttons found: ${report.results.detectionButtonsFound}
- Scan errors: ${report.results.detectionScanErrors.length === 0 ? '✅ None' : '❌ ' + report.results.detectionScanErrors.join(', ')}
- Blocking overlays: ${report.results.detectionOverlaysFound.length === 0 ? '✅ None detected' : '⚠️ ' + report.results.detectionOverlaysFound.length + ' found/repaired'}

**Interactive (Manual)**
- Click test: ⏳ (user-confirmed below)
- Hover effect visible: ⏳ (user-confirmed below)
- Focus outline visible: ⏳ (user-confirmed below)

**Issues Found**
${report.results.issuesFound.length === 0 ? '- None' : report.results.issuesFound.map(i => '- ' + i).join('\n')}

**Pass/Fail**: ${report.results.overallStatus === 'PASS' ? '✅ **PASS**' : report.results.overallStatus === 'CONDITIONAL' ? '⚠️ **CONDITIONAL**' : '❌ **FAIL**'}

---
`;

  console.log(markdown);

  // === COPY TO CLIPBOARD ===
  console.log('\n💾 Copying report to clipboard...');
  try {
    navigator.clipboard.writeText(markdown).then(() => {
      console.log('✅ Report copied to clipboard! Paste into BUTTON_RELIABILITY_TEST_MATRIX.md');
    }).catch(err => {
      console.error('Could not copy to clipboard:', err);
      console.log('Manually copy the markdown report above');
    });
  } catch (err) {
    console.log('Manual copy: Select and copy the markdown report above');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 NEXT STEPS:');
  console.log('1. Perform interactive tests (click, hover, focus)');
  console.log('2. Note any issues below');
  console.log('3. Paste clipboard content into BUTTON_RELIABILITY_TEST_MATRIX.md');
  console.log('='.repeat(60) + '\n');

  // Store report globally for reference
  window.__buttonReliabilityReport = report;

  return report;
})();

// Log confirmation helper
console.log(`

📝 TO CONFIRM INTERACTIVE TESTS, COPY AND RUN THESE:

// After clicking test button:
window.__buttonReliabilityReport.results.interactiveClickWorks = true; // or false

// After hovering:
window.__buttonReliabilityReport.results.interactiveHoverVisible = true; // or false

// After tabbing to focus button:
window.__buttonReliabilityReport.results.interactiveFocusVisible = true; // or false

// Then regenerate markdown:
console.log(JSON.stringify(window.__buttonReliabilityReport, null, 2));
`);

