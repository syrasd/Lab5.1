Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile("C:\Users\DELL\.gemini\antigravity\scratch\syeda-shafia-portfolio\assets\images\media_1793279715544_8d486973.jpg")

# Panel 1: x from 8 to 204
# Panel 2: x from 212 to 408
# Panel 3: x from 416 to 612
# Panel 4: x from 620 to 816
# Panel 5: x from 824 to 1020

# Let's save small crops of each panel so we can inspect them clearly
for ($i = 1; $i -le 5; $i++) {
    $xCoords = @(0, 8, 212, 416, 620, 824)
    $x = $xCoords[$i]
    $rect = New-Object System.Drawing.Rectangle($x, 44, 196, 450)
    $c = $img.Clone($rect, $img.PixelFormat)
    $c.Save("C:\Users\DELL\.gemini\antigravity\scratch\syeda-shafia-portfolio\assets\images\panel_$i.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $c.Dispose()
    Write-Output "Saved panel_$i.jpg"
}
$img.Dispose()
