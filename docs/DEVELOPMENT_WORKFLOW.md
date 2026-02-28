# DeTake 前端 - 开发工作流

> **AI 辅助开发的自动化测试流程**
> **最后更新**: 2026-02-27

---

## 🎯 核心理念

**开发 → 自动测试 → 自动清理 → 提交代码**

所有中间产物（截图、视频、测试报告）在测试完成后自动清理，保持仓库整洁。

---

## 🚀 完整开发流程

### 1. 接收需求并开发

```bash
# 启动开发服务器
pnpm dev

# 在另一个终端进行开发...
# 修改代码、添加功能等
```

### 2. 开发完成后自动测试并提交（推荐）

```bash
# 一键完成：测试 + 清理 + Git 提交
./dev-commit.sh <type> "<message>"

# 或使用 pnpm
pnpm commit <type> "<message>"
```

**提交类型**:
- `feat` - 新功能 (new feature for the user)
- `fix` - Bug 修复 (bug fix for the user)
- `docs` - 文档变更 (changes to documentation)
- `style` - 代码格式 (formatting, missing semicolons, etc)
- `refactor` - 代码重构 (refactoring production code)
- `test` - 测试相关 (adding missing tests, refactoring tests)
- `chore` - 构建/工具 (updating grunt tasks, etc)

**示例**:
```bash
./dev-commit.sh feat "添加用户头像显示功能"
./dev-commit.sh fix "修复首页图片加载问题"
./dev-commit.sh docs "更新 API 文档"
```

这个脚本会自动：
1. ✅ 检查 Git 状态（有改动才继续）
2. ✅ 运行 TypeScript 类型检查
3. ✅ 构建项目验证无错误
4. ✅ 运行 E2E 测试
5. ✅ **自动清理**所有测试产物
6. ✅ **自动 Git 提交**（遵循规范格式）

### 3. 推送到远程（可选）

```bash
# 推送到当前分支
git push

# 或推送到特定分支
git push origin dev
```

---

## 📝 测试命令速查

### 快速测试（日常开发）

```bash
# 只运行测试（不清理）
pnpm test

# UI 模式（调试时使用）
pnpm test:ui

# 仅 Chromium（最快）
pnpm test:chromium
```

### 完整测试（提交前）

```bash
# 一键运行所有检查 + 自动清理
./dev-test.sh
```

### 手动清理

```bash
# 清理所有测试产物
rm -rf test-results/ playwright-report/ *.png
```

---

## 🤖 AI 开发工作流

当 AI（如 Claude Code）帮你开发时，标准流程：

### 步骤 1: AI 接收需求

```
用户: "请在首页添加一个搜索框"
```

### 步骤 2: AI 开发功能

AI 会：
1. 分析需求
2. 修改相关组件
3. 更新类型定义
4. 添加样式

### 步骤 3: AI 自动测试和提交

开发完成后，AI 会自动运行：

```bash
./dev-commit.sh feat "添加首页搜索框功能"
```

这会触发：
1. ✅ 检查 Git 状态
2. ✅ TypeScript 类型检查
3. ✅ 项目构建验证
4. ✅ E2E 测试（确保没破坏现有功能）
5. ✅ 自动清理测试产物
6. ✅ **自动 Git 提交**（格式：`feat: 添加首页搜索框功能`）

### 步骤 4: 报告结果

AI 会告诉你：

```
✅ 所有检查通过并已提交！
- TypeScript: 0 errors
- Build: Success
- E2E Tests: 10/10 passed
- 中间产物已自动清理
- Git Commit: feat: 添加首页搜索框功能

可以推送到远程: git push
```

或者如果有问题：

```
❌ 发现问题：
- TypeScript: 3 errors in src/components/SearchBox.tsx
- E2E Tests: 8/10 passed (2 failed)

正在修复...
```

---

## 📦 测试配置特点

### 自动清理机制

所有测试产物都会被自动清理：

```javascript
// playwright.config.js
use: {
  trace: 'off',  // 不生成 trace
  screenshot: 'off',  // CI 时不截图
  video: 'off',  // CI 时不录像
}
```

```.gitignore
# 测试产物不提交到 git
test-results/
playwright-report/
*.png  # 排除所有 PNG 截图
```

### 仅保留必要信息

测试只输出：
- ✅ 通过的测试数量
- ❌ 失败的测试名称和原因
- 📊 测试总耗时

不保留：
- ❌ 截图文件
- ❌ 视频文件
- ❌ HTML 报告
- ❌ Trace 文件

---

## 🛠️ 测试套件说明

### 当前测试覆盖

#### Homepage Tests (10个测试)
1. ✅ 页面加载成功
2. ✅ 显示头部导航
3. ✅ 显示最新新闻
4. ✅ 显示高亮文章
5. ✅ 显示热门阅读
6. ✅ 文章链接可点击
7. ✅ 显示语言选择器
8. ✅ 移动端响应式
9. ✅ 图片加载
10. ✅ 显示页脚

#### Article Tests
- 从首页导航到文章
- 显示文章内容
- 显示作者信息
- 分享功能

#### Navigation Tests
- 分类页导航
- 作者页导航
- 前进/后退导航
- 404 处理

### 测试编写原则

1. **快速**：所有测试应在 30 秒内完成
2. **稳定**：不依赖网络、时间等不稳定因素
3. **独立**：每个测试独立运行，互不影响
4. **清晰**：测试名称清楚说明测试内容

---

## 🐛 问题排查

### 测试失败时

```bash
# 1. 查看详细错误（不清理产物）
pnpm test --reporter=list

# 2. UI 模式调试
pnpm test:ui

# 3. 查看失败截图（如果有）
ls test-results/
```

### 类型错误时

```bash
# 单独运行类型检查
pnpm type-check

# 查看详细错误信息
```

### 构建失败时

```bash
# 查看构建日志
pnpm build
```

---

## 📊 性能指标

### 测试速度

- **Homepage Tests**: ~18s
- **Article Tests**: ~10s
- **Navigation Tests**: ~15s
- **总计**: < 1 分钟

### 清理效果

运行 `./dev-test.sh` 后：
- 测试产物：0 KB（全部清理）
- 仅保留：代码文件和配置
- Git 状态：仅显示代码变更

---

## 💡 最佳实践

### 开发时

1. **小步提交**: 每完成一个小功能就测试一次
2. **及时修复**: 测试失败立即修复，不要累积
3. **保持整洁**: 依赖自动清理，不要手动创建临时文件

### AI 协作时

1. **明确需求**: 给 AI 清晰的任务描述
2. **信任测试**: 让 AI 自动运行测试流程
3. **审查结果**: 检查 AI 的测试报告

### 提交代码前

```bash
# 必须运行完整检查
./dev-test.sh

# 确保输出显示
✅ 所有检查通过！代码可以提交
```

---

## 🔄 CI/CD 集成

### GitHub Actions 示例

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: ./dev-test.sh

      # 不需要上传产物，因为已自动清理
```

---

## 📚 相关文档

- **详细测试指南**: `docs/E2E_TESTING_GUIDE.md`
- **项目知识图谱**: `docs/PROJECT_KNOWLEDGE_MAP.md`
- **开发规范**: `CLAUDE.md`

---

## 🎯 总结

**核心优势**：

1. ✅ **零中间产物**: 测试完自动清理，不污染代码库
2. ✅ **一键完成**: `./dev-commit.sh` 测试 + 提交一步到位
3. ✅ **快速反馈**: < 1 分钟知道代码质量
4. ✅ **规范提交**: 强制遵循 Git 提交规范
5. ✅ **AI 友好**: 适合 AI 辅助开发工作流

**工作流总结**：

```
开发代码 → ./dev-commit.sh <type> "<message>"
                    ↓
            [类型检查 + 构建 + 测试]
                    ↓
                 ✅ 通过
                    ↓
         [自动清理 + Git 提交]
                    ↓
              git push
```

**失败处理**：

```
开发代码 → ./dev-commit.sh <type> "<message>"
                    ↓
            [类型检查 + 构建 + 测试]
                    ↓
                 ❌ 失败
                    ↓
              修复代码
                    ↓
         重新运行 dev-commit.sh
```

---

**最后更新**: 2026-02-27
**维护者**: DeTake 前端团队
