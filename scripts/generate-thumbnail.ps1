param(
  [Parameter(Mandatory = $true)]
  [string]$OutFile,

  [Parameter(Mandatory = $true)]
  [string]$Line1,

  [Parameter(Mandatory = $true)]
  [string]$Line2,

  [string]$Line3 = "",

  [string]$Template = ".\assets\thumbnail\ssangbak-base.jpg"
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
  param([string]$Hex)

  $hexValue = $Hex.TrimStart("#")
  $r = [Convert]::ToInt32($hexValue.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($hexValue.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($hexValue.Substring(4, 2), 16)

  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($r, $g, $b))
}

function Draw-CenteredLine {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [float]$Y,
    [float]$Height,
    [float]$InitialSize,
    [System.Drawing.Brush]$Brush,
    [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Bold,
    [float]$MaxWidth = 680
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return
  }

  $size = $InitialSize
  $font = New-ThumbnailFont -Size $size -Style $Style

  while ($size -gt 34) {
    $measured = $Graphics.MeasureString($Text, $font)
    if ($measured.Width -le $MaxWidth) {
      break
    }

    $font.Dispose()
    $size -= 3
    $font = New-ThumbnailFont -Size $size -Style $Style
  }

  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap

  $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(28, 0, 0, 0))
  $shadowRect = [System.Drawing.RectangleF]::new(63, $Y + 3, $MaxWidth, $Height)
  $textRect = [System.Drawing.RectangleF]::new(60, $Y, $MaxWidth, $Height)

  $Graphics.DrawString($Text, $font, $shadowBrush, $shadowRect, $format)
  $Graphics.DrawString($Text, $font, $Brush, $textRect, $format)

  $shadowBrush.Dispose()
  $format.Dispose()
  $font.Dispose()
}

if (-not (Test-Path -LiteralPath $Template)) {
  throw "Template image not found: $Template"
}

$templateImage = [System.Drawing.Image]::FromFile($Template)
$bitmap = [System.Drawing.Bitmap]::new($templateImage.Width, $templateImage.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.DrawImage($templateImage, 0, 0, $templateImage.Width, $templateImage.Height)

$accentBrush = New-SolidBrush "#0F766E"
$inkBrush = New-SolidBrush "#111827"

if ([string]::IsNullOrWhiteSpace($Line3)) {
  Draw-CenteredLine -Graphics $graphics -Text $Line1 -Y 276 -Height 70 -InitialSize 56 -Brush $accentBrush
  Draw-CenteredLine -Graphics $graphics -Text $Line2 -Y 365 -Height 110 -InitialSize 94 -Brush $inkBrush
} else {
  Draw-CenteredLine -Graphics $graphics -Text $Line1 -Y 248 -Height 68 -InitialSize 54 -Brush $accentBrush
  Draw-CenteredLine -Graphics $graphics -Text $Line2 -Y 328 -Height 108 -InitialSize 92 -Brush $inkBrush
  Draw-CenteredLine -Graphics $graphics -Text $Line3 -Y 448 -Height 74 -InitialSize 62 -Brush $inkBrush
}

$directory = Split-Path -Parent $OutFile
if ($directory -and -not (Test-Path -LiteralPath $directory)) {
  New-Item -ItemType Directory -Path $directory | Out-Null
}

$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new($qualityEncoder, 92L)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }

$bitmap.Save($OutFile, $jpegCodec, $encoderParameters)

$accentBrush.Dispose()
$inkBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
$templateImage.Dispose()
$encoderParameters.Dispose()
