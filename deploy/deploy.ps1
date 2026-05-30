param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "deploy.config.ps1"),
  [switch]$PackageOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ArtifactPath = Join-Path $ProjectRoot "trade-kg-deploy.tar.gz"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Command not found: $Name. Please enable Windows OpenSSH client and make sure tar/scp/ssh are available."
  }
}

function Invoke-Native {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FilePath failed with exit code $LASTEXITCODE"
  }
}

if (-not (Test-Path $ConfigPath)) {
  throw "Config file not found: $ConfigPath"
}

. $ConfigPath

Require-Command "tar"
Require-Command "scp"
Require-Command "ssh"

Set-Location $ProjectRoot

& (Join-Path $PSScriptRoot "build-home.ps1") -ProjectRoot $ProjectRoot

if (Test-Path $ArtifactPath) {
  Remove-Item -LiteralPath $ArtifactPath -Force
}

$PackageItems = @(
  "index.html",
  "advantage.html",
  "capability.html",
  "evidence.html",
  "workflow.html",
  "trade.html",
  "resume.html",
  "src/home.css",
  "src/home-particles.js",
  "src/trade.css",
  "src/trade.js",
  "README.md",
  "DEPLOY.md"
)

Write-Host "Packing static site..."
$TarArgs = @("-czf", $ArtifactPath) + $PackageItems
Invoke-Native "tar" $TarArgs
Write-Host "Package created: $ArtifactPath"

if ($PackageOnly) {
  Write-Host "Package-only mode complete."
  return
}

$SshTarget = "${ServerUser}@${ServerHost}"
$ScpArgs = @()
$SshArgs = @()

if ($ServerPort) {
  $ScpArgs += @("-P", [string]$ServerPort)
  $SshArgs += @("-p", [string]$ServerPort)
}

if ($SshKeyPath) {
  $ScpArgs += @("-i", $SshKeyPath)
  $SshArgs += @("-i", $SshKeyPath)
}

Write-Host "Uploading to ${SshTarget}:${RemoteArchive}"
$ScpArgs += @($ArtifactPath, "${SshTarget}:${RemoteArchive}")
Invoke-Native "scp" $ScpArgs

$RemoteScript = @'
set -e

SITE_DIR="__REMOTE_ROOT__"
ARCHIVE="__REMOTE_ARCHIVE__"
NGINX_CONF="__NGINX_CONF_PATH__"
NGINX_BIN="__NGINX_BIN__"
SERVER_NAME="__SERVER_NAME__"

mkdir -p "$SITE_DIR"
rm -rf "$SITE_DIR"/*
tar -xzf "$ARCHIVE" -C "$SITE_DIR"

mkdir -p "$(dirname "$NGINX_CONF")"
cat > "$NGINX_CONF" <<NGINXCONF
server {
    listen 80;
    server_name __SERVER_NAME__;

    root __REMOTE_ROOT__;
    index index.html;

    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(css|js|json|png|jpg|jpeg|gif|svg|ico|webp)$ {
        expires 7d;
        try_files \$uri =404;
    }
}
NGINXCONF

"$NGINX_BIN" -t
"$NGINX_BIN" -s reload

echo "Deploy complete: http://$SERVER_NAME"
'@

$RemoteScript = $RemoteScript.Replace("__REMOTE_ROOT__", $RemoteRoot)
$RemoteScript = $RemoteScript.Replace("__REMOTE_ARCHIVE__", $RemoteArchive)
$RemoteScript = $RemoteScript.Replace("__NGINX_CONF_PATH__", $NginxConfPath)
$RemoteScript = $RemoteScript.Replace("__NGINX_BIN__", $NginxBin)
$RemoteScript = $RemoteScript.Replace("__SERVER_NAME__", $ServerName)

Write-Host "Deploying on remote server and reloading Nginx..."
$RemoteScript | & ssh @SshArgs $SshTarget "bash -s"
if ($LASTEXITCODE -ne 0) {
  throw "Remote deploy failed with exit code $LASTEXITCODE"
}

Write-Host "Done: http://$ServerName"
