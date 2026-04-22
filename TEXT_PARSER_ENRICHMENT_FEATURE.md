# 📝 Location Data Enrichment via Text Parser

## Overview
A smart text parser feature has been added to the Visited Locations tab that allows users to manually enrich location data by pasting free-form text blocks. The app intelligently extracts and structures the following fields:

- 📍 **Address** (street addresses)
- 🏙️ **City**
- 🗺️ **State** (2-letter abbreviation or full name)
- 📞 **Phone** (multiple formats supported)
- ⏰ **Hours of Operation**
- 📝 **Description** (any remaining text)

## Features

### 1. **Smart Text Parsing**
The parser uses intelligent regex patterns to identify and extract:

#### Phone Numbers
Recognizes multiple formats:
- `(555) 123-4567`
- `555-123-4567`
- `555.123.4567`
- `+1-555-123-4567`
- `+1 555 123 4567`

#### State Recognition
- Recognizes all 50 US state abbreviations (CA, TX, NY, FL, etc.)
- Case-insensitive matching
- Distinguishes state from city context

#### Address Detection
- Identifies lines starting with street numbers
- Captures full street addresses with names and numbers

#### Hours Recognition
- Detects common patterns: "Mon-Fri: 9am-5pm"
- Recognizes day abbreviations and time formats
- Supports am/pm, AM/PM, a.m., p.m. formats

#### Description
- Captures any remaining text not matched by other patterns
- Useful for general location notes or additional context

### 2. **User Interface**

#### Quick Action Button
A new **📝 Enrich Data** button appears in the Quick Actions menu for each location card:
```
Quick Actions
├── Directions
├── Google URL
├── Log Visit
├── Tag Manager
├── Edit Notes
├── 📷 Photos
├── 🔗 Find / Add URLs
└── 📝 Enrich Data ← NEW
```

#### Text Parser Modal
When clicked, opens a modal with:
1. **Text Input Area** — Large textarea for pasting location information
2. **Parse Button** — Triggers the extraction algorithm
3. **Preview Area** — Shows extracted and editable fields:
   - Address input
   - City input
   - State input
   - Phone input
   - Hours textarea (multi-line)
   - Description textarea (multi-line)
4. **Save Button** — Writes confirmed data to local storage and Excel (if signed in)

### 3. **Parsing Algorithm**

The parser processes text line-by-line with the following logic:

```javascript
parseLocationDataFromText(text)
```

**Processing Order:**
1. Split input into lines
2. For each line, attempt to match in order:
   - Phone number → extract and remove from line
   - State code → extract and remove from line
   - City name → extract if state was found
   - Street address → extract if starts with number
   - Hours pattern → extract time/day info
   - Default → add to description

**Key Characteristics:**
- Non-greedy extraction (stops after first match per category)
- Remaining text from partially matched lines goes to description
- Unmatched lines accumulate as description

### 4. **Example Usage**

**Input Text:**
```
123 Main Street
New York, NY 10001
(555) 123-4567
Mon-Fri: 9am-5pm, Sat-Sun: Closed
Great restaurant with outdoor seating and full bar. Known for their roasted chicken and craft cocktails. Reservations recommended on weekends.
```

**Parsed Output:**
- **Address:** `123 Main Street`
- **City:** `New York`
- **State:** `NY`
- **Phone:** `(555) 123-4567`
- **Hours:** `Mon-Fri: 9am-5pm, Sat-Sun: Closed`
- **Description:** `Great restaurant with outdoor seating and full bar. Known for their roasted chicken and craft cocktails. Reservations recommended on weekends.`

### 5. **Data Saving**

#### Local Storage
- All parsed data is immediately saved to the local `visitRecords` cache
- Updates the location item in the local cache via `updateExplorerCardDraft()`

#### OneDrive Sync
- If user is signed in with OneDrive access, the parser saves data to Excel
- Attempts to map each field to the corresponding column in the workbook
- Falls back gracefully if columns don't exist (shows friendly message)

#### Toast Notifications
- **Success:** "Location data updated locally."
- **OneDrive Save:** "Location data updated locally. Note: Some fields may require manual Excel sync."
- **Error:** Shows specific error message with fallback guidance

### 6. **Customization & Extensibility**

To add more fields (e.g., Cost, Rating, Website):

1. Add new regex pattern in `parseLocationDataFromText()`:
```javascript
// Cost pattern
if (!result.cost) {
  const costMatch = line.match(/\$+|\bcost[\s:]*([^,\n]+)/i);
  if (costMatch) {
    result.cost = costMatch[1].trim();
    matched = true;
  }
}
```

2. Add field to preview in `parseLocationText()`:
```javascript
<div class="visited-parser-field">
  <label for="visitedLocationParserCost">Cost</label>
  <input id="visitedLocationParserCost" type="text" value="${escapeHtml(parsed.cost || '')}" />
</div>
```

3. Add save logic in `saveLocationParsedData()`:
```javascript
const cost = (document.getElementById('visitedLocationParserCost') || {}).value || '';
if (cost) updates.cost = cost;
```

### 7. **Technical Details**

**File Changes:**
- `JS Files/visited-locations-tab-system.js`
  - Added `parseLocationDataFromText()` — Core parsing logic
  - Added `openLocationTextParserModal()` — Modal open handler
  - Added `closeLocationTextParserModal()` — Modal close handler
  - Added `parseLocationText()` — Trigger parsing and render preview
  - Added `saveLocationParsedData()` — Save to local + OneDrive
  - Added button handler in `bindControls()`
  - Added "📝 Enrich Data" button to quick actions menu

- `HTML Files/tabs/visited-locations-tab.html`
  - Added `#visitedLocationTextParserModal` — Modal dialog
  - Added `#visitedLocationTextParserBackdrop` — Modal backdrop
  - Added CSS styles for parser UI components

**API Integration:**
- Uses existing `updateExplorerCardDraft()` for local updates
- Uses existing `syncVisitedExplorerDetailFields()` for OneDrive sync
- Graceful fallback if Excel columns don't exist

### 8. **Limitations & Future Improvements**

**Current Limitations:**
- City detection requires state context (heuristic-based)
- No automatic deduplication if user pastes multiple entries
- No API-based address validation (purely regex-based)

**Future Enhancements:**
1. **Expand Pattern Library** — Add support for:
   - Website URLs
   - Cost/pricing ($, $$, $$$)
   - Difficulty levels (for outdoor locations)
   - Amenities/features

2. **AI-Powered Extraction** — Use LLM to:
   - Better understand context
   - Handle non-standard formats
   - Extract implicit information

3. **Batch Processing** — Allow users to:
   - Parse multiple locations at once
   - Import CSV/table data
   - Paste from rich text sources

4. **Validation & Suggestions** — Add:
   - Address validation via Google/Bing APIs
   - Phone number normalization
   - Hours conflict detection

### 9. **Testing Checklist**

- [ ] Open a location card's Quick Actions
- [ ] Click "📝 Enrich Data"
- [ ] Paste sample text with various formats
- [ ] Click "Parse 🔍"
- [ ] Verify extracted fields are accurate
- [ ] Edit any incorrect fields
- [ ] Click "Save to Data"
- [ ] Verify toast notification
- [ ] Reload page and check if data persisted
- [ ] If signed in with OneDrive, verify Excel column updated

### 10. **Example Test Cases**

**Test 1: Full Information**
```
Address: 456 Oak Avenue
Location: Portland, Oregon
Phone: (503) 555-1234
Hours: Open Daily 10am-10pm
Notes: Beautiful rooftop view, pet friendly
```

**Test 2: Partial Information**
```
Seattle, WA
(206) 555-9876
```

**Test 3: Mixed Formatting**
```
789 Pine St, Denver CO 80202
555-234-5678
Mon/Tue/Wed/Thu: 11am-9pm Fri-Sat: 11am-midnight Sun: closed
```

---

**Status:** ✅ **IMPLEMENTED & READY TO USE**

For questions or enhancements, refer to the parsing functions in `visited-locations-tab-system.js` lines 1990-2150.

