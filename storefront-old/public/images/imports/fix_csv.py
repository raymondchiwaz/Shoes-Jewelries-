import os
import re
import csv

def generate_product_csv(root_dir, output_file):
    product_folders = [d for d in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, d)) and not d.startswith('.')]
    
    header = [
        "Product Id", "Product Handle", "Product Title", "Product Subtitle", "Product Description", "Product Status",
        "Product Thumbnail", "Product Weight", "Product Length", "Product Width", "Product Height", "Product HS Code",
        "Product Origin Country", "Product MID Code", "Product Material", "Product Collection Id", "Product Type Id",
        "Product Tag 1", "Product Discountable", "Product External Id", "Variant Id", "Variant Title", "Variant SKU",
        "Variant Barcode", "Variant Allow Backorder", "Variant Manage Inventory", "Variant Weight", "Variant Length",
        "Variant Width", "Variant Height", "Variant HS Code", "Variant Origin Country", "Variant MID Code", "Variant Material",
        "Variant Price EUR", "Variant Price USD", "Variant Option 1 Name", "Variant Option 1 Value",
        "Product Image 1 Url", "Product Image 2 Url"
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for folder in product_folders:
            folder_path = os.path.join(root_dir, folder)
            
            price_match = re.search(r'\$(\d+)', folder)
            price = price_match.group(1) if price_match else ''
            
            title = re.sub(r'💰\$?\d+\s*', '', folder)
            title = re.sub(r'[🎀♦‼️🔥🔥💚💚💫²⁰²¹]', '', title)
            title = re.sub(r'【.*?】', '', title)
            title = title.strip()

            handle = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

            description = ''
            details_path = os.path.join(folder_path, 'details.md')
            if os.path.exists(details_path):
                try:
                    with open(details_path, 'r', encoding='utf-8') as desc_f:
                        description = desc_f.read().strip()
                except Exception as e:
                    description = ''

            images = [f"./{folder}/{f}".replace("\\", "/") for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            
            thumbnail = images[0] if images else ''
            image1 = images[0] if len(images) > 0 else ''
            image2 = images[1] if len(images) > 1 else ''

            row = [
                '',         # Product Id
                handle,
                title,
                '',         # Product Subtitle
                description,
                'published',# Product Status
                thumbnail,  # Product Thumbnail
                '', '', '', '', '', '', '', '', '', '', '', # Product Attributes
                'TRUE',     # Product Discountable
                '', '', 'One Size', '', '', 'FALSE', 'TRUE', # Variant Attributes
                '', '', '', '', '', '', '', '', # More Variant Attributes
                '',         # Variant Price EUR
                price,      # Variant Price USD
                'Size',     # Variant Option 1 Name
                'One Size', # Variant Option 1 Value
                image1,
                image2
            ]
            
            writer.writerow(row)

if __name__ == '__main__':
    generate_product_csv('.', 'product-import-template.csv')
    print("CSV generation complete.")