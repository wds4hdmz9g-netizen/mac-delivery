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

# 三层回退找 Node.js: 便携版 .node → 系统 node → 提示安装
NODE_BIN=""
if [ -f "$APP_DIR/.node" ]; then
    NODE_BIN="$APP_DIR/.node"
    echo "  [OK] 使用便携版 Node.js"
elif command -v node &> /dev/null; then
    NODE_BIN="node"
    echo "  [OK] 使用系统已安装的 Node.js ($(node --version))"
else
    echo "  [错误] 未检测到 Node.js 运行环境！"
    echo ""
    echo "  请选择以下任一方式："
    echo "    1) 双击「安装.command」自动安装"
    echo "    2) 手动安装Node.js: https://nodejs.org"
    echo ""
    echo "  按任意键关闭..."
    read -n 1
    exit 1
fi

# 设置 FFmpeg 路径 (矩阵工厂用)
export FFMPEG_PATH="$APP_DIR/.ffmpeg"
export PATH="$APP_DIR/.ffmpeg:$PATH"
# 口播助手也可能需要 ffmpeg，创建软链
if [ -f "$APP_DIR/.ffmpeg" ] && [ ! -f "$APP_DIR/.ffmpeg/ffmpeg" ]; then
    mkdir -p "$APP_DIR/.ffmpeg"
    ln -sf "$APP_DIR/ffmpeg" "$APP_DIR/.ffmpeg/ffmpeg" 2>/dev/null || true
fi

# Start server
echo "  正在启动服务..."
"$NODE_BIN" "$APP_DIR/server.js" &
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
