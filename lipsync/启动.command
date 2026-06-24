#!/bin/bash
# =============================================
#   AI数字人口播助手 · Mac版 启动脚本
#   双击本文件即可启动服务
# =============================================

cd "$(dirname "$0")"
APP_DIR="$(pwd)"

echo ""
echo "  ============================================"
echo "    AI数字人口播助手 · 启动中..."
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

# Set FFmpeg path
export FFMPEG_PATH="$APP_DIR/.ffmpeg/ffmpeg"
export PATH="$APP_DIR/.ffmpeg:$PATH"

# Start server
echo "  正在启动服务..."
"$APP_DIR/.node" "$APP_DIR/server.js" &
SERVER_PID=$!

# Wait for server to be ready
sleep 3

# Open browser
echo "  正在打开浏览器..."
open "http://localhost:3459"

echo ""
echo "  ============================================"
echo "    服务已启动"
echo "    地址: http://localhost:3459"
echo "  ============================================"
echo ""
echo "  提示: 关闭本窗口将停止服务"
echo "  按 Ctrl+C 或关闭窗口退出"
echo ""

# Keep running until user closes
wait $SERVER_PID
