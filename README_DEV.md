# DeTake 开发快速参考

> 快速开始指南 - 5 分钟上手

---

## 🚀 快速开始

### 开发新功能

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 修改代码...

# 3. 开发完成，一键测试并提交 (提交信息必须用英语)
./dev-commit.sh feat "your feature description"

# 4. 推送到远程
git push
```

**⚠️ 重要**: 所有提交信息必须使用英语 (All commit messages must be in English)

**就这么简单！** ✅

---

## 📝 提交类型速查 (Commit message must be in English)

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `./dev-commit.sh feat "add user avatar"` |
| `fix` | Bug修复 | `./dev-commit.sh fix "fix login issue"` |
| `docs` | 文档 | `./dev-commit.sh docs "update API documentation"` |
| `style` | 格式 | `./dev-commit.sh style "format code"` |
| `refactor` | 重构 | `./dev-commit.sh refactor "refactor user module"` |
| `test` | 测试 | `./dev-commit.sh test "add unit tests"` |
| `chore` | 构建 | `./dev-commit.sh chore "update dependencies"` |

---

## 🔧 常用命令

```bash
# 开发
pnpm dev                # 启动开发服务器

# 测试（不提交）
pnpm test               # 运行所有测试
pnpm test:ui            # UI 模式（调试用）
./dev-test.sh           # 测试 + 清理（不提交）

# 测试 + 提交
./dev-commit.sh <type> "<message>"

# 检查
pnpm type-check         # 类型检查
pnpm build              # 构建项目
```

---

## 📦 自动化脚本说明

### `./dev-test.sh` - 仅测试

运行测试但不提交代码

**流程**:
1. TypeScript 类型检查
2. 项目构建
3. E2E 测试
4. 清理中间产物

### `./dev-commit.sh` - 测试 + 提交

运行测试并自动提交代码

**流程**:
1. 检查 Git 状态
2. TypeScript 类型检查
3. 项目构建
4. E2E 测试
5. 清理中间产物
6. **Git 提交**（自动格式化）

---

## 🤖 AI 开发流程

当你请 AI 帮你开发时 (AI 提交信息将使用英语)：

```
你: "请添加一个搜索功能"
   ↓
AI: [开发代码...]
   ↓
AI: [自动运行 ./dev-commit.sh feat "add search feature"]
   ↓
AI: ✅ 测试通过，代码已提交
   ↓
你: git push
```

---

## 📚 详细文档

- **完整工作流**: `docs/DEVELOPMENT_WORKFLOW.md`
- **测试指南**: `docs/E2E_TESTING_GUIDE.md`
- **项目架构**: `docs/PROJECT_KNOWLEDGE_MAP.md`
- **开发规范**: `CLAUDE.md`

---

## ⚠️ 注意事项

1. **提交前必须通过测试** - 脚本会自动检查
2. **中间产物会自动清理** - 不会留在代码库
3. **提交信息遵循规范** - 格式: `<type>: <message>`
4. **TypeScript 零容忍** - 必须 0 errors

---

## 🎯 核心原则

- ✅ 开发完立即测试
- ✅ 测试通过立即提交
- ✅ 保持代码库整洁
- ✅ 遵循提交规范

---

**Happy Coding! 🚀**
