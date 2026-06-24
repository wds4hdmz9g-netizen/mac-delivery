#!/bin/bash
# =============================================
#   矩阵内容工厂 · Mac版 一键安装
#   双击本文件即可自动安装所需组件
# =============================================

set -e
cd "$(dirname "$0")"
APP_DIR="$(pwd)"

echo ""
echo "  ============================================"
echo "    矩阵内容工厂 · Mac版 安装程序"
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
    curl -L -# "$NODE_URL" -o "/tmp/node_matrix.tar.gz"
    echo "  正在解压..."
    tar -xzf /tmp/node_matrix.tar.gz -C /tmp/
    cp "/tmp/$NODE_DIR/bin/node" "$APP_DIR/.node"
    chmod +x "$APP_DIR/.node"
    rm -rf /tmp/node_matrix.tar.gz "/tmp/$NODE_DIR"
    echo "  [OK] Node.js 安装完成"
else
    echo "  [OK] Node.js 已存在，跳过"
fi

# Download and install FFmpeg
if [ ! -f "$APP_DIR/.ffmpeg" ]; then
    echo ""
    echo "  [2/2] 正在下载 FFmpeg 视频处理组件..."
    echo "  (约80MB，请耐心等待)"
    echo ""
    curl -L -# "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" -o "/tmp/ffmpeg_matrix.zip"
    unzip -o /tmp/ffmpeg_matrix.zip -d "$APP_DIR/" > /dev/null 2>&1
    # The zip extracts 'ffmpeg' binary to current dir, rename to .ffmpeg
    if [ -f "$APP_DIR/ffmpeg" ]; then
        mv "$APP_DIR/ffmpeg" "$APP_DIR/.ffmpeg"
    fi
    chmod +x "$APP_DIR/.ffmpeg"
    # 兼容性: 创建软链接（服务端可能按 ffmpeg.exe 或 ffmpeg 查找）
    ln -sf "$APP_DIR/.ffmpeg" "$APP_DIR/ffmpeg"
    ln -sf "$APP_DIR/.ffmpeg" "$APP_DIR/ffmpeg.exe"
    rm -f /tmp/ffmpeg_matrix.zip
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
