#!/usr/bin/env python3
"""
Fix CSV file by removing ALL problematic characters including:
1. Newlines and standard control characters
2. Backslash sequences  
3. Invisible Unicode characters
4. ALL EMOJIS
"""
import csv
import sys
import re
import unicodedata

def is_emoji(char):
    """Check if a character is an emoji."""
    code = ord(char)
    # Common emoji ranges
    emoji_ranges = [
        (0x1F600, 0x1F64F),  # Emoticons
        (0x1F300, 0x1F5FF),  # Misc Symbols and Pictographs
        (0x1F680, 0x1F6FF),  # Transport and Map
        (0x1F1E0, 0x1F1FF),  # Flags
        (0x2600, 0x26FF),    # Misc symbols
        (0x2700, 0x27BF),    # Dingbats
        (0xFE00, 0xFE0F),    # Variation Selectors
        (0x1F900, 0x1F9FF),  # Supplemental Symbols and Pictographs
        (0x1FA00, 0x1FA6F),  # Chess Symbols
        (0x1FA70, 0x1FAFF),  # Symbols and Pictographs Extended-A
        (0x231A, 0x231B),    # Watch, Hourglass
        (0x23E9, 0x23F3),    # Various symbols
        (0x23F8, 0x23FA),    # Various symbols
        (0x25AA, 0x25AB),    # Squares
        (0x25B6, 0x25C0),    # Triangles
        (0x25FB, 0x25FE),    # Squares
        (0x2614, 0x2615),    # Umbrella, Hot Beverage
        (0x2648, 0x2653),    # Zodiac
        (0x267F, 0x267F),    # Wheelchair
        (0x2693, 0x2693),    # Anchor
        (0x26A1, 0x26A1),    # High Voltage
        (0x26AA, 0x26AB),    # Circles
        (0x26BD, 0x26BE),    # Soccer, Baseball
        (0x26C4, 0x26C5),    # Snowman, Sun
        (0x26CE, 0x26CE),    # Ophiuchus
        (0x26D4, 0x26D4),    # No Entry
        (0x26EA, 0x26EA),    # Church
        (0x26F2, 0x26F3),    # Fountain, Golf
        (0x26F5, 0x26F5),    # Sailboat
        (0x26FA, 0x26FA),    # Tent
        (0x26FD, 0x26FD),    # Fuel Pump
        (0x2702, 0x2702),    # Scissors
        (0x2705, 0x2705),    # Check Mark
        (0x2708, 0x270D),    # Various
        (0x270F, 0x270F),    # Pencil
        (0x2712, 0x2712),    # Black Nib
        (0x2714, 0x2714),    # Check Mark
        (0x2716, 0x2716),    # X Mark
        (0x271D, 0x271D),    # Latin Cross
        (0x2721, 0x2721),    # Star of David
        (0x2728, 0x2728),    # Sparkles
        (0x2733, 0x2734),    # Eight Spoked Asterisk
        (0x2744, 0x2744),    # Snowflake
        (0x2747, 0x2747),    # Sparkle
        (0x274C, 0x274C),    # Cross Mark
        (0x274E, 0x274E),    # Cross Mark
        (0x2753, 0x2755),    # Question marks
        (0x2757, 0x2757),    # Exclamation
        (0x2763, 0x2764),    # Heart exclamation, Heart
        (0x2795, 0x2797),    # Plus, Minus, Division
        (0x27A1, 0x27A1),    # Right Arrow
        (0x27B0, 0x27B0),    # Curly Loop
        (0x27BF, 0x27BF),    # Double Curly Loop
        (0x2934, 0x2935),    # Arrows
        (0x2B05, 0x2B07),    # Arrows
        (0x2B1B, 0x2B1C),    # Squares
        (0x2B50, 0x2B50),    # Star
        (0x2B55, 0x2B55),    # Circle
        (0x3030, 0x3030),    # Wavy Dash
        (0x303D, 0x303D),    # Part Alternation Mark
        (0x3297, 0x3297),    # Circled Ideograph Congratulation
        (0x3299, 0x3299),    # Circled Ideograph Secret
        (0x2660, 0x2667),    # Card suits
        (0x2669, 0x266F),    # Musical symbols
        (0x203C, 0x203C),    # Double exclamation
        (0x2049, 0x2049),    # Exclamation question
    ]
    
    for start, end in emoji_ranges:
        if start <= code <= end:
            return True
    
    # Also check Unicode category for symbols
    cat = unicodedata.category(char)
    if cat == 'So':  # Symbol, Other - includes many emojis
        # But exclude some useful symbols
        if char in '©®™°€£¥×÷±≈≠≤≥':
            return False
        if code > 0x2000:  # Most emojis are above this
            return True
    
    return False

def clean_string(s):
    """Remove all problematic characters including emojis."""
    # Replace newlines and control characters with spaces
    s = s.replace('\r\n', ' ')
    s = s.replace('\n', ' ')
    s = s.replace('\r', ' ')
    s = s.replace('\t', ' ')
    s = s.replace('\f', ' ')
    s = s.replace('\v', ' ')
    s = s.replace('\b', '')
    s = s.replace('\x00', '')
    
    # Remove ASCII control characters
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', s)
    
    # Remove invisible Unicode characters
    invisible_chars = [
        '\u200d', '\u200c', '\u200b', '\ufeff',
        '\ufe0f', '\ufe0e', '\u00ad', '\u2060',
        '\u2061', '\u2062', '\u2063', '\u2064',
    ]
    for char in invisible_chars:
        s = s.replace(char, '')
    
    # Remove emojis and problematic Unicode symbols
    cleaned = []
    for char in s:
        cat = unicodedata.category(char)
        # Skip format/control characters
        if cat in ('Cf', 'Cc', 'Co', 'Cs'):
            continue
        # Skip emojis
        if is_emoji(char):
            continue
        cleaned.append(char)
    s = ''.join(cleaned)
    
    # Handle LaTeX/backslash sequences
    latex_replacements = {
        '\\\\times': 'x', '\\\\approx': '~', '\\\\text': '',
        '\\\\$': '$', '\\\\&': '&', '\\\\%': '%',
        '\\times': 'x', '\\approx': '~', '\\text': '',
        '\\&': '&', '\\%': '%', '\\$': '$',
        '\\n': ' ', '\\r': ' ', '\\t': ' ',
    }
    for seq, repl in latex_replacements.items():
        s = s.replace(seq, repl)
    
    # Remove remaining backslashes
    s = re.sub(r'\\[a-zA-Z]+', '', s)
    s = s.replace('\\', '')
    
    # Collapse multiple spaces
    s = re.sub(r' +', ' ', s)
    
    return s.strip()

def fix_csv(input_file, output_file):
    """Read CSV, clean all problematic characters, write back."""
    print(f"Reading: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8', errors='replace') as infile:
        reader = csv.reader(infile)
        rows = list(reader)
    
    print(f"Read {len(rows)} rows")
    
    # Count emojis before cleaning
    emoji_count = 0
    for row in rows:
        for cell in row:
            for char in cell:
                if is_emoji(char):
                    emoji_count += 1
    print(f"Found {emoji_count} emoji characters to remove")
    
    # Process each row
    fixed_rows = []
    for row in rows:
        fixed_row = [clean_string(cell) for cell in row]
        fixed_rows.append(fixed_row)
    
    # Write back as CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.writer(outfile, quoting=csv.QUOTE_MINIMAL)
        writer.writerows(fixed_rows)
    
    print(f"Wrote {len(fixed_rows)} rows to: {output_file}")
    
    # Verify
    with open(output_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for remaining emojis
    remaining_emoji = sum(1 for c in content if is_emoji(c))
    if remaining_emoji:
        print(f"WARNING: {remaining_emoji} emojis remain")
    else:
        print("✓ All emojis removed")
    
    # Check for invisible characters
    invisible_count = sum(1 for c in content if unicodedata.category(c) in ('Cf', 'Cc') and c not in '\r\n')
    if invisible_count:
        print(f"WARNING: {invisible_count} invisible chars remain")
    else:
        print("✓ No invisible characters remain")
    
    if '\\' in content:
        print("WARNING: Backslashes remain")
    else:
        print("✓ No backslashes remain")

if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "product-import-template.csv"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "product-import-clean.csv"
    fix_csv(input_file, output_file)
