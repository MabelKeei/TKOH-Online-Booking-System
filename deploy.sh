#!/bin/bash
# TKHO 在线预订系统 — Docker 蓝绿部署脚本
# 用法: ./deploy.sh [blue|green|switch|status|cleanup|help] [blue|green]

set -e

NETWORK_NAME="tkho-booking-network"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_dependencies() {
    log_info "检查依赖..."
    command -v docker >/dev/null 2>&1 || { log_error "Docker 未安装"; exit 1; }
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        log_error "Docker Compose 未安装"
        exit 1
    fi
    log_success "依赖检查通过 (使用: $COMPOSE_CMD)"
}

init_env_file() {
    if [ ! -f .env ]; then
        if [ -f env.production ]; then
            log_info "从 env.production 创建 .env ..."
            cp env.production .env
            log_success ".env 已创建，请修改密码与 JWT_SECRET"
        else
            log_warning "未找到 .env 或 env.production"
        fi
    else
        log_info ".env 已存在"
    fi
}

create_network() {
    log_info "创建 Docker 网络 $NETWORK_NAME ..."
    docker network create "$NETWORK_NAME" 2>/dev/null || log_warning "网络可能已存在"
}

start_base_services() {
    log_info "启动 PostgreSQL、Adminer ..."
    $COMPOSE_CMD -f docker-compose.base.yml up -d
    log_success "PostgreSQL、Adminer 已启动 — Adminer: http://localhost:3201"
}

start_redis_service() {
    log_info "启动 Redis ..."
    $COMPOSE_CMD -f docker-compose.redis.yml up -d
    log_success "Redis 已启动"
}

apply_nginx_env_conf() {
    local env="$1"
    local cert="docker/nginx/ssl/cert.pem"
    local key="docker/nginx/ssl/key.pem"
    if [ -f "$cert" ] && [ -f "$key" ] && [ -f "docker/nginx/nginx.${env}.https.conf" ]; then
        cp "docker/nginx/nginx.${env}.https.conf" docker/nginx/nginx.conf
    else
        cp "docker/nginx/nginx.${env}.conf" docker/nginx/nginx.conf
    fi
}

deploy_blue() {
    log_info "部署蓝环境 ..."
    $COMPOSE_CMD -f docker-compose.green.yml down 2>/dev/null || true
    apply_nginx_env_conf blue
    $COMPOSE_CMD -f docker-compose.base.yml -f docker-compose.redis.yml -f docker-compose.blue.yml up -d --build
    log_info "等待服务就绪（约 60 秒）..."
    sleep 60
    log_success "蓝环境部署完成"
}

deploy_green() {
    log_info "部署绿环境 ..."
    $COMPOSE_CMD -f docker-compose.blue.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.base.yml -f docker-compose.redis.yml -f docker-compose.green.yml up -d --build
    log_info "等待服务就绪（约 60 秒）..."
    sleep 60
    log_success "绿环境部署完成"
}

switch_to_blue() {
    if [ ! -f "./switch-nginx-env.sh" ]; then
        log_error "缺少 switch-nginx-env.sh"
        exit 1
    fi
    bash ./switch-nginx-env.sh blue
}

switch_to_green() {
    if [ ! -f "./switch-nginx-env.sh" ]; then
        log_error "缺少 switch-nginx-env.sh"
        exit 1
    fi
    bash ./switch-nginx-env.sh green
}

init_ssl_certs() {
    local cert="docker/nginx/ssl/cert.pem"
    local key="docker/nginx/ssl/key.pem"
    if [ -f "$cert" ] && [ -f "$key" ]; then
        log_success "SSL 证书已就绪"
        return
    fi
    if ! command -v openssl >/dev/null 2>&1; then
        log_warning "未找到证书且本机无 openssl，见 docker/nginx/ssl/README.md"
        return
    fi
    log_info "生成开发用自签名 SSL 证书 ..."
    (cd docker/nginx/ssl && openssl genrsa -out key.pem 2048 && \
        openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=localhost")
    if [ -f "$cert" ] && [ -f "$key" ]; then
        log_success "自签名证书已生成"
    else
        log_warning "证书生成失败，HTTPS 可能不可用"
    fi
}

start_nginx() {
    log_info "启动 Nginx 入口 (HTTP 3200 / HTTPS 3243) ..."
    init_ssl_certs
    $COMPOSE_CMD -f docker-compose.nginx.yml up -d
    log_success "Nginx 已启动 — HTTP: http://localhost:3200  HTTPS: https://localhost:3243"
}

show_status() {
    log_info "系统状态:"
    echo ""; echo "--- PostgreSQL ---"
    $COMPOSE_CMD -f docker-compose.base.yml ps
    echo ""; echo "--- Redis ---"
    $COMPOSE_CMD -f docker-compose.redis.yml ps
    echo ""; echo "--- 蓝环境 ---"
    $COMPOSE_CMD -f docker-compose.blue.yml ps 2>/dev/null || echo "未运行"
    echo ""; echo "--- 绿环境 ---"
    $COMPOSE_CMD -f docker-compose.green.yml ps 2>/dev/null || echo "未运行"
    echo ""; echo "--- Nginx ---"
    $COMPOSE_CMD -f docker-compose.nginx.yml ps 2>/dev/null || echo "未运行"
}

cleanup() {
    log_warning "停止并清理所有 TKHO Docker 服务 ..."
    $COMPOSE_CMD -f docker-compose.blue.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.green.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.nginx.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.redis.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.base.yml down 2>/dev/null || true
    docker network rm "$NETWORK_NAME" 2>/dev/null || true
    log_success "清理完成（数据卷默认保留）"
}

main() {
    case "${1:-help}" in
        blue)
            check_dependencies
            init_env_file
            create_network
            start_base_services
            start_redis_service
            deploy_blue
            start_nginx
            switch_to_blue
            show_status
            ;;
        green)
            check_dependencies
            init_env_file
            create_network
            start_base_services
            start_redis_service
            deploy_green
            start_nginx
            switch_to_green
            show_status
            ;;
        switch)
            [ -z "$2" ] && { log_error "请指定 blue 或 green"; exit 1; }
            check_dependencies
            case "$2" in
                blue) switch_to_blue ;;
                green) switch_to_green ;;
                *) log_error "无效环境: $2"; exit 1 ;;
            esac
            show_status
            ;;
        status)
            check_dependencies
            show_status
            ;;
        cleanup)
            check_dependencies
            cleanup
            ;;
        *)
            echo "TKHO 在线预订系统 — Docker 蓝绿部署"
            echo ""
            echo "  $0 blue              # 首次部署蓝环境"
            echo "  $0 green             # 部署绿环境"
            echo "  $0 switch green      # 切换流量（调用 switch-nginx-env.sh）"
            echo "  ./switch-nginx-env.sh blue|green|status  # 仅切换 Nginx 流量"
            echo "  $0 status            # 查看状态"
            echo "  $0 cleanup           # 停止所有容器"
            echo ""
            echo "HTTP:  http://localhost:3200"
            echo "HTTPS: https://localhost:3243"
            ;;
    esac
}

main "$@"
