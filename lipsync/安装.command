#!/bin/bash
# =============================================
#   AI数字人口播助手 · Mac版 一键安装
#   双击本文件即可自动安装所需组件
# =============================================

set -e
cd "$(dirname "$0")"
APP_DIR="$(pwd)"

echo ""
echo "  ============================================"
echo "    AI数字人口播助手 · Mac版 安装程序"
echo "  ============================================"
echo ""

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    echo "  检测到: Apple Silicon (M系列芯片)"
    NODE_URL="https://nodejs.org/dist/v22.12.0/node-v22.12.0-darwin-arm64.tar.gz"
    NODE_DIR="node-v22.12.0-darwin-arm64"
else
    echo "  检测到: Intel 芯片"
    NODE_URL="https://nodejs.org/dist/v22.12.0/node-v22.12.0-darwin-x64.tar.gz"
    NODE_DIR="node-v22.12.0-darwin-x64"
fi

# Download and install Node.js
if [ ! -f "$APP_DIR/.node" ]; then
    echo ""
    echo "  [1/2] 正在下载 Node.js 运行环境..."
    echo "  (约50MB，请耐心等待)"
    echo ""
    curl -L -# "$NODE_URL" -o "/tmp/node.tar.gz"
    echo "  正在解压..."
    tar -xzf /tmp/node.tar.gz -C /tmp/
    cp "/tmp/$NODE_DIR/bin/node" "$APP_DIR/.node"
    chmod +x "$APP_DIR/.node"
    rm -rf /tmp/node.tar.gz "/tmp/$NODE_DIR"
    echo "  [OK] Node.js 安装完成"
else
    echo "  [OK] Node.js 已存在，跳过"
fi

# Download and install FFmpeg
if [ ! -f "$APP_DIR/.ffmpeg/ffmpeg" ]; then
    echo ""
    echo "  [2/2] 正在下载 FFmpeg 视频处理组件..."
    echo "  (约80MB，请耐心等待)"
    echo ""
    mkdir -p "$APP_DIR/.ffmpeg"
    curl -L -# "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" -o "/tmp/ffmpeg.zip"
    unzip -o /tmp/ffmpeg.zip -d "$APP_DIR/.ffmpeg/" > /dev/null 2>&1
    chmod +x "$APP_DIR/.ffmpeg/ffmpeg"
    rm -f /tmp/ffmpeg.zip
    echo "  [OK] FFmpeg 安装完成"
else
    echo "  [OK] FFmpeg 已存在，跳过"
fi

# Set permissions for launch script
chmod +x "$APP_DIR/启动.command" 2>/dev/null || true

echo ""
echo "  ============================================"
echo "    安装完成!"
echo "  ============================================"
echo ""
echo "  下一步: 双击「启动.command」即可使用"
echo ""
echo "  按任意键关闭本窗口..."
read -n 1
