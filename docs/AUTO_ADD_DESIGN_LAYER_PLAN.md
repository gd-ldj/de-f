# AUTO `/auto:add` UI 设计层改造落地方案

## 1. 文档目标

本文档给出 `/auto:add` 的一版更稳、更轻量、与当前 AUTO 架构更匹配的改造方案。

这版方案吸收了 review 意见，调整后的核心判断是：

- 当前项目确实缺一个 UI 任务专用的“设计目标层”
- 但 Phase 1 不应先做 HTML mockup + 截图
- Phase 1 应先落地 **`DESIGN-BRIEF.md` + `UI_PRIMITIVES.md` 注入 + QA 状态约束**
- 实现结果截图证据链放到 Phase 2
- AI 自动生成的 UI 稿 / mockup 放到 Phase 3，等待 multimodal runtime 或明确的人审流程支持

一句话概括：

> 先把“目标说清楚”，再把“结果截下来”，最后才考虑“自动画草图”。

## 2. 为什么调整原方案

原方案的问题不是方向错，而是 **Phase 1 选型过重**。

### 2.1 原方案成立的部分

- 现有 AUTO 在 UI 任务上确实缺“视觉目标层”
- 纯文字 spec 容易导致 task dev 做对功能但做偏视觉
- QA 也缺少一个稳定的设计参照物

### 2.2 原方案不适合先落地的部分

1. **AI mockup 不是可靠主规格**
   - 生成 mockup 的 agent 与后续实现 UI 的 agent 属于同类能力
   - 如果 mockup 本身方向错，下游会把错误做得更像“正确实现”

2. **当前 runtime 是 text-only**
   - `auto/runtime/codex_cli.py` 当前只构造 text prompt
   - 截图无法直接成为 stage agent 的输入
   - 因此 Phase 1 里自动生成截图，对自动链路帮助有限

3. **当前仓库已经有更稳定的设计约束**
   - `/Users/lideju/Documents/company/detake/detake-frontend/docs/UI_PRIMITIVES.md` 已存在
   - 当前更真实的问题不是“没有 AI 草图”，而是 task dev 没被强制读这份设计约束

因此，本次修订后的正式建议是：

- **权威设计输入**：`DESIGN-BRIEF.md` + `UI_PRIMITIVES.md`
- **实现证据输出**：QA 实现截图
- **AI 生成 mockup**：后置增强能力，不作为当前主规格

## 3. 当前代码现实

结合当前仓库实现，现状如下：

### 3.1 已经具备的能力

- `/auto:add` 已能产出 `REQUIREMENT.md`、`SPEC-LITE.md`、`TASKS.json`、`QA-UNITS.json`
- `/auto:start` 已能驱动 task dev、review、verify、QA verify
- `qa_verify` 已能走 Playwright browser 验证
- runtime 已有有限次 fix loop

### 3.2 还缺失的关键能力

1. `auto/commands/add.py`
   - 当前主链路是 `build spec -> spec review -> build tasks/qa`
   - 设计层没有进入 authoritative intake 主链路

2. `auto/orchestrator/design.py`
   - 当前只有轻量 `DESIGN.md`
   - 没有结构化 brief，也没有明确服务于 task dev / qa_verify

3. `scripts/auto-stage-agent.py`
   - `task_dev` prompt 当前只读 requirement/spec/tasks/qa_units/fix_context/review
   - **没有**任何 `UI_PRIMITIVES.md` 注入

4. `auto/runtime/context_paths.py`
   - 当前没有 `design_brief` 或 `ui_primitives` 这样的上下文入口

5. `auto/orchestrator/qa_units.py`
   - 当前只会粗略决定 `browser` / `non_ui`
   - 不知道“该验哪些状态、哪些视觉约束”

结论：

> 当前最值得优先补齐的，不是 mockup 生成能力，而是把设计约束稳定喂给 task dev 和 QA。

## 4. 修订后的总体路线

## Phase 1：Authoritative Design Layer（推荐先做）

目标：

- 对 UI / 交互类需求强制生成 `DESIGN-BRIEF.md`
- 把 `/Users/lideju/Documents/company/detake/detake-frontend/docs/UI_PRIMITIVES.md` 注入 task dev 上下文
- 让 QA Unit 知道关键状态和基础视觉检查项
- 不做 HTML 渲染，不做设计稿截图

这是当前应当优先落地的阶段。

## Phase 2：Implementation Evidence Layer

目标：

- `qa_verify` 完成后自动保留实现截图
- 形成“需求 / design brief -> 实现结果”的证据链
- 为人类 review、回归检查、fix loop 归因提供依据

## Phase 3：Optional Visual Draft Layer

目标：

- 在 runtime 具备更稳定的 multimodal 支持，或者明确引入 human-in-the-loop 设计审查之后
- 再考虑 `DESIGN-DRAFT.html`、mockup 截图、甚至轻量视觉比对

这不是当前第一优先级。

## 5. Phase 1 方案细节

## 5.1 Phase 1 的正式定义

对当前项目而言，Phase 1 的“UI 自动生成”应定义为：

> `/auto:add` 在 UI / 交互类需求上自动生成结构化 `DESIGN-BRIEF.md`，并把项目现有设计规范注入开发与验收链路。

不是：

- 自动生成 HTML mockup
- 自动生成高保真视觉稿
- 自动生成最终生产级 UI

## 5.2 Phase 1 产物

建议在 `.auto/work-items/<work_item_id>/` 下新增以下产物：

```text
.auto/work-items/<id>/
├── REQUIREMENT.md
├── SPEC-LITE.md
├── DESIGN-BRIEF.md
├── TASKS.json
└── QA-UNITS.json
```

### `DESIGN-BRIEF.md` 的职责

它是当前阶段的 authoritative design input，面向：

- spec reviewer
- task dev agent
- QA / verify agent
- 人类 reviewer

### `DESIGN-BRIEF.md` 建议结构

建议至少包含以下部分：

1. **Surface**
   - 页面 / 弹窗 / drawer / form / overlay / section

2. **User Goal**
   - 用户在这个界面上要完成什么

3. **Layout / Sections**
   - 页面结构
   - 信息层级
   - 主要区域

4. **Components**
   - 核心组件清单
   - 是否复用现有 primitives

5. **States**
   - loading
   - empty
   - error
   - success
   - disabled
   - open / active / hover / focus

6. **Interactions**
   - 点击、输入、筛选、切换、弹层开关等行为

7. **Responsive Rules**
   - mobile / tablet / desktop 的布局重点

8. **Visual Constraints**
   - 明确引用 `docs/UI_PRIMITIVES.md`
   - 列出本任务特别相关的 token / pattern / spacing / typography 约束

9. **Out of Scope**
   - 本次不做什么，防止任务漂移

## 5.3 Phase 1 的主流程

对于 UI / 交互类需求，`/auto:add` 建议流程改为：

1. 写入 `REQUIREMENT.md`
2. 生成 `SPEC-LITE.md`
3. 判断是否属于 UI / 交互类任务
4. 生成 `DESIGN-BRIEF.md`
5. 将 brief 摘要注入 spec review 输入
6. spec review 通过后，生成 `TASKS.json`
7. 生成包含关键状态的 `QA-UNITS.json`

对于非 UI 任务：

- 跳过 `DESIGN-BRIEF.md`
- 保持当前轻量路径

## 6. Phase 1 代码改造点

## 6.1 `auto/commands/add.py`

建议从当前逻辑：

1. prepare work item
2. build spec
3. run spec review
4. maybe write design
5. build tasks / qa units

调整为：

1. prepare work item
2. build spec
3. if UI task -> build `DESIGN-BRIEF.md`
4. run spec review（带上 design brief 摘要）
5. build tasks / qa units

关键点：

- `DESIGN-BRIEF.md` 必须在 spec review 前生成
- 因为它是当前阶段的 authoritative design input

## 6.2 `auto/orchestrator/design.py`

当前建议不要新开很重的 `ui_draft.py` 链路。

更稳妥的做法是扩展现有 `design.py`，只做两件事：

- 判断该 requirement 是否属于 UI / 交互类
- 生成 `DESIGN-BRIEF.md`

建议新增或扩展的接口：

- `should_generate_design_brief(requirement: str) -> bool`
- `write_design_brief(item_dir, requirement, spec_path) -> Path | None`

这样可以把第一阶段控制在最小改造范围内。

## 6.3 `auto/orchestrator/spec_review.py`

当前 `run_spec_review()` 会把 requirement 和 spec 拼成 `combined_requirement`。

建议增加：

- 若存在 `DESIGN-BRIEF.md`
- 则把其摘要追加到 `combined_requirement`

注意：

- 当前 reviewer 仍是 text-only
- 所以这里要注入的是 **brief 文本摘要**
- 不是截图路径，也不是图片内容

## 6.4 `auto/runtime/context_paths.py`

建议新增以下 context path：

- `design_brief`
- `ui_primitives`

其中：

- `design_brief` 指向 `.auto/work-items/<id>/DESIGN-BRIEF.md`
- `ui_primitives` 指向 `/Users/lideju/Documents/company/detake/detake-frontend/docs/UI_PRIMITIVES.md`

这样 task dev / review / verify 都能稳定读到这些上下文。

## 6.5 `scripts/auto-stage-agent.py`

当前 `_build_task_dev_prompt()` 没有设计系统约束输入。

建议修改为：

- 在 “Before coding, read these files in order” 中加入：
  - `DESIGN-BRIEF.md`
  - `docs/UI_PRIMITIVES.md`

推荐读取顺序：

1. Requirement
2. Spec
3. Design brief
4. UI primitives
5. Task graph
6. QA units
7. Fix context
8. Previous review

这样 task dev 会先知道：

- 要做什么
- 应该长成什么样
- 必须遵守哪些已有设计模式

## 6.6 `auto/orchestrator/qa_units.py`

当前 `QA-UNITS.json` 只知道 `verify_mode` 和粗略 acceptance criteria。

建议对 UI 任务新增更明确的字段，例如：

- `required_states`
- `visual_checks`
- `design_brief_path`

其中：

- `required_states` 来自 `DESIGN-BRIEF.md`
- `visual_checks` 只做轻量要求，例如：
  - 关键区域可见
  - loading / empty / error 状态存在
  - 交互状态变化正确
  - mobile / desktop 不出现明显结构错误

这一步仍然不要求 design screenshot 作为输入。

## 7. Phase 2 方案：实现结果截图证据链

Phase 2 的目标不是生成设计稿，而是保存实现结果证据。

## 7.1 为什么先做实现截图，而不是设计截图

因为实现截图有直接价值：

- 它反映真实页面结果
- 它能帮助定位“功能对 / 视觉偏”的问题
- 它能为 fix loop 提供更真实的证据
- 它不依赖 agent 先猜一个 mockup

## 7.2 建议产物结构

建议在 QA Unit 目录下增加截图产物：

```text
.auto/qa-units/<qa_unit_id>/
├── VERIFY.json
├── BUGS.json
├── screenshots/
│   ├── desktop.png
│   ├── mobile.png
│   └── interaction-open.png
```

## 7.3 需要改的代码点

### `auto/runtime/qa_verify.py`

建议增强：

- 在 verify 完成后输出 screenshot 路径
- 把路径写入 `VERIFY.json`

### `scripts/auto-qa-verify.py`

建议增强：

- 对 browser verify 自动补充至少两档截图
  - desktop
  - mobile
- 若有 `required_states`，再补关键状态截图

这样 Phase 2 会形成：

- requirement / spec / design brief
- implementation screenshot
- verify verdict

这是第一条真正有实用价值的视觉证据链。

## 8. Phase 3：可选的 UI draft / mockup

只有满足以下条件之一，才建议进入 Phase 3：

1. runtime 能稳定消费 multimodal 输入
2. 团队明确需要在 spec review 阶段做人审式视觉预演
3. 已有足够经验验证 AI 生成 mockup 不会显著误导开发

到那时，才考虑引入：

- `DESIGN-DRAFT.html`
- 设计稿截图
- 轻量 design-vs-implementation 对照

但在当前阶段：

- **不要**把 mockup 作为 authoritative spec
- **不要**把设计稿截图当作自动链路的核心输入

## 9. 修订后的验收标准

## 9.1 Phase 1 验收

以下条件全部满足才算通过：

1. 对 UI / 交互类需求，`/auto:add` 会生成 `DESIGN-BRIEF.md`
2. spec review 的输入包含 design brief 摘要
3. task dev prompt 明确要求读取：
   - `DESIGN-BRIEF.md`
   - `docs/UI_PRIMITIVES.md`
4. `QA-UNITS.json` 对 UI 任务包含关键状态或视觉检查项
5. 非 UI 需求不受影响，仍走当前轻量流程

## 9.2 Phase 2 验收

1. browser verify 完成后自动保留实现截图
2. `VERIFY.json` 中可追溯截图路径
3. 至少包含 desktop / mobile 两档截图
4. 若任务存在关键状态，则至少保留一个状态截图

## 10. 风险与应对

### 风险 1：`DESIGN-BRIEF.md` 写得过于抽象

应对：

- 使用固定模板
- 强制包含 `sections`、`states`、`interactions`、`responsive rules`
- 强制引用 `UI_PRIMITIVES.md`

### 风险 2：task dev 虽然读了 brief，但仍然忽略设计规范

应对：

- 在 `hard_rules` 中加入相关规则
- 在 review / qa 环节增加对关键状态和结构的检查

### 风险 3：QA 截图只存档，不被使用

应对：

- 截图路径进入 `VERIFY.json`
- fix loop 打开时，把截图路径作为 evidence 引用

### 风险 4：过早引入 mockup，误导整个流程

应对：

- 当前阶段明确不做
- 只在 Phase 3 重新评估

## 11. 最终建议

当前项目最合理的落地顺序，应明确为：

1. **Phase 1：先做 `DESIGN-BRIEF.md` + `UI_PRIMITIVES.md` 注入**
2. **Phase 2：再做 QA 实现截图证据链**
3. **Phase 3：最后再评估 HTML mockup / UI draft**

因此，当前项目对“UI 自动生成”的阶段性定义应调整为：

> 在 UI / 交互类需求上，`/auto:add` 先自动生成结构化设计说明，并把既有设计规范注入开发与验收链路；实现截图证据链在 QA 阶段补齐。

这是当前 AUTO 架构下更低风险、收益更明确、也更容易真正落地的一条路线。
