#!/bin/bash

echo "==================================="
echo "前端启动诊断和修复脚本"
echo "==================================="

# 检查Node版本
echo ""
echo "1. 检查Node.js版本..."
node --version
npm --version

# 检查依赖
echo ""
echo "2. 检查依赖完整性..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules不存在，正在安装..."
    npm install
else
    echo "   ✓ node_modules存在"
fi

# 检查端口占用
echo ""
echo "3. 检查端口5173占用情况..."
netstat -an | grep ":5173" || echo "   ✓ 端口5173空闲"

# 清理缓存
echo ""
echo "4. 清理Vite缓存..."
rm -rf node_modules/.vite
echo "   ✓ 缓存已清理"

# 检查关键文件
echo ""
echo "5. 检查关键文件..."
files=(
    "src/pages/Training.tsx"
    "src/components/PoseViewer/PoseComparisonView.tsx"
    "src/components/PoseViewer/ActionMatchingTable.tsx"
    "src/utils/standardActions.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file 不存在"
    fi
done

echo ""
echo "==================================="
echo "诊断完成！现在启动开发服务器..."
echo "==================================="
echo ""

# 启动开发服务器
npm run dev
