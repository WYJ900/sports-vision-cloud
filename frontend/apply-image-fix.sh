#!/bin/bash

echo "==========================================="
echo "应用图片双画面对比修复"
echo "==========================================="

cd "$(dirname "$0")/src/pages"

# 备份当前文件
cp Training.tsx Training.tsx.before-image-fix
echo "✓ 已备份当前文件到 Training.tsx.before-image-fix"

# 恢复到原始备份
cp Training.tsx.backup Training-temp.tsx
echo "✓ 已创建临时文件"

# 应用修改
echo "开始应用修改..."

# 1. 修改第2行：添加Tabs
sed -i '2s/Badge }/Badge, Tabs }/' Training-temp.tsx
echo "✓ [1/8] 添加Tabs导入"

# 2. 修改第11行：添加SwapOutlined
sed -i '11s/WarningOutlined,/WarningOutlined,\n  SwapOutlined,/' Training-temp.tsx
echo "✓ [2/8] 添加SwapOutlined图标"

# 3. 在第20行后添加新的imports
sed -i '20 a\import { ImageComparisonView } from '"'"'../components/PoseViewer/ImageComparisonView'"'"'\nimport { ActionMatchingTable } from '"'"'../components/PoseViewer/ActionMatchingTable'"'"'\nimport { generateActionMatches, getFixedStandardPose, type ActionMatchData } from '"'"'../utils/standardActions'"'"'' Training-temp.tsx
echo "✓ [3/8] 添加组件导入"

# 4. 在第142行后添加新states
sed -i '142 a\  const [viewMode, setViewMode] = useState<'"'"'single'"'"' | '"'"'comparison'"'"'>( '"'"'single'"'"')\n  const [actionMatches, setActionMatches] = useState<ActionMatchData[]>([])\n  const [currentActionIndex, setCurrentActionIndex] = useState(0)' Training-temp.tsx
echo "✓ [4/8] 添加状态变量"

# 5-8 的修改比较复杂，创建提示
echo ""
echo "==========================================="
echo "⚠️  需要手动完成以下步骤："
echo "==========================================="
echo ""
echo "1. 打开 Training-temp.tsx"
echo "2. 找到第209行的 startDemo 函数"
echo "3. 在 setDemoMode(true) 后添加："
echo "   setActionMatches(generateActionMatches(username))"
echo "   setCurrentActionIndex(0)"
echo ""
echo "4. 找到第161行的 demoTimerRef.current 设置"
echo "5. 修改为每60帧切换："
echo "   if (nextFrame % 60 === 0) {"
echo "     setCurrentActionIndex((idx) => (idx + 1) % 20)"
echo "   }"
echo ""
echo "6. 替换第262-275行的Card为Tabs结构（参考IMAGE_COMPARISON_FIX.md）"
echo ""
echo "7. 修改第277行的Col条件为："
echo "   {!(demoMode && viewMode === 'comparison') && ("
echo ""
echo "8. 完成后："
echo "   mv Training-temp.tsx Training.tsx"
echo "   npm run dev"
echo ""
echo "==========================================="
echo "或者直接复制示例文件："
echo "==========================================="
echo "我已经在项目根目录创建了完整的示例文件"
echo "请查看 COMPLETE_TRAINING_EXAMPLE.tsx"
