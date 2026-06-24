#!/bin/bash
# =============================================
#   矩阵内容工厂 · Mac版 启动
#   双击本文件即可启动服务
# =============================================

cd "$(dirname "$0")"
APP_DIR="$(pwd)"

echo ""
echo "  ============================================"
echo "    矩阵内容工厂 · 启动中..."
echo "  ============================================"
echo ""

# Check if installed
if [ ! -f "$APP_DIR/.node" ]; then
    echo "  [错误] 未检测到运行环境！"
    echo "  请先双击「安装.command」完成安装。"
    echo ""
    echo "  按任意键关闭..."
    read -n 1
    exit 1
fi

# Set FFmpeg path - make it findable by the server
export FFMPEG_PATH="$APP_DIR/.ffmpeg"
export PATH="$APP_DIR:$PATH"

# Create a symlink so server can find ffmpeg by name
if [ -f "$APP_DIR/.ffmpeg" ] && [ ! -f "$APP_DIR/ffmpeg" ]; then
    ln -sf "$APP_DIR/.ffmpeg" "$APP_DIR/ffmpeg"
fi

# Start server
echo "  正在启动服务..."
"$APP_DIR/.node" "$APP_DIR/server.js" &
SERVER_PID=$!

# Wait for server to be ready
sleep 5

# Open browser
echo "  正在打开浏览器..."
open "http://localhost:3460"

echo ""
echo "  ============================================"
echo "    服务已启动!"
echo "    地址: http://localhost:3460"
echo "  ============================================"
echo ""
echo "  提示: 关闭本窗口将停止服务"
echo "  按 Ctrl+C 或关闭窗口退出"
echo ""

# Keep running until user closes
wait $SERVER_PID
