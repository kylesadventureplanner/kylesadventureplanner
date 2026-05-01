# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edit-mode-global.spec.js >> Edit Mode – target-table selectors >> automation row persistence prefers workbook row ids when available
- Location: tests/edit-mode-global.spec.js:1370:3

# Error details

```
Error: page.evaluate: TypeError: window.handleUpdateAllDescriptions is not a function
    at eval (eval at evaluate (:302:30), <anonymous>:4:54)
    at UtilityScript.evaluate (<anonymous>:304:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - heading "📝 Edit Mode" [level=1] [ref=e6]
          - paragraph [ref=e7]: Manage locations, automation, and settings
          - generic [ref=e8]:
            - generic [ref=e9]: "Editing:"
            - generic [ref=e10]: Nature_Locations
            - generic [ref=e11]: (Nature_Locations.xlsx)
          - generic [ref=e12]:
            - generic "When enabled, automation runs are blocked on critical preflight failures like missing auth or no targets." [ref=e13]:
              - checkbox "Hard preflight block" [ref=e14] [cursor=pointer]
              - text: Hard preflight block
            - generic [ref=e15]: "Preflight: 1 target selected, but Graph auth is missing."
            - group [ref=e16]:
              - generic "Why blocked?" [ref=e17] [cursor=pointer]
            - button "Copy diagnostics" [ref=e18] [cursor=pointer]
            - button "Copy all diagnostics" [ref=e19] [cursor=pointer]
        - button "✕" [ref=e20] [cursor=pointer]
      - tablist "Edit mode sections" [ref=e21]:
        - tab "➕ Add Places" [ref=e22] [cursor=pointer]:
          - generic: ➕ Add Places
        - tab "🔄 Automation" [active] [selected] [ref=e23] [cursor=pointer]
        - tab "💾 Backup" [ref=e24] [cursor=pointer]
        - tab "📅 History" [ref=e25] [cursor=pointer]
        - tab "🎪 Festival Config 3 providers enabled • max 8" [ref=e26] [cursor=pointer]:
          - generic:
            - text: 🎪 Festival Config
            - generic: 3 providers enabled • max 8
    - generic [ref=e27]:
      - text: Critical configuration
      - generic [ref=e28]: ⚙️ Automation default target table
      - generic [ref=e29]:
        - generic [ref=e30]: Automation default target table
        - combobox "Automation default target table" [ref=e31]:
          - option "Nature_Locations (Nature_Locations.xlsx)" [selected]
          - option "Coffee (Retail_Food_and_Drink.xlsx)"
          - option "Retail (Retail_Food_and_Drink.xlsx)"
          - option "Restaurants (Retail_Food_and_Drink.xlsx)"
          - option "Festivals (Entertainment_Locations.xlsx)"
          - option "Wildlife_Animals (Entertainment_Locations.xlsx)"
          - option "General_Entertainment (Entertainment_Locations.xlsx)"
    - tabpanel "🔄 Automation" [ref=e32]:
      - generic [ref=e33]:
        - button "Expand all" [ref=e34] [cursor=pointer]
        - button "Collapse all" [ref=e35] [cursor=pointer]
      - generic [ref=e36]:
        - generic [ref=e37]: 🩺 Places Health Check
        - button "▼ Expand" [ref=e38] [cursor=pointer]
      - generic [ref=e39]:
        - generic [ref=e40]: 🔍 Fix Missing Place IDs
        - button "▼ Expand" [ref=e41] [cursor=pointer]
      - generic [ref=e42]:
        - generic [ref=e43]: 🔄 Refresh Place IDs
        - button "▼ Expand" [ref=e44] [cursor=pointer]
      - generic [ref=e45]:
        - generic [ref=e46]: 🏷️ Auto-Tag All
        - button "▼ Expand" [ref=e47] [cursor=pointer]
      - generic [ref=e48]:
        - generic [ref=e49]: 🏷️ Batch Tag Actions
        - button "▼ Expand" [ref=e50] [cursor=pointer]
      - generic [ref=e51]:
        - generic [ref=e52]: 📝 Fill Missing Fields
        - button "▼ Expand" [ref=e53] [cursor=pointer]
      - generic [ref=e54]:
        - generic [ref=e55]: 🕐 Update Hours
        - button "▼ Expand" [ref=e56] [cursor=pointer]
      - generic [ref=e57]:
        - generic [ref=e58]: 📝 Update Descriptions
        - button "▼ Expand" [ref=e59] [cursor=pointer]
      - generic [ref=e60]:
        - generic [ref=e61]: 🔄 Force Update All Fields
        - button "▼ Expand" [ref=e62] [cursor=pointer]
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]: 🧹 Remove Exact Duplicates
          - generic [ref=e66]: "Removed: --"
        - button "▼ Expand" [ref=e67] [cursor=pointer]
  - button "⌨️ Shortcuts" [ref=e68] [cursor=pointer]
  - dialog "Edit Mode Shortcuts" [ref=e69]:
    - generic [ref=e70]:
      - generic [ref=e71]:
        - generic [ref=e72]: Edit Mode Shortcuts
        - generic [ref=e73]: Available shortcuts for this page
      - button "Close" [ref=e74] [cursor=pointer]
    - generic [ref=e75]:
      - generic [ref=e76]:
        - generic [ref=e77]: General
        - generic [ref=e78]:
          - generic [ref=e80]: "?"
          - generic [ref=e81]: Open keyboard shortcuts
        - generic [ref=e82]:
          - generic [ref=e84]: Esc
          - generic [ref=e85]: Close the shortcuts drawer or active dialog
      - generic [ref=e86]:
        - generic [ref=e87]: Tab Navigation
        - generic [ref=e88]:
          - generic [ref=e89]:
            - generic [ref=e90]: ArrowLeft / ArrowRight
            - generic [ref=e91]: Home / End
            - generic [ref=e92]: Enter / Space
          - generic [ref=e93]: When the tab bar is focused, move between sections or activate the focused tab
      - generic [ref=e94]:
        - generic [ref=e95]: Batch Tagging Search
        - generic [ref=e96]:
          - generic [ref=e98]: Enter
          - generic [ref=e99]: Run the Batch Tagging target search from the “Find targets” field
        - generic [ref=e100]:
          - generic [ref=e102]: Enter
          - generic [ref=e103]: Run the existing-tag search from the Batch Tagging tag lookup field
```