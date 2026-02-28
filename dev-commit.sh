#!/bin/bash

# DeTake Frontend - 开发、测试、提交自动化脚本
# 使用方法: ./dev-commit.sh <type> <message>
# 例如: ./dev-commit.sh feat "添加用户头像显示功能"

set -e  # 遇到错误立即退出

# 检查参数
if [ $# -lt 2 ]; then
    echo "❌ 错误: 缺少参数"
    echo ""
    echo "使用方法: ./dev-commit.sh <type> <message>"
    echo ""
    echo "提交类型 (type):"
    echo "  feat     - 新功能 (new feature for the user)"
    echo "  fix      - Bug 修复 (bug fix for the user)"
    echo "  docs     - 文档变更 (changes to documentation)"
    echo "  style    - 代码格式 (formatting, missing semicolons, etc)"
    echo "  refactor - 代码重构 (refactoring production code)"
    echo "  test     - 测试相关 (adding missing tests, refactoring tests)"
    echo "  chore    - 构建/工具 (updating grunt tasks, etc)"
    echo ""
    echo "示例 (Examples - commit message must be in English):"
    echo "  ./dev-commit.sh feat \"add user avatar display\""
    echo "  ./dev-commit.sh fix \"fix homepage image loading issue\""
    echo "  ./dev-commit.sh docs \"update API documentation\""
    exit 1
fi

COMMIT_TYPE=$1
COMMIT_MESSAGE=$2

# 验证提交类型
VALID_TYPES="feat fix docs style refactor test chore"
if ! echo "$VALID_TYPES" | grep -w "$COMMIT_TYPE" > /dev/null; then
    echo "❌ 错误: 无效的提交类型 '$COMMIT_TYPE'"
    echo "有效类型: $VALID_TYPES"
    exit 1
fi

echo "🚀 DeTake 开发、测试、提交流程"
echo "================================"
echo "提交类型: $COMMIT_TYPE"
echo "提交信息: $COMMIT_MESSAGE"
echo "================================"

# 1. 检查是否有改动
echo ""
echo "📋 检查 Git 状态..."
if git diff --quiet && git diff --cached --quiet; then
    echo "⚠️  没有检测到代码改动，无需提交"
    exit 0
fi
echo "✅ 检测到代码改动"

# 2. 类型检查
echo ""
echo "📝 步骤 1/4: 运行类型检查..."
pnpm type-check
echo "✅ 类型检查通过"

# 3. 构建测试
echo ""
echo "🔨 步骤 2/4: 构建项目..."
pnpm build
echo "✅ 构建成功"

# 4. E2E 测试
echo ""
echo "🧪 步骤 3/4: 运行 E2E 测试..."
pnpm test --reporter=list
echo "✅ 所有测试通过"

# 5. 清理测试产物
echo ""
echo "🧹 清理测试产物..."
rm -rf test-results/ playwright-report/ *.png 2>/dev/null || true
echo "✅ 清理完成"

# 6. Git 提交
echo ""
echo "📦 步骤 4/4: 提交代码..."

# 添加所有改动
git add .

# 生成提交信息
FULL_COMMIT_MESSAGE="${COMMIT_TYPE}: ${COMMIT_MESSAGE}"

# 提交
git commit -m "$FULL_COMMIT_MESSAGE"
echo "✅ 代码已提交"

# 显示最新提交
echo ""
echo "📋 最新提交信息:"
git log -1 --oneline

echo ""
echo "================================"
echo "🎉 完成！代码已准备好推送"
echo ""
echo "推送到远程:"
echo "  git push"
echo ""
echo "或推送到特定分支:"
echo "  git push origin <branch-name>"
echo "================================"
