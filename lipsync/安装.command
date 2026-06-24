#!/bin/bash
# =============================================
#   AI数字人口播助手 · Mac版 一键安装
#   双击本文件即可自动安装所需组件
# =============================================

cd "$(dirname "$0")"
APP_DIR="$(pwd)"

echo ""
echo "  ============================================"
echo "    AI数字人口播助手 · Mac版 安装程序"
echo "  ============================================"
echo ""

# 检查是否已有系统Node.js（更快）
if command -v node &> /dev/null; then
    echo "  [提示] 已检测到系统 Node.js ($(node --version))"
    echo "  即使安装失败，也可直接双击「启动.command」使用。"
    echo ""
fi

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

INSTALL_OK=true

# Download and install Node.js
if [ ! -f "$APP_DIR/.node" ]; then
    echo ""
    echo "  [1/2] 正在下载 Node.js 运行环境..."
    echo "  (约50MB，请耐心等待)"
    echo ""
    if curl -L --connect-timeout 30 --retry 3 -# "$NODE_URL" -o "/tmp/node_lipsync.tar.gz" 2>/dev/null; then
        echo "  正在解压..."
        if tar -xzf /tmp/node_lipsync.tar.gz -C /tmp/ 2>/dev/null; then
            cp "/tmp/$NODE_DIR/bin/node" "$APP_DIR/.node"
            chmod +x "$APP_DIR/.node"
            rm -rf /tmp/node_lipsync.tar.gz "/tmp/$NODE_DIR"
            echo "  [OK] Node.js 安装完成"
        else
            echo "  [警告] 解压失败，Node.js 安装不成功"
            INSTALL_OK=false
        fi
    else
        echo "  [警告] 下载失败，请检查网络连接"
        echo "  如果已安装系统 Node.js，可跳过此步骤直接启动。"
        INSTALL_OK=false
    fi
else
    echo "  [OK] Node.js 已存在，跳过"
fi

# Download and install FFmpeg
if [ ! -f "$APP_DIR/.ffmpeg/ffmpeg" ]; then
    echo ""
    echo "  [2/2] 正在下载 FFmpeg 视频处理组件..."
    echo "  (约80MB，请耐心等待)"
    echo ""
    if curl -L --connect-timeout 30 --retry 3 -# "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" -o "/tmp/ffmpeg_lipsync.zip" 2>/dev/null; then
        unzip -o /tmp/ffmpeg_lipsync.zip -d "$APP_DIR/.ffmpeg/" > /dev/null 2>&1
        if [ -f "$APP_DIR/.ffmpeg/ffmpeg" ]; then
            chmod +x "$APP_DIR/.ffmpeg/ffmpeg"
            rm -f /tmp/ffmpeg_lipsync.zip
            echo "  [OK] FFmpeg 安装完成"
        else
            echo "  [警告] FFmpeg 安装不成功（解压后未找到文件）"
            INSTALL_OK=false
        fi
    else
        echo "  [警告] FFmpeg 下载失败，请检查网络连接"
        INSTALL_OK=false
    fi
else
    echo "  [OK] FFmpeg 已存在，跳过"
fi

# Set permissions for launch script
chmod +x "$APP_DIR/启动.command" 2>/dev/null || true

echo ""
echo "  ============================================"
if [ "$INSTALL_OK" = true ]; then
    echo "    安装完成!"
else
    echo "    安装完成（部分组件未成功）"
    echo ""
    echo "    如果系统已安装 Node.js，"启动.command" 仍可正常运行。"
    echo "    FFmpeg 为视频处理所需，缺失可能导致部分功能不可用。"
    echo "    可手动安装: brew install ffmpeg"
fi
echo "  ============================================"
echo ""
echo "  下一步: 双击「启动.command」即可使用"
echo ""
echo "  按任意键关闭本窗口..."
read -n 1
