Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\PLP\Documents\3RD YEAR\techno\silicon-trading\modern\public\images\listings"

function Crop-Image($srcFile, $destFile, $xRatio, $yRatio, $wRatio, $hRatio, $targetW, $targetH) {
    $srcPath = Join-Path $dir $srcFile
    if (-not (Test-Path $srcPath)) { return }
    $bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
    $srcX = [int]($bmp.Width * $xRatio)
    $srcY = [int]($bmp.Height * $yRatio)
    $srcW = [int]($bmp.Width * $wRatio)
    $srcH = [int]($bmp.Height * $hRatio)
    
    $dest = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $srcW, $srcH)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $destPath = Join-Path $dir $destFile
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $g.Dispose()
    $dest.Dispose()
    $bmp.Dispose()
    Write-Output "Created: $destFile"
}

# 1. iPhone crops
Crop-Image "iphone_donor_boards.jpg" "listing_iphone_a14_macro.jpg" 0.32 0.32 0.38 0.28 800 600
Crop-Image "iphone_donor_boards.jpg" "listing_iphone_board_clean.jpg" 0.25 0.30 0.45 0.35 800 600
Crop-Image "iphone_donor_boards.jpg" "listing_mechanic_tweezers.jpg" 0.60 0.35 0.38 0.45 800 600
Crop-Image "iphone_donor_boards.jpg" "listing_iphone_rf_subboards.jpg" 0.30 0.65 0.45 0.32 800 600

# 2. Samsung crops
Crop-Image "samsung_galaxy_board.jpg" "listing_samsung_exynos_chip.jpg" 0.32 0.45 0.30 0.35 800 600
Crop-Image "samsung_galaxy_board.jpg" "listing_samsung_full_bench.jpg" 0.15 0.25 0.70 0.65 800 600
Crop-Image "samsung_galaxy_board.jpg" "listing_samsung_usbc_board.jpg" 0.40 0.68 0.35 0.25 800 600
Crop-Image "samsung_galaxy_board.jpg" "listing_technician_repair_station.jpg" 0.55 0.15 0.42 0.55 800 600

# 3. Scrap lot crops
Crop-Image "scrap_phones_lot.jpg" "listing_cracked_screens_pile.jpg" 0.05 0.40 0.55 0.45 800 600
Crop-Image "scrap_phones_lot.jpg" "listing_scrap_phones_pile.jpg" 0.20 0.35 0.65 0.50 800 600
Crop-Image "scrap_phones_lot.jpg" "listing_manila_repair_shop.jpg" 0.10 0.05 0.85 0.85 800 600
Crop-Image "scrap_phones_lot.jpg" "listing_harvested_pcb_coils.jpg" 0.30 0.50 0.35 0.40 800 600

# 4. Cameras
Crop-Image "huawei_camera_modules.jpg" "listing_camera_modules_macro.jpg" 0.10 0.10 0.80 0.80 800 600
Crop-Image "huawei_camera_modules.jpg" "listing_dual_camera_sensor.jpg" 0.25 0.25 0.55 0.55 800 600

# 5. Cell phone trash
Crop-Image "cell_phone_trash_bulk.jpg" "listing_cell_phone_trash_bulk.jpg" 0.15 0.15 0.70 0.70 800 600
Crop-Image "cell_phone_trash_bulk.jpg" "listing_ewaste_gold_refining.jpg" 0.30 0.30 0.50 0.50 800 600
