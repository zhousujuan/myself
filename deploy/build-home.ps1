param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot ".."))
)

$ErrorActionPreference = "Stop"

$HomeTemplatePath = Join-Path $ProjectRoot "src/home.template.html"
$PageTemplatePath = Join-Path $ProjectRoot "src/page.template.html"
$HomeOutputPath = Join-Path $ProjectRoot "index.html"
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$IncludePattern = '(?m)^[ \t]*<!--\s*@include\s+(?<path>[^>]+?)\s*-->'

function Read-Text {
  param([string]$Path)
  [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Text {
  param(
    [string]$Path,
    [string]$Content
  )
  [System.IO.File]::WriteAllText($Path, $Content.TrimEnd() + "`r`n", $Utf8NoBom)
}

function Resolve-Includes {
  param([string]$Content)

  [regex]::Replace($Content, $IncludePattern, {
    param($Match)

    $RelativePath = $Match.Groups["path"].Value.Trim().Replace("/", [IO.Path]::DirectorySeparatorChar)
    $IncludePath = Join-Path $ProjectRoot $RelativePath

    if (-not (Test-Path $IncludePath)) {
      throw "Included home section not found: $IncludePath"
    }

    Read-Text $IncludePath | ForEach-Object { $_.TrimEnd() }
  })
}

function Get-SectionContent {
  param([string[]]$Names)

  ($Names | ForEach-Object {
    $Path = Join-Path $ProjectRoot "src/home-sections/$_.html"
    if (-not (Test-Path $Path)) {
      throw "Home section not found: $Path"
    }
    Read-Text $Path | ForEach-Object { $_.TrimEnd() }
  }) -join "`r`n`r`n"
}

if (-not (Test-Path $HomeTemplatePath)) {
  throw "Home template not found: $HomeTemplatePath"
}

if (-not (Test-Path $PageTemplatePath)) {
  throw "Page template not found: $PageTemplatePath"
}

$HomeOutput = Resolve-Includes (Read-Text $HomeTemplatePath)
Write-Text $HomeOutputPath $HomeOutput
Write-Host "Built homepage: $HomeOutputPath"

$PageTemplate = Read-Text $PageTemplatePath
$Pages = @(
  @{
    Output = "advantage.html";
    Title = "Positioning | sujuan AI product portfolio";
    Description = "Sujuan AI-native product manager positioning, advantages, and signature statements.";
    Sections = @("advantage", "memory");
  },
  @{
    Output = "capability.html";
    Title = "Capability matrix | sujuan AI product portfolio";
    Description = "Sujuan capability matrix for product judgment, AI orchestration, full-stack validation, and knowledge productization.";
    Sections = @("capability");
  },
  @{
    Output = "evidence.html";
    Title = "Project evidence | sujuan AI product portfolio";
    Description = "Sujuan project evidence across AI products, full-stack delivery, complex systems, and knowledge products.";
    Sections = @("evidence");
  },
  @{
    Output = "workflow.html";
    Title = "AI product workflow | sujuan AI product portfolio";
    Description = "Sujuan AI product workflow from opportunity framing to AI-assisted modeling, full-stack validation, and iteration.";
    Sections = @("workflow");
  }
)

foreach ($Page in $Pages) {
  $Content = Get-SectionContent $Page.Sections
  $Output = $PageTemplate.Replace("{{PAGE_TITLE}}", $Page.Title)
  $Output = $Output.Replace("{{PAGE_DESCRIPTION}}", $Page.Description)
  $Output = $Output.Replace("{{PAGE_CONTENT}}", $Content)
  $OutputPath = Join-Path $ProjectRoot $Page.Output
  Write-Text $OutputPath $Output
  Write-Host "Built page: $OutputPath"
}
