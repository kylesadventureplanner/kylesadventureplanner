# Mobile Polish - Testing Guide
**Focus:** Trail Explorer Preview Chip Mobile Optimization
**Date:** April 7, 2026

---

## Quick Test Checklist

### 🔍 Visual Inspection

#### Desktop (1200px+)
- [ ] Preview cards show 3 chips per row max
- [ ] Text reads "Drive: Under 30 min", "Length: Short"
- [ ] Padding: `2px 8px`, Font: `11px`
- [ ] Card titles at 12px, metadata at 11px
- [ ] Card gaps at 8px, margin-top at 10px

#### Tablet (481px - 768px)
- [ ] Chips slightly tighter: `2px 6px`, Font: `10px`
- [ ] Card gaps at 6px, margin-top at 8px
- [ ] Card padding: `6px 8px`
- [ ] Titles at 11px, metadata at 10px

#### Mobile (≤480px) ✨ **NEW**
- [ ] Ultra-compact chips: `1px 5px`, Font: `9px`
- [ ] Text shows "Drive: <30m", "Length: Short"
- [ ] Card gaps at 3px, margin-top at 6px
- [ ] Card padding: `5px 7px`
- [ ] Titles at 10px, metadata at 9px
- [ ] No text overflow in chips
- [ ] All chips fit on one line

---

## Browser DevTools Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click **Device Toolbar** (Ctrl+Shift+M)
3. Select device or set custom viewport

### Test Viewports
```
iPhone SE:        375px × 667px
iPhone 12/13:     390px × 844px  
iPhone 14 Pro:    430px × 932px
Samsung Galaxy:   360px × 800px
iPad:             768px × 1024px
iPad Pro:         1024px × 1366px
Desktop (1200px): 1200px × 800px
```

### CSS Inspection
1. Right-click preview card → **Inspect**
2. Check `.bike-explorer-preview-why-chip` styles
3. Verify media query applies at breakpoints

---

## Manual Testing Scenarios

### Scenario 1: Trail Explorer Filter Selection
**Steps:**
1. Navigate to Bike Trails tab
2. Open Trail Explorer modal
3. Select filters: "Under 30 min drive", "Short distance"
4. Observe preview cards appearing

**Expected Results:**
- [ ] Chips show short labels: "Drive: <30m", "Length: Short"
- [ ] On mobile (<480px): Chips fit on one line
- [ ] On tablet (481-768px): One chip per line max
- [ ] Font sizes reduce smoothly

---

### Scenario 2: Fallback Chips (No Matching Filters)
**Steps:**
1. Select difficult filter combo with no matches
2. Preview shows closest matches with fallback chips

**Expected Results:**
- [ ] Fallback shows: "15m drive", "2.5mi", "Easy"
- [ ] Text is capitalized correctly
- [ ] No "undefined" or broken text

---

### Scenario 3: Long Trail Names
**Steps:**
1. Filter for trails with long names
2. View in mobile preview

**Expected Results:**
- [ ] Long trail names wrap properly
- [ ] Preview card expands, not squeezed
- [ ] Chips don't overlap with title

---

### Scenario 4: Many Matching Trails
**Steps:**
1. Select broad filters (e.g., "Any difficulty")
2. Observe multiple preview cards

**Expected Results:**
- [ ] Cards stack vertically
- [ ] Gap between cards reduces on mobile
- [ ] All three preview cards visible
- [ ] No horizontal scroll needed

---

## Performance Testing

### Page Load
- [ ] No layout shift when chips load
- [ ] Images load within 1 second
- [ ] Smooth scroll performance (60 fps)

### Responsiveness
- [ ] Chips render within 100ms
- [ ] No jank when resizing viewport
- [ ] Media queries apply instantly

### Network
- [ ] No additional requests for mobile
- [ ] CSS file size unchanged
- [ ] No new HTTP roundtrips

---

## Accessibility Testing

### Screen Reader (NVDA / JAWS)
- [ ] Chips announced with full text
- [ ] Short labels understood in context
- [ ] Navigate with Tab key works

### Keyboard Navigation
- [ ] Tab through all interactive chips
- [ ] Focus visible on all buttons
- [ ] Enter key triggers actions

### Color Contrast
- [ ] Chip text contrast ≥ 4.5:1 (WCAG AA)
- [ ] Title text meets contrast requirements
- [ ] Preview card borders visible

### High Contrast Mode
- [ ] Chips remain readable
- [ ] Borders visible
- [ ] No text disappears

---

## Label Verification

### Before (Verbose)
```
"Drive Time: Under 30 min"
"Length: Short"
"Difficulty: Moderate"
"Elevation: Lots of Climbing"
```

### After (Optimized)
```
"Drive: <30m"
"Length: Short"
"Difficulty: Mod"
"Elevation: Steep"
```

**Verification Checklist:**
- [ ] All abbreviations used correctly
- [ ] No verbose text remains
- [ ] Labels still meaningful

---

## CSS Classes to Test

### Primary Classes
```
.bike-explorer-preview-why-chip       ← Chip text styling
.bike-explorer-preview-card           ← Card container
.bike-explorer-preview-card-title     ← Card heading
.bike-explorer-preview-card-meta      ← Drive/distance text
.bike-explorer-preview-chip-row       ← Chip container
.bike-explorer-preview-cards          ← Grid container
```

### Media Queries to Verify
```
@media (max-width: 768px)  {  }  ← Tablet
@media (max-width: 480px)  {  }  ← Mobile
```

**Test Method:**
1. Resize browser to 481px, 769px, 1200px
2. Open DevTools Computed tab
3. Verify properties match expected values

---

## Example Test Output

### ✅ iPhone SE (375px) - PASS
```
.bike-explorer-preview-why-chip
├─ padding: 1px 5px        ✓
├─ font-size: 9px          ✓
└─ text: "Drive: <30m"      ✓

.bike-explorer-preview-card
├─ padding: 5px 7px        ✓
└─ fits on 375px width      ✓
```

### ✅ iPad (768px) - PASS
```
.bike-explorer-preview-chip-row
├─ gap: 4px                ✓
├─ margin-top: 4px         ✓
└─ fits without wrapping    ✓
```

### ✅ Desktop (1200px) - PASS
```
.bike-explorer-preview-why-chip
├─ padding: 2px 8px        ✓
├─ font-size: 11px         ✓
└─ text: "Drive: <30m"      ✓
```

---

## Known Limitations & Edge Cases

### Limitations
- [ ] Very long trail names (>50 chars) may still wrap
- [ ] Extremely narrow devices (<360px) not tested
- [ ] RTL languages not optimized (future phase)

### Edge Cases to Test
- [ ] Empty chip arrays
- [ ] Null/undefined trail data
- [ ] Very fast viewport resizing
- [ ] Multiple explorer windows open
- [ ] Mixed viewport sizes (split screen)

---

## Success Metrics

### Mobile Experience
- ✅ 30-40% text reduction achieved
- ✅ Zero horizontal scroll needed
- ✅ All chips fit on single line (<480px)
- ✅ Font sizes readable at all breakpoints

### User Feedback Targets
- 90%+ can read labels clearly
- 85%+ prefer compact design
- 80%+ no frustration with mobile view

---

## Regression Testing

### Areas to Monitor
1. **Trail Explorer Modal**
   - Preset save/load still works
   - Chip removal still works
   - Preview count accurate

2. **Filter System**
   - Base filters unaffected
   - Quick filters still work
   - Search functionality intact

3. **Other Tabs**
   - No style bleed to Adventures tab
   - No style bleed to other pages
   - Shared CSS classes unaffected

### Regression Test Steps
1. Load app in fresh browser
2. Go through each tab
3. Verify no broken layouts
4. Check console for errors

---

## Device-Specific Notes

### iOS Safari
- [ ] Viewport meta tag respected
- [ ] Touch interactions responsive
- [ ] No rendering lag on home screen

### Android Chrome
- [ ] Font rendering crisp
- [ ] Touch targets large enough (44px+)
- [ ] Smooth scroll works

### Windows Firefox
- [ ] Subpixel rendering looks good
- [ ] Media queries trigger correctly
- [ ] No flickering on resize

---

## Final Sign-Off

- [ ] All visual tests passed
- [ ] All responsive breakpoints working
- [ ] No regressions detected
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] Ready for production deployment

**Tester Name:** _________________
**Date Tested:** _________________
**Browser/Device:** _________________
**Result:** ☐ PASS ☐ FAIL

---

## Questions?

If you find issues:
1. Document the viewport size (DevTools)
2. Screenshot the problem
3. Check browser console for errors
4. Compare to this guide's expected output
5. Report with device model + browser version

**Target:** Excellent mobile experience on all screens ≤768px


