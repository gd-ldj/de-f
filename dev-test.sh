#!/bin/bash

# DeTake Frontend - 开发后自动测试脚本
# 使用方法: ./dev-test.sh

set -e  # 遇到错误立即退出

echo "🚀 DeTake 开发测试流程"
echo "================================"

# 1. 类型检查
echo ""
echo "📝 步骤 1/3: 运行类型检查..."
pnpm type-check
echo "✅ 类型检查通过"

# 2. 构建测试
echo ""
echo "🔨 步骤 2/3: 构建项目..."
pnpm build
echo "✅ 构建成功"

# 3. E2E 测试
echo ""
echo "🧪 步骤 3/3: 运行 E2E 测试..."
pnpm test --reporter=list
echo "✅ 所有测试通过"

# 4. 清理测试产物
echo ""
echo "🧹 清理测试产物..."
rm -rf test-results/ playwright-report/ *.png 2>/dev/null || true
echo "✅ 清理完成"

echo ""
echo "================================"
echo "🎉 所有检查通过！代码可以提交"
echo "================================"
