#!/usr/bin/env python3
"""
Button Reliability Final Verification Report Generator
Validates all standalone windows have proper script loading and configuration
"""

import json
import pathlib
import re
from collections import defaultdict

def check_script_loading(html_file):
    """Check if button-reliability-system.js is loaded in the HTML file"""
    text = html_file.read_text(encoding='utf-8', errors='ignore')
    has_loader = 'button-reliability-system.js' in text

    # Find the line number
    lines = text.split('\n')
    line_num = None
    for i, line in enumerate(lines, 1):
        if 'button-reliability-system.js' in line:
            line_num = i
            break

    return {
        'loaded': has_loader,
        'line': line_num
    }

def check_archived_dependencies(html_file):
    """Check for unresolved Archived-Files dependencies"""
    text = html_file.read_text(encoding='utf-8', errors='ignore')
    archived_refs = re.findall(r'Archived-Files/JS/[\w\-\.]+\.js', text)

    return {
        'has_archived': len(archived_refs) > 0,
        'count': len(archived_refs),
        'refs': list(set(archived_refs))
    }

def check_consolidated_loading(html_file):
    """Check which consolidated systems are loaded"""
    text = html_file.read_text(encoding='utf-8', errors='ignore')
    consolidated_systems = re.findall(r'consolidated-[\w\-]+\.js', text)

    return {
        'count': len(consolidated_systems),
        'systems': list(set(consolidated_systems))
    }

def check_button_count(html_file):
    """Count approximate number of buttons in HTML"""
    text = html_file.read_text(encoding='utf-8', errors='ignore')
    button_count = len(re.findall(r'<button[^>]*>', text, re.I))
    role_button = len(re.findall(r'role=["\']button["\']', text, re.I))

    return {
        'html_buttons': button_count,
        'role_buttons': role_button,
        'total_interactive': button_count + role_button
    }

def main():
    root = pathlib.Path('/Users/kylechavez/WebstormProjects/kylesadventureplanner')
    html_dir = root / 'HTML Files'

    # Define the windows to test
    windows = {
        'Main App': 'index.html',
        'Automation Control Panel': 'automation-control-panel.html',
        'Edit Mode': 'edit-mode.html',
        'Edit Mode (Enhanced)': 'edit-mode-enhanced.html',
        'Edit Mode (Simple)': 'edit-mode-simple.html',
        'Edit Mode (New)': 'edit-mode-new.html',
        'City Viewer Window': 'city-viewer-window.html',
        'Find Near Me Window': 'find-near-me-window.html',
        'Trail Explorer Window': 'trail-explorer-window.html',
        'Adventure Details Window': 'adventure-details-window.html',
        'Bike Details Window': 'bike-details-window.html',
    }

    print('\n' + '='*80)
    print('BUTTON RELIABILITY SYSTEM - PRE-TEST VALIDATION REPORT')
    print('='*80 + '\n')

    results = {}
    pass_count = 0
    fail_count = 0

    for window_name, filename in windows.items():
        if filename == 'index.html':
            html_file = root / filename
        else:
            html_file = html_dir / filename

        if not html_file.exists():
            print(f"❌ {window_name}: FILE NOT FOUND ({filename})")
            fail_count += 1
            continue

        # Run checks
        loader_status = check_script_loading(html_file)
        archived_status = check_archived_dependencies(html_file)
        consolidated_status = check_consolidated_loading(html_file)
        button_status = check_button_count(html_file)

        # Determine pass/fail
        is_pass = loader_status['loaded'] and not archived_status['has_archived']

        if is_pass:
            pass_count += 1
            status = '✅ PASS'
        else:
            fail_count += 1
            status = '❌ FAIL'

        print(f"{status} | {window_name}")
        print(f"        File: {filename}")
        print(f"        Buttons: {button_status['total_interactive']} interactive elements")

        if loader_status['loaded']:
            print(f"        ✅ button-reliability-system.js loaded (line {loader_status['line']})")
        else:
            print(f"        ❌ button-reliability-system.js NOT LOADED")

        if archived_status['has_archived']:
            print(f"        ❌ {archived_status['count']} Archived-Files reference(s) found:")
            for ref in archived_status['refs']:
                print(f"           - {ref}")
        else:
            print(f"        ✅ No archived dependencies")

        if consolidated_status['count'] > 0:
            print(f"        ✅ {consolidated_status['count']} consolidated system(s):")
            for sys in consolidated_status['systems']:
                print(f"           - {sys}")

        print()

        results[window_name] = {
            'file': filename,
            'loader': loader_status,
            'archived': archived_status,
            'consolidated': consolidated_status,
            'buttons': button_status,
            'pass': is_pass
        }

    # Summary
    print('='*80)
    print('SUMMARY')
    print('='*80)
    total = pass_count + fail_count
    pct = int((pass_count / total * 100)) if total > 0 else 0

    print(f"\n✅ PASS:  {pass_count}/{total} ({pct}%)")
    print(f"❌ FAIL:  {fail_count}/{total}")

    if fail_count == 0:
        print("\n🎉 ALL WINDOWS READY FOR INTERACTIVE TESTING!\n")
        print("Next Steps:")
        print("1. Open each window in browser (start with Automation Control Panel)")
        print("2. For each window, run the diagnostic script from DevTools Console:")
        print("   Copy from: docs/BUTTON_RELIABILITY_CONSOLE_DIAGNOSTIC.js")
        print("3. Follow on-screen prompts to confirm interactive tests")
        print("4. Copy markdown results and paste into BUTTON_RELIABILITY_TEST_MATRIX.md")
        print("5. Aggregate all results in final Summary Report section\n")
    else:
        print(f"\n⚠️  {fail_count} WINDOW(S) NEED ATTENTION:\n")
        for window_name, data in results.items():
            if not data['pass']:
                print(f"  - {window_name}")
                if not data['loader']['loaded']:
                    print(f"    → Add: <script src=\"../JS Files/button-reliability-system.js\"></script>")
                if data['archived']['has_archived']:
                    print(f"    → Remove archived dependencies and use consolidated systems")
        print()

    print('='*80 + '\n')

if __name__ == '__main__':
    main()

