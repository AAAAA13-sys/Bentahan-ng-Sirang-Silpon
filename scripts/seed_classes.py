import json

with open('modern/.data/legacy-import.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update existing listings
specs = {
    1: {"board_class": "Grade A (Complete / All ICs)", "storage_gb": "256GB", "ram_gb": "6GB", "ic_code": "KLUFG8R1EM-B0C1"},
    2: {"board_class": "Grade A (Complete / All ICs)", "storage_gb": "128GB", "ram_gb": "8GB", "ic_code": "KLUEG8UHDB-C2D1"},
    3: {"board_class": "Grade A (Complete / All ICs)", "storage_gb": "128GB", "ram_gb": "4GB", "ic_code": None},
    4: {"board_class": "Grade A (Complete / All ICs)", "storage_gb": "128GB", "ram_gb": "6GB", "ic_code": "PM8150-002"},
    5: {"board_class": "Grade B (Partial Donor / Key ICs)", "storage_gb": "64GB", "ram_gb": "3GB", "ic_code": "H26T1TD88AAR"},
    6: {"board_class": "Grade A (Complete / All ICs)", "storage_gb": "128GB", "ram_gb": "8GB", "ic_code": None},
    7: {"board_class": "Grade B (Partial Donor / Key ICs)", "storage_gb": "128GB", "ram_gb": "8GB", "ic_code": "KM2V7001CM-B518"},
    8: {"board_class": "Grade A (Complete / All ICs)", "storage_gb": "128GB", "ram_gb": "8GB", "ic_code": "BQ25970"}
}

for l in data['listings']:
    if l['id'] in specs:
        l.update(specs[l['id']])

# Add extra listings to cover 4GB, 8GB, 16GB, 32GB, 512GB, 1024GB (1TB)
extra_listings = [
    {
        "id": 9,
        "seller_id": 3,
        "title": "Nokia / Cherry Mobile keypad scrap boards lot",
        "brand": "OPPO",
        "model": "Keypad / Feature Phone Scrap",
        "category": "Bulk lots",
        "condition": "For harvesting",
        "board_class": "Grade C (Pure Scrap / Refining)",
        "storage_gb": "4GB",
        "ram_gb": "512MB",
        "ic_code": "K5A3240YTA",
        "description": "Bulk legacy feature phone logic boards. De-shielded, cleaned of plastics, and sorted for precious metal refining or basic keypad trace repair.",
        "diagnostics": "Grade C scrap grade. Untested ICs. Ideal for e-waste gold recovery and component harvesting.",
        "price_centavos": 3500,
        "quantity": 100,
        "minimum_quantity": 20,
        "art": "board",
        "created_at": "2026-10-14T11:40:53+00:00",
        "updated_at": "2026-10-14T11:48:53+00:00",
        "is_active": 1,
        "stock_version": 0
    },
    {
        "id": 10,
        "seller_id": 4,
        "title": "Redmi 6A budget donor board",
        "brand": "Xiaomi",
        "model": "Redmi 6A / M1804C3CG",
        "category": "Donor boards",
        "condition": "For harvesting",
        "board_class": "Grade B (Partial Donor / Key ICs)",
        "storage_gb": "16GB",
        "ram_gb": "2GB",
        "ic_code": "KMQE60013M-B318",
        "description": "Entry-tier budget smartphone donor motherboard. eMMC 5.1 storage chip and MediaTek Helio A22 processor intact. Suitable for charging and power IC recovery.",
        "diagnostics": "Laser IC code KMQE60013M verified via Mobile IC Checker. Unheated PMIC and audio rail.",
        "price_centavos": 45000,
        "quantity": 10,
        "minimum_quantity": 1,
        "art": "board",
        "created_at": "2026-10-14T11:39:53+00:00",
        "updated_at": "2026-10-14T11:48:53+00:00",
        "is_active": 1,
        "stock_version": 0
    },
    {
        "id": 11,
        "seller_id": 3,
        "title": "Galaxy J7 Prime logic board",
        "brand": "Samsung",
        "model": "Galaxy J7 Prime / SM-G610F",
        "category": "Donor boards",
        "condition": "Tested working",
        "board_class": "Grade A (Complete / All ICs)",
        "storage_gb": "32GB",
        "ram_gb": "3GB",
        "ic_code": "KLMBG4GEUF-B04P",
        "description": "Reclaimed tested working Samsung logic board. 32GB internal storage class with all RF front-end chips and baseband intact.",
        "diagnostics": "Full boot test passed. 32GB eMMC 5.1 verified with clean solder pads.",
        "price_centavos": 75000,
        "quantity": 4,
        "minimum_quantity": 1,
        "art": "board",
        "created_at": "2026-10-14T11:38:53+00:00",
        "updated_at": "2026-10-14T11:48:53+00:00",
        "is_active": 1,
        "stock_version": 0
    },
    {
        "id": 12,
        "seller_id": 4,
        "title": "iPhone 13 Pro Max 512GB donor board",
        "brand": "Apple",
        "model": "iPhone 13 Pro Max / A2643",
        "category": "Donor boards",
        "condition": "For harvesting",
        "board_class": "Grade A (Complete / All ICs)",
        "storage_gb": "512GB",
        "ram_gb": "6GB",
        "ic_code": "KIC3246-512G-NVME",
        "description": "High-tier flagship donor motherboard. 512GB Apple NVMe NAND storage chip intact. Prime donor board for NAND harvesting and high-capacity storage upgrades.",
        "diagnostics": "Sandwich board separated cleanly with pre-heater plate. 512GB NAND pads 100% intact without blister.",
        "price_centavos": 320000,
        "quantity": 2,
        "minimum_quantity": 1,
        "art": "board",
        "created_at": "2026-10-14T11:37:53+00:00",
        "updated_at": "2026-10-14T11:48:53+00:00",
        "is_active": 1,
        "stock_version": 0
    },
    {
        "id": 13,
        "seller_id": 3,
        "title": "iPhone 14 Pro 1TB elite donor board",
        "brand": "Apple",
        "model": "iPhone 14 Pro / A2890",
        "category": "Donor boards",
        "condition": "For harvesting",
        "board_class": "Grade A (Complete / All ICs)",
        "storage_gb": "1024GB (1TB)",
        "ram_gb": "6GB",
        "ic_code": "APL1W07-1TB-NVME",
        "description": "Elite tier 1TB (1024GB) master tech donor board. Clean top and bottom board layers. Sought after for CNC NAND swaps and high-end repair lab diagnostics.",
        "diagnostics": "1024GB NVMe flash storage confirmed. All surface mount decoupling capacitors intact.",
        "price_centavos": 480000,
        "quantity": 1,
        "minimum_quantity": 1,
        "art": "board",
        "created_at": "2026-10-14T11:36:53+00:00",
        "updated_at": "2026-10-14T11:48:53+00:00",
        "is_active": 1,
        "stock_version": 0
    }
]

existing_ids = {l['id'] for l in data['listings']}
for el in extra_listings:
    if el['id'] not in existing_ids:
        data['listings'].append(el)

with open('modern/.data/legacy-import.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Updated legacy-import.json with 4GB to 1024GB specs and scrap classes!")
