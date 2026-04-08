// COMPREHENSIVE BUTTON DIAGNOSTICS
// Paste this entire script into browser console (F12) and run it
// It will tell us EXACTLY what's happening with the buttons

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  COMPREHENSIVE BUTTON DIAGNOSTICS');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// 1. Check if visited locations root exists
const root = document.getElementById('visitedLocationsRoot');
console.log('1. ROOT ELEMENT:');
console.log('   visitedLocationsRoot exists:', !!root);
if (!root) {
  console.error('   ❌ CRITICAL: Root not found - tab may not be loaded');
}

// 2. Check Focus buttons exist
const focusButtons = document.querySelectorAll('[data-category-filter]');
console.log('\n2. FOCUS BUTTONS:');
console.log('   Total found:', focusButtons.length);
console.log('   Expected: 9');

if (focusButtons.length === 0) {
  console.error('   ❌ CRITICAL: No focus buttons found!');
} else if (focusButtons.length < 9) {
  console.warn('   ⚠️  WARNING: Expected 9 buttons, found', focusButtons.length);
}

// 3. Check each button's properties
console.log('\n3. BUTTON PROPERTIES:');
focusButtons.forEach((btn, idx) => {
  const category = btn.getAttribute('data-category-filter');
  const computed = window.getComputedStyle(btn);
  const rect = btn.getBoundingClientRect();

  console.log(`\n   Button ${idx + 1}: ${category}`);
  console.log(`   - Disabled: ${btn.disabled}`);
  console.log(`   - Display: ${computed.display}`);
  console.log(`   - Visibility: ${computed.visibility}`);
  console.log(`   - Opacity: ${computed.opacity}`);
  console.log(`   - Pointer Events: ${computed.pointerEvents}`);
  console.log(`   - Position: ${computed.position}`);
  console.log(`   - Z-Index: ${computed.zIndex}`);
  console.log(`   - Width/Height: ${rect.width}x${rect.height}px`);
  console.log(`   - Visible on screen: ${rect.width > 0 && rect.height > 0 ? 'YES' : 'NO'}`);

  // Check if button is actually hidden
  if (computed.display === 'none') {
    console.error(`   ❌ PROBLEM: Button is display:none!`);
  }
  if (computed.visibility === 'hidden') {
    console.error(`   ❌ PROBLEM: Button is visibility:hidden!`);
  }
  if (computed.pointerEvents === 'none') {
    console.error(`   ❌ PROBLEM: Button has pointer-events:none!`);
  }
});

// 4. Test click event listener
console.log('\n4. EVENT LISTENERS:');
const testBtn = focusButtons[0];
if (testBtn) {
  console.log('   Testing first button for click listeners...');

  // Try to dispatch a test click
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });

  console.log('   - Can dispatch click event:', testBtn.dispatchEvent ? 'YES' : 'NO');

  // Check event listeners (Chrome/Firefox only)
  if (typeof getEventListeners === 'function') {
    const listeners = getEventListeners(testBtn);
    console.log('   - Click listeners attached:', listeners.click ? listeners.click.length : 0);
  } else {
    console.log('   - Event listener check: (not available in this browser)');
  }
}

// 5. Check click handler function
console.log('\n5. CLICK HANDLER:');
if (testBtn && testBtn.onclick) {
  console.log('   - Inline onclick handler: YES');
  console.log('   - Handler:', testBtn.onclick.toString().slice(0, 100) + '...');
} else {
  console.log('   - Inline onclick handler: NO (using event delegation)');
}

// 6. Simulate a click and check what happens
console.log('\n6. CLICK SIMULATION TEST:');
if (testBtn && root) {
  console.log('   Attempting to simulate click on first button...');

  try {
    // Set up a listener to see if click is handled
    let clickHandled = false;
    const handler = () => { clickHandled = true; };
    root.addEventListener('click', handler);

    // Try the click
    testBtn.click();

    // Check if it was handled
    setTimeout(() => {
      console.log('   - Click method executed: YES');
      console.log('   - Click was handled by listener: ' + (clickHandled ? 'YES ✅' : 'NO ❌'));
      root.removeEventListener('click', handler);
    }, 100);
  } catch (e) {
    console.error('   ❌ Error during click test:', e.message);
  }
}

// 7. Check refresh state
console.log('\n7. REFRESH STATE:');
console.log('   isRefreshing:', window.__visitedState?.isRefreshing ?? 'unknown');
console.log('   lastRender:', window.__visitedState?.lastRenderAt ?? 'unknown');

// 8. Check debug data
console.log('\n8. DEBUG DATA:');
console.log('   Note: Focus-button click counters appear only when visited diagnostics are enabled.');
console.log('   Focus button clicks recorded:', window.__debugFocusButtons?.clicks ?? 'none');
if (window.__debugFocusButtons?.lastClick) {
  console.log('   Last click:', window.__debugFocusButtons.lastClick);
}

// 9. Summary
console.log('\n════════════════════════════════════════════════════════════');
console.log('SUMMARY:\n');

let issues = [];
if (!root) issues.push('❌ Root element not found');
if (focusButtons.length === 0) issues.push('❌ No focus buttons in DOM');
focusButtons.forEach((btn, idx) => {
  const computed = window.getComputedStyle(btn);
  if (computed.display === 'none') issues.push(`❌ Button ${idx+1} is hidden (display:none)`);
  if (computed.pointerEvents === 'none') issues.push(`❌ Button ${idx+1} has pointer-events:none`);
});

if (issues.length === 0) {
  console.log('✅ All checks passed! Buttons appear to be properly configured.');
  console.log('\nNEXT: Try clicking a button and look for:');
  console.log('  1. Console shows: 🔘 Focus button clicked: ...');
  console.log('  2. Button highlights immediately');
  console.log('  3. Catalog filters in background');
} else {
  console.log('⚠️  ISSUES FOUND:\n');
  issues.forEach(issue => console.log('  ' + issue));
  console.log('\nThese issues must be fixed before buttons will work properly.');
}

console.log('\n════════════════════════════════════════════════════════════\n');


