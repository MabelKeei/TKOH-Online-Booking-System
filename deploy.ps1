# TKHO 在线预订系统 — Docker 蓝绿部署脚本 (PowerShell)
# 用法: .\deploy.ps1 [blue|green|switch|status|cleanup|help] [blue|green]

param(
    [Parameter(Position=0)]
    [ValidateSet("blue", "green", "switch", "status", "cleanup", "help")]
    [string]$Action = "help",

    [Parameter(Position=1)]
    [ValidateSet("blue", "green")]
    [string]$Target = ""
)

$NETWORK_NAME = "tkho-booking-network"

function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param([string]$Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warn { param([string]$Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Err { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Test-Dependencies {
    Write-Info "检查依赖..."
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Err "未安装 Docker"
        exit 1
    }
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $script:COMPOSE_CMD = "docker-compose"
    } elseif (docker compose version 2>$null) {
        $script:COMPOSE_CMD = "docker compose"
    } else {
        Write-Err "未安装 Docker Compose"
        exit 1
    }
    Write-Success "依赖检查通过 (使用: $COMPOSE_CMD)"
}

function Initialize-EnvFile {
    if (-not (Test-Path .env)) {
        if (Test-Path env.production) {
            Write-Info "从 env.production 创建 .env ..."
            Copy-Item -Path "env.production" -Destination ".env"
            Write-Success ".env 已创建，请修改其中的密码与 JWT_SECRET"
        } else {
            Write-Warn "未找到 .env 或 env.production"
        }
    } else {
        Write-Info ".env 已存在"
    }
}

function New-Network {
    Write-Info "创建 Docker 网络 $NETWORK_NAME ..."
    docker network create $NETWORK_NAME 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Success "网络已创建" } else { Write-Warn "网络可能已存在" }
}

function Start-BaseServices {
    Write-Info "启动 PostgreSQL、Adminer ..."
    & $COMPOSE_CMD -f docker-compose.base.yml up -d
    if ($LASTEXITCODE -ne 0) { Write-Err "基础服务启动失败"; exit 1 }
    Write-Success "PostgreSQL、Adminer 已启动 — Adminer: http://localhost:3201"
}

function Start-RedisService {
    Write-Info "启动 Redis ..."
    & $COMPOSE_CMD -f docker-compose.redis.yml up -d
    if ($LASTEXITCODE -ne 0) { Write-Err "Redis 启动失败"; exit 1 }
    Write-Success "Redis 已启动"
}

function Deploy-Blue {
    Write-Info "部署蓝环境 ..."
    & $COMPOSE_CMD -f docker-compose.green.yml down 2>$null
    Copy-Item -Path "docker\nginx\nginx.blue.conf" -Destination "docker\nginx\nginx.conf" -Force
    & $COMPOSE_CMD -f docker-compose.base.yml -f docker-compose.redis.yml -f docker-compose.blue.yml up -d --build
    if ($LASTEXITCODE -ne 0) { Write-Err "蓝环境部署失败"; exit 1 }
    Write-Info "等待服务就绪（约 60 秒）..."
    Start-Sleep -Seconds 60
    Write-Success "蓝环境部署完成"
}

function Deploy-Green {
    Write-Info "部署绿环境 ..."
    & $COMPOSE_CMD -f docker-compose.blue.yml down 2>$null
    & $COMPOSE_CMD -f docker-compose.base.yml -f docker-compose.redis.yml -f docker-compose.green.yml up -d --build
    if ($LASTEXITCODE -ne 0) { Write-Err "绿环境部署失败"; exit 1 }
    Write-Info "等待服务就绪（约 60 秒）..."
    Start-Sleep -Seconds 60
    Write-Success "绿环境部署完成"
}

function Switch-ToBlue {
    Write-Info "切换流量到蓝环境 ..."
    Copy-Item -Path "docker\nginx\nginx.blue.conf" -Destination "docker\nginx\nginx.conf" -Force
    & $COMPOSE_CMD -f docker-compose.nginx.yml up -d --force-recreate nginx
    if ($LASTEXITCODE -ne 0) { Write-Err "切换失败"; exit 1 }
    Write-Success "已切换到蓝环境"
}

function Switch-ToGreen {
    Write-Info "切换流量到绿环境 ..."
    Copy-Item -Path "docker\nginx\nginx.green.conf" -Destination "docker\nginx\nginx.conf" -Force
    & $COMPOSE_CMD -f docker-compose.nginx.yml up -d --force-recreate nginx
    if ($LASTEXITCODE -ne 0) { Write-Err "切换失败"; exit 1 }
    Write-Success "已切换到绿环境"
}

function Initialize-SslCerts {
    $sslDir = "docker\nginx\ssl"
    $cert = Join-Path $sslDir "cert.pem"
    $key = Join-Path $sslDir "key.pem"
    if ((Test-Path $cert) -and (Test-Path $key)) {
        Write-Success "SSL 证书已就绪"
        return
    }
    if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
        Write-Warn "未找到证书且本机无 openssl，请先按 docker\nginx\ssl\README.md 生成 cert.pem / key.pem"
        return
    }
    Write-Info "生成开发用自签名 SSL 证书 ..."
    Push-Location $sslDir
    openssl genrsa -out key.pem 2048 2>$null
    openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=localhost" 2>$null
    Pop-Location
    if ((Test-Path $cert) -and (Test-Path $key)) {
        Write-Success "自签名证书已生成"
    } else {
        Write-Warn "证书生成失败，HTTPS 可能不可用"
    }
}

function Start-Nginx {
    Write-Info "启动 Nginx 入口 (HTTP 3200 / HTTPS 3243) ..."
    Initialize-SslCerts
    & $COMPOSE_CMD -f docker-compose.nginx.yml up -d
    if ($LASTEXITCODE -ne 0) { Write-Err "Nginx 启动失败"; exit 1 }
    Write-Success "Nginx 已启动 — HTTP: http://localhost:3200  HTTPS: https://localhost:3243"
}

function Show-Status {
    Write-Info "系统状态:"
    Write-Host "`n--- PostgreSQL ---"
    & $COMPOSE_CMD -f docker-compose.base.yml ps
    Write-Host "`n--- Redis ---"
    & $COMPOSE_CMD -f docker-compose.redis.yml ps
    Write-Host "`n--- 蓝环境 ---"
    & $COMPOSE_CMD -f docker-compose.blue.yml ps 2>$null
    Write-Host "`n--- 绿环境 ---"
    & $COMPOSE_CMD -f docker-compose.green.yml ps 2>$null
    Write-Host "`n--- Nginx ---"
    & $COMPOSE_CMD -f docker-compose.nginx.yml ps 2>$null
}

function Clear-AllServices {
    Write-Warn "停止并清理所有 TKHO Docker 服务 ..."
    & $COMPOSE_CMD -f docker-compose.blue.yml down 2>$null
    & $COMPOSE_CMD -f docker-compose.green.yml down 2>$null
    & $COMPOSE_CMD -f docker-compose.nginx.yml down 2>$null
    & $COMPOSE_CMD -f docker-compose.redis.yml down 2>$null
    & $COMPOSE_CMD -f docker-compose.base.yml down 2>$null
    docker network rm $NETWORK_NAME 2>$null
    Write-Success "清理完成（数据卷默认保留，需手动 docker volume rm 才会删库）"
}

function Show-Help {
    Write-Host "TKHO 在线预订系统 — Docker 蓝绿部署" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  .\deploy.ps1 blue              # 首次部署蓝环境"
    Write-Host "  .\deploy.ps1 green             # 部署新版本到绿环境"
    Write-Host "  .\deploy.ps1 switch green      # 切换流量到绿环境"
    Write-Host "  .\deploy.ps1 switch blue       # 回滚到蓝环境"
    Write-Host "  .\deploy.ps1 status            # 查看状态"
    Write-Host "  .\deploy.ps1 cleanup           # 停止所有容器"
    Write-Host ""
    Write-Host "HTTP:  http://localhost:3200"
    Write-Host "HTTPS: https://localhost:3243"
    Write-Host "Swagger: http://localhost:3200/api/docs"
}

switch ($Action) {
    "blue" {
        Test-Dependencies
        Initialize-EnvFile
        New-Network
        Start-BaseServices
        Start-RedisService
        Deploy-Blue
        Start-Nginx
        Switch-ToBlue
        Show-Status
    }
    "green" {
        Test-Dependencies
        Initialize-EnvFile
        New-Network
        Start-BaseServices
        Start-RedisService
        Deploy-Green
        Start-Nginx
        Switch-ToGreen
        Show-Status
    }
    "switch" {
        if ([string]::IsNullOrEmpty($Target)) {
            Write-Err "请指定 blue 或 green"
            exit 1
        }
        Test-Dependencies
        if ($Target -eq "blue") { Switch-ToBlue } else { Switch-ToGreen }
        Show-Status
    }
    "status" { Test-Dependencies; Show-Status }
    "cleanup" { Test-Dependencies; Clear-AllServices }
    default { Show-Help }
}
