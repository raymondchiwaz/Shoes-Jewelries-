#!/usr/bin/env python3
"""
Fix CSV file by replacing raw newlines in quoted fields with escaped \\n
so that Medusa's JSON parser can handle them.
"""
import csv
import sys

def fix_csv_newlines(input_file, output_file):
    """Read CSV, replace newlines in fields with \\n, write back."""
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        rows = list(reader)
    
    # Process each row, replacing newlines in each cell
    fixed_rows = []
    for row in rows:
        fixed_row = []
        for cell in row:
            # Replace actual newlines with escaped \n (for JSON compatibility)
            # Also replace carriage returns
            fixed_cell = cell.replace('\r\n', '\\n').replace('\n', '\\n').replace('\r', '\\n')
            fixed_row.append(fixed_cell)
        fixed_rows.append(fixed_row)
    
    # Write back as CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.writer(outfile, quoting=csv.QUOTE_MINIMAL)
        writer.writerows(fixed_rows)
    
    print(f"Fixed {len(fixed_rows)} rows. Output: {output_file}")

if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "product-import-template.csv"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "product-import-template-fixed.csv"
    fix_csv_newlines(input_file, output_file)





