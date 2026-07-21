param(
  [Parameter(Mandatory = $true)]
  [string]$Background,

  [Parameter(Mandatory = $true)]
  [string]$OutFile,

  [Parameter(Mandatory = $true)]
  [string]$Eyebrow,

  [Parameter(Mandatory = $true)]
  [string]$Line1,

  [Parameter(Mandatory = $true)]
  [string]$Line2,

  [string]$Note = ""
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function New-ThumbnailFont {
  param(
    [float]$Size,
    [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Bold
  )

  foreach ($family in @("Malgun Gothic", "Noto Sans KR", "Arial")) {
    try {
      return [System.Drawing.Font]::new($family, $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
    } catch {
      continue
    }
  }

  return [System.Drawing.Font]::new([System.Drawing.FontFamily]::GenericSansSerif, $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-SolidBrush {
  param([string]$Hex, [int]$Alpha = 255)

  $value = $Hex.TrimStart("#")
  $r = [Convert]::ToInt32($value.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($value.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($value.Substring(4, 2), 16)
  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b))
}

if (-not (Test-Path -LiteralPath $Background)) {
  throw "Background image not found: $Background"
}

$source = [System.Drawing.Image]::FromFile($Background)
$bitmap = [System.Drawing.Bitmap]::new(1600, 900)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.DrawImage($source, 0, 0, 1600, 900)

$white = New-SolidBrush "#F8FAFC"
$mint = New-SolidBrush "#58E0CA"
$gold = New-SolidBrush "#F6C85F"
$muted = New-SolidBrush "#C9D7EA"
$pill = New-SolidBrush "#0E385C" 220
$shadow = New-SolidBrush "#020617" 115
$brandFont = New-ThumbnailFont 28
$eyebrowFont = New-ThumbnailFont 34
$headlineFont = New-ThumbnailFont 78
$noteFont = New-ThumbnailFont 25 ([System.Drawing.FontStyle]::Regular)

$graphics.FillRectangle($pill, 92, 82, 245, 54)
$graphics.DrawString("SsangBak", $brandFont, $white, 112, 93)
$graphics.DrawString($Eyebrow, $eyebrowFont, $mint, 92, 188)

$graphics.DrawString($Line1, $headlineFont, $shadow, 96, 264)
$graphics.DrawString($Line1, $headlineFont, $white, 92, 258)
$graphics.DrawString($Line2, $headlineFont, $shadow, 96, 370)
$graphics.DrawString($Line2, $headlineFont, $gold, 92, 364)

$graphics.FillRectangle($mint, 92, 492, 92, 7)
if (-not [string]::IsNullOrWhiteSpace($Note)) {
  $graphics.DrawString($Note, $noteFont, $muted, 92, 535)
}

$directory = Split-Path -Parent $OutFile
if ($directory -and -not (Test-Path -LiteralPath $directory)) {
  New-Item -ItemType Directory -Path $directory | Out-Null
}

$encoder = [System.Drawing.Imaging.Encoder]::Quality
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new($encoder, 92L)
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$bitmap.Save($OutFile, $jpeg, $parameters)

foreach ($resource in @($white, $mint, $gold, $muted, $pill, $shadow, $brandFont, $eyebrowFont, $headlineFont, $noteFont, $graphics, $bitmap, $source, $parameters)) {
  $resource.Dispose()
}
