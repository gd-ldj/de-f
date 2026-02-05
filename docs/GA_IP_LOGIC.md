# GA 上报 vpn_ip 与 real_ip 逻辑说明

## 目标
整理前端在 GA 上报时 `vpn_ip` 与 `real_ip` 的来源、判断流程与优先级。

## 上报字段位置
在 GA 事件上报阶段，`real_ip` 与 `vpn_ip` 会作为通用参数附加到所有 GA 事件中：
- 逻辑位置：`src/lib/analytics.ts`
- 触发点：`trackEvent` 内的 `commonParams`

## 数据获取总流程
1. 初始化埋点系统并生成 visitor 数据
2. 调用 `getAdditionalVisitorInfo`
3. 获取 Cloudflare 访客信息与综合 IP 信息
4. 依据 VPN 检测结果设置 `real_ip` / `vpn_ip`
5. 用 Cloudflare 数据做最终覆盖与补全
6. 上报到 GA

## 关键模块与职责
### 1) analytics.ts（上报与赋值入口）
文件：`src/lib/analytics.ts`
- `getAdditionalVisitorInfo` -> `getEnhancedCloudflareInfo`
  - 取 Cloudflare 访客 ID
  - 取综合 IP 信息（含 VPN 检测）
  - 生成用户指纹
- `trackEvent`
  - 将 `real_ip`、`vpn_ip` 放入 GA 的通用参数

### 2) ip-detector.ts（综合 IP 与 VPN 检测）
文件：`docs/utils/ip-detector.ts`
- `getComprehensiveIPInfo`
  - 优先从 Cloudflare 获取 `clientIP`
  - 若 Cloudflare 不可用或是本地地址，再调用外部 IP API 兜底
  - 收集 WebRTC IP
  - 计算 `publicIP`、`realIP`、`vpnDetection`
- `detectVPN`
  - 通过多指标判断是否 VPN：
    - 多个公有 IP（WebRTC 泄露）
    - 公网 IP 不一致（API IP vs WebRTC IP）
    - ASN/ISP 可疑关键词
    - 地理位置不一致
    - WebRTC 被阻断
  - 计算 `realIP` 与 `vpnIP`

### 3) cloudflare-cache.ts / cf-headers.ts（Cloudflare 数据）
文件：
- `docs/utils/cloudflare-cache.ts`
- `src/pages/api/cf-headers.ts`

职责：
- 通过 `/api/cf-headers` 提供 Cloudflare 头信息缓存
- 输出 `clientIP`、`realIP`、`country` 等字段

## real_ip / vpn_ip 的赋值规则
发生在 `analytics.ts` 的 `getEnhancedCloudflareInfo` 中。

### 1) 基于 VPN 检测结果的初始赋值
来自 `getComprehensiveIPInfo()` 的 `vpnDetection`：
- 若 `isVPN = true`
  - `vpn_ip = vpnDetection.vpnIP || publicIP`
  - `real_ip = vpnDetection.realIP`
- 若 `isVPN = false`
  - `real_ip = publicIP`
  - `vpn_ip = undefined`

### 2) Cloudflare 数据的最终覆盖
在 VPN 规则之后，再尝试用 Cloudflare 数据增强：
- 若 `cloudflareData.realIP` 存在：
  - `real_ip = cloudflareData.realIP`（覆盖）
- 若 `cloudflareData.clientIP` 存在且检测为 VPN：
  - `vpn_ip = cloudflareData.clientIP`（覆盖）

## 数据源优先级总结
1. Cloudflare `/api/cf-headers` 的 `realIP`（最终覆盖）
2. VPN 检测结果的 `realIP`
3. 公网 `publicIP`（VPN 未检测时）

对应 `vpn_ip`：
1. Cloudflare `clientIP`（仅 VPN 情况下覆盖）
2. VPN 检测结果的 `vpnIP`
3. 公网 `publicIP`（VPN 检测但无更优结果时）

## 可能为空的情况
`real_ip` / `vpn_ip` 可能为空或不存在：
- Cloudflare 不可用且外部 IP API 失败
- WebRTC/IP API 被阻断或无权限
- VPN 检测失败导致回退为最小数据

## 代码参考
- 赋值与上报入口：`src/lib/analytics.ts`
- VPN 检测与 IP 计算：`docs/utils/ip-detector.ts`
- Cloudflare 缓存：`docs/utils/cloudflare-cache.ts`
- Cloudflare 头信息：`src/pages/api/cf-headers.ts`
