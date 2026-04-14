# 全局公共参数

**全局Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**全局Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**全局Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**全局认证方式**

> 无需认证

# 状态码说明

| 状态码 | 中文描述 |
| --- | ---- |
| 2001 | 操作成功 |
| 2002 | 创建成功 |
| 2003 | 更新成功 |
| 2004 | 删除成功 |
| 4001 | 请求参数错误 |
| 4002 | 未授权 |
| 4003 | 资源不存在 |
| 4004 | 缺失参数 |
| 4005 | 请求过于频繁 |
| 4006 | 禁止访问 |
| 4007 | 无效的令牌格式 |
| 6001 | 无效的令牌 |
| 6002 | 令牌过期 |
| 6003 | 无效的签名 |
| 6004 | 邮箱已存在 |
| 6005 | 邮箱不存在 |
| 6006 | 钱包已存在 |
| 6007 | 钱包不存在 |
| 6008 | 邮件发送失败 |
| 6009 | 无效的钱包地址 |
| 6012 | 访问令牌刷新成功 |
| 6013 | 无效的刷新令牌 |
| 6014 | 无效的邮箱验证码 |
| 6015 | 缺失内容标题 |
| 6016 | 无效的内容状态 |
| 6017 | 无效的内容语言 |
| 6018 | 无效的内容类型 |
| 6019 | 缺失国家信息 |
| 6020 | 缺失城市信息 |
| 6021 | 分类不存在 |
| 6022 | 标签不存在 |
| 6023 | 草稿数量超出限制 |
| 6024 | 无效的内容ID格式 |
| 6025 | 无权限 |
| 6026 | 业务类型不存在 |
| 6028 | 内容已在集合中 |
| 6029 | 内容不在集合中 |
| 6030 | 缺失集合名称 |
| 6031 | 缺失内容ID |
| 6032 | 已发布的文章不能被修改 |
| 6033 | 操作失败 |
| 6034 | 缺失必需字段 |
| 6035 | 无效的请求数据 |
| 7001 | 其他错误 |
| 7002 | 无法加载环境变量文件 |

# 用户管理

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2025-06-25 19:31:35

**用户相关接口**

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 邮箱注册/登录

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2025-08-19 21:04:11

**通过邮箱发送验证链接，可用于注册或登录，系统发送包含验证链接的邮件**

**接口状态**

> 开发中

**接口URL**

> /api/v1/auth/email

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"email": "dannyburger@163.com",
	"redirect_url": "http://127.0.0.1:3000/",
	"lang": "en"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| email | - | string | 是 | 用户邮箱 |
| type | - | string | 是 | 邮件类型，register表示注册邮件，login表示登录邮件 |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Email sent successfully",
		"zh": "邮件发送成功"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| message | - | string | 提示信息 |
| email | - | string | 邮箱 |
| type | - | string | 邮件类型 |
| expires_at | - | string | 链接过期时间 |

* 失败(500)

```javascript
{
	"code": 6004,
	"msg": {
		"en": "Email already exists",
		"zh": "邮箱已存在"
	}
}
```

**Query**

## 验证邮箱注册/登录

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-01-13 17:57:04

**用户点击邮件中的链接后，验证令牌完成注册或登录**

**接口状态**

> 开发中

**接口URL**

> /api/v1/auth/email/verify

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"verify_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRhbm55YnVyZ2VyQDE2My5jb20iLCJjb2RlIjoiMzY0NDQ0IiwicHVycG9zZSI6ImVtYWlsX3ZlcmlmaWNhdGlvbiIsImlhdCI6MTc2ODI5Nzc2OCwiZXhwIjoxNzY4Mjk5NTY4fQ.vC4ALaWqOoQYgrWGKex6gu9rW_jTw99KmzcHAW2YuiQ"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| email | - | string | 是 | 邮箱地址，用于验证 |
| verification_token | - | string | 是 | 邮箱验证成功后获得的验证令牌 |
| type | - | string | 是 | 邮件类型，区分是注册邮件还是登录邮件 |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "User login successfully",
		"zh": "用户登录成功"
	},
	"data": {
		"type": "login",
		"user_id": "3",
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzIiwicmFuZG9tIjoiOTI4MjhjOWVlNDJkZDQ1ZmRjY2U5ZjIwN2UzYzFmYjE0ZmNkNzA3MTFmM2I2ZjI2ODQ5MmVkOGVmN2JmMjY0ZiIsImlhdCI6MTc1NTYxMTQ4MX0.vhD0LjHuQtw6RXI79VgSe5ybTzsgHsmAHW-12ieL_Mc"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| access_token | - | string | 访问令牌，用于API访问认证 |
| refresh_token | - | string | 刷新令牌，用于获取新的访问令牌 |
| access_token_expires_at | - | string | 访问令牌过期时间 |
| refresh_token_expires_at | - | string | 刷新令牌过期时间 |
| user.id | - | integer | 用户ID |
| user.email | - | string | 用户邮箱 |
| user.nickname | - | string | 用户昵称 |
| user.avatar_url | - | string | 用户头像URL |
| user.wallet_address | - | string | 用户钱包地址 |
| user | - | object | - |

* 失败(500)

```javascript
{
	"code": 7001,
	"msg": {
		"en": "Other error",
		"zh": "其他错误"
	}
}
```

**Query**

## 钱包注册/登录

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2025-08-19 21:58:12

**通过钱包地址和签名注册新用户**

**接口状态**

> 开发中

**接口URL**

> /api/v1/auth/wallet

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
	"wallet_address": "0xadc5340863207ea08bf199eb1ae9bee6b34499fc",
	"signature": "0xa9410046e1ac0c265ccd3b665a3c6268a80bd33e7ae29162d20a880dbcc8d175"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| wallet_address | - | string | 是 | 钱包地址 |
| signature | - | string | 是 | 钱包签名 |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2001,
	"msg": {
		"en": "User login successfully",
		"zh": "用户登录成功"
	},
	"data": {
		"type": "login",
		"userId": "5",
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1IiwicmFuZG9tIjoiZGE0MDc3MjQxYjQ2YzJmYjU1OTQ1NWEyNjg2N2MxN2U0NDVmMjk3ODU2MTE2OWFkNzFiMzgzZmMwNjlmM2FjNiIsImlhdCI6MTc1NTYwODcwOX0.Q4Jd8L4xmWn9C5hFNIbQhKklLOyNXWdc8xGQQ317DuQ"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| access_token | - | string | 访问令牌，用于API访问认证 |
| refresh_token | - | string | 刷新令牌，用于获取新的访问令牌 |
| access_token_expires_at | - | string | 访问令牌过期时间 |
| refresh_token_expires_at | - | string | 刷新令牌过期时间 |
| user.id | - | integer | 用户ID |
| user.email | - | string | 用户邮箱 |
| user.nickname | - | string | 用户昵称 |
| user.avatar_url | - | string | 用户头像URL |
| user.wallet_address | - | string | 用户钱包地址 |
| user | - | object | - |

* 失败(500)

```javascript
{
	"code": 6006,
	"msg": {
		"en": "Wallet address already exists",
		"zh": "钱包地址已存在"
	}
}
```

**Query**

## clerk 登录

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-02-06 16:59:58

> 更新时间: 2026-02-06 17:25:05

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/auth/clerk

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "token": "654321"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "User login successfully",
		"zh": "用户登录成功"
	},
	"data": {
		"type": "login",
		"user_id": "6",
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2IiwicmFuZG9tIjoiYTczNGZmZDc3NWU3NzA4NDcxMzAwNmRlODZjOWZlYThhNGFjZjBmYzVmYzIwZWNmMDFlNTlmOTQyNjQ1MTMyZiIsImlhdCI6MTc3MDM2ODM5NH0.4gahLLfPB2i9kCI04_npui2LGDSuOFFyIq2lHY-89mE"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取用户基础(公开)信息

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-26 10:43:01

> 更新时间: 2026-02-26 12:44:29

**根据ID获取用户详情和个人资料**

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/public?user_id=5

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | - | string | 是 | Bearer {JWT_TOKEN} |

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| user_id | 5 | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "User public profile retrieved successfully",
		"zh": "获取用户基础信息成功"
	},
	"data": {
		"user_id": "5",
		"nick": null,
		"avatar_url": null,
		"promote_code": "MM8nvsbJ",
		"full_name": null,
		"profile_bio": null,
		"twitter": null
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| user_id | - | string | 用户唯一标识 |
| email | - | string | 用户邮箱 |
| nickname | - | string | 用户昵称 |
| avatar_url | - | string | 用户头像URL |
| wallet_address | - | string | 用户钱包地址 |
| roles.0 | - | array | 用户角色列表 |
| view_count | - | integer | 内容浏览量 |
| full_name | - | string | 用户全名 |
| bio | - | string | 用户简介 |
| website | - | string | 用户网站 |
| twitter | - | string | 用户Twitter账号 |
| telegram | - | string | 用户Telegram账号 |

* 失败(500)

```javascript
{
	"code": 4003,
	"msg": {
		"en": "User not found",
		"zh": "用户不存在"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | - |
| message | - | string | - |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | - | string | 是 | Bearer {JWT_TOKEN} |

**Query**

## 获取用户详情

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-02-06 17:00:51

**根据ID获取用户详情和个人资料**

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/personal

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | Bearer {JWT_TOKEN} |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "User details retrieved successfully",
		"zh": "获取用户详情成功"
	},
	"data": {
		"user_id": "6",
		"nick": null,
		"email": "dannyburger@163.com",
		"avatar_url": null,
		"promote_code": "qgZ9MpVW",
		"full_name": null,
		"profile_bio": null,
		"twitter": null,
		"twitter_api_key": null,
		"role": 1,
		"evm_wallets": [],
		"sol_wallets": []
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| user_id | - | string | 用户唯一标识 |
| email | - | string | 用户邮箱 |
| nickname | - | string | 用户昵称 |
| avatar_url | - | string | 用户头像URL |
| wallet_address | - | string | 用户钱包地址 |
| roles.0 | - | array | 用户角色列表 |
| view_count | - | integer | 内容浏览量 |
| full_name | - | string | 用户全名 |
| bio | - | string | 用户简介 |
| website | - | string | 用户网站 |
| twitter | - | string | 用户Twitter账号 |
| telegram | - | string | 用户Telegram账号 |

* 失败(500)

```javascript
{
	"code": 6001,
	"msg": {
		"en": "Invalid verify token",
		"zh": "无效的验证令牌"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | - |
| message | - | string | - |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | Bearer {JWT_TOKEN} |

**Query**

## 更新用户信息

> 创建人: Danny B.

> 更新人: Derek

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-03-02 16:40:58

**更新用户基本信息和个人资料**

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/update

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
	"nick": "user_3ACM8",
	"full_name": "Danny Burger",
	"profile_bio": "xxx yyy",
	"avatar_url": "",
	"twitter": "",
	"twitter_api_key": ""
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| email | - | string | 否 | 用户邮箱 |
| nickname | - | string | 否 | 用户昵称 |
| avatar_url | - | string | 否 | 用户头像URL |
| wallet_address | - | string | 否 | 用户钱包地址 |
| full_name | - | string | 否 | 用户全名 |
| bio | - | string | 否 | 用户简介 |
| website | - | string | 否 | 用户网站 |
| twitter | - | string | 否 | 用户Twitter账号 |
| telegram | - | string | 否 | 用户Telegram账号 |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "User information updated successfully",
		"zh": "用户信息更新成功"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| user_id | - | string | 用户唯一标识 |
| email | - | string | 用户邮箱 |
| nickname | - | string | 用户昵称 |
| avatar_url | - | string | 用户头像URL |
| wallet_address | - | string | 用户钱包地址 |
| roles.0 | - | array | 用户角色列表 |
| view_count | - | integer | 内容浏览量 |
| full_name | - | string | 用户全名 |
| bio | - | string | 用户简介 |
| website | - | string | 用户网站 |
| twitter | - | string | 用户Twitter账号 |
| telegram | - | string | 用户Telegram账号 |

* 失败(500)

```javascript
{
	"code": 7001,
	"msg": {
		"en": "Other error",
		"zh": "其他错误"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | - |
| message | - | string | - |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 删除钱包

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-07 21:26:58

> 更新时间: 2025-08-19 21:54:48

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/wallet/remove

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
    "wallet_id": "Mw=="
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Wallet address removed successfully",
		"zh": "钱包地址删除成功"
	}
}
```

* 失败(404)

```javascript
{
	"code": 4001,
	"msg": {
		"en": "Cannot delete the last wallet",
		"zh": "无法删除最后一个钱包"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 新增钱包

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-07 21:32:42

> 更新时间: 2025-08-19 21:54:53

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/wallet/add

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
	"wallet_address": "0x84c7bf8745ff5ff871c53adf8b80589a6987398f",
	"wallet_type": "evm", // evm|sol
	"signature": "0xa9410046e1ac0c265ccd3b665a3c6268a80bd33e7ae29162d20a880dbcc8d175"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Wallet address added successfully",
		"zh": "钱包地址添加成功"
	}
}
```

* 失败(404)

```javascript
{
	"code": 7001,
	"msg": {
		"en": "Other error",
		"zh": "其他错误"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 更新钱包

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-07 21:39:58

> 更新时间: 2025-08-19 21:25:50

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/wallet/update

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
	"wallet_id": "Mw==",
	"wallet_type": "evm", // evm|sol
	"new_wallet_address": "0xadc5340863207ea08bf199eb1ae9bee6b34499fc",
	"signature": "0xa9410046e1ac0c265ccd3b665a3c6268a80bd33e7ae29162d20a880dbcc8d175"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 6003,
	"msg": {
		"en": "Invalid signature",
		"zh": "无效的签名"
	}
}
```

* 失败(404)

```javascript
{
	"code": 7001,
	"msg": {
		"en": "Other error",
		"zh": "其他错误"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 关注作者

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2025-08-19 21:28:12

**关注指定的作者**

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/follow

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
    "author_id": {{authorId}}
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| notification_enabled | true | boolean | 否 | 是否接收通知 |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2001,
	"msg": {
		"en": "Followed author successfully",
		"zh": "关注作者成功"
	}
}
```

* 失败(500)

```javascript
{
	"code": 4002,
	"msg": {
		"en": "Unauthorized",
		"zh": "未授权"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | 错误代码 |
| message | - | string | 错误信息 |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 取消关注作者

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2025-08-19 21:29:57

**取消关注指定的作者**

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/unfollow

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
    "author_id": {{authorId}}
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Unfollowed author successfully",
		"zh": "取消关注作者成功"
	}
}
```

* 失败(500)

```javascript
{
	"code": 4002,
	"msg": {
		"en": "Unauthorized",
		"zh": "未授权"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | 错误代码 |
| message | - | string | 错误信息 |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 获取关注列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-08 10:10:46

> 更新时间: 2025-08-19 21:30:34

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/following

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2001,
	"msg": {
		"en": "User details retrieved successfully",
		"zh": "获取用户详情成功"
	},
	"data": {
		"following": [
			{
				"id": "2",
				"nick": "dannyx",
				"avatar_url": "https://yyy.png",
				"profile_bio": "ccc ddd"
			}
		]
	}
}
```

* 失败(404)

```javascript
{
	"code": 4002,
	"msg": {
		"en": "Unauthorized",
		"zh": "未授权"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 获取粉丝列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-08 10:15:51

> 更新时间: 2025-08-19 21:30:58

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/users/followers

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{author_access_token}} | string | 是 | access token |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2001,
	"msg": {
		"en": "User details retrieved successfully",
		"zh": "获取用户详情成功"
	},
	"data": {
		"followers": [
			{
				"id": "5",
				"nick": "dannyburger",
				"avatar_url": "https://xxx.png",
				"profile_bio": "xxx yyy"
			}
		]
	}
}
```

* 失败(404)

```javascript
{
	"code": 6001,
	"msg": {
		"en": "Invalid verify token",
		"zh": "无效的验证令牌"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{author_access_token}} | string | 是 | access token |

**Query**

## 游客登录接口

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-09-04 12:36:48

> 更新时间: 2025-09-04 12:37:32

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/auth/guest

**请求方式**

> POST

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "User login successfully",
		"zh": "用户登录成功"
	},
	"data": {
		"type": "guest_login",
		"user_id": "74",
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NCIsInJhbmRvbSI6IjViMTJmZWMzODIwMjIxNTRkYzEzNmIwYmRkMWM4NWVhNDZmNTAxMDZkMzlhNzAyZDNmMjdiMzJmZjQzZjRlMWMiLCJpYXQiOjE3NTY5NjA2MDN9.ruksxGefpc3cRp5z972QwtOJgkzKF8Cp5_UtTqqwMfU"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 登录 twitter

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-04 11:16:15

> 更新时间: 2026-03-04 15:29:13

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/auth/twitter/info

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
    "code": "SGdMU3lqb1hScUxaVDYzN3NFVEs5dEdyTXZvRkZoUXhUYUdROGx1Q1lKYUZnOjE3NzI1OTQwMTMyOTM6MToxOmFjOjE",
    "code_verifier": "F0BVLHljx34dMGxtGXQ5eYTD7C6QDwTpGwoHO9C8utA",
    "redirect_uri": "https://detake-admin.vercel.app/us/settings"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**Query**

# 内容管理

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2025-07-22 18:24:06

**内容相关接口**

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 创建(保存)内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-02-09 15:58:34

**创建新的内容**

**接口状态**

> 开发中

**接口URL**

> /api/v1/contents/save

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
	"country": "United States",
	"city": "Indiana",
	"title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
	"sub_title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
	"body": "An Afghan family has been split by U.S. and Canadian immigration policies. After fleeing Afghanistan, some relatives reached Canada as legal refugees, while others are detained by ICE in the United States, stalled by Trump-era asylum policy changes. The detained members are eligible for asylum in Canada but cannot fly there without a visa, currently under review. Their U.S. attorney fears they could be deported to Afghanistan. Their Canadian lawyer is pressing to fast-track their entry, a case that raises whether Canada must assist people with established ties.",
	"content_type": "article",
	"business_type": "News",
	"categories": [
		"Policy"
	],
	"subcategories": [
		"Regulation",
		"Geopolitics"
	],
	"tags": [
		"Agents"
	],
	"language": "en",
	"img_url": "https://ichef.bbci.co.uk/ace/standard/3840/cpsprodpb/6652/live/5a034df0-88cb-11f0-85f1-5f1042c3058b.jpg",
	"status": "published"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| url_code | - | string | 否 | 唯一标识码 |
| user_id | - | integer | 是 | 作者ID |
| title | - | string | 是 | 内容标题 |
| summary | - | string | 否 | 内容摘要 |
| content | - | string | 是 | 内容正文 |
| type | - | string | 是 | 内容类型 |
| category_id | - | integer | 否 | 分类ID |
| tag_id | - | integer | 否 | 标签ID |
| language | - | string | 否 | 语言：英文、中文等 |
| img_url | - | string | 否 | 封面图片URL |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2003,
	"msg": {
		"en": "Content updated successfully",
		"zh": "内容更新成功"
	}
}
```

* 失败(500)

```javascript
{
	"code": 6025,
	"msg": {
		"en": "No permission",
		"zh": "无权限"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 获取用户创建的内容列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-02-27 19:25:40

**获取内容列表，支持分页和筛选**

**接口状态**

> 开发中

**接口URL**

> /api/v1/contents/?page=1&limit=10&type=article&show_all=true&author_role=Authors

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| page | 1 | integer | 否 | 页码 |
| limit | 10 | integer | 否 | 每页数量 |
| status | reviewing | string | 否 | 内容状态 |
| type | article | string | 是 | - |
| show_all | true | string | 是 | - |
| author_role | Authors | string | 否 | Root/Authors |

**认证方式**

> 继承父级

**响应示例**

* 获取成功(200)

```javascript
{
	"code": 2000,
	"msg": "success",
	"data": {
		"list": [
			{
				"entry_id": "dtc-gk6vgC1X",
				"user_id": "7",
				"slug": "test-pyf9",
				"title": "test",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
				"ai_img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
				"image_urls": null,
				"status": "draft",
				"sub_title": "sub title",
				"created_at": "2026-02-11T00:56:48.179Z",
				"author": {
					"id": "7",
					"name": "",
					"avatar_url": "",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-Ht8nDOPZ",
				"user_id": "7",
				"slug": "test-03rf",
				"title": "test",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
				"ai_img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
				"image_urls": null,
				"status": "published",
				"sub_title": "sub title",
				"created_at": "2026-02-10T19:21:49.623Z",
				"author": {
					"id": "7",
					"name": "",
					"avatar_url": "",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-BfAwtQ5a",
				"user_id": "6",
				"slug": "how-an-afghan-family-ende-7pt8",
				"title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://ichef.bbci.co.uk/ace/standard/3840/cpsprodpb/6652/live/5a034df0-88cb-11f0-85f1-5f1042c3058b.jpg",
				"ai_img_url": null,
				"image_urls": null,
				"status": "published",
				"sub_title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
				"created_at": "2026-02-08T23:54:12.642Z",
				"author": {
					"id": "6",
					"name": "dannyburger",
					"avatar_url": "https://xxx.png",
					"profile_bio": "xxx yyy",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-o0BNIyff",
				"user_id": "43",
				"slug": "women-leading-efforts-to--p0p5",
				"title": "Women leading efforts to protect India's snow leopards",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png",
				"ai_img_url": null,
				"image_urls": [
					"https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png"
				],
				"status": "published",
				"sub_title": "Women leading efforts to protect India's snow leopards",
				"created_at": "2026-02-06T01:22:46.229Z",
				"author": {
					"id": "43",
					"name": "Hannah Clark",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-Q3k6gqmZ",
				"user_id": "65",
				"slug": "at-least-18-killed-in-dea-o8a9",
				"title": "At least 18 killed in deadly 'rat-hole' mining explosion in India",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://fast.image.delivery/dcyefzf.png",
				"ai_img_url": null,
				"image_urls": null,
				"status": "reviewing",
				"sub_title": "At least 18 killed in deadly 'rat-hole' mining explosion in India",
				"created_at": "2026-02-06T01:19:38.225Z",
				"author": {
					"id": "65",
					"name": "Morgan Phillips",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=morganphillips",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-2c8sj85x",
				"user_id": "46",
				"slug": "canada-sends-senior-offic-y7oq",
				"title": "Canada sends senior officials to open Greenland consulate",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://fast.image.delivery/ybvbhav.png",
				"ai_img_url": null,
				"image_urls": null,
				"status": "reviewing",
				"sub_title": "Canada sends senior officials to open Greenland consulate",
				"created_at": "2026-02-06T01:17:15.205Z",
				"author": {
					"id": "46",
					"name": "Nicholas Lee",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=nicholaslee",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-Ac9BdVSc",
				"user_id": "46",
				"slug": "russian-general-shot-mult-m9lg",
				"title": "Russian general shot multiple times in Moscow",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://fast.image.delivery/mbrlpzq.png",
				"ai_img_url": null,
				"image_urls": null,
				"status": "reviewing",
				"sub_title": "Russian general shot multiple times in Moscow",
				"created_at": "2026-02-06T01:14:46.236Z",
				"author": {
					"id": "46",
					"name": "Nicholas Lee",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=nicholaslee",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-92fXzaeP",
				"user_id": "59",
				"slug": "patrol-boats-out-of-servi-3o5u",
				"title": "Patrol boats out of service at Cairns shipyards as foreign fishers reach Australian shores",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://fast.image.delivery/joupbta.png",
				"ai_img_url": null,
				"image_urls": null,
				"status": "reviewing",
				"sub_title": "Patrol boats out of service at Cairns shipyards as foreign fishers reach Australian shores",
				"created_at": "2026-02-06T01:12:21.705Z",
				"author": {
					"id": "59",
					"name": "Alexis Baker",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=alexisbaker",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-svdty21t",
				"user_id": "56",
				"slug": "light-aircraft-crashes-in-xjv0",
				"title": "Light aircraft crashes into the ocean at Goolwa South on South Australia's south coast",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://fast.image.delivery/nikcoho.png",
				"ai_img_url": null,
				"image_urls": null,
				"status": "reviewing",
				"sub_title": "Light aircraft crashes into the ocean at Goolwa South on South Australia's south coast",
				"created_at": "2026-02-06T01:09:21.733Z",
				"author": {
					"id": "56",
					"name": "Austin Scott",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=austinscott",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-xof7CfeE",
				"user_id": "35",
				"slug": "why-police-waited-nine-da-5agf",
				"title": "Why police waited nine days to label the Invasion Day attempted bomb attack in Perth as terrorism",
				"unique_vistor": "0",
				"page_view": "0",
				"img_url": "https://fast.image.delivery/ttvrbqi.png",
				"ai_img_url": null,
				"image_urls": null,
				"status": "reviewing",
				"sub_title": "Why police waited nine days to label the Invasion Day attempted bomb attack in Perth as terrorism",
				"created_at": "2026-02-06T01:07:10.592Z",
				"author": {
					"id": "35",
					"name": "Samantha Jackson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=samanthajackson",
					"profile_bio": "Author",
					"role": "Authors"
				}
			}
		],
		"next": true
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| total | - | integer | 总数量 |
| page | - | integer | 当前页码 |
| limit | - | integer | 每页数量 |
| data.id | - | integer | 内容ID |
| data.url_code | - | string | 唯一标识码 |
| data.user_id | - | integer | 作者ID |
| data.title | - | string | 内容标题 |
| data.summary | - | string | 内容摘要 |
| data.content | - | string | 内容正文 |
| data.type | - | string | 内容类型 |
| data.category_id | - | integer | 分类ID |
| data.tag_id | - | integer | 标签ID |
| data.language | - | string | 语言：英文、中文等 |
| data.img_url | - | string | 封面图片URL |
| data.status | - | string | 内容状态 |
| data.created_at | - | string | 创建时间 |
| data.updated_at | - | string | 更新时间 |

* 失败(404)

```javascript
{
	"code": 7001,
	"msg": {
		"en": "Other error",
		"zh": "其他错误"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |

**Query**

## 获取内容详情

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-02-26 16:57:01

**根据ID获取内容详情**

**接口状态**

> 开发中

**接口URL**

> /api/v1/contents/detail?entry_id=dtc-xof7CfeE

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |
| User-Agent | node | string | 是 | - |

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| entry_id | dtc-xof7CfeE | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"id": "808",
		"entry_id": "dtc-xof7CfeE",
		"slug": "why-police-waited-nine-da-5agf",
		"title": "Why police waited nine days to label the Invasion Day attempted bomb attack in Perth as terrorism",
		"type": "article",
		"language": "en",
		"img_url": "https://fast.image.delivery/ttvrbqi.png",
		"user_id": "35",
		"status": "reviewing",
		"body": "It took nine days from January 26 — when a 31-year-old man allegedly hurled a homemade fragment bomb into a crowd — for police to charge him with engaging in a terrorist act.\n\nBy contrast, when two gunmen opened fire at a Hanukkah celebration at Sydney’s Bondi Beach in December, killing 15 people, authorities declared it a terrorist attack within three hours.\n\nThat timing has prompted persistent questions about why police were slower to label the attempted bombing at an Invasion Day rally in Perth’s CBD a terrorist act.\n\nWA Police Commissioner Col Blanch said key differences between the two incidents meant confirming the Perth case as terrorism required more time.\n\nWhat the investigation involved\n\nCommissioner Blanch said the Joint Counter Terrorism Team began an investigation roughly 36 minutes after the Perth attack.\n\nHowever, he said police first needed to interview the suspect, forensically examine his electronic devices and speak to his family and friends before they were confident the incident met the threshold for terrorism.\n\nBlanch said the combination of those three steps revealed an ideology that advanced the cause of a racist nationalist, allowing police to lay the charge of engaging in a terrorist act.\n\nHe noted those three tasks took nine days.\n\nHe added that the Australian Federal Police commissioner had made it clear that, in the broader context, when ideology is not immediately evident at a terrorist attack, a nine-day turnaround is considered relatively quick.\n\nA ‘deadly silence’ felt by community\n\nAboriginal elder Jim Morrison has taken part in several meetings with WA Police and the state government since the alleged attack.\n\nMr Morrison, who chairs the WA Stolen Generations Aboriginal Corporation, said the political response fell short when compared with the reaction to the Bondi terror attack.\n\nComparing the response to that tragedy and what might have unfolded in Perth, he said there was, in his view, a deadly silence and that more should have been said.\n\nHe called the process of formally declaring it an act of terrorism “lengthy” and “frustrating,” while expressing hope that lessons would be learned.\n\nHe said he does not want his grandchildren to feel unsafe at the playground or when travelling into the city for a nightclub.\n\nHe added there are genuine worries about security, safety and violence.\n\nAn old problem, not a new one\n\nUniversity of Western Australia Indigenous Studies researcher Pat Dudgeon described the attempted attack as “very frightening” but said she understood why formal confirmation as a terrorist event took nine days.\n\nShe said that to secure a charge that has merit and will stand in court, authorities must have appropriate evidence, although for many watching from the outside the process felt slow.\n\nProfessor Dudgeon said she is concerned about the psychological toll the attack may have on Aboriginal and Torres Strait Islander people.\n\nShe said people are horrified and experiencing a strong emotional response, but given the everyday racism many face, the issue is not new — it has simply fallen to a different low point.\n\nShe added that it is, ultimately, a threat to all Australians.\n\nRace and religion in focus\n\nCommissioner Blanch was asked whether the incident would have been declared a terrorist attack sooner if the crowd had been a religious group rather than First Nations people.\n\nHe replied that the identity of those involved is irrelevant under the law.\n\nHe said the motivation, ideology and intent must be demonstrated by the person who carried out the attack.\n\nBlanch said the Bondi attack was far more clear cut.\n\nHe explained that when the ideology or motivation is visible at the time of the attack — for example, an ISIS flag or something similarly obvious with a religious element — authorities can attribute a religious motivation.\n\nHe added that if the scale of the attack were such that he needed to enact special powers under the terrorism act, he would declare it a terrorist act.",
		"sub_title": "Why police waited nine days to label the Invasion Day attempted bomb attack in Perth as terrorism",
		"contact": null,
		"created_at": "2026-02-06T01:07:10.592Z",
		"updated_at": "2026-02-06T01:07:10.592Z",
		"country": "United States",
		"city": "New Jersey",
		"unique_vistor": "0",
		"page_view": "0",
		"is_translated": false,
		"ai_img_url": null,
		"image_urls": null,
		"category_id": "19",
		"tags": [
			{
				"id": "38",
				"name": "Robotics"
			},
			{
				"id": "39",
				"name": "Drone"
			},
			{
				"id": "40",
				"name": "Energy (Nuclear, Grid, Sustainability)"
			}
		],
		"categories": [
			{
				"id": "19",
				"name": "Policy"
			},
			{
				"id": "23",
				"name": "Technology"
			}
		],
		"subcategories": [
			{
				"id": "17",
				"name": "Safety & Ethics",
				"parent_category_id": "19",
				"parent_category_name": "Policy"
			},
			{
				"id": "16",
				"name": "Regulation",
				"parent_category_id": "19",
				"parent_category_name": "Policy"
			},
			{
				"id": "6",
				"name": "Skills",
				"parent_category_id": "23",
				"parent_category_name": "Technology"
			},
			{
				"id": "4",
				"name": "Agents",
				"parent_category_id": "23",
				"parent_category_name": "Technology"
			},
			{
				"id": "1",
				"name": "New Releases",
				"parent_category_id": "23",
				"parent_category_name": "Technology"
			}
		],
		"business_type_info": {
			"id": "4",
			"name": "News"
		},
		"author": {
			"id": "35",
			"name": "Samantha Jackson",
			"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=samanthajackson",
			"bio": "Author",
			"role": "Root"
		}
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| id | - | integer | - |
| url_code | - | string | 唯一标识码 |
| user_id | - | integer | - |
| title | - | string | - |
| summary | - | string | - |
| content | - | string | 内容正文 |
| type | - | string | 内容类型 |
| category_id | - | integer | 分类ID |
| tag_id | - | integer | 标签ID |
| language | - | string | 语言：英文、中文等 |
| img_url | - | string | 封面图片URL |
| status | - | string | - |
| business_category_id | - | integer | - |
| content_category_id | - | integer | - |
| cover_image_url | - | string | - |
| created_at | - | string | - |
| updated_at | - | string | - |

* 失败(500)

```javascript
{
	"code": 4007,
	"msg": {
		"en": "Invalid token format",
		"zh": "无效的令牌格式"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | - |
| message | - | string | - |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |
| User-Agent | node | string | 是 | - |

**Query**

## 删除内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-02-09 16:02:01

**标记内容为已删除状态**

**接口状态**

> 开发中

**接口URL**

> /api/v1/contents/delete

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |

**请求Body参数**

```javascript
{
    "entry_id": "dtc-S5EplGMw"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2004,
	"msg": {
		"en": "Content has been deleted",
		"zh": "内容已删除"
	}
}
```

* 失败(500)

```javascript
{
	"code": 4007,
	"msg": {
		"en": "Invalid token format",
		"zh": "无效的令牌格式"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | - |
| message | - | string | - |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |

**Query**

## 发布内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-06-25 19:31:35

> 更新时间: 2026-02-09 16:01:50

**将草稿内容发布**

**接口状态**

> 开发中

**接口URL**

> /api/v1/contents/publish

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |

**请求Body参数**

```javascript
{
    "entry_id": "dtc-rTFIUcak"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Content published successfully",
		"zh": "内容发布成功"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| id | - | integer | - |
| url_code | - | string | 唯一标识码 |
| user_id | - | integer | - |
| title | - | string | - |
| summary | - | string | - |
| content | - | string | 内容正文 |
| type | - | string | 内容类型 |
| category_id | - | integer | 分类ID |
| tag_id | - | integer | 标签ID |
| language | - | string | 语言：英文、中文等 |
| img_url | - | string | 封面图片URL |
| status | - | string | - |
| created_at | - | string | - |
| updated_at | - | string | - |

* 失败(500)

```javascript
{
	"code": 4007,
	"msg": {
		"en": "Invalid token format",
		"zh": "无效的令牌格式"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | - | string | - |
| message | - | string | - |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | - |

**Query**

## 上传图片

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-09-04 17:17:22

> 更新时间: 2026-03-12 23:00:10

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/upload/image

**请求方式**

> POST

**Content-Type**

> form-data

**请求Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| image | /Users/yangfubo/Downloads/icon1.png | file | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"status": 200,
	"message": "Image uploaded successfully",
	"data": {
		"url": "https://static-files.detake.com/d_c_3-1772081460797-143418597.png",
		"filename": "d_c_3-1772081460797-143418597.png"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

# 页面数据获取

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-02 11:16:48

> 更新时间: 2025-07-02 11:16:48

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 获取所有分类

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-08 16:08:21

> 更新时间: 2026-02-06 18:13:15

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/categories

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": [
		{
			"id": "30",
			"name": "Adoption",
			"description": "Stories, case studies, and data on how AI is being practically adopted across industries, teams, and workflows, including challenges, ROI, and best practices",
			"business_type_name": "Insights"
		},
		{
			"id": "24",
			"name": "Benchmarks",
			"description": "Standardized measurements and comparative evaluations of Web3 protocols, networks, and infrastructure, focusing on performance, scalability, security, and cost-efficiency to provide objective data for technology selection and optimization",
			"business_type_name": "Research"
		},
		{
			"id": "34",
			"name": "Blogs",
			"description": "Opinion pieces, narrative posts, and reflective writing on AI from individuals and organizations, capturing evolving thinking, debates, and personal perspectives",
			"business_type_name": "Voices"
		},
		{
			"id": "25",
			"name": "Breakthroughs",
			"description": "Major advances, novel techniques, and frontier capabilities in AI that significantly push the boundaries of what models can do, with clear implications for products and research",
			"business_type_name": "Research"
		},
		{
			"id": "20",
			"name": "Business",
			"description": "Analyses and coverage of business models, monetization strategies, organizational structures, and commercial applications in the Web3 ecosystem, including token economies, fundraising, partnerships, and market expansion",
			"business_type_name": "News"
		},
		{
			"id": "29",
			"name": "Competition",
			"description": "Coverage of competitive dynamics in the AI landscape, including model races, product battles, benchmarks, market positioning, and strategic responses among key players",
			"business_type_name": "Insights"
		},
		{
			"id": "26",
			"name": "Context",
			"description": "Background, history, and framing that explain why specific AI developments, debates, or technologies matter, connecting them to broader technical and societal trends",
			"business_type_name": "Research"
		},
		{
			"id": "35",
			"name": "Glossary",
			"description": "Concise definitions and explanations of AI terms, concepts, techniques, and acronyms to help readers quickly build and refresh foundational understanding",
			"business_type_name": "Tutorials"
		},
		{
			"id": "21",
			"name": "Hardware",
			"description": "Content focused on physical infrastructure and devices that support Web3, such as mining rigs, validators, nodes, wallets, and specialized chips, including performance insights, architecture, deployment, and optimization",
			"business_type_name": "News"
		},
		{
			"id": "28",
			"name": "Labs (DeepMind, OpenAI, FAIR news)",
			"description": "Updates, analyses, and inside looks at major AI research labs such as OpenAI, Google DeepMind, and FAIR, covering papers, policies, product launches, and strategic moves",
			"business_type_name": "Research"
		},
		{
			"id": "31",
			"name": "New Players",
			"description": "Profiles and analyses of emerging AI companies, open-source communities, and research groups entering the ecosystem and reshaping the competitive and innovation landscape",
			"business_type_name": "Insights"
		},
		{
			"id": "37",
			"name": "Playbooks",
			"description": "Structured, reusable strategies and best-practice guides for applying AI to specific domains or problems, from evaluation and safety to product integration",
			"business_type_name": "Tutorials"
		},
		{
			"id": "19",
			"name": "Policy",
			"description": "News and analysis on governments, policies and political events",
			"business_type_name": "News"
		},
		{
			"id": "36",
			"name": "Prompting",
			"description": "Practical techniques, patterns, and examples for designing prompts, system messages, and interaction strategies to reliably steer and control AI models",
			"business_type_name": "Tutorials"
		},
		{
			"id": "27",
			"name": "RAG",
			"description": "Content focused on Retrieval-Augmented Generation methods, including architectures, vector databases, evaluation, optimization techniques, and real-world implementation patterns",
			"business_type_name": "Research"
		},
		{
			"id": "33",
			"name": "Talks",
			"description": "Summaries, highlights, and commentary on keynotes, lectures, panels, and interviews from AI conferences, meetups, and online events",
			"business_type_name": "Voices"
		},
		{
			"id": "23",
			"name": "Technology",
			"description": "News on innovation, digital trends and emerging technologies",
			"business_type_name": "News"
		},
		{
			"id": "32",
			"name": "Trend Watch",
			"description": "Ongoing monitoring and interpretation of emerging AI trends, patterns, and inflection points, highlighting where the field and market may be heading next",
			"business_type_name": "Insights"
		},
		{
			"id": "39",
			"name": "Vibe Coding",
			"description": "Exploratory, creative, and informal coding sessions with AI, emphasizing experimentation, rapid iteration, and discovery over strict structure or production readiness",
			"business_type_name": "Tutorials"
		},
		{
			"id": "38",
			"name": "Workflows",
			"description": "End-to-end process designs that integrate AI tools into real tasks and teams, detailing steps, tools, handoffs, and automation opportunities",
			"business_type_name": "Tutorials"
		}
	]
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取所有标签

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-08 16:09:35

> 更新时间: 2025-08-19 20:39:34

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/tags

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": [
		{
			"id": "13",
			"name": "AIWeb3",
			"description": "Integration of artificial intelligence with blockchain for enhanced decentralized systems"
		},
		{
			"id": "1",
			"name": "Blockchain",
			"description": "The foundational technology of Web3 enabling decentralized and immutable record-keeping"
		},
		{
			"id": "8",
			"name": "Cryptocurrency",
			"description": "Digital currencies using cryptography for security and operating on blockchain networks"
		},
		{
			"id": "4",
			"name": "DAO",
			"description": "Decentralized autonomous organizations governed by smart contracts and community voting"
		},
		{
			"id": "11",
			"name": "DApps",
			"description": "Decentralized applications running on peer-to-peer networks instead of centralized servers"
		},
		{
			"id": "14",
			"name": "DataMarkets",
			"description": "Platforms for secure data sharing and monetization with privacy preservation"
		},
		{
			"id": "2",
			"name": "DeFi",
			"description": "Decentralized finance applications and protocols that operate without traditional intermediaries"
		},
		{
			"id": "19",
			"name": "DEX",
			"description": "Decentralized exchanges allowing peer-to-peer trading of cryptocurrencies without intermediaries"
		},
		{
			"id": "16",
			"name": "DID",
			"description": "Decentralized identifiers enabling self-sovereign identity management without central authorities"
		},
		{
			"id": "5",
			"name": "GameFi",
			"description": "The intersection of gaming and finance allowing players to earn crypto through gameplay"
		},
		{
			"id": "20",
			"name": "Governance",
			"description": "Community-based decision making processes for protocol changes and treasury management"
		},
		{
			"id": "21",
			"name": "Interoperability",
			"description": "Technologies enabling different blockchains to communicate and share information"
		},
		{
			"id": "15",
			"name": "Layer2",
			"description": "Scaling solutions built on top of blockchains to improve transaction speed and reduce fees"
		},
		{
			"id": "6",
			"name": "Metaverse",
			"description": "Virtual worlds built on blockchain technology with digital ownership and economies"
		},
		{
			"id": "22",
			"name": "Mining",
			"description": "Process of validating transactions and securing proof-of-work blockchain networks"
		},
		{
			"id": "3",
			"name": "NFT",
			"description": "Non-fungible tokens representing unique digital assets and ownership rights"
		},
		{
			"id": "23",
			"name": "Oracles",
			"description": "Services connecting blockchains with real-world data for smart contract execution"
		},
		{
			"id": "24",
			"name": "Privacy",
			"description": "Technologies protecting user identity and transaction details in blockchain systems"
		},
		{
			"id": "7",
			"name": "SmartContracts",
			"description": "Self-executing code that automatically enforces agreements when conditions are met"
		},
		{
			"id": "17",
			"name": "Staking",
			"description": "Locking up cryptocurrency to support network operations and earn rewards"
		},
		{
			"id": "25",
			"name": "Tokenization",
			"description": "Converting real-world assets into digital tokens on blockchain networks"
		},
		{
			"id": "10",
			"name": "Tokenomics",
			"description": "Economic systems designed into crypto projects governing token creation and distribution"
		},
		{
			"id": "9",
			"name": "Web3Wallets",
			"description": "Digital tools for storing and managing crypto assets and interacting with dApps"
		},
		{
			"id": "18",
			"name": "Yield",
			"description": "Returns generated from crypto assets through lending, staking, or liquidity provision"
		},
		{
			"id": "12",
			"name": "ZKML",
			"description": "Zero-knowledge machine learning combining privacy-preserving proofs with AI applications"
		}
	]
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取所有二级子标签【新增】

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-02-06 18:19:35

> 更新时间: 2026-02-06 18:19:49

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/subcategories

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": [
		{
			"id": "10",
			"name": "Enterprise Adoption",
			"description": "How large organizations are implementing AI, including deployment strategies, case studies, and organizational impact",
			"parent_category_id": "20",
			"parent_category_name": "Business"
		},
		{
			"id": "8",
			"name": "Funding",
			"description": "Coverage of venture capital, grants, and other funding events involving AI companies and projects",
			"parent_category_id": "20",
			"parent_category_name": "Business"
		},
		{
			"id": "7",
			"name": "Press Release",
			"description": "Official company announcements related to AI, including launches, partnerships, and strategic initiatives",
			"parent_category_id": "20",
			"parent_category_name": "Business"
		},
		{
			"id": "9",
			"name": "Reports",
			"description": "Industry reports, market research, whitepapers, and in‑depth analyses on the AI landscape and its economics",
			"parent_category_id": "20",
			"parent_category_name": "Business"
		},
		{
			"id": "11",
			"name": "Chips",
			"description": "AI hardware and accelerators such as GPUs, TPUs, NPUs, and custom silicon, focusing on performance and ecosystem impact",
			"parent_category_id": "21",
			"parent_category_name": "Hardware"
		},
		{
			"id": "14",
			"name": "Drone",
			"description": "Autonomous and semi‑autonomous drones powered by AI, including sensing, navigation, and surveillance applications",
			"parent_category_id": "21",
			"parent_category_name": "Hardware"
		},
		{
			"id": "15",
			"name": "Energy (Nuclear, Grid, Sustainability)",
			"description": "AI applications in energy production and management, from nuclear and grid optimization to sustainability and decarbonization",
			"parent_category_id": "21",
			"parent_category_name": "Hardware"
		},
		{
			"id": "12",
			"name": "Military",
			"description": "Use of AI in defense and military contexts, including autonomy, decision support, and related policy concerns",
			"parent_category_id": "21",
			"parent_category_name": "Hardware"
		},
		{
			"id": "13",
			"name": "Robotics",
			"description": "AI‑enabled robots for industry, service, and research, covering hardware, control systems, and embodied intelligence",
			"parent_category_id": "21",
			"parent_category_name": "Hardware"
		},
		{
			"id": "18",
			"name": "Geopolitics",
			"description": "How AI influences and is shaped by international relations, national strategies, and global power dynamics",
			"parent_category_id": "19",
			"parent_category_name": "Policy"
		},
		{
			"id": "16",
			"name": "Regulation",
			"description": "Laws, standards, and policy frameworks governing AI development, deployment, and compliance requirements",
			"parent_category_id": "19",
			"parent_category_name": "Policy"
		},
		{
			"id": "17",
			"name": "Safety & Ethics",
			"description": "Discussions and research on AI safety, alignment, responsible use, and ethical implications for society",
			"parent_category_id": "19",
			"parent_category_name": "Policy"
		},
		{
			"id": "4",
			"name": "Agents",
			"description": "Content on autonomous and semi‑autonomous AI agents, their frameworks, behaviors, and real‑world applications",
			"parent_category_id": "23",
			"parent_category_name": "Technology"
		},
		{
			"id": "2",
			"name": "Feature Updates",
			"description": "Incremental improvements and new capabilities added to existing AI products, APIs, and platforms",
			"parent_category_id": "23",
			"parent_category_name": "Technology"
		},
		{
			"id": "3",
			"name": "Models",
			"description": "Information and analysis on specific AI models, including capabilities, limitations, architectures, and usage patterns",
			"parent_category_id": "23",
			"parent_category_name": "Technology"
		},
		{
			"id": "1",
			"name": "New Releases",
			"description": "Announcements and overviews of brand‑new AI products, models, and platforms entering the market",
			"parent_category_id": "23",
			"parent_category_name": "Technology"
		},
		{
			"id": "6",
			"name": "Skills",
			"description": "Specific capabilities, plugins, and domain skills that extend AI systems to perform specialized tasks or integrations",
			"parent_category_id": "23",
			"parent_category_name": "Technology"
		},
		{
			"id": "5",
			"name": "Tools (Image, Video, Audio gen)",
			"description": "AI tools for generating and editing images, video, and audio, including capabilities, workflows, and creative use cases",
			"parent_category_id": "23",
			"parent_category_name": "Technology"
		}
	]
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取文章列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-10 14:06:57

> 更新时间: 2026-04-10 16:01:51

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles?locale=en&limit=12&page=1&order_by=Latest

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| business_type_name | News | string | 是 | - |
| category_name | Markets | string | 是 | - |
| tag | DeFi | string | 是 | - |
| order_by | Latest | string | 是 | 支持 None、Latest、MostRead |
| limit | 20 | string | 是 | - |
| page | 6 | string | 是 | - |
| locale | en | string | 是 | - |
| limit | 12 | string | 是 | - |
| page | 1 | string | 是 | - |
| business_type_name | News | string | 是 | - |
| category_name | Hardware,Policy | string | 是 | - |
| order_by | Latest | string | 是 | - |
| subcategory_name | Drone | string | 是 | - |
| author_role | Root | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": "success",
	"data": {
		"list": [
			{
				"entry_id": "dtc-o0BNIyff",
				"slug": "women-leading-efforts-to--p0p5",
				"title": "Women leading efforts to protect India's snow leopards",
				"sub_title": "Women leading efforts to protect India's snow leopards",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png",
				"created_at": "2026-02-06T09:22:46.229Z",
				"updated_at": "2026-02-24T04:07:36.090Z",
				"tags": [
					"Environment",
					"Regulation"
				],
				"category_names": [
					"Business",
					"Hardware"
				],
				"subcategory_names": [
					"Reports",
					"Funding",
					"Chips",
					"Military",
					"Drone"
				],
				"business_type_name": "News",
				"author": {
					"id": "43",
					"name": "Hannah Clark",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-hT6ryo1k",
				"slug": "trump-says-it-would-be-gr-erxf",
				"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
				"sub_title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
				"img_url": "https://fast.image.delivery/venszwy.png",
				"created_at": "2026-01-30T08:05:13.600Z",
				"updated_at": "2026-01-30T08:26:38.182Z",
				"tags": [
					"Models",
					"Agents",
					"Feature Updates"
				],
				"category_names": [
					"Hardware",
					"Technology"
				],
				"subcategory_names": [
					"Energy (Nuclear, Grid, Sustainability)",
					"Drone",
					"New Releases",
					"Feature Updates"
				],
				"business_type_name": "News",
				"author": {
					"id": "69",
					"name": "Jasmine Edwards",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-WmgEq7Ar",
				"slug": "government-secures-last-m-k8l3",
				"title": "Government secures last-minute hospital funding agreement with the states",
				"sub_title": "Government secures last-minute hospital funding agreement with the states",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ba3130f6dc637f098433b2a76c5efa07?impolicy=wcms_crop_resize&cropH=2436&cropW=4330&xPos=0&yPos=100&width=862&height=485",
				"created_at": "2026-01-30T04:20:23.282Z",
				"updated_at": "2026-01-30T04:20:23.282Z",
				"tags": [
					"Feature Updates",
					"Tools (Image, Video, Audio gen)",
					"New Releases"
				],
				"category_names": [
					"Policy",
					"Hardware"
				],
				"subcategory_names": [
					"Geopolitics",
					"Safety & Ethics",
					"Regulation",
					"Robotics",
					"Drone"
				],
				"business_type_name": "News",
				"author": {
					"id": "58",
					"name": "Kevin Adams",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-tbwoTD1g",
				"slug": "agents-could-be-pulled-ba-sgj8",
				"title": "Agents could be pulled back in Minneapolis if local officials cooperate, border tsar says",
				"sub_title": "Agents could be pulled back in Minneapolis if local officials cooperate, border tsar says",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/36e9/live/b45d5c70-fd4a-11f0-b028-cf183ca533c1.jpg",
				"created_at": "2026-01-30T01:59:24.925Z",
				"updated_at": "2026-01-30T01:59:24.925Z",
				"tags": [
					"Feature Updates",
					"Tools (Image, Video, Audio gen)"
				],
				"category_names": [
					"Hardware",
					"Technology"
				],
				"subcategory_names": [
					"Drone",
					"Robotics",
					"Feature Updates",
					"New Releases",
					"Models"
				],
				"business_type_name": "News",
				"author": {
					"id": "63",
					"name": "Sierra Roberts",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=sierraroberts",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-xLiSuiQk",
				"slug": "france-plans-to-scrap-con-sjeu",
				"title": "France plans to scrap concept of marital duty to have sex",
				"sub_title": "France plans to scrap concept of marital duty to have sex",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/7701/live/9317e120-fd1d-11f0-8de9-b9e0f3a8919a.jpg",
				"created_at": "2026-01-29T21:48:57.947Z",
				"updated_at": "2026-01-29T21:48:57.947Z",
				"tags": [
					"Tools (Image, Video, Audio gen)",
					"Feature Updates"
				],
				"category_names": [
					"Business",
					"Hardware"
				],
				"subcategory_names": [
					"Press Release",
					"Enterprise Adoption",
					"Reports",
					"Drone",
					"Robotics"
				],
				"business_type_name": "News",
				"author": {
					"id": "25",
					"name": "Emily Johnson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=emilyjohnson",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-cyC4bg73",
				"slug": "essendon-north-beauty-sal-4yde",
				"title": "Essendon North beauty salon firebombed a second time in two days",
				"sub_title": "Essendon North beauty salon firebombed a second time in two days",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/2696250af2552ebd5d172919a701aa47?impolicy=wcms_crop_resize&cropH=1080&cropW=1920&xPos=0&yPos=0&width=862&height=485",
				"created_at": "2026-01-29T21:41:28.264Z",
				"updated_at": "2026-01-29T21:41:28.264Z",
				"tags": [
					"Robotics",
					"Drone"
				],
				"category_names": [
					"Technology",
					"Hardware"
				],
				"subcategory_names": [
					"Agents",
					"Skills",
					"Drone",
					"Robotics"
				],
				"business_type_name": "News",
				"author": {
					"id": "73",
					"name": "Paula Morris",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=paulamorris",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-9NJqUg6N",
				"slug": "talks-intensify-to-preven-bg9g",
				"title": "Talks intensify to prevent a US government shutdown after Minneapolis shooting",
				"sub_title": "Talks intensify to prevent a US government shutdown after Minneapolis shooting",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/c3b8/live/3bbd2080-fc7c-11f0-b9c1-0d3cbd49d190.jpg",
				"created_at": "2026-01-29T17:28:21.321Z",
				"updated_at": "2026-01-29T17:28:21.321Z",
				"tags": [
					"Tools (Image, Video, Audio gen)",
					"Feature Updates"
				],
				"category_names": [
					"Business",
					"Hardware"
				],
				"subcategory_names": [
					"Enterprise Adoption",
					"Press Release",
					"Funding",
					"Robotics",
					"Drone"
				],
				"business_type_name": "News",
				"author": {
					"id": "45",
					"name": "Nicole Lewis",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=nicolelewis",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-0V7UuDtr",
				"slug": "uk-says-china-will-ease-t-ch6c",
				"title": "UK says China will ease travel rules for British visitors",
				"sub_title": "UK says China will ease travel rules for British visitors",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/5666/live/1a709de0-fcdf-11f0-853a-2b6f40b40d41.jpg",
				"created_at": "2026-01-29T17:23:07.243Z",
				"updated_at": "2026-01-29T17:23:07.243Z",
				"tags": [
					"Agents",
					"Feature Updates",
					"Models"
				],
				"category_names": [
					"Hardware",
					"Policy"
				],
				"subcategory_names": [
					"Energy (Nuclear, Grid, Sustainability)",
					"Drone",
					"Chips",
					"Geopolitics",
					"Safety & Ethics"
				],
				"business_type_name": "News",
				"author": {
					"id": "69",
					"name": "Jasmine Edwards",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-gVhM7N3Q",
				"slug": "unprecedented-scale-of-fo-wcok",
				"title": "Unprecedented scale of foreign vessels in Far North Queensland, as government defends its border security",
				"sub_title": "Unprecedented scale of foreign vessels in Far North Queensland, as government defends its border security",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ec9f4a4a0a1eb1f5f63d75d41f3d8088?impolicy=wcms_crop_resize&cropH=349&cropW=620&xPos=0&yPos=56&width=862&height=485",
				"created_at": "2026-01-29T13:16:54.700Z",
				"updated_at": "2026-01-29T13:16:54.700Z",
				"tags": [
					"Feature Updates",
					"Models",
					"Agents"
				],
				"category_names": [
					"Hardware",
					"Policy"
				],
				"subcategory_names": [
					"Robotics",
					"Military",
					"Drone",
					"Geopolitics",
					"Safety & Ethics"
				],
				"business_type_name": "News",
				"author": {
					"id": "42",
					"name": "James Robinson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jamesrobinson",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-OWVYNAs8",
				"slug": "parramatta-receives-email-9dh5",
				"title": "Parramatta receives emails from Zac Lomax's lawyer as the ongoing contract dispute unfolds in court proceedings",
				"sub_title": "Parramatta receives emails from Zac Lomax's lawyer as the ongoing contract dispute unfolds in court proceedings",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/0e9d486bf6be461eee022f34d8dde4db?impolicy=wcms_crop_resize&cropH=2532&cropW=4502&xPos=0&yPos=123&width=862&height=485",
				"created_at": "2026-01-29T06:53:23.688Z",
				"updated_at": "2026-01-29T06:53:23.688Z",
				"tags": [
					"Drone",
					"Robotics"
				],
				"category_names": [
					"Business",
					"Hardware"
				],
				"subcategory_names": [
					"Press Release",
					"Funding",
					"Robotics",
					"Chips",
					"Drone"
				],
				"business_type_name": "News",
				"author": {
					"id": "69",
					"name": "Jasmine Edwards",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-gdrJaMDb",
				"slug": "predatory-former-logan-te-q5c4",
				"title": "'Predatory' former Logan teacher jailed over child sex offences",
				"sub_title": "'Predatory' former Logan teacher jailed over child sex offences",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/03b8931c9619653df4ea6ed3bd38bbb1?impolicy=wcms_crop_resize&cropH=897&cropW=1594&xPos=173&yPos=132&width=862&height=485",
				"created_at": "2026-01-29T06:51:20.975Z",
				"updated_at": "2026-01-29T06:51:20.975Z",
				"tags": [
					"Robotics",
					"Chips"
				],
				"category_names": [
					"Policy",
					"Hardware"
				],
				"subcategory_names": [
					"Safety & Ethics",
					"Geopolitics",
					"Energy (Nuclear, Grid, Sustainability)",
					"Drone"
				],
				"business_type_name": "News",
				"author": {
					"id": "36",
					"name": "Daniel White",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=danielwhite",
					"profile_bio": "",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-uhLv3yUV",
				"slug": "indians-honor-arijit-sing-8if0",
				"title": "Indians honor Arijit Singh after he retires at 38 as Bollywood singer",
				"sub_title": "Indians honor Arijit Singh after he retires at 38 as Bollywood singer",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/7e13/live/755219c0-fc0b-11f0-a422-4ba8a094a8fa.jpg",
				"created_at": "2026-01-29T06:46:01.735Z",
				"updated_at": "2026-01-29T06:46:01.735Z",
				"tags": [
					"Drone",
					"Chips"
				],
				"category_names": [
					"Policy",
					"Hardware"
				],
				"subcategory_names": [
					"Regulation",
					"Safety & Ethics",
					"Geopolitics",
					"Drone",
					"Robotics"
				],
				"business_type_name": "News",
				"author": {
					"id": "34",
					"name": "Joshua Thomas",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=joshuathomas",
					"profile_bio": "",
					"role": "Authors"
				}
			}
		],
		"total": 382,
		"next": true
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取所有业务类型

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-08 16:10:13

> 更新时间: 2026-02-06 18:19:52

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/business-types

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": [
		{
			"id": "5",
			"name": "Insights",
			"description": "In-depth analysis and interpretations of Web3 trends, technologies, and market dynamics, offering strategic perspectives and actionable intelligence for informed decision-making"
		},
		{
			"id": "4",
			"name": "News",
			"description": "Current events, announcements, and breaking developments in the Web3 ecosystem, including project launches, partnerships, regulatory updates, and market movements"
		},
		{
			"id": "6",
			"name": "Research",
			"description": "Comprehensive studies, technical papers, and data-driven investigations exploring Web3 technologies, protocols, and applications with academic rigor and empirical evidence"
		},
		{
			"id": "2",
			"name": "Tutorials",
			"description": "Step-by-step guides, how-tos, and practical walkthroughs that teach users how to use Web3 tools, protocols, and applications, from beginner to advanced levels"
		},
		{
			"id": "1",
			"name": "Voices",
			"description": "Perspectives, opinions, and personal narratives from thought leaders, builders, and community members in Web3, highlighting diverse viewpoints and experiences"
		}
	]
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取文章详情

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-02 11:17:07

> 更新时间: 2026-04-09 18:17:05

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/info?entry_id=dtc-EMWoPkVf

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| slug | neuroscience-and-society--jsjo | string | 是 | - |
| entry_id | dtc-EMWoPkVf | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"entry_id": "dtc-zhic6jqj",
		"slug": "significant-impact-for-co-rjia",
		"title": "'Significant' impact for community bands as funding applications rejected",
		"type": "article",
		"language": "en",
		"img_url": "https://live-production.wcms.abc-cdn.net.au/810c3cc42cfe3851421cd88d33c3509a?impolicy=wcms_crop_resize&cropH=2340&cropW=3120&xPos=940&yPos=0&width=862&height=647",
		"status": "published",
		"body": "For the past 90 years, the City of Wollongong Brass and Wind Band has been proud of keeping its membership fees down, but the looming loss of funding has cast doubt on the band's future.\n\n\"We want to include everybody as much as possible,\" said the band's president Neil Wright.\n\n\"Some people might say it's kind of a niche … but there's a lot of people who do this.\"\n\nThe volunteer-run group is one of more than 100 community and school bands in New South Wales, which are represented by the Bands Association of NSW (BANSW).\n\nFor years the association has received funding through the state government's arts and culture grant schemes, and has allocated it to local bands to cover venue hire, advertising, organising concerts, buying sheet music or repairing instruments.\n\nBANSW president Jeff Markham said the amount they received often \"waxed and waned\", but they had consistently secured around $55,000 each year for the past decade.\n\n\"We've had certainty of funding which has allowed us to plan,\" he said.\n\nIn Wollongong, Mr Wright said the money had helped fund music camps, workshops and social media advertising.\n\n\"Most of our grants have been towards fostering our young and upcoming players,\" he said.\n\n\"It's good getting particularly the young ones into the organisation, but you've got to find ways of wanting them to actually remain as part of the organisation.\"\n\nFight for funding\n\nMore than 140 organisations were successful in the latest round of funding, which for the first time operated under a competitive model.\n\nGroups had been able to apply for multi-year funding over for a period of two or four years.\n\nBut BANSW's funding application was rejected.\n\nA spokesperson for Create NSW said the latest funding rounds had been \"highly competitive\".\n\n\"The Arts and Cultural Funding Program is delivered through an open, competitive, independently assessed process,\" the spokesperson said in a statement.\n\n\"Funding is not ongoing or guaranteed.\"\n\nCreate NSW said it held multiple meetings with BANSW to provide \"feedback and support\" before and after its application was submitted.\n\n'Significant' impact on bands\n\nMr Markham said the possibility of BANSW no longer being able to fund local bands for the time being would have a \"significant\" impact — especially on groups with younger players.\n\n\"The youth program is a lot of work, it's a lot of expense, and it's a lot of energy,\" he said.\n\nMr Wright said if they were granted money this year, they would have used it on promotional materials like banners and signs.\n\n\"Currently, we just do without, and hope people might come up close enough and ask questions,\" he said.\n\n\"They're just little things … [but] if we're able to get a grant, we don't have to think about where we are going to take that money from.\"\n\nHe said it might also affect their membership costs.\n\n\"Something we've been fairly proud of is keeping our membership fees down.\"\n\nBudget changes flagged\n\nMr Markham said without grant funding, bands could soon be forced to reassess whether some of their events and programs are worth budgeting for.\n\n\"Most of the stuff a band does in the community, they don't get paid for it,\" he said.\n\n\"Without that little bit of funding, all of the money has to come from the band itself, which means there's no upfront commitment to do these things.\"\n\nMr Markham said the alternative was to ask members to reach into their own pockets to help meet band costs.\n\n\"They're all out fundraising, but all those fundraising efforts are all to just keep the doors open,\" he said.\n\n\"Everything else extra to that is basically on the members.\"\n\nRegional bands hit hard\n\nThe Hills Music Academy in Sydney's north-west has youth and senior bands with around 100 members.\n\nMusical director Garry Clark said the academy had been receiving grant funding periodically over the last 25 years.\n\nHe said their larger membership base and event partnerships meant they would not be as affected by the loss of funding as their regional counterparts.\n\n\"Smaller groups, less active groups, they would really struggle,\" he said.\n\n\"A lot of the regional groups would maybe not even be able to function, because numbers are not as high.\"\n\nMr Wright said that may be the case for his musicians.\n\n\"We'll [still] put on events, it just means however that we can't subsidise these events … there might be some players who might not be able to attend.\"\n\nBringing community together\n\nMr Clark said locals would ultimately suffer if their bands could not survive.\n\n\"Seeing a band out in public performing, marching down the street, playing Christmas carols in a shopping centre, all those little things that bring the community together.\"\n\nMr Markham said the importance of community bands is often underestimated.\n\n\"Your community band is quite often the first place that somebody will be introduced to live music,\" he said.\n\n\"We play in nursing homes, we play at funerals … and quite often for many people, the community band is the last live music that they see as well.\"",
		"sub_title": "'Significant' impact for community bands as funding applications rejected",
		"contact": null,
		"created_at": "2026-01-14T01:40:26.699Z",
		"updated_at": "2026-01-16T01:42:45.321Z",
		"country": "United States",
		"city": "Kansas",
		"unique_vistor": "0",
		"page_view": "0",
		"is_translated": true,
		"ai_img_url": null,
		"image_urls": null,
		"category_id": "23",
		"tags": [
			"Crypto"
		],
		"author": {
			"id": "58",
			"name": "Kevin Adams",
			"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
			"bio": "Author",
			"role": "Root"
		},
		"category_names": [
			"Policy",
			"Business"
		],
		"subcategory_names": [
			"Geopolitics",
			"Safety & Ethics",
			"Regulation",
			"Funding",
			"Press Release"
		],
		"business_type_name": "News"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取首页内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-08-18 16:19:58

> 更新时间: 2026-02-28 17:17:19

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/home

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| User-Agent | node | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"lastest": [
			{
				"entry_id": "dtc-sSQvblEN",
				"slug": "auther-create-cbe4",
				"title": "auther-create",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772259334756-237830499.png",
				"created_at": "2026-02-28T06:17:17.879Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-gk6vgC1X",
				"slug": "test-111-5orb",
				"title": "test-111",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772260163333-336324806.png",
				"created_at": "2026-02-11T08:56:48.179Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-Ht8nDOPZ",
				"slug": "test-2-xgmr",
				"title": "test--2",
				"img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
				"created_at": "2026-02-11T03:21:49.623Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-BfAwtQ5a",
				"slug": "how-an-afghan-family-ende-7pt8",
				"title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
				"img_url": "https://ichef.bbci.co.uk/ace/standard/3840/cpsprodpb/6652/live/5a034df0-88cb-11f0-85f1-5f1042c3058b.jpg",
				"created_at": "2026-02-09T07:54:12.642Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-o0BNIyff",
				"slug": "women-leading-efforts-to--p0p5",
				"title": "Women leading efforts to protect India's snow leopards",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png",
				"created_at": "2026-02-06T09:22:46.229Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-hT6ryo1k",
				"slug": "trump-says-it-would-be-gr-erxf",
				"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
				"img_url": "https://fast.image.delivery/venszwy.png",
				"created_at": "2026-01-30T08:05:13.600Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-dn9Wjxoc",
				"slug": "imran-khan-not-the-only-o-1vxt",
				"title": "Imran Khan not the only one silenced as Pakistan military suppresses dissent",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/b6e6/live/9791ad00-fd6b-11f0-a8b8-bdd2c5f9bcad.jpg",
				"created_at": "2026-01-30T06:23:50.765Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-WmgEq7Ar",
				"slug": "government-secures-last-m-k8l3",
				"title": "Government secures last-minute hospital funding agreement with the states",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ba3130f6dc637f098433b2a76c5efa07?impolicy=wcms_crop_resize&cropH=2436&cropW=4330&xPos=0&yPos=100&width=862&height=485",
				"created_at": "2026-01-30T04:20:23.282Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-cImx19JI",
				"slug": "machine-capable-of-produc-zg2c",
				"title": "Machine capable of producing millions of illegal cigarettes seized in Sydney",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/01ce4672b1bfc6d24434725878ba1a53?impolicy=wcms_crop_resize&cropH=432&cropW=768&xPos=0&yPos=0&width=862&height=485",
				"created_at": "2026-01-30T04:17:03.539Z",
				"business_type_id": "4",
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-tq9TWUxF",
				"slug": "cannington-greyhound-carn-y9ji",
				"title": "Cannington greyhound 'carnage' prompts calls to phase out",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/bcf08703fd1a136279b6921216308683?impolicy=wcms_crop_resize&cropH=1688&cropW=3000&xPos=0&yPos=61&width=862&height=485",
				"created_at": "2026-01-30T04:15:40.801Z",
				"business_type_id": "4",
				"business_type_name": "News"
			}
		],
		"who_to_follow": [
			{
				"user_id": "25",
				"nick": "Emily Johnson",
				"name": "Emily Johnson",
				"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=emilyjohnson",
				"profile_bio": "Author"
			},
			{
				"user_id": "26",
				"nick": "Michael Smith",
				"name": "Michael Smith",
				"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=michaelsmith",
				"profile_bio": "Author"
			},
			{
				"user_id": "27",
				"nick": "Sarah Brown",
				"name": "Sarah Brown",
				"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=sarahbrown",
				"profile_bio": "Author"
			},
			{
				"user_id": "28",
				"nick": "David Wilson",
				"name": "David Wilson",
				"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=davidwilson",
				"profile_bio": "Author"
			},
			{
				"user_id": "29",
				"nick": "Jessica Davis",
				"name": "Jessica Davis",
				"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jessicadavis",
				"profile_bio": "Author"
			}
		],
		"news_all": [
			{
				"entry_id": "dtc-hT6ryo1k",
				"slug": "trump-says-it-would-be-gr-erxf",
				"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
				"sub_title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
				"img_url": "https://fast.image.delivery/venszwy.png",
				"body": "Donald Trump says he has informed Iran it must meet “two things” to avoid US military action, as Washington increases its forces in the Gulf.\n\n“Number one, no nuclear. And number two, stop killing protesters,” the US President said, asserting that “they are killing them by the thousands”.\n\n“We have a lot of very big, very powerful ships sailing to Iran right now, and it would be great if we didn’t have to use them.”\n\nHe delivered those remarks at the premiere of a documentary about his wife, Melania.\n\nThe comments follow weeks of pressure on Tehran to negotiate an agreement on its nuclear programme.\n\nEarlier in the week, Trump posted on Truth Social: “Hopefully Iran will quickly ‘Come to the Table’ and negotiate a fair and equitable deal - NO NUCLEAR WEAPONS.”\n\nHe further warned that a “massive Armada is heading to Iran”, saying it was “ready, willing, and able to rapidly fulfil its mission, with speed and violence, if necessary”.\n\nIran’s Foreign Minister Abbas Araghchi has said the armed forces stand “with their fingers on the trigger” to “immediately and powerfully respond” to any aggression.\n\nIn response, Araghchi said: “Iran has always welcomed a mutually beneficial, fair and equitable NUCLEAR DEAL - on equal footing, and free from coercion, threats, and intimidation - which ensures Iran’s rights to PEACEFUL nuclear technology, and guarantees NO NUCLEAR WEAPONS.”\n\n“Such weapons have no place in our security calculations and we have NEVER sought to acquire them,” he added.\n\nIran’s Deputy Foreign Minister Kazem Gharibabadi said there were no negotiations with the US under way, despite “exchanges of messages”.\n\nDemonstrations began in late December after a steep fall in the value of the Iranian currency, but quickly became a crisis of legitimacy for the country’s clerical leadership.\n\nResidents in Tehran told the BBC the crackdown on protesters was unlike anything they had seen before.\n\nEarlier this month, Trump said the US would come to the “rescue” of Iranian protesters if authorities resorted to violence.\n\nThough Trump initially promised that “help is on the way”, he later said he had been told on good authority that the execution of demonstrators had stopped.\n\nThe US-based Human Rights Activists News Agency (Hrana) says it has so far confirmed the killing of at least 6,479 people since the unrest began, including 6,092 protesters, 118 children and 214 people affiliated with the government.\n\nIt is also investigating approximately 17,000 more reported deaths.\n\nIranian authorities said last week that more than 3,100 people had been killed, but that most were security personnel or bystanders attacked by “rioters”.\n\nThe European Union has since added Iran’s Islamic Revolutionary Guard Corps (IRGC) to its terrorist list, and imposed new sanctions on six entities and 15 individuals in Iran.",
				"created_at": "2026-01-30T08:05:13.600Z",
				"author": {
					"id": "69",
					"name": "Jasmine Edwards",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "News"
			},
			{
				"entry_id": "dtc-uMKkPykR",
				"slug": "six-dead-including-child--bcx8",
				"title": "Six dead, including child, in Mississippi shootings, suspect charged",
				"sub_title": "Six dead, including child, in Mississippi shootings, suspect charged",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ada73204ef1b4cab2adb6c33784bc28d?impolicy=wcms_crop_resize&cropH=338&cropW=451&xPos=197&yPos=0&width=862&height=647",
				"body": "Warning: This story contains references to sexual assault.\n\nA 24-year-old man has been charged with murder after six people were killed in a series of shootings in north-east Mississippi.\n\nClay County Sheriff Eddie Scott said the suspect was accused of shooting his father, brother and uncle fatally in the head on Friday evening, before stealing a truck and driving to a second site.\n\nSexual assault support lines:\n\n1800 Respect National Helpline: 1800 737 732Men's Referral Service: 1300 766 491Lifeline (24-hour crisis line): 131 114Victims of Crime Helpline: 1800 819 817Full Stop Australia: 1800 385 578There, he allegedly attempted to sexually assault a seven-year-old girl, who was also related to him, before fatally shooting her in the head.\n\nA 911 call then directed law enforcement to a third site, where two more men, including a local pastor, were found fatally shot in the head.\n\nThe suspect was arrested nearby just before midnight.\n\n\"I don’t know what kind of motive you could have to kill a seven-year-old,\" Sheriff Scott said at a press conference on Saturday.\n\n\"This has really shaken our community.\n\n\"A situation like this, you've got a family member attacking their own family … whatever the reason is, we're hoping that we'll find out.\"\n\nSuspect had no criminal history, records show\n\nSheriff's Deputy Steven Woodruff identified Daricka M Moore, 24, as the man arrested.\n\nHe faces a first-degree murder charge that could be upgraded to capital murder, Sheriff Scott said.\n\nHe may also face additional murder charges.\n\nOnline court records in Clay County show he has no previous criminal charges. \n\nScott Colom, the district attorney for Mississippi's Sixteenth Circuit Court, said the incident was one of the worst he had come across.\n\n\"This is horrific. It's about as bad as it gets,\" he said.\n\nThe Mississippi Crime Lab, a state office, will conduct autopsies, Sheriff Scott said.\n\nThe shootings took place in the rural community of Cedarbluff, which is west of the county seat of West Point.\n\nAP/Reuters",
				"created_at": "2026-01-14T09:39:35.895Z",
				"author": {
					"id": "28",
					"name": "David Wilson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=davidwilson",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights"
			},
			{
				"entry_id": "dtc-37RNYgs3",
				"slug": "wetland-teeming-with-life-1anr",
				"title": "Wetland teeming with life in this remote Corner Country of NSW",
				"sub_title": "Wetland teeming with life in this remote Corner Country of NSW",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/24de5d9bfaaf21aa582db5d6bfa00ced?impolicy=wcms_crop_resize&cropH=2268&cropW=3024&xPos=504&yPos=0&width=862&height=647",
				"body": "In one of the most remote parts of New South Wales, a desert has turned into an oasis.\n\nWater from floods in south-west Queensland early last year have flown down the Bulloo River, through the Bulloo Overflow and into Narriearra Caryapundy Swamp, an ephemeral wetland that only fills every 10 to 20 years.\n\nThe swamp is a 17-hour drive from Sydney to the Corner Country – not far from the dog fence at the Queensland border which forms its northern boundary.\n\n\"This is an incredibly healthy system and it's just going through the natural rhythms that it's been doing for tens of thousands of years,\" river ecologist Professor Richard Kingsford said.\n\n\"I think it's one of the most incredible wetlands that we've got in the country.\"\n\nThe 70,000-hectare wetland received Ramsar listing in 2021, and is part of the larger Bulloo Overflow.\n\nProfessor Kingsford said he thought the wetland had its largest infill ever, as the 2024 floods at Thargomindah were bigger than those in the 1950s and 1970s.\n\n\"We know it's big but when you … survey it from a light aircraft and it takes you hours to go back and forth, you just realise what an amazing natural phenomenon this is,\" he said.\n\nSurvey estimates 300,000 birds\n\nSince the New South Wales government purchased the 150,000-hectare Narriearra Station about five years ago, scientists, rangers and local Indigenous people have been able to appreciate its ecological significance and cultural history.\n\nProfessor Kingsford estimated about 200,000 to 300,000 birds were in the area when it was surveyed in October 2025.\n\n\"We're flying [in an plane] at 50 metres above the water with tape recorders being like race callers and identifying and estimating the numbers of birds,\" he said.\n\nProfessor Kingsford said they spotted about 30 species including rare species like Freckled Duck.\n\n\"[There were] over 100,000 grey teal ducks, 70,000 pink-eared ducks, and even the swans were breeding there,\" he said.\n\n\"I've never seen so many swamphens in one place.\n\n\"Even one of the enigmas of water birds, these black-tailed native-hens, were all also there in their tens of thousands.\n\n\"[It's] just an incredible sight to see.\"\n\nProfessor Kingsford said it was the first bird survey done in about 35 years, with birds a good indicator of the health of a system.\n\nHe said as the water evaporated over the summer, it would become more productive.\n\n\"All those invertebrates and fish that are in the water are going to be available to a whole range of different water birds,\" he said. \n\n\"As it dries, it's got all of this moisture, so you get all the plants, animals and woodland birds and all those small animals will be able to take advantage of that high productivity that's in the system.\"\n\nMalyangapa man Mark Sutton said the water means many totem species were being replenished.\n\n\"My particular totem is the bony bream … and that particular species of fish sits in the sand, often for many years, waiting for a deluge of decent rain,\" he said.\n\n\"Once that water arrives, either flowing down through systems or from the sky, those eggs hatch.\n\n\"Within weeks, those previously dry lakes can suddenly be full of fish.\"\n\nUndisturbed cultural heritage\n\nMr Sutton said the government purchase of Narriearra Station has meant Aboriginal people can access the landscape.\n\n\"For Aboriginal people in the last 150 years, we've really not been able to access most of the landscape because … I would like to think we've respected the non-Aboriginal owners of those lands,\" he said.\n\nNSW National Parks and Wildlife Service Ranger Emma McLean said they had recorded many Indigenous artefacts in the area.\n\n\"This place is so incredibly rich in Aboriginal cultural heritage,\" she said.\n\n\"Everywhere you walk – especially once you get off tracks – everywhere you walk it's just all over the place.\n\n\"There's some really fascinating and important examples of things like hearths – which are ancient cooking fires where people would cook their food – and even stone artefacts.\"\n\nMr Sutton said a very rare greenstone axe head was found on site, which had been traded all the way up from Victoria.\n\n\"These are pretty rare now,\" he said.\n\n\"They were often collected by property owners and others prior to the amendments to the National Parks and Wildlife Act in 1974.\"",
				"created_at": "2026-01-14T09:34:30.580Z",
				"author": {
					"id": "58",
					"name": "Kevin Adams",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research"
			}
		],
		"topics": [
			{
				"id": "29",
				"name": "Agents",
				"description": "Content on autonomous and semi‑autonomous AI agents, their frameworks, behaviors, and real‑world applications"
			},
			{
				"id": "45",
				"name": "Artificial Intelligence",
				"description": "News on AI research, applications and impacts"
			},
			{
				"id": "47",
				"name": "Blockchain",
				"description": "Coverage of blockchain technology and its use cases"
			},
			{
				"id": "36",
				"name": "Chips",
				"description": "AI hardware and accelerators such as GPUs, TPUs, NPUs, and custom silicon, focusing on performance and ecosystem impact"
			},
			{
				"id": "51",
				"name": "Commodities",
				"description": "Coverage of oil, metals, agriculture and other commodities"
			},
			{
				"id": "50",
				"name": "Crypto",
				"description": "News on cryptocurrencies, tokens and digital assets"
			},
			{
				"id": "46",
				"name": "Cybersecurity",
				"description": "Reports on data breaches, hacking and digital security"
			},
			{
				"id": "39",
				"name": "Drone",
				"description": "Autonomous and semi‑autonomous drones powered by AI, including sensing, navigation, and surveillance applications"
			},
			{
				"id": "40",
				"name": "Energy (Nuclear, Grid, Sustainability)",
				"description": "AI applications in energy production and management, from nuclear and grid optimization to sustainability and decarbonization"
			},
			{
				"id": "35",
				"name": "Enterprise Adoption",
				"description": "How large organizations are implementing AI, including deployment strategies, case studies, and organizational impact"
			},
			{
				"id": "44",
				"name": "Environment",
				"description": "Stories on ecosystems, conservation and environmental policy"
			},
			{
				"id": "27",
				"name": "Feature Updates",
				"description": "Incremental improvements and new capabilities added to existing AI products, APIs, and platforms"
			},
			{
				"id": "52",
				"name": "Forex",
				"description": "Reports on currency markets and exchange rate movements"
			},
			{
				"id": "33",
				"name": "Funding",
				"description": "Coverage of venture capital, grants, and other funding events involving AI companies and projects"
			},
			{
				"id": "43",
				"name": "Geopolitics",
				"description": "How AI influences and is shaped by international relations, national strategies, and global power dynamics"
			},
			{
				"id": "48",
				"name": "Innovation",
				"description": "Stories on new technologies, startups and tech innovation"
			},
			{
				"id": "53",
				"name": "Investment",
				"description": "Stories on investing strategies, funds and personal finance"
			},
			{
				"id": "37",
				"name": "Military",
				"description": "Use of AI in defense and military contexts, including autonomy, decision support, and related policy concerns"
			},
			{
				"id": "28",
				"name": "Models",
				"description": "Information and analysis on specific AI models, including capabilities, limitations, architectures, and usage patterns"
			},
			{
				"id": "26",
				"name": "New Releases",
				"description": "Announcements and overviews of brand‑new AI products, models, and platforms entering the market"
			},
			{
				"id": "32",
				"name": "Press Release",
				"description": "Official company announcements related to AI, including launches, partnerships, and strategic initiatives"
			},
			{
				"id": "41",
				"name": "Regulation",
				"description": "Laws, standards, and policy frameworks governing AI development, deployment, and compliance requirements"
			},
			{
				"id": "34",
				"name": "Reports",
				"description": "Industry reports, market research, whitepapers, and in‑depth analyses on the AI landscape and its economics"
			},
			{
				"id": "38",
				"name": "Robotics",
				"description": "AI‑enabled robots for industry, service, and research, covering hardware, control systems, and embodied intelligence"
			},
			{
				"id": "42",
				"name": "Safety & Ethics",
				"description": "Discussions and research on AI safety, alignment, responsible use, and ethical implications for society"
			},
			{
				"id": "31",
				"name": "Skills",
				"description": "Specific capabilities, plugins, and domain skills that extend AI systems to perform specialized tasks or integrations"
			},
			{
				"id": "49",
				"name": "Stocks",
				"description": "Updates on stock markets, indices and listed companies"
			},
			{
				"id": "30",
				"name": "Tools (Image, Video, Audio gen)",
				"description": "AI tools for generating and editing images, video, and audio, including capabilities, workflows, and creative use cases"
			}
		],
		"mostread": [
			{
				"entry_id": "dtc-hT6ryo1k",
				"slug": "trump-says-it-would-be-gr-erxf",
				"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
				"img_url": "https://fast.image.delivery/venszwy.png",
				"created_at": "2026-01-30T08:05:13.600Z",
				"business_type_id": "4",
				"page_view": "5",
				"business_type_name": "News",
				"author": {
					"id": "69",
					"name": "Jasmine Edwards",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-8ClLLpvl",
				"slug": "man-who-exposed-human-rig-f8re",
				"title": "Man who exposed human rights abuses in China receives U.S. asylum",
				"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/82a0/live/8338b490-fcbf-11f0-be2d-7b4b1a60e9bc.jpg",
				"created_at": "2026-01-29T06:50:02.437Z",
				"business_type_id": "4",
				"page_view": "4",
				"business_type_name": "News",
				"author": {
					"id": "49",
					"name": "Rachel Allen",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=rachelallen",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-gdrJaMDb",
				"slug": "predatory-former-logan-te-q5c4",
				"title": "'Predatory' former Logan teacher jailed over child sex offences",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/03b8931c9619653df4ea6ed3bd38bbb1?impolicy=wcms_crop_resize&cropH=897&cropW=1594&xPos=173&yPos=132&width=862&height=485",
				"created_at": "2026-01-29T06:51:20.975Z",
				"business_type_id": "4",
				"page_view": "3",
				"business_type_name": "News",
				"author": {
					"id": "36",
					"name": "Daniel White",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=danielwhite",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-xulFUzZr",
				"slug": "despite-secret-meeting-ha-w1zv",
				"title": "Despite secret meeting, Hastie and Taylor fail to agree on plan to oust Ley",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/b1d71492397396ed977cf9e7a72da2dc?impolicy=wcms_crop_resize&cropH=450&cropW=800&xPos=0&yPos=28&width=862&height=485",
				"created_at": "2026-01-29T06:58:43.655Z",
				"business_type_id": "4",
				"page_view": "2",
				"business_type_name": "News",
				"author": {
					"id": "57",
					"name": "Rebecca Green",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=rebeccagreen",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-OWVYNAs8",
				"slug": "parramatta-receives-email-9dh5",
				"title": "Parramatta receives emails from Zac Lomax's lawyer as the ongoing contract dispute unfolds in court proceedings",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/0e9d486bf6be461eee022f34d8dde4db?impolicy=wcms_crop_resize&cropH=2532&cropW=4502&xPos=0&yPos=123&width=862&height=485",
				"created_at": "2026-01-29T06:53:23.688Z",
				"business_type_id": "4",
				"page_view": "2",
				"business_type_name": "News",
				"author": {
					"id": "69",
					"name": "Jasmine Edwards",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-aTDQMbWY",
				"slug": "united-nations-special-ra-t0zo",
				"title": "United Nations special rapporteur moves to join the challenge against NSW government's protest restrictions",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/c4431f90d6d4f5553c7312dae12a07bd?impolicy=wcms_crop_resize&cropH=2813&cropW=5000&xPos=0&yPos=260&width=862&height=485",
				"created_at": "2026-01-29T06:56:16.104Z",
				"business_type_id": "4",
				"page_view": "1",
				"business_type_name": "News",
				"author": {
					"id": "38",
					"name": "Andrew Martin",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=andrewmartin",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-sSQvblEN",
				"slug": "auther-create-cbe4",
				"title": "auther-create",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772259334756-237830499.png",
				"created_at": "2026-02-28T06:17:17.879Z",
				"business_type_id": "4",
				"page_view": "0",
				"business_type_name": "News",
				"author": {
					"id": "10",
					"name": "user_3AFND54bR76VDqSRibqerZZlGbg",
					"avatar_url": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQUZORDVNM0hpdmtnaFlObGhpMG5qWXJ3TjQifQ",
					"profile_bio": null,
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-gk6vgC1X",
				"slug": "test-111-5orb",
				"title": "test-111",
				"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772260163333-336324806.png",
				"created_at": "2026-02-11T08:56:48.179Z",
				"business_type_id": "4",
				"page_view": "0",
				"business_type_name": "News",
				"author": {
					"id": "7",
					"name": null,
					"avatar_url": null,
					"profile_bio": null,
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-Ht8nDOPZ",
				"slug": "test-2-xgmr",
				"title": "test--2",
				"img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
				"created_at": "2026-02-11T03:21:49.623Z",
				"business_type_id": "4",
				"page_view": "0",
				"business_type_name": "News",
				"author": {
					"id": "7",
					"name": null,
					"avatar_url": null,
					"profile_bio": null,
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-BfAwtQ5a",
				"slug": "how-an-afghan-family-ende-7pt8",
				"title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
				"img_url": "https://ichef.bbci.co.uk/ace/standard/3840/cpsprodpb/6652/live/5a034df0-88cb-11f0-85f1-5f1042c3058b.jpg",
				"created_at": "2026-02-09T07:54:12.642Z",
				"business_type_id": "4",
				"page_view": "0",
				"business_type_name": "News",
				"author": {
					"id": "6",
					"name": "dannyburger",
					"avatar_url": "https://xxx.png",
					"profile_bio": "xxx yyy",
					"role": "Authors"
				}
			}
		],
		"categories": [
			{
				"id": "30",
				"name": "Adoption",
				"description": "Stories, case studies, and data on how AI is being practically adopted across industries, teams, and workflows, including challenges, ROI, and best practices",
				"business_type_name": "Insights"
			},
			{
				"id": "24",
				"name": "Benchmarks",
				"description": "Standardized measurements and comparative evaluations of Web3 protocols, networks, and infrastructure, focusing on performance, scalability, security, and cost-efficiency to provide objective data for technology selection and optimization",
				"business_type_name": "Research"
			},
			{
				"id": "34",
				"name": "Blogs",
				"description": "Opinion pieces, narrative posts, and reflective writing on AI from individuals and organizations, capturing evolving thinking, debates, and personal perspectives",
				"business_type_name": "Voices"
			},
			{
				"id": "25",
				"name": "Breakthroughs",
				"description": "Major advances, novel techniques, and frontier capabilities in AI that significantly push the boundaries of what models can do, with clear implications for products and research",
				"business_type_name": "Research"
			},
			{
				"id": "20",
				"name": "Business",
				"description": "Analyses and coverage of business models, monetization strategies, organizational structures, and commercial applications in the Web3 ecosystem, including token economies, fundraising, partnerships, and market expansion",
				"business_type_name": "News"
			},
			{
				"id": "29",
				"name": "Competition",
				"description": "Coverage of competitive dynamics in the AI landscape, including model races, product battles, benchmarks, market positioning, and strategic responses among key players",
				"business_type_name": "Insights"
			},
			{
				"id": "26",
				"name": "Context",
				"description": "Background, history, and framing that explain why specific AI developments, debates, or technologies matter, connecting them to broader technical and societal trends",
				"business_type_name": "Research"
			},
			{
				"id": "35",
				"name": "Glossary",
				"description": "Concise definitions and explanations of AI terms, concepts, techniques, and acronyms to help readers quickly build and refresh foundational understanding",
				"business_type_name": "Tutorials"
			},
			{
				"id": "21",
				"name": "Hardware",
				"description": "Content focused on physical infrastructure and devices that support Web3, such as mining rigs, validators, nodes, wallets, and specialized chips, including performance insights, architecture, deployment, and optimization",
				"business_type_name": "News"
			},
			{
				"id": "28",
				"name": "Labs",
				"description": "Updates, analyses, and inside looks at major AI research labs such as OpenAI, Google DeepMind, and FAIR, covering papers, policies, product launches, and strategic moves",
				"business_type_name": "Research"
			},
			{
				"id": "31",
				"name": "New Players",
				"description": "Profiles and analyses of emerging AI companies, open-source communities, and research groups entering the ecosystem and reshaping the competitive and innovation landscape",
				"business_type_name": "Insights"
			},
			{
				"id": "37",
				"name": "Playbooks",
				"description": "Structured, reusable strategies and best-practice guides for applying AI to specific domains or problems, from evaluation and safety to product integration",
				"business_type_name": "Tutorials"
			},
			{
				"id": "19",
				"name": "Policy",
				"description": "News and analysis on governments, policies and political events",
				"business_type_name": "News"
			},
			{
				"id": "36",
				"name": "Prompting",
				"description": "Practical techniques, patterns, and examples for designing prompts, system messages, and interaction strategies to reliably steer and control AI models",
				"business_type_name": "Tutorials"
			},
			{
				"id": "27",
				"name": "RAG",
				"description": "Content focused on Retrieval-Augmented Generation methods, including architectures, vector databases, evaluation, optimization techniques, and real-world implementation patterns",
				"business_type_name": "Research"
			},
			{
				"id": "33",
				"name": "Talks",
				"description": "Summaries, highlights, and commentary on keynotes, lectures, panels, and interviews from AI conferences, meetups, and online events",
				"business_type_name": "Voices"
			},
			{
				"id": "23",
				"name": "Technology",
				"description": "News on innovation, digital trends and emerging technologies",
				"business_type_name": "News"
			},
			{
				"id": "32",
				"name": "Trend Watch",
				"description": "Ongoing monitoring and interpretation of emerging AI trends, patterns, and inflection points, highlighting where the field and market may be heading next",
				"business_type_name": "Insights"
			},
			{
				"id": "39",
				"name": "Vibe Coding",
				"description": "Exploratory, creative, and informal coding sessions with AI, emphasizing experimentation, rapid iteration, and discovery over strict structure or production readiness",
				"business_type_name": "Tutorials"
			},
			{
				"id": "38",
				"name": "Workflows",
				"description": "End-to-end process designs that integrate AI tools into real tasks and teams, detailing steps, tools, handoffs, and automation opportunities",
				"business_type_name": "Tutorials"
			}
		],
		"news": [
			{
				"tag": "All",
				"data": [
					{
						"entry_id": "dtc-sSQvblEN",
						"slug": "auther-create-cbe4",
						"title": "auther-create",
						"sub_title": "auther-create-sub",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772259334756-237830499.png",
						"body": "<p>auther-create </p>\n<p></p>\n<p>《ysgf》</p>\n<p></p>\n<p><b>加粗</b></p>\n<p></p>\n<img src=\"https://fast.image.delivery/bupiptu.jpg\" alt=\"Image\" />",
						"created_at": "2026-02-28T06:17:17.879Z",
						"author": {
							"id": "10",
							"name": "user_3AFND54bR76VDqSRibqerZZlGbg",
							"avatar_url": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQUZORDVNM0hpdmtnaFlObGhpMG5qWXJ3TjQifQ",
							"profile_bio": null,
							"role": "Authors"
						},
						"business_type_name": "News",
						"category_names": [
							"Business"
						],
						"subcategory_names": [
							"Enterprise Adoption",
							"Funding",
							"Press Release"
						]
					},
					{
						"entry_id": "dtc-gk6vgC1X",
						"slug": "test-111-5orb",
						"title": "test-111",
						"sub_title": "sub title",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772260163333-336324806.png",
						"body": "<h2>title</h2>\n<p></p>\n<blockquote>content</blockquote>\n<p></p>\n<p></p>\n<img src=\"https://fast.image.delivery/plnhwry.png\" alt=\"Image\" width=\"1000\" height=\"1000\" />",
						"created_at": "2026-02-11T08:56:48.179Z",
						"author": {
							"id": "7",
							"name": null,
							"avatar_url": null,
							"profile_bio": null,
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business"
						],
						"subcategory_names": [
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-Ht8nDOPZ",
						"slug": "test-2-xgmr",
						"title": "test--2",
						"sub_title": "sub title",
						"img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
						"body": "<h2>title</h2>\n<p></p>\n<blockquote>content</blockquote>\n<p></p>\n<p></p>\n<img src=\"https://fast.image.delivery/plnhwry.png\" alt=\"Image\" width=\"1000\" height=\"1000\" />",
						"created_at": "2026-02-11T03:21:49.623Z",
						"author": {
							"id": "7",
							"name": null,
							"avatar_url": null,
							"profile_bio": null,
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business"
						],
						"subcategory_names": [
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-BfAwtQ5a",
						"slug": "how-an-afghan-family-ende-7pt8",
						"title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
						"sub_title": "How an Afghan family ended up detained by ICE amid bureaucratic limbo",
						"img_url": "https://ichef.bbci.co.uk/ace/standard/3840/cpsprodpb/6652/live/5a034df0-88cb-11f0-85f1-5f1042c3058b.jpg",
						"body": "An Afghan family has been split by U.S. and Canadian immigration policies. After fleeing Afghanistan, some relatives reached Canada as legal refugees, while others are detained by ICE in the United States, stalled by Trump-era asylum policy changes. The detained members are eligible for asylum in Canada but cannot fly there without a visa, currently under review. Their U.S. attorney fears they could be deported to Afghanistan. Their Canadian lawyer is pressing to fast-track their entry, a case that raises whether Canada must assist people with established ties.",
						"created_at": "2026-02-09T07:54:12.642Z",
						"author": {
							"id": "6",
							"name": "dannyburger",
							"avatar_url": "https://xxx.png",
							"profile_bio": "xxx yyy",
							"role": "Authors"
						},
						"business_type_name": "News",
						"category_names": [],
						"subcategory_names": []
					},
					{
						"entry_id": "dtc-o0BNIyff",
						"slug": "women-leading-efforts-to--p0p5",
						"title": "Women leading efforts to protect India's snow leopards",
						"sub_title": "Women leading efforts to protect India's snow leopards",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png",
						"body": "In Himachal Pradesh’s Spiti Valley, around Kibber village, snow leopards work their way across a stark, high‑altitude cold desert strung along the Himalayan belt. Locals often call them the “ghosts of the mountains” for their silent passage across shattered rock, their presence sensed more than seen and their appearance a rare event.\n\nIn one of India’s most frigid and remote corners, a group of women has embraced an unexpected mission: safeguarding the snow leopard, among Asia’s most elusive and secretive big cats, in the very landscape where they grew up.\n\nClose to a dozen women from the area now collaborate with the Himachal Pradesh forest department and conservationists to monitor and shield the species, taking on an expanding part in conservation and earning recognition for their growing expertise.\n\nKnown locally as Shen, the cats lend their name to the women’s collective, “Shenmo.” Trained to place and check camera traps, they handle units marked with unique IDs and fitted with memory cards that automatically capture photographs as animals pass, allowing a non‑intrusive way to track movement.\n\nLocal coordinator Lobzang Yangchen, who works with a small group supported by the non-profit Nature Conservation Foundation (NCF) alongside the forest department, says that for years only men installed the cameras and the women kept asking why they could not do the same work as well.\n\nOn survey days, they rise before dawn, finish household tasks, and gather at a base camp, driving as far as rough tracks allow. From there they hike several kilometres to camera stations, often above 14,000ft (4,300m), where the thin air turns even simple steps into hard work and the cold stings exposed skin.\n\nGathering the data is grueling. Most fieldwork is scheduled for winter, when heavy snowfall drives snow leopards and their prey to lower elevations, concentrating their movements and making travel routes easier to trace across ridge lines and ravines.\n\nIn December, the BBC joined the team on one such climb. After hours of trudging through biting wind and cold, the women halted on a narrow ledge skirting a steep slope, eyes scanning the ground for signs.\n\nYangchen pointed to prints in the dust, saying the tracks showed a snow leopard had passed recently and that the pugmarks were fresh, a small but telling clue that the cat was in the vicinity.\n\nBesides pugmarks, they search for scrapes and scent‑mark sites at habitual stopping points, then carefully secure a camera to a rock beside the trail at a likely chokepoint used by the animals.\n\nOne member then performs a “walk test,” crawling along the path to ensure the camera’s height and angle will yield a clear frame should a snow leopard pass, adjusting the device until the field of view is just right.\n\nThe team moves on to older locations, pulling memory cards and swapping out batteries installed weeks before, a routine that keeps the network of cameras running through the long winter.\n\nBy mid‑afternoon they are back at camp, logging and analysing images with specialised software — tools many of them had never seen until recently — and filing the results so each image can be catalogued and later reviewed.\n\nChhering Lanzom says she studied only through grade five and at first was afraid to use a computer, but gradually learned to handle the keyboard and mouse, gaining confidence with each session.\n\nThe women entered the camera‑trapping programme in 2023. At the outset, conservation was not what drew them; winters in the Spiti Valley are long and quiet, with scant agricultural work to fall back on and few other opportunities.\n\nLobzang says the snow leopard work did not interest them at first; they signed up out of curiosity and because it offered a modest income at a time when seasonal jobs are scarce.\n\nThey now earn between 500 rupees ($5.46; £4) and 700 rupees per day, a small but dependable wage during months when money is often tight in the high-altitude villages.\n\nYet beyond pay, the effort has reshaped the community’s view of the cat, gradually changing long‑held perceptions and sparking conversations in homes across Kibber and neighbouring settlements.\n\nLocal resident Dolma Zangmo says that where once they regarded the snow leopard as an enemy for killing livestock, they now consider its conservation vital to the future of the valley.\n\nAlong with survey duties, the women help neighbours navigate government livestock insurance schemes and encourage predator‑proof corrals — stone or mesh pens that secure animals overnight and reduce losses to raids.\n\nTheir work coincides with wider recognition for the area: Spiti Valley has been added to the Cold Desert Biosphere Reserve, a Unesco‑recognised network designed to conserve fragile ecosystems while bolstering local livelihoods through careful stewardship.\n\nWith climate change altering the delicate trans‑Himalayan landscape, conservationists say such community participation will be essential to safeguard species like the snow leopard and the prey they depend on.\n\nDeepshikha Sharma, programme manager for NCF’s High Altitudes initiative, says conservation is more sustainable once communities are involved, because local stewardship endures beyond short projects.\n\nShe adds that the women are not merely assisting but are becoming practitioners of wildlife conservation and monitoring, building skills that can be passed to others in the villages.\n\nSnow leopards range across only 12 countries in Central and South Asia. India hosts one of the largest populations, with the country’s first comprehensive nationwide survey in 2023 estimating more than 700 animals, a baseline that is guiding future efforts.\n\nYangchen was among those who helped collect data for Himachal Pradesh’s 2024 snow leopard survey, which counted 83 animals in the state — up from 51 in 2021, indicating a clearer picture of where the cats persist.\n\nUsing camera traps deployed across nearly 26,000sq km (10,000sq miles), the survey recorded snow leopards and 43 other species. Individual cats were identified by the unique rosette patterns on their coats, a standard method for spotted big cats. The results are now informing broader conservation and habitat‑management planning.\n\nGoldy Chhabra, deputy conservator of forests with the Spiti Wildlife Division, says their contribution was crucial to identifying individual animals and linking sightings across sites.\n\nFor generations, the cats were viewed mainly as livestock raiders that threatened herds. But in Kibber and nearby villages, attitudes are shifting as people acknowledge the snow leopard’s place as a top predator and its role in sustaining the region’s fragile mountain ecosystem.\n\nThe women say the work also deepens their ties to their village, the people they live with, and the mountains that shaped them, giving them a stake in decisions about land and wildlife.\n\nLobzang says they were born there and know nothing else; at times they are afraid because snow leopards are predators, but this is where they belong and where they intend to keep working.",
						"created_at": "2026-02-06T09:22:46.229Z",
						"author": {
							"id": "43",
							"name": "Hannah Clark",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business",
							"Hardware"
						],
						"subcategory_names": [
							"Reports",
							"Funding",
							"Chips",
							"Military",
							"Drone"
						]
					},
					{
						"entry_id": "dtc-hT6ryo1k",
						"slug": "trump-says-it-would-be-gr-erxf",
						"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
						"sub_title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
						"img_url": "https://fast.image.delivery/venszwy.png",
						"body": "Donald Trump says he has informed Iran it must meet “two things” to avoid US military action, as Washington increases its forces in the Gulf.\n\n“Number one, no nuclear. And number two, stop killing protesters,” the US President said, asserting that “they are killing them by the thousands”.\n\n“We have a lot of very big, very powerful ships sailing to Iran right now, and it would be great if we didn’t have to use them.”\n\nHe delivered those remarks at the premiere of a documentary about his wife, Melania.\n\nThe comments follow weeks of pressure on Tehran to negotiate an agreement on its nuclear programme.\n\nEarlier in the week, Trump posted on Truth Social: “Hopefully Iran will quickly ‘Come to the Table’ and negotiate a fair and equitable deal - NO NUCLEAR WEAPONS.”\n\nHe further warned that a “massive Armada is heading to Iran”, saying it was “ready, willing, and able to rapidly fulfil its mission, with speed and violence, if necessary”.\n\nIran’s Foreign Minister Abbas Araghchi has said the armed forces stand “with their fingers on the trigger” to “immediately and powerfully respond” to any aggression.\n\nIn response, Araghchi said: “Iran has always welcomed a mutually beneficial, fair and equitable NUCLEAR DEAL - on equal footing, and free from coercion, threats, and intimidation - which ensures Iran’s rights to PEACEFUL nuclear technology, and guarantees NO NUCLEAR WEAPONS.”\n\n“Such weapons have no place in our security calculations and we have NEVER sought to acquire them,” he added.\n\nIran’s Deputy Foreign Minister Kazem Gharibabadi said there were no negotiations with the US under way, despite “exchanges of messages”.\n\nDemonstrations began in late December after a steep fall in the value of the Iranian currency, but quickly became a crisis of legitimacy for the country’s clerical leadership.\n\nResidents in Tehran told the BBC the crackdown on protesters was unlike anything they had seen before.\n\nEarlier this month, Trump said the US would come to the “rescue” of Iranian protesters if authorities resorted to violence.\n\nThough Trump initially promised that “help is on the way”, he later said he had been told on good authority that the execution of demonstrators had stopped.\n\nThe US-based Human Rights Activists News Agency (Hrana) says it has so far confirmed the killing of at least 6,479 people since the unrest began, including 6,092 protesters, 118 children and 214 people affiliated with the government.\n\nIt is also investigating approximately 17,000 more reported deaths.\n\nIranian authorities said last week that more than 3,100 people had been killed, but that most were security personnel or bystanders attacked by “rioters”.\n\nThe European Union has since added Iran’s Islamic Revolutionary Guard Corps (IRGC) to its terrorist list, and imposed new sanctions on six entities and 15 individuals in Iran.",
						"created_at": "2026-01-30T08:05:13.600Z",
						"author": {
							"id": "69",
							"name": "Jasmine Edwards",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Technology"
						],
						"subcategory_names": [
							"Energy (Nuclear, Grid, Sustainability)",
							"Drone",
							"New Releases",
							"Feature Updates"
						]
					}
				]
			},
			{
				"tag": "Business",
				"data": [
					{
						"entry_id": "dtc-sSQvblEN",
						"slug": "auther-create-cbe4",
						"title": "auther-create",
						"sub_title": "auther-create-sub",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772259334756-237830499.png",
						"body": "<p>auther-create </p>\n<p></p>\n<p>《ysgf》</p>\n<p></p>\n<p><b>加粗</b></p>\n<p></p>\n<img src=\"https://fast.image.delivery/bupiptu.jpg\" alt=\"Image\" />",
						"created_at": "2026-02-28T06:17:17.879Z",
						"author": {
							"id": "10",
							"name": "user_3AFND54bR76VDqSRibqerZZlGbg",
							"avatar_url": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQUZORDVNM0hpdmtnaFlObGhpMG5qWXJ3TjQifQ",
							"profile_bio": null,
							"role": "Authors"
						},
						"business_type_name": "News",
						"category_names": [
							"Business"
						],
						"subcategory_names": [
							"Enterprise Adoption",
							"Funding",
							"Press Release"
						]
					},
					{
						"entry_id": "dtc-gk6vgC1X",
						"slug": "test-111-5orb",
						"title": "test-111",
						"sub_title": "sub title",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1772260163333-336324806.png",
						"body": "<h2>title</h2>\n<p></p>\n<blockquote>content</blockquote>\n<p></p>\n<p></p>\n<img src=\"https://fast.image.delivery/plnhwry.png\" alt=\"Image\" width=\"1000\" height=\"1000\" />",
						"created_at": "2026-02-11T08:56:48.179Z",
						"author": {
							"id": "7",
							"name": null,
							"avatar_url": null,
							"profile_bio": null,
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business"
						],
						"subcategory_names": [
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-Ht8nDOPZ",
						"slug": "test-2-xgmr",
						"title": "test--2",
						"sub_title": "sub title",
						"img_url": "https://static-files.detake.com/Donald Trump names Kevin Warsh next Federal Reserve chair, replacing Jerome Powell-1770779981799-517157138.png",
						"body": "<h2>title</h2>\n<p></p>\n<blockquote>content</blockquote>\n<p></p>\n<p></p>\n<img src=\"https://fast.image.delivery/plnhwry.png\" alt=\"Image\" width=\"1000\" height=\"1000\" />",
						"created_at": "2026-02-11T03:21:49.623Z",
						"author": {
							"id": "7",
							"name": null,
							"avatar_url": null,
							"profile_bio": null,
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business"
						],
						"subcategory_names": [
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-o0BNIyff",
						"slug": "women-leading-efforts-to--p0p5",
						"title": "Women leading efforts to protect India's snow leopards",
						"sub_title": "Women leading efforts to protect India's snow leopards",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png",
						"body": "In Himachal Pradesh’s Spiti Valley, around Kibber village, snow leopards work their way across a stark, high‑altitude cold desert strung along the Himalayan belt. Locals often call them the “ghosts of the mountains” for their silent passage across shattered rock, their presence sensed more than seen and their appearance a rare event.\n\nIn one of India’s most frigid and remote corners, a group of women has embraced an unexpected mission: safeguarding the snow leopard, among Asia’s most elusive and secretive big cats, in the very landscape where they grew up.\n\nClose to a dozen women from the area now collaborate with the Himachal Pradesh forest department and conservationists to monitor and shield the species, taking on an expanding part in conservation and earning recognition for their growing expertise.\n\nKnown locally as Shen, the cats lend their name to the women’s collective, “Shenmo.” Trained to place and check camera traps, they handle units marked with unique IDs and fitted with memory cards that automatically capture photographs as animals pass, allowing a non‑intrusive way to track movement.\n\nLocal coordinator Lobzang Yangchen, who works with a small group supported by the non-profit Nature Conservation Foundation (NCF) alongside the forest department, says that for years only men installed the cameras and the women kept asking why they could not do the same work as well.\n\nOn survey days, they rise before dawn, finish household tasks, and gather at a base camp, driving as far as rough tracks allow. From there they hike several kilometres to camera stations, often above 14,000ft (4,300m), where the thin air turns even simple steps into hard work and the cold stings exposed skin.\n\nGathering the data is grueling. Most fieldwork is scheduled for winter, when heavy snowfall drives snow leopards and their prey to lower elevations, concentrating their movements and making travel routes easier to trace across ridge lines and ravines.\n\nIn December, the BBC joined the team on one such climb. After hours of trudging through biting wind and cold, the women halted on a narrow ledge skirting a steep slope, eyes scanning the ground for signs.\n\nYangchen pointed to prints in the dust, saying the tracks showed a snow leopard had passed recently and that the pugmarks were fresh, a small but telling clue that the cat was in the vicinity.\n\nBesides pugmarks, they search for scrapes and scent‑mark sites at habitual stopping points, then carefully secure a camera to a rock beside the trail at a likely chokepoint used by the animals.\n\nOne member then performs a “walk test,” crawling along the path to ensure the camera’s height and angle will yield a clear frame should a snow leopard pass, adjusting the device until the field of view is just right.\n\nThe team moves on to older locations, pulling memory cards and swapping out batteries installed weeks before, a routine that keeps the network of cameras running through the long winter.\n\nBy mid‑afternoon they are back at camp, logging and analysing images with specialised software — tools many of them had never seen until recently — and filing the results so each image can be catalogued and later reviewed.\n\nChhering Lanzom says she studied only through grade five and at first was afraid to use a computer, but gradually learned to handle the keyboard and mouse, gaining confidence with each session.\n\nThe women entered the camera‑trapping programme in 2023. At the outset, conservation was not what drew them; winters in the Spiti Valley are long and quiet, with scant agricultural work to fall back on and few other opportunities.\n\nLobzang says the snow leopard work did not interest them at first; they signed up out of curiosity and because it offered a modest income at a time when seasonal jobs are scarce.\n\nThey now earn between 500 rupees ($5.46; £4) and 700 rupees per day, a small but dependable wage during months when money is often tight in the high-altitude villages.\n\nYet beyond pay, the effort has reshaped the community’s view of the cat, gradually changing long‑held perceptions and sparking conversations in homes across Kibber and neighbouring settlements.\n\nLocal resident Dolma Zangmo says that where once they regarded the snow leopard as an enemy for killing livestock, they now consider its conservation vital to the future of the valley.\n\nAlong with survey duties, the women help neighbours navigate government livestock insurance schemes and encourage predator‑proof corrals — stone or mesh pens that secure animals overnight and reduce losses to raids.\n\nTheir work coincides with wider recognition for the area: Spiti Valley has been added to the Cold Desert Biosphere Reserve, a Unesco‑recognised network designed to conserve fragile ecosystems while bolstering local livelihoods through careful stewardship.\n\nWith climate change altering the delicate trans‑Himalayan landscape, conservationists say such community participation will be essential to safeguard species like the snow leopard and the prey they depend on.\n\nDeepshikha Sharma, programme manager for NCF’s High Altitudes initiative, says conservation is more sustainable once communities are involved, because local stewardship endures beyond short projects.\n\nShe adds that the women are not merely assisting but are becoming practitioners of wildlife conservation and monitoring, building skills that can be passed to others in the villages.\n\nSnow leopards range across only 12 countries in Central and South Asia. India hosts one of the largest populations, with the country’s first comprehensive nationwide survey in 2023 estimating more than 700 animals, a baseline that is guiding future efforts.\n\nYangchen was among those who helped collect data for Himachal Pradesh’s 2024 snow leopard survey, which counted 83 animals in the state — up from 51 in 2021, indicating a clearer picture of where the cats persist.\n\nUsing camera traps deployed across nearly 26,000sq km (10,000sq miles), the survey recorded snow leopards and 43 other species. Individual cats were identified by the unique rosette patterns on their coats, a standard method for spotted big cats. The results are now informing broader conservation and habitat‑management planning.\n\nGoldy Chhabra, deputy conservator of forests with the Spiti Wildlife Division, says their contribution was crucial to identifying individual animals and linking sightings across sites.\n\nFor generations, the cats were viewed mainly as livestock raiders that threatened herds. But in Kibber and nearby villages, attitudes are shifting as people acknowledge the snow leopard’s place as a top predator and its role in sustaining the region’s fragile mountain ecosystem.\n\nThe women say the work also deepens their ties to their village, the people they live with, and the mountains that shaped them, giving them a stake in decisions about land and wildlife.\n\nLobzang says they were born there and know nothing else; at times they are afraid because snow leopards are predators, but this is where they belong and where they intend to keep working.",
						"created_at": "2026-02-06T09:22:46.229Z",
						"author": {
							"id": "43",
							"name": "Hannah Clark",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business",
							"Hardware"
						],
						"subcategory_names": [
							"Reports",
							"Funding",
							"Chips",
							"Military",
							"Drone"
						]
					},
					{
						"entry_id": "dtc-dn9Wjxoc",
						"slug": "imran-khan-not-the-only-o-1vxt",
						"title": "Imran Khan not the only one silenced as Pakistan military suppresses dissent",
						"sub_title": "Imran Khan not the only one silenced as Pakistan military suppresses dissent",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/b6e6/live/9791ad00-fd6b-11f0-a8b8-bdd2c5f9bcad.jpg",
						"body": "Imran Khan, the imprisoned former prime minister of Pakistan, has not been allowed any visitors for more than five weeks, according to his party.\n\nHis relatives contend the restriction is designed to prevent his words from reaching the outside world, and they accuse the country’s military chief, Field Marshall Asim Munir, of being responsible. The government rejects that allegation, saying visits were halted because Khan breached prison rules that ban political discussion.\n\nKhan may be muted for now, but he is far from the only person under strain.\n\nAccording to voices from journalist, analysts and human rights advocates, the space for dissent against the state has narrowed and the risks have grown.\n\nJust last weekend, human rights lawyer Imaan Mazari and her husband were found guilty of sharing anti-state posts on social platforms.\n\nThey were each sentenced to 10 years in prison.\n\nBefore the verdicts were delivered, Amnesty International urged Pakistan to stop “coercive tactics used to silence dissent and intimidate those who defend human rights”.\n\nKhan’s family insists there is a deliberate effort to erase him from the public conversation.\n\n“There are two names you can't have on television. You can't say anything nice about Imran Khan, and you can't say anything bad about Asim Munir,” his sister, Aleema Khanum, told the BBC. She spoke at a recent rally by supporters a few kilometres from his cell at Rawalpindi’s Adiala jail.\n\nHis party says he has not seen a family member for more than eight weeks, and his most recent meeting with a lawyer was over five weeks ago—and lasted only eight minutes.\n\nAt the protest, Khanum said building public pressure is their only option right now to secure access. She argued that meeting his lawyers and family is his right and his only line of communication with the outside world.\n\nWhen it has happened, that communication has often been sharply critical of Pakistan’s government and the military chief. After jail meetings, statements attributed to Khan have frequently appeared on his X account, offering direction to his party and supporters.\n\n“They are unable to block his voice because people want to hear him, they read his messages, they are not giving up on him,” Khanum said.\n\nFor the moment, however, the halt to visits has also cut off those messages.\n\nBehind bars since August 2023, Khan has been convicted in several corruption cases that he says are politically motivated.\n\nOfficials in government and the military reject claims that he is kept in isolation. Interior minister Talal Chaudhry has called him “the most privileged prisoner in Pakistan,” saying he has gym equipment and a cook.\n\nAfter an X post appeared quoting Khan as calling Munir a “mentally unstable person,” the military spokesperson held a two-hour news conference, broadcast across Pakistan’s media, saying Khan had moved beyond politics and was a national security threat.\n\nMichael Kugelman, a senior fellow for South Asia at the Atlantic Council, says one could argue the military is steering the country on so many levels that Pakistan is edging close to authoritarian rule.\n\nHe added that repression is now at its worst point during any period of civilian rule.\n\nThe military—often dubbed “the establishment”—has long been a constant force in Pakistan’s politics, including during eras of military dictatorship.\n\nEarly in Khan’s tenure, he and the military appeared aligned; many believe its backing helped bring him to office, and at the time the opposition accused him of governing in thrall to the military. His party denied that.\n\nBy the time he was removed in a no-confidence vote in 2022, Khan had fallen out with the military leadership and blamed them for bringing down his government.\n\nIn November 2025, a constitutional amendment granted Munir lifetime immunity from prosecution and oversight of all Pakistan’s defence forces.\n\nMany viewed that as further evidence that the military’s influence under a civilian administration had reached a high-water mark.\n\nThe current government denies that the military is calling the shots.\n\n“The civilian government is [taking] decisions. We are all working hand in glove,” Chaudhry says, adding that the chief of defence forces “is doing a marvellous job”.\n\nSecurity sources said: “The military has always maintained it operates within legal bounds.”\n\nEven so, Kugelman and others see a link between the military’s reach into politics and the amount of space for expression.\n\nMunizae Jahangir, a journalist and co-chair of the Human Rights Council of Pakistan (HRCP), says it is intrinsically connected to the strength or weakness of a democratic government and to its relationship with the military.\n\n“If the military is more dominant, there will be less space for protest, there will be less space for dissent, there will be less space for free expression,” she said.\n\nAmong those already behind bars, Mazari is one of the most prominent. A lawyer known for taking on some of Pakistan’s most sensitive cases, she and her husband, Hadi Ali Chattha, were convicted of “disseminating and propagating narratives that align with hostile terrorist groups.”\n\nOfficials have defended the sentences; Pakistan’s information minister posted on X: “As you sow, so you shall reap!”\n\n“Attempts to frame law-breaking as democracy or human rights are entirely misplaced,” Chaudhry said.\n\nOther human rights advocates told the BBC they, too, have run up against restrictions in their work.\n\nHRCP says staff have been harassed over the phone and blocked from holding round-table discussions at hotels unless they secure prior permission. The government says these steps are “to ensure security”.\n\nThose in the journalist community also describe pressure. In 2023, the BBC reported that TV channels were told not to show Khan’s face or voice, or even say his name. According to journalist the BBC spoke to, the subjects deemed off-limits have grown.\n\n“They [Pakistan’s authorities] have controlled the mainstream media to a large extent,” said Geo TV reporter Azaz Syed. He added that even stories only loosely tied to the military—including one he recently did on a defence housing authority—have prompted calls from unknown numbers warning him not to proceed.\n\nJahangir says editors have directly instructed her not to cover particular stories.\n\n“The editors are not doing this for fun. They do fundamentally believe in freedom of expression. They are doing this in order to survive,” she said.\n\njournalists from other outlets, who spoke to the BBC on condition of anonymity, said a culture of self-censorship has become common in newsrooms.\n\n“There were times in the past when there was complete censorship,” one said. “Now there is self-censorship, which in many ways is worse because we are deceiving the audience.”\n\nThe BBC sought comment from the military.\n\nSecurity sources told the BBC that ISPR, the military’s communications arm, “does not regulate media content, freedom of speech, or interfere in civilian journalism, nor does it exercise any authority over public discourse beyond its lawful communication role”.\n\nDawn newspaper—the country’s oldest, founded in 1941 by Pakistan’s founding father, Muhammad Ali Jinnah—has suffered financially for its reporting. In December, Dawn Media Group said it faced an unannounced ban on government adverts: first on its newspaper, then on its TV and radio outlets. The Council of Newspaper Editors said the move was “financially crippling the organisation”.\n\n“While some within the state may think that punishing outlets that refuse to toe the line may snuff out critical voices, in the modern age this is next to impossible,” the editorial board said.\n\nInformation minister Atta Tarar denied that Dawn was denied government advertisement.\n\nSeveral journalists said changes to Pakistan’s Prevention of Electronic Crimes Act in early 2025 have made the environment more difficult.\n\nAuthorities introduced the amendments saying they were needed to counter what the military has often called “digital terrorism”: the spread of what they see as “anarchy and false information” to undermine the state. The country’s constitution protects freedom of speech and expression, subject to reasonable restrictions, security sources told the BBC.\n\n“It’s false to claim Pakistan suppresses free speech,” Chaudhry says. He cited the dangers of social media being used for financial fraud and for recruiting terrorists. “We want to regulate social media, the whole world is regulating [it].”\n\nCritics counter that these tools can limit a journalist’s ability to report.\n\n“Changes made to the law have now made it an explicit crime to criticise the security establishment, the judiciary and definitions around national interest have been made even more vague. There are astonishingly steep fines and the penalties have been enhanced disproportionately,” said Adnan Rehmat, a media analyst in Islamabad.\n\nHe added that beyond the official rules, unspoken lines also exist: “It’s really difficult to know what the boundaries are, they are forever shifting.”\n\nLimits on the press are not new in Pakistan. Under Khan’s government, journalist protested against restrictions on what they could publish and broadcast.\n\nSyed sees the current situation as a continuation of pressure against the media. Jahangir also sees a degree of historical consistency. “I can’t say this has been the worst time, but let’s say that times haven’t improved for us,” she said.\n\nAlthough efforts to constrain and intimidate critics are not new, some say the approach now looks different.\n\n“It feels like something has shifted,” said Azeema Cheema, an Islamabad-based research director who specialises in conflict, fragility and violence. “Because now you are using the courts. You are using institutions, not extra institutional measures.”\n\nThose working online from outside Pakistan are also in the authorities’ sights. In early January, seven Pakistani journalists and Youtubers, including two former army officers, were tried in absentia and handed life sentences for digital terrorism. Prosecutors accused them of “waging war against state” and “incitement” in connection with protests on 9 May 2023 after Khan’s first arrest.\n\nIn a post on X, one of those sentenced, Adil Raja, said “speaking truth to power is now called Digital Terrorism in Pakistan”.\n\nSyed and Cheema cite that case as a particularly stark example of severe punishment.\n\n“There’s been a growing realisation that the state is excessively willing and unapologetically willing to wield a blunt hammer,” Cheema said.\n\nWhere that hammer might fall next is what many of those we interviewed are trying to assess.\n\nAdditional reporting by Usman Zahid",
						"created_at": "2026-01-30T06:23:50.765Z",
						"author": {
							"id": "28",
							"name": "David Wilson",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=davidwilson",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Business"
						],
						"subcategory_names": [
							"Military",
							"Chips",
							"Energy (Nuclear, Grid, Sustainability)",
							"Reports",
							"Funding",
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-cImx19JI",
						"slug": "machine-capable-of-produc-zg2c",
						"title": "Machine capable of producing millions of illegal cigarettes seized in Sydney",
						"sub_title": "Machine capable of producing millions of illegal cigarettes seized in Sydney",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/01ce4672b1bfc6d24434725878ba1a53?impolicy=wcms_crop_resize&cropH=432&cropW=768&xPos=0&yPos=0&width=862&height=485",
						"body": "A machine capable of producing up to 3.6 million illicit cigarettes per day has been confiscated by the Australian Border Force (ABF) from a storage facility in north‑west Sydney. The industrial‑scale setup was found operating within a commercial storage environment, authorities said.\n\nDuring the operation at a Rouse Hill self‑storage unit last Thursday, officers also seized 7.53 kilograms of loose‑leaf tobacco, nearly 6,000 components for vaping devices, and eight large boxes believed to contain counterfeit tobacco packaging. The haul was discovered at the same location as the cigarette‑making machine.\n\nThe raid was coordinated by the ABF’s Illicit Tobacco Taskforce (ITTF), with support from the Australian Taxation Office, the Therapeutic Goods Administration and NSW Police. The multi‑agency team executed the action as part of ongoing efforts targeting illicit tobacco supply chains.\n\nNo arrests have been made following the discovery, and the ABF believes an organised crime syndicate was running the operation. Investigations are continuing to identify those responsible.\n\nITTF Acting Superintendent Samuel Harnden cautioned that every purchase of illicit tobacco directly bankrolls organised crime. He said the broader market for illegal cigarettes relies on consumers who seek cheaper products outside the legal system.\n\n“There are clear and established links between local illicit tobacco manufacturing in Australia and organised criminal syndicates,” he said. Harnden urged buyers to consider the criminal networks their money may be supporting.\n\nUniversity of New South Wales (UNSW) public health expert Becky Freeman said finding a cigarette‑making machine inside Australia was unusual. In her view, illicit tobacco in Australia is typically sourced elsewhere.\n\nShe said the discovery highlighted how rapidly the underground market is evolving. The find, she added, shows operators are adapting their methods to meet demand.\n\n“The majority of these products are imported into Australia — they’re manufactured in our region and then imported into Australia and sold,” she said. She noted this import‑driven model has dominated the illicit supply.\n\nPost-COVID phenomenon\n\nProfessor Freeman said Australia is oversupplied with cheap illicit tobacco products and that authorities are struggling to keep up. She described the scale of the market as overwhelming enforcement capacity.\n\n“It’s a post‑COVID phenomenon. There are more cigarettes here than can be smoked or used by anybody,” she said. The glut, she argued, is fuelling street‑level availability.\n\nViolent criminal market\n\nThe underground trade is one of the country’s fastest‑growing and most violent criminal markets, according to recent reports by the Australian Criminal Intelligence Commission and the Australian Institute of Criminology. Those assessments link the illicit tobacco economy to broader organised activity.\n\nReleased in November, the research estimated illicit tobacco cost $4 billion in 2023‑24 through lost tax revenue and healthcare costs. The figure underscored the fiscal and health impacts of the black market.\n\nIn the same month, the NSW government passed legislation making it easier for NSW Health to order retailers to shut down for 90 days if caught selling illegal tobacco. The measure was designed to give regulators stronger tools to disrupt sales.\n\nSince then, more than 50 tobacco retailers have been temporarily closed across the state. Authorities say the closures reflect stepped‑up enforcement under the new powers.\n\nLast year, NSW Premier Chris Minns urged the federal government to reduce the tobacco excise, which was first introduced in 2010 to reduce smoking rates. He renewed concerns about the affordability gap between legal and illegal products.\n\nAt the time, the premier argued the high cost of legal tobacco was pushing smokers to buy black market cigarettes, but Federal Treasurer Jim Chalmers disagreed and declined to make the changes. The federal position remained that excise settings should not be adjusted.\n\nProfessor Freeman urged the Commonwealth and state governments to stop blaming each other and instead back multi‑agency raids and investigations such as the Rouse Hill operation. She said cooperative enforcement is the most effective way to disrupt supply.\n\n“A cigarette costs about one Australian cent to make, and criminal syndicates have figured out how to sell these products in broad daylight, so the key solution to me is to shut down those shops,” she said. Shuttering points of sale, she added, would cut off the most visible distribution channels.",
						"created_at": "2026-01-30T04:17:03.539Z",
						"author": {
							"id": "58",
							"name": "Kevin Adams",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business",
							"Technology"
						],
						"subcategory_names": [
							"Press Release",
							"Funding",
							"Models",
							"Agents"
						]
					}
				]
			},
			{
				"tag": "Hardware",
				"data": [
					{
						"entry_id": "dtc-o0BNIyff",
						"slug": "women-leading-efforts-to--p0p5",
						"title": "Women leading efforts to protect India's snow leopards",
						"sub_title": "Women leading efforts to protect India's snow leopards",
						"img_url": "https://static-files.detake.com/Women leading efforts to protect India's snow leopards-1771905919637-349626804.png",
						"body": "In Himachal Pradesh’s Spiti Valley, around Kibber village, snow leopards work their way across a stark, high‑altitude cold desert strung along the Himalayan belt. Locals often call them the “ghosts of the mountains” for their silent passage across shattered rock, their presence sensed more than seen and their appearance a rare event.\n\nIn one of India’s most frigid and remote corners, a group of women has embraced an unexpected mission: safeguarding the snow leopard, among Asia’s most elusive and secretive big cats, in the very landscape where they grew up.\n\nClose to a dozen women from the area now collaborate with the Himachal Pradesh forest department and conservationists to monitor and shield the species, taking on an expanding part in conservation and earning recognition for their growing expertise.\n\nKnown locally as Shen, the cats lend their name to the women’s collective, “Shenmo.” Trained to place and check camera traps, they handle units marked with unique IDs and fitted with memory cards that automatically capture photographs as animals pass, allowing a non‑intrusive way to track movement.\n\nLocal coordinator Lobzang Yangchen, who works with a small group supported by the non-profit Nature Conservation Foundation (NCF) alongside the forest department, says that for years only men installed the cameras and the women kept asking why they could not do the same work as well.\n\nOn survey days, they rise before dawn, finish household tasks, and gather at a base camp, driving as far as rough tracks allow. From there they hike several kilometres to camera stations, often above 14,000ft (4,300m), where the thin air turns even simple steps into hard work and the cold stings exposed skin.\n\nGathering the data is grueling. Most fieldwork is scheduled for winter, when heavy snowfall drives snow leopards and their prey to lower elevations, concentrating their movements and making travel routes easier to trace across ridge lines and ravines.\n\nIn December, the BBC joined the team on one such climb. After hours of trudging through biting wind and cold, the women halted on a narrow ledge skirting a steep slope, eyes scanning the ground for signs.\n\nYangchen pointed to prints in the dust, saying the tracks showed a snow leopard had passed recently and that the pugmarks were fresh, a small but telling clue that the cat was in the vicinity.\n\nBesides pugmarks, they search for scrapes and scent‑mark sites at habitual stopping points, then carefully secure a camera to a rock beside the trail at a likely chokepoint used by the animals.\n\nOne member then performs a “walk test,” crawling along the path to ensure the camera’s height and angle will yield a clear frame should a snow leopard pass, adjusting the device until the field of view is just right.\n\nThe team moves on to older locations, pulling memory cards and swapping out batteries installed weeks before, a routine that keeps the network of cameras running through the long winter.\n\nBy mid‑afternoon they are back at camp, logging and analysing images with specialised software — tools many of them had never seen until recently — and filing the results so each image can be catalogued and later reviewed.\n\nChhering Lanzom says she studied only through grade five and at first was afraid to use a computer, but gradually learned to handle the keyboard and mouse, gaining confidence with each session.\n\nThe women entered the camera‑trapping programme in 2023. At the outset, conservation was not what drew them; winters in the Spiti Valley are long and quiet, with scant agricultural work to fall back on and few other opportunities.\n\nLobzang says the snow leopard work did not interest them at first; they signed up out of curiosity and because it offered a modest income at a time when seasonal jobs are scarce.\n\nThey now earn between 500 rupees ($5.46; £4) and 700 rupees per day, a small but dependable wage during months when money is often tight in the high-altitude villages.\n\nYet beyond pay, the effort has reshaped the community’s view of the cat, gradually changing long‑held perceptions and sparking conversations in homes across Kibber and neighbouring settlements.\n\nLocal resident Dolma Zangmo says that where once they regarded the snow leopard as an enemy for killing livestock, they now consider its conservation vital to the future of the valley.\n\nAlong with survey duties, the women help neighbours navigate government livestock insurance schemes and encourage predator‑proof corrals — stone or mesh pens that secure animals overnight and reduce losses to raids.\n\nTheir work coincides with wider recognition for the area: Spiti Valley has been added to the Cold Desert Biosphere Reserve, a Unesco‑recognised network designed to conserve fragile ecosystems while bolstering local livelihoods through careful stewardship.\n\nWith climate change altering the delicate trans‑Himalayan landscape, conservationists say such community participation will be essential to safeguard species like the snow leopard and the prey they depend on.\n\nDeepshikha Sharma, programme manager for NCF’s High Altitudes initiative, says conservation is more sustainable once communities are involved, because local stewardship endures beyond short projects.\n\nShe adds that the women are not merely assisting but are becoming practitioners of wildlife conservation and monitoring, building skills that can be passed to others in the villages.\n\nSnow leopards range across only 12 countries in Central and South Asia. India hosts one of the largest populations, with the country’s first comprehensive nationwide survey in 2023 estimating more than 700 animals, a baseline that is guiding future efforts.\n\nYangchen was among those who helped collect data for Himachal Pradesh’s 2024 snow leopard survey, which counted 83 animals in the state — up from 51 in 2021, indicating a clearer picture of where the cats persist.\n\nUsing camera traps deployed across nearly 26,000sq km (10,000sq miles), the survey recorded snow leopards and 43 other species. Individual cats were identified by the unique rosette patterns on their coats, a standard method for spotted big cats. The results are now informing broader conservation and habitat‑management planning.\n\nGoldy Chhabra, deputy conservator of forests with the Spiti Wildlife Division, says their contribution was crucial to identifying individual animals and linking sightings across sites.\n\nFor generations, the cats were viewed mainly as livestock raiders that threatened herds. But in Kibber and nearby villages, attitudes are shifting as people acknowledge the snow leopard’s place as a top predator and its role in sustaining the region’s fragile mountain ecosystem.\n\nThe women say the work also deepens their ties to their village, the people they live with, and the mountains that shaped them, giving them a stake in decisions about land and wildlife.\n\nLobzang says they were born there and know nothing else; at times they are afraid because snow leopards are predators, but this is where they belong and where they intend to keep working.",
						"created_at": "2026-02-06T09:22:46.229Z",
						"author": {
							"id": "43",
							"name": "Hannah Clark",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business",
							"Hardware"
						],
						"subcategory_names": [
							"Reports",
							"Funding",
							"Chips",
							"Military",
							"Drone"
						]
					},
					{
						"entry_id": "dtc-hT6ryo1k",
						"slug": "trump-says-it-would-be-gr-erxf",
						"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
						"sub_title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
						"img_url": "https://fast.image.delivery/venszwy.png",
						"body": "Donald Trump says he has informed Iran it must meet “two things” to avoid US military action, as Washington increases its forces in the Gulf.\n\n“Number one, no nuclear. And number two, stop killing protesters,” the US President said, asserting that “they are killing them by the thousands”.\n\n“We have a lot of very big, very powerful ships sailing to Iran right now, and it would be great if we didn’t have to use them.”\n\nHe delivered those remarks at the premiere of a documentary about his wife, Melania.\n\nThe comments follow weeks of pressure on Tehran to negotiate an agreement on its nuclear programme.\n\nEarlier in the week, Trump posted on Truth Social: “Hopefully Iran will quickly ‘Come to the Table’ and negotiate a fair and equitable deal - NO NUCLEAR WEAPONS.”\n\nHe further warned that a “massive Armada is heading to Iran”, saying it was “ready, willing, and able to rapidly fulfil its mission, with speed and violence, if necessary”.\n\nIran’s Foreign Minister Abbas Araghchi has said the armed forces stand “with their fingers on the trigger” to “immediately and powerfully respond” to any aggression.\n\nIn response, Araghchi said: “Iran has always welcomed a mutually beneficial, fair and equitable NUCLEAR DEAL - on equal footing, and free from coercion, threats, and intimidation - which ensures Iran’s rights to PEACEFUL nuclear technology, and guarantees NO NUCLEAR WEAPONS.”\n\n“Such weapons have no place in our security calculations and we have NEVER sought to acquire them,” he added.\n\nIran’s Deputy Foreign Minister Kazem Gharibabadi said there were no negotiations with the US under way, despite “exchanges of messages”.\n\nDemonstrations began in late December after a steep fall in the value of the Iranian currency, but quickly became a crisis of legitimacy for the country’s clerical leadership.\n\nResidents in Tehran told the BBC the crackdown on protesters was unlike anything they had seen before.\n\nEarlier this month, Trump said the US would come to the “rescue” of Iranian protesters if authorities resorted to violence.\n\nThough Trump initially promised that “help is on the way”, he later said he had been told on good authority that the execution of demonstrators had stopped.\n\nThe US-based Human Rights Activists News Agency (Hrana) says it has so far confirmed the killing of at least 6,479 people since the unrest began, including 6,092 protesters, 118 children and 214 people affiliated with the government.\n\nIt is also investigating approximately 17,000 more reported deaths.\n\nIranian authorities said last week that more than 3,100 people had been killed, but that most were security personnel or bystanders attacked by “rioters”.\n\nThe European Union has since added Iran’s Islamic Revolutionary Guard Corps (IRGC) to its terrorist list, and imposed new sanctions on six entities and 15 individuals in Iran.",
						"created_at": "2026-01-30T08:05:13.600Z",
						"author": {
							"id": "69",
							"name": "Jasmine Edwards",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Technology"
						],
						"subcategory_names": [
							"Energy (Nuclear, Grid, Sustainability)",
							"Drone",
							"New Releases",
							"Feature Updates"
						]
					},
					{
						"entry_id": "dtc-dn9Wjxoc",
						"slug": "imran-khan-not-the-only-o-1vxt",
						"title": "Imran Khan not the only one silenced as Pakistan military suppresses dissent",
						"sub_title": "Imran Khan not the only one silenced as Pakistan military suppresses dissent",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/b6e6/live/9791ad00-fd6b-11f0-a8b8-bdd2c5f9bcad.jpg",
						"body": "Imran Khan, the imprisoned former prime minister of Pakistan, has not been allowed any visitors for more than five weeks, according to his party.\n\nHis relatives contend the restriction is designed to prevent his words from reaching the outside world, and they accuse the country’s military chief, Field Marshall Asim Munir, of being responsible. The government rejects that allegation, saying visits were halted because Khan breached prison rules that ban political discussion.\n\nKhan may be muted for now, but he is far from the only person under strain.\n\nAccording to voices from journalist, analysts and human rights advocates, the space for dissent against the state has narrowed and the risks have grown.\n\nJust last weekend, human rights lawyer Imaan Mazari and her husband were found guilty of sharing anti-state posts on social platforms.\n\nThey were each sentenced to 10 years in prison.\n\nBefore the verdicts were delivered, Amnesty International urged Pakistan to stop “coercive tactics used to silence dissent and intimidate those who defend human rights”.\n\nKhan’s family insists there is a deliberate effort to erase him from the public conversation.\n\n“There are two names you can't have on television. You can't say anything nice about Imran Khan, and you can't say anything bad about Asim Munir,” his sister, Aleema Khanum, told the BBC. She spoke at a recent rally by supporters a few kilometres from his cell at Rawalpindi’s Adiala jail.\n\nHis party says he has not seen a family member for more than eight weeks, and his most recent meeting with a lawyer was over five weeks ago—and lasted only eight minutes.\n\nAt the protest, Khanum said building public pressure is their only option right now to secure access. She argued that meeting his lawyers and family is his right and his only line of communication with the outside world.\n\nWhen it has happened, that communication has often been sharply critical of Pakistan’s government and the military chief. After jail meetings, statements attributed to Khan have frequently appeared on his X account, offering direction to his party and supporters.\n\n“They are unable to block his voice because people want to hear him, they read his messages, they are not giving up on him,” Khanum said.\n\nFor the moment, however, the halt to visits has also cut off those messages.\n\nBehind bars since August 2023, Khan has been convicted in several corruption cases that he says are politically motivated.\n\nOfficials in government and the military reject claims that he is kept in isolation. Interior minister Talal Chaudhry has called him “the most privileged prisoner in Pakistan,” saying he has gym equipment and a cook.\n\nAfter an X post appeared quoting Khan as calling Munir a “mentally unstable person,” the military spokesperson held a two-hour news conference, broadcast across Pakistan’s media, saying Khan had moved beyond politics and was a national security threat.\n\nMichael Kugelman, a senior fellow for South Asia at the Atlantic Council, says one could argue the military is steering the country on so many levels that Pakistan is edging close to authoritarian rule.\n\nHe added that repression is now at its worst point during any period of civilian rule.\n\nThe military—often dubbed “the establishment”—has long been a constant force in Pakistan’s politics, including during eras of military dictatorship.\n\nEarly in Khan’s tenure, he and the military appeared aligned; many believe its backing helped bring him to office, and at the time the opposition accused him of governing in thrall to the military. His party denied that.\n\nBy the time he was removed in a no-confidence vote in 2022, Khan had fallen out with the military leadership and blamed them for bringing down his government.\n\nIn November 2025, a constitutional amendment granted Munir lifetime immunity from prosecution and oversight of all Pakistan’s defence forces.\n\nMany viewed that as further evidence that the military’s influence under a civilian administration had reached a high-water mark.\n\nThe current government denies that the military is calling the shots.\n\n“The civilian government is [taking] decisions. We are all working hand in glove,” Chaudhry says, adding that the chief of defence forces “is doing a marvellous job”.\n\nSecurity sources said: “The military has always maintained it operates within legal bounds.”\n\nEven so, Kugelman and others see a link between the military’s reach into politics and the amount of space for expression.\n\nMunizae Jahangir, a journalist and co-chair of the Human Rights Council of Pakistan (HRCP), says it is intrinsically connected to the strength or weakness of a democratic government and to its relationship with the military.\n\n“If the military is more dominant, there will be less space for protest, there will be less space for dissent, there will be less space for free expression,” she said.\n\nAmong those already behind bars, Mazari is one of the most prominent. A lawyer known for taking on some of Pakistan’s most sensitive cases, she and her husband, Hadi Ali Chattha, were convicted of “disseminating and propagating narratives that align with hostile terrorist groups.”\n\nOfficials have defended the sentences; Pakistan’s information minister posted on X: “As you sow, so you shall reap!”\n\n“Attempts to frame law-breaking as democracy or human rights are entirely misplaced,” Chaudhry said.\n\nOther human rights advocates told the BBC they, too, have run up against restrictions in their work.\n\nHRCP says staff have been harassed over the phone and blocked from holding round-table discussions at hotels unless they secure prior permission. The government says these steps are “to ensure security”.\n\nThose in the journalist community also describe pressure. In 2023, the BBC reported that TV channels were told not to show Khan’s face or voice, or even say his name. According to journalist the BBC spoke to, the subjects deemed off-limits have grown.\n\n“They [Pakistan’s authorities] have controlled the mainstream media to a large extent,” said Geo TV reporter Azaz Syed. He added that even stories only loosely tied to the military—including one he recently did on a defence housing authority—have prompted calls from unknown numbers warning him not to proceed.\n\nJahangir says editors have directly instructed her not to cover particular stories.\n\n“The editors are not doing this for fun. They do fundamentally believe in freedom of expression. They are doing this in order to survive,” she said.\n\njournalists from other outlets, who spoke to the BBC on condition of anonymity, said a culture of self-censorship has become common in newsrooms.\n\n“There were times in the past when there was complete censorship,” one said. “Now there is self-censorship, which in many ways is worse because we are deceiving the audience.”\n\nThe BBC sought comment from the military.\n\nSecurity sources told the BBC that ISPR, the military’s communications arm, “does not regulate media content, freedom of speech, or interfere in civilian journalism, nor does it exercise any authority over public discourse beyond its lawful communication role”.\n\nDawn newspaper—the country’s oldest, founded in 1941 by Pakistan’s founding father, Muhammad Ali Jinnah—has suffered financially for its reporting. In December, Dawn Media Group said it faced an unannounced ban on government adverts: first on its newspaper, then on its TV and radio outlets. The Council of Newspaper Editors said the move was “financially crippling the organisation”.\n\n“While some within the state may think that punishing outlets that refuse to toe the line may snuff out critical voices, in the modern age this is next to impossible,” the editorial board said.\n\nInformation minister Atta Tarar denied that Dawn was denied government advertisement.\n\nSeveral journalists said changes to Pakistan’s Prevention of Electronic Crimes Act in early 2025 have made the environment more difficult.\n\nAuthorities introduced the amendments saying they were needed to counter what the military has often called “digital terrorism”: the spread of what they see as “anarchy and false information” to undermine the state. The country’s constitution protects freedom of speech and expression, subject to reasonable restrictions, security sources told the BBC.\n\n“It’s false to claim Pakistan suppresses free speech,” Chaudhry says. He cited the dangers of social media being used for financial fraud and for recruiting terrorists. “We want to regulate social media, the whole world is regulating [it].”\n\nCritics counter that these tools can limit a journalist’s ability to report.\n\n“Changes made to the law have now made it an explicit crime to criticise the security establishment, the judiciary and definitions around national interest have been made even more vague. There are astonishingly steep fines and the penalties have been enhanced disproportionately,” said Adnan Rehmat, a media analyst in Islamabad.\n\nHe added that beyond the official rules, unspoken lines also exist: “It’s really difficult to know what the boundaries are, they are forever shifting.”\n\nLimits on the press are not new in Pakistan. Under Khan’s government, journalist protested against restrictions on what they could publish and broadcast.\n\nSyed sees the current situation as a continuation of pressure against the media. Jahangir also sees a degree of historical consistency. “I can’t say this has been the worst time, but let’s say that times haven’t improved for us,” she said.\n\nAlthough efforts to constrain and intimidate critics are not new, some say the approach now looks different.\n\n“It feels like something has shifted,” said Azeema Cheema, an Islamabad-based research director who specialises in conflict, fragility and violence. “Because now you are using the courts. You are using institutions, not extra institutional measures.”\n\nThose working online from outside Pakistan are also in the authorities’ sights. In early January, seven Pakistani journalists and Youtubers, including two former army officers, were tried in absentia and handed life sentences for digital terrorism. Prosecutors accused them of “waging war against state” and “incitement” in connection with protests on 9 May 2023 after Khan’s first arrest.\n\nIn a post on X, one of those sentenced, Adil Raja, said “speaking truth to power is now called Digital Terrorism in Pakistan”.\n\nSyed and Cheema cite that case as a particularly stark example of severe punishment.\n\n“There’s been a growing realisation that the state is excessively willing and unapologetically willing to wield a blunt hammer,” Cheema said.\n\nWhere that hammer might fall next is what many of those we interviewed are trying to assess.\n\nAdditional reporting by Usman Zahid",
						"created_at": "2026-01-30T06:23:50.765Z",
						"author": {
							"id": "28",
							"name": "David Wilson",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=davidwilson",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Business"
						],
						"subcategory_names": [
							"Military",
							"Chips",
							"Energy (Nuclear, Grid, Sustainability)",
							"Reports",
							"Funding",
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-WmgEq7Ar",
						"slug": "government-secures-last-m-k8l3",
						"title": "Government secures last-minute hospital funding agreement with the states",
						"sub_title": "Government secures last-minute hospital funding agreement with the states",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/ba3130f6dc637f098433b2a76c5efa07?impolicy=wcms_crop_resize&cropH=2436&cropW=4330&xPos=0&yPos=100&width=862&height=485",
						"body": "Facing intensifying demands from the states, Prime Minister Anthony Albanese pledged an additional $25 billion for the public hospital system, a move intended to end a months‑long stalemate over funding and draw a line under a bitter dispute.\n\nNational leaders met in Sydney for a national cabinet meeting on Friday morning and, after protracted talks, reached a deal for a new five‑year funding agreement for public hospital care across the country.\n\nAlbanese said the extra $25 billion forms part of almost $220 billion in record Commonwealth support to the states over the next five years, a total he cast as unprecedented in scale.\n\nHe said they had struck a landmark agreement that would deliver record funding to state and territory hospital services while also safeguarding the future of the National Disability Insurance Scheme.\n\nHe characterized the agreement as among the most significant national reforms in living memory, saying it would ensure Australians continue to access world‑class healthcare alongside disability support for years to come.\n\nUnder an agreement negotiated by national cabinet in 2023, the federal government committed to lift its share of public hospital funding to 42.5 per cent by 2030 and to 45 per cent by 2035, setting a new trajectory for the Commonwealth’s contribution.\n\nIn return, states and territories agreed to provide some disability services outside the NDIS, including Thriving Kids, a program for children with mild to moderate developmental delay and autism.\n\nThe Health Minister, Mark Butler, said today that the start date — originally set for July 1 — may be delayed “by several months” after states and territories sought more time to prepare for the shift.\n\nAfter the meeting, Albanese said the scheme would begin “this year,” with the aim of becoming fully operational within two years, signalling a phased rollout rather than an immediate switch.\n\nHe said the states had proposed a brief delay to full implementation of Thriving Kids, but confirmed the program would start this year and be fully in place by 1 January 2028.\n\nAlbanese said the Commonwealth accepted that proposal as a reasonable step to ensure it is done properly, calling it a positive move designed to get the settings right.\n\nThe government also reiterated that families currently on the NDIS would remain within the scheme until Thriving Kids is rolled out, to ensure continuity of support during the transition.\n\nHe added that national cabinet agreed to work towards an annual growth target of six per cent or less, down from the existing target of eight per cent.\n\nNicole Rogerson, CEO of Autism Awareness Australia, said the protracted negotiations had unsettled the autism community, which was anxious about what the proposed changes would ultimately mean for them.\n\nShe said “everybody needs to put on their big boy pants, and get on with it,” expressing frustration at the protracted talks.\n\nAccording to Rogerson, the autism community is “so over this,” describing the process as akin to a rush to act followed by inaction — “hurry up, and then do nothing.”\n\nShe said she had warned in 2023 that tying the two issues together was problematic and that, even now, the situation remained deeply frustrating for families.\n\nGrowth cap remained another sticking point in the talks.\n\nAnother source of tension has been how much growth in public hospital activity the Commonwealth will fund, currently capped at 6.5 per cent a year.\n\nIn 2023, national cabinet agreed to replace that with a “more generous” model, and under the current offer the cap would be 10.25 per cent in the first year before settling at 8 per cent in the medium term.\n\nTensions remained high throughout the extended stoush.\n\nFor months, the Albanese government has been locked in strained, protracted talks on the next five‑year public hospital funding agreement, with the ABC revealing the Prime Minister wrote to premiers and chief ministers in September urging them to rein in hospital spending growth if they wanted a funding commitment made more than two years ago implemented.\n\nThere was also a push to finalise the deal before Friday’s meeting, with the South Australian government entering caretaker mode from February 21 ahead of the state election, narrowing the window for signing.\n\nOn Thursday, the Health Minister conceded that if an agreement was not secured by then, striking a deal before the one‑year interim funding agreement expires in June would be difficult, underscoring the tight timetable.\n\nTensions also flared before Christmas, when the Prime Minister was branded a “grinch” after adding $1 billion to the Commonwealth’s existing offer to lift its contribution by $20 billion over five years.\n\nThat offer included a further sweetener: an additional $2 billion over four years to address the increasingly political problem of aged care patients stuck in public hospital beds.\n\nThese patients are medically fit to leave but remain in hospital while waiting for a federally funded residential aged care bed.",
						"created_at": "2026-01-30T04:20:23.282Z",
						"author": {
							"id": "58",
							"name": "Kevin Adams",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Policy",
							"Hardware"
						],
						"subcategory_names": [
							"Geopolitics",
							"Safety & Ethics",
							"Regulation",
							"Robotics",
							"Drone"
						]
					},
					{
						"entry_id": "dtc-tbwoTD1g",
						"slug": "agents-could-be-pulled-ba-sgj8",
						"title": "Agents could be pulled back in Minneapolis if local officials cooperate, border tsar says",
						"sub_title": "Agents could be pulled back in Minneapolis if local officials cooperate, border tsar says",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/36e9/live/b45d5c70-fd4a-11f0-b028-cf183ca533c1.jpg",
						"body": "The Trump administration signaled it may seek to \"draw down\" the federal presence in Minnesota if local officials cooperate, following the fatal shootings of two U.S. citizens in the state.\n\nAt a press conference in Minneapolis, White House Border Tsar Tom Homan pledged to continue the immigration enforcement mission but said he wants “common sense cooperation that allows us to draw down on the number of people we have here.”\n\n“We are not surrendering our mission at all. We’re just doing it smarter,” Homan said.\n\nHoman added: “President Trump wants this fixed, and I’m going to fix it.”\n\nHow many federal personnel might leave the city, or when, was not made clear, prompting fresh questions about the extent of any pullback after the president said he was seeking to “de-escalate” in Minneapolis.\n\nThe deaths of Renee Good and Alex Pretti have sparked protests in Minneapolis, fueled national outcry, and prompted criticism from lawmakers.\n\nThe killings of Good and Pretti by agents enforcing Trump’s immigration crackdown this month have drawn demonstrations in Minneapolis, anger across the U.S., and bipartisan calls for the removal of some administration officials.\n\nMinnesota Governor Tim Walz and Minneapolis Mayor Jacob Frey have urged a full withdrawal of federal agents from the state’s capital region. The state has also asked a federal judge to halt “Operation Metro Surge,” which involves about 3,000 immigration, border patrol and other Department of Homeland Security (DHS) officers.\n\nIn the hours after Pretti was killed on Saturday, Walz spoke with the White House twice; since then, he and Frey, both Democrats, have had phone conversations with Trump.\n\nHoman said Thursday that any adjustments to the operation would depend on how much state and local officials cooperate with federal authorities, adding that the administration disagrees with some of Frey and Walz’s demands, without specifying which.\n\nThe administration has, in turn, castigated local leaders, saying they should collaborate with federal officers and agents, and criticized Minneapolis for maintaining a “sanctuary city policy” that prevents city employees from enforcing immigration laws.\n\nOverall, Homan offered few specifics about what changes the administration might entertain. He said the federal operation in Minneapolis would become more “targeted,” but did not elaborate.\n\nEven as he promised to “fix” the situation in Minneapolis, Homan defended the administration’s immigration enforcement, arguing that tougher border security and focusing on undocumented immigrants for deportation have made the country safer.\n\nIn Trump’s first year back in office, US Immigration and Customs Enforcement (ICE), a component of DHS, carried out more than 480,000 deportations, according to an agency document obtained by the BBC’s US partner CBS News.\n\nThat figure surpasses the previous high of 410,000 recorded in 2012, when former President Barack Obama was in office. According to the document, DHS is currently holding more than 75,000 people in detention.\n\nOver the past year, Trump has deployed federal agents and the National Guard to major U.S. cities to fulfill his campaign promise to crack down on illegal immigration. Those deployments have faced protests and legal challenges in Democrat-led cities including Portland, Los Angeles and Chicago.\n\nAfter frustration over the handling of Good and Pretti’s deaths appeared to reach a boiling point—both in Minneapolis and on Capitol Hill—Trump sent Homan to the city this week to take charge of the operation, sidelining Border Patrol chief Gregory Bovino, who had also led crackdowns in Chicago and other cities.\n\nWhether Homan’s comments Thursday will satisfy lawmakers in Washington remains unclear.\n\nSeveral House and Senate Republicans have called for investigations into the shootings of Good and Pretti.\n\nSenate Democrats have threatened a partial government shutdown if a spending package includes new DHS funding.\n\nOn Thursday, seven Senate Republicans joined Democrats to block a procedural vote on the spending bill. Senate leaders and the White House then worked on a deal to remove DHS funding from the package, enabling the government to finance other agencies and giving both sides more time to negotiate a separate DHS spending plan.\n\n“Republicans and Democrats in Congress have come together to get the vast majority of the Government funded until September, while at the same time providing an extension to the Department of Homeland Security,” Trump wrote on social media.\n\nSenate Democrats want any DHS funding bill to limit the tactics ICE uses in the field, specifically urging agents to stop wearing masks and to cease searches and arrests without a judge’s warrant. In a memo released earlier this month, ICE authorized its agents to conduct warrantless searches.\n\n“This is a moment of truth,” Senate Minority Leader Chuck Schumer said in a floor speech Thursday. “What ICE is doing, outside the law, is state-sanctioned thuggery and it must stop.”\n\nTrump said during a cabinet meeting on Thursday that the White House was working with Democrats to avoid a shutdown.\n\nSpeaking at a conference for mayors in Washington on Thursday, Frey continued to press for an end to the federal operation in his city. He also visited Capitol Hill.\n\nFrey said there were 3,000 to 4,000 federal forces in Minneapolis, vastly outnumbering the city’s roughly 600 local police officers. Asked Thursday for an updated figure, Homan did not confirm how many federal forces were present.\n\n“People have been indiscriminately pulled off the street,” Frey said. “American citizens have been yanked away from their homes after that, solely because they look like they are from Mexico or Ecuador or Somalia.”\n\nHe added: “That’s not how we operate in America.”",
						"created_at": "2026-01-30T01:59:24.925Z",
						"author": {
							"id": "63",
							"name": "Sierra Roberts",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=sierraroberts",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Technology"
						],
						"subcategory_names": [
							"Drone",
							"Robotics",
							"Feature Updates",
							"New Releases",
							"Models"
						]
					},
					{
						"entry_id": "dtc-v4kyDwfJ",
						"slug": "israeli-media-report-an-o-rban",
						"title": "Israeli media report an official accepts Hamas estimate of 70,000 war dead",
						"sub_title": "Israeli media report an official accepts Hamas estimate of 70,000 war dead",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/2040/live/f9c934e0-fd41-11f0-a8b8-bdd2c5f9bcad.jpg",
						"body": "Israeli media report that a senior security source says the military now accepts that the war in Gaza has killed more than 70,000 Palestinians, according to those accounts.\n\nThe senior source told Israeli journalists, among them Haaretz and the Times of Israel, that the overall toll reported by the Hamas health ministry is broadly accurate, while noting they cannot yet separate combatants from those who died directly in the fighting, or provide a verified breakdown.\n\nThe IDF said the latest reports do not reflect its official position at this time.\n\nPreviously, the Israel Defense Forces estimated publicly that for every dead militant, two or three civilians had been killed.\n\nIsrael had long questioned the figures released by the Hamas-run health ministry, disputing their accuracy over time.\n\nHowever, the UN and other human rights groups have treated those numbers as credible, and they are widely cited by international media around the world.\n\nIsrael responded with a military campaign in Gaza, during which more than 71,660 people have been killed, according to the Hamas-run health ministry.\n\nIt adds that at least 492 Palestinians have been killed since a ceasefire began on 10 October 2025, and that four Israeli soldiers have also been killed.\n\nThe war began after a Hamas-led attack in southern Israel on 7 October 2023, in which about 1,200 other people were killed and 251 were taken hostage.\n\nIsrael has consistently disputed the Hamas figures and said, in statements, that before last year's ceasefire it had killed 1,600 fighters since 7 October 2023, plus a further 22,000 combatants in the war.",
						"created_at": "2026-01-29T21:55:56.735Z",
						"author": {
							"id": "42",
							"name": "James Robinson",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jamesrobinson",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Business"
						],
						"subcategory_names": [
							"Chips",
							"Military",
							"Robotics",
							"Funding",
							"Reports"
						]
					}
				]
			},
			{
				"tag": "Policy",
				"data": [
					{
						"entry_id": "dtc-WmgEq7Ar",
						"slug": "government-secures-last-m-k8l3",
						"title": "Government secures last-minute hospital funding agreement with the states",
						"sub_title": "Government secures last-minute hospital funding agreement with the states",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/ba3130f6dc637f098433b2a76c5efa07?impolicy=wcms_crop_resize&cropH=2436&cropW=4330&xPos=0&yPos=100&width=862&height=485",
						"body": "Facing intensifying demands from the states, Prime Minister Anthony Albanese pledged an additional $25 billion for the public hospital system, a move intended to end a months‑long stalemate over funding and draw a line under a bitter dispute.\n\nNational leaders met in Sydney for a national cabinet meeting on Friday morning and, after protracted talks, reached a deal for a new five‑year funding agreement for public hospital care across the country.\n\nAlbanese said the extra $25 billion forms part of almost $220 billion in record Commonwealth support to the states over the next five years, a total he cast as unprecedented in scale.\n\nHe said they had struck a landmark agreement that would deliver record funding to state and territory hospital services while also safeguarding the future of the National Disability Insurance Scheme.\n\nHe characterized the agreement as among the most significant national reforms in living memory, saying it would ensure Australians continue to access world‑class healthcare alongside disability support for years to come.\n\nUnder an agreement negotiated by national cabinet in 2023, the federal government committed to lift its share of public hospital funding to 42.5 per cent by 2030 and to 45 per cent by 2035, setting a new trajectory for the Commonwealth’s contribution.\n\nIn return, states and territories agreed to provide some disability services outside the NDIS, including Thriving Kids, a program for children with mild to moderate developmental delay and autism.\n\nThe Health Minister, Mark Butler, said today that the start date — originally set for July 1 — may be delayed “by several months” after states and territories sought more time to prepare for the shift.\n\nAfter the meeting, Albanese said the scheme would begin “this year,” with the aim of becoming fully operational within two years, signalling a phased rollout rather than an immediate switch.\n\nHe said the states had proposed a brief delay to full implementation of Thriving Kids, but confirmed the program would start this year and be fully in place by 1 January 2028.\n\nAlbanese said the Commonwealth accepted that proposal as a reasonable step to ensure it is done properly, calling it a positive move designed to get the settings right.\n\nThe government also reiterated that families currently on the NDIS would remain within the scheme until Thriving Kids is rolled out, to ensure continuity of support during the transition.\n\nHe added that national cabinet agreed to work towards an annual growth target of six per cent or less, down from the existing target of eight per cent.\n\nNicole Rogerson, CEO of Autism Awareness Australia, said the protracted negotiations had unsettled the autism community, which was anxious about what the proposed changes would ultimately mean for them.\n\nShe said “everybody needs to put on their big boy pants, and get on with it,” expressing frustration at the protracted talks.\n\nAccording to Rogerson, the autism community is “so over this,” describing the process as akin to a rush to act followed by inaction — “hurry up, and then do nothing.”\n\nShe said she had warned in 2023 that tying the two issues together was problematic and that, even now, the situation remained deeply frustrating for families.\n\nGrowth cap remained another sticking point in the talks.\n\nAnother source of tension has been how much growth in public hospital activity the Commonwealth will fund, currently capped at 6.5 per cent a year.\n\nIn 2023, national cabinet agreed to replace that with a “more generous” model, and under the current offer the cap would be 10.25 per cent in the first year before settling at 8 per cent in the medium term.\n\nTensions remained high throughout the extended stoush.\n\nFor months, the Albanese government has been locked in strained, protracted talks on the next five‑year public hospital funding agreement, with the ABC revealing the Prime Minister wrote to premiers and chief ministers in September urging them to rein in hospital spending growth if they wanted a funding commitment made more than two years ago implemented.\n\nThere was also a push to finalise the deal before Friday’s meeting, with the South Australian government entering caretaker mode from February 21 ahead of the state election, narrowing the window for signing.\n\nOn Thursday, the Health Minister conceded that if an agreement was not secured by then, striking a deal before the one‑year interim funding agreement expires in June would be difficult, underscoring the tight timetable.\n\nTensions also flared before Christmas, when the Prime Minister was branded a “grinch” after adding $1 billion to the Commonwealth’s existing offer to lift its contribution by $20 billion over five years.\n\nThat offer included a further sweetener: an additional $2 billion over four years to address the increasingly political problem of aged care patients stuck in public hospital beds.\n\nThese patients are medically fit to leave but remain in hospital while waiting for a federally funded residential aged care bed.",
						"created_at": "2026-01-30T04:20:23.282Z",
						"author": {
							"id": "58",
							"name": "Kevin Adams",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Policy",
							"Hardware"
						],
						"subcategory_names": [
							"Geopolitics",
							"Safety & Ethics",
							"Regulation",
							"Robotics",
							"Drone"
						]
					},
					{
						"entry_id": "dtc-tq9TWUxF",
						"slug": "cannington-greyhound-carn-y9ji",
						"title": "Cannington greyhound 'carnage' prompts calls to phase out",
						"sub_title": "Cannington greyhound 'carnage' prompts calls to phase out",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/bcf08703fd1a136279b6921216308683?impolicy=wcms_crop_resize&cropH=1688&cropW=3000&xPos=0&yPos=61&width=862&height=485",
						"body": "Pressure to shut down greyhound racing has escalated after a night described as “carnage” at a suburban Perth venue, where four dogs were injured and two were euthanased.\n\nRacing at the Cannington greyhound track was halted on Wednesday night after the seventh of 12 scheduled events, following injuries to four dogs, according to Racing and Wagering WA (RWWA).\n\nCanning Mayor Patrick Hall urged the state government to heed public sentiment and set a date to transition Western Australia away from greyhound racing.\n\nTrack branded Australia’s ‘most deadly’ for greyhounds\n\nSpeaking to ABC Radio Perth, Hall said the scene on Wednesday amounted to “absolute carnage,” noting it occurred on a fine evening and a dry track.\n\nHe said he took no pride in Cannington being, in his words, the most deadly greyhound track in the country, and stressed that it sits within the City of Canning.\n\nHall added that authorities needed to draw a line, step up, and meet the expectations of the local community.\n\nRWWA declined an interview and, in a statement, said track-side veterinarians and racing stewards acted to ensure all injured greyhounds received appropriate care and attention following the incidents.\n\nA spokesperson said Racing WA is conducting a comprehensive review of what occurred and assessing all available data before any further racing or trialling resumes at Cannington.\n\nThe organisation expressed sympathy to those connected to the affected greyhounds and said the care, safety and welfare of racing animals remains a priority.\n\nThe spokesperson also reiterated that the welfare of all racing animals is Racing WA’s highest priority.\n\nCannington was temporarily closed in 2024 for maintenance and a safety upgrade, which reportedly cost RWWA $3 million.\n\nAccording to data compiled by the Coalition for the Protection of Greyhounds, 119 greyhounds died on Australian tracks last year.\n\nThe Coalition identified Cannington and Mandurah in WA as the most deadly tracks, with 10 deaths recorded at each venue.\n\nParliamentary inquiry underway\n\nA parliamentary inquiry, prompted by a petition with more than 26,000 signatures calling for the industry to be phased out, is in progress.\n\nMel Harrison, president of advocacy group Free The Hounds, said Australia has more greyhound racetracks than the rest of the world combined, and has long advocated for the sport to be stopped.\n\nShe told ABC Radio Perth she wished it were the first time something like this had happened, but said it was not.\n\nHarrison argued it was disingenuous for the industry and its supporters to claim they care about greyhound welfare.\n\nIf supporters accept that dogs die for the sport, she said, they should stop hiding behind welfare rhetoric while asserting they care about the animals.\n\nShe also called for greater transparency and independent oversight across the industry.",
						"created_at": "2026-01-30T04:15:40.801Z",
						"author": {
							"id": "73",
							"name": "Paula Morris",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=paulamorris",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Policy",
							"Technology"
						],
						"subcategory_names": [
							"Regulation",
							"Safety & Ethics",
							"Geopolitics",
							"New Releases",
							"Feature Updates"
						]
					},
					{
						"entry_id": "dtc-rJu0mfJx",
						"slug": "police-respond-to-a-serio-5a54",
						"title": "Police respond to a 'serious incident' at Mosman Park home in Perth's western suburbs",
						"sub_title": "Police respond to a 'serious incident' at Mosman Park home in Perth's western suburbs",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/7b99c5a8f81345cd9b5ed2d6144ea2c4?impolicy=wcms_crop_resize&cropH=1080&cropW=1920&xPos=0&yPos=180&width=862&height=485",
						"body": "WA Police say they are responding to a serious incident at a residence in Mosman Park, in Perth’s western suburbs. A heavy police presence is at a home on Mott Close, and several streets in the area have been cordoned off. People in the vicinity are being asked to stay away from the area, though authorities say there are no concerns for public safety. A St John Ambulance spokesperson said crews were responding to a critical incident, with about half-a-dozen crews on scene. WA’s Police Commissioner, Col Blanch, will hold a press conference with the head of the Major Crime Division at 11:30am local time.",
						"created_at": "2026-01-30T04:13:49.812Z",
						"author": {
							"id": "67",
							"name": "Haley Parker",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=haleyparker",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Technology",
							"Policy"
						],
						"subcategory_names": [
							"Agents",
							"Models",
							"Geopolitics",
							"Safety & Ethics"
						]
					},
					{
						"entry_id": "dtc-7eaQYrKr",
						"slug": "celebrities-and-standout--f883",
						"title": "Celebrities and standout looks from Paris Haute Couture Fashion Week",
						"sub_title": "Celebrities and standout looks from Paris Haute Couture Fashion Week",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/23d9/live/0a3cdf20-fc75-11f0-9f00-a7fda7ef067e.jpg",
						"body": "Paris saw debut collections from the new leads at Chanel and Dior, injecting renewed energy into the storied labels, and marked the first Armani Privé couture presentation since Giorgio Armani died last year.\n\nFeathers, standout craft and a front row packed with famous faces signalled the return of Paris Haute Couture Week.\n\nThe exclusive four-day showcase, held twice annually, presents custom-fitted, hand-made pieces from an exclusive roster of 13 fashion houses.\n\nVictoria and David Beckham joined Gracie Abrams, Dua Lipa, A$AP Rocky and Rihanna on the front row to view the latest high-end looks in the French capital.\n\nChanel’s new artistic lead, Matthieu Blazy, delivered one of the week’s most anticipated outings at the Grand Palais.\n\nThe vast glass-domed exhibition space was transformed into a fantastical setting, with pink weeping willows and oversized toadstools flanking the runway.\n\nBlazy—who showed ready-to-wear in the same venue last October—said he aimed to “probe and explore the heart of Chanel”.\n\nSeveral looks nodded to the house’s classic suits, refreshed through new fabrics and finishing techniques.\n\n\"I wanted to see whether, when you strip away the usual Chanel signatures - the tweed, the jewelled buttons - you can still get to that essence,\" he told WWD.\n\nThe lineup also veered into bolder territory, with feathers running as a through-line.\n\nAvian references—from pigeons and crows to the rarer roseate spoonbill—provided the theme.\n\n\"All kinds of birds appear, as if by magic, from the most familiar to the rarest,\" the 41-year-old Franco-Belgian wrote in his show notes.\n\nNorthern Irish designer Jonathan Anderson staged his first haute couture collection for Dior, another of the week’s most awaited moments.\n\nNature guided the presentation, with airy silhouettes and florals, some of which appeared as earrings on the models.\n\nThe Spring Summer 2026 show unfolded beneath a flower canopy atop a mirrored runway.\n\nA largely monochrome palette was lifted by flashes of orange, accented with ice blue and pink.\n\nAccessories echoed the motif, including a ladybird-shaped bag and a clutch that appeared to sprout long grass.\n\nAnderson, also 41, previously served as creative director at Loewe and joined Dior in March.\n\nAhead of the Rodin Museum debut, he called the task “intimidating” because “you are up against people who are in the history books,” the Guardian reported.\n\n\"My Dior is never going to be a formula, because my brain doesn't work like that,\" he added. \"I get bored too quickly.\n\n\"Everyone wants every designer right now to work out the brand like, tomorrow. But Dior is ginormous.\"\n\nOnly days after designer Valentino Garavani’s death, Alessandro Michele unveiled a high-concept collection at Paris Haute Couture Fashion Week.\n\nGuests viewed the looks via a device dubbed a “kaiserpanorama,” peering into an alternate universe.\n\nA standout was a batwing gown rendered in the shade of red used in Valentino’s first collection more than six decades ago.\n\nLace, feathers and ornate detailing punctuated the lineup, with models styled like showgirls.\n\nLily Allen, Kirsten Dunst, Tyla and Dakota Johnson were among the guests exploring Michele’s vision.\n\nArmani Privé also drew close attention, presenting its first haute couture collection since founder Giorgio died last year at 91.\n\nHis niece Silvana—who collaborated with him on women’s ready-to-wear—supervised the new wardrobe, intended to be “like classic Armani, but with a touch of originality.”\n\nPastel mint and baby pink anchored the palette, featuring bejewelled satin trouser suits and glittering evening gowns.\n\nLebanese designer Elie Saab returned to his roots with a couture outing titled Golden Summer Nights of ’71.\n\nCountering the chill in Paris, he channeled Middle Eastern warmth via blush pinks, bronzes and desert hues.\n\nSaab, 61, established his Beirut-based house in the 1980s and has consistently embraced maximalism.\n\nWednesday’s presentation was no exception, dominated by lavish beading, sweeping ball gowns and metallic fabrics.\n\nOther notable sightings included Sir David and Lady Victoria Beckham; the fashion designer and former Spice Girl received a Knight of the Order of Arts and Letters on haute couture week’s opening day.\n\nThey were accompanied by three of their children, though not their son Brooklyn Peltz Beckham, after a public rift with his family.\n\nAnna Wintour, Vogue global editorial director, joined the Beckhams at the ceremony and appeared on the front row at several shows, alongside celebrities such as Tilda Swinton, Nicole Kidman and designer John Galliano.",
						"created_at": "2026-01-29T21:53:26.408Z",
						"author": {
							"id": "58",
							"name": "Kevin Adams",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Policy"
						],
						"subcategory_names": [
							"Military",
							"Chips",
							"Geopolitics",
							"Safety & Ethics",
							"Regulation"
						]
					},
					{
						"entry_id": "dtc-lNVKzgnr",
						"slug": "i-can-breathe-again-says--glrx",
						"title": "'I can breathe again,' says Israeli hostage held for nearly 500 days in Gaza",
						"sub_title": "'I can breathe again,' says Israeli hostage held for nearly 500 days in Gaza",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/354f/live/8973c100-fd24-11f0-a8b8-bdd2c5f9bcad.jpg",
						"body": "For the first time since 2014, there are no Israeli hostages remaining in Gaza. During the Hamas-led attack on 7 October 2023, 251 people were abducted and about 1,200 others were killed.\n\nIsrael then began a military campaign in Gaza. According to the Hamas-run health ministry, more than 71,660 people have been killed during the fighting. Since the ceasefire took effect on 10 October 2025, the ministry adds, at least 492 Palestinians have been killed, as well as four Israeli soldiers.\n\nWith all the hostages, alive and dead, now back in Israel, the second phase of US President Donald Trump's plan to end the war in Gaza can move forward. Under the plan, the Rafah border crossing between Egypt and Gaza is to reopen on an ongoing basis for the first time since May 2024.\n\nThe blueprint calls for fully demilitarising Gaza, including the disarmament of Hamas and other Palestinian groups, the creation of a technocratic Palestinian government, and a broad reconstruction effort to rebuild homes and infrastructure.\n\nSasha Troufanov, 30, an Amazon electronics engineer, was seized as a hostage on 7 October 2023 by Palestinian Islamic Jihad gunmen. His fiancée, Sapir Cohen, his mother and his grandmother were also abducted and taken into Gaza. The three women were freed after more than 50 days as hostages, while he was released a year ago after 498 days in captivity.\n\nA former Israeli hostage who spent nearly 500 days in Gaza says the return this week of the final hostage’s body means those who were freed can, in his words, “finally breathe and begin our lives again.”\n\nIn his first international interview, given during a visit to London, Troufanov told BBC News that Monday’s return of Ran Gvili’s body — which meant all hostages had come home — felt “wonderful” after a long wait.\n\nHe explained that he had carried a heavy burden since his own return, likening it to a weight on his shoulders that kept him from resuming life. Even after their release, he said, it felt as if they had not truly left Gaza while their friends and “brothers” remained.\n\nYet the day was also painful because it fell on his father Vitaly’s birthday. Troufanov discovered only on the day of his release, in February 2025, that his father had been murdered on 7 October, realising then that his dad would not be there to meet him.\n\nTroufanov and Cohen had been visiting his family at Kibbutz Nir Oz, near the Gaza border, when Palestinian gunmen stormed their homes. Cohen wrapped herself in a blanket and hid under a bed, but both were found and taken. He was punched and stabbed in the shoulder.\n\nHe recalled seeing an assailant’s face “full of anger and hate,” a knife in his hand as he tried to stab him again, an image that has stayed with him since.\n\nAs the attackers tried to take him off the kibbutz, he briefly managed to escape, he said; but when he stopped running, they shot him twice in each leg before recapturing him.\n\nHe described a rush of pain flooding his head before he collapsed, after which one of the assailants struck him on the back of the skull with a rifle, splitting it open.\n\nOn reaching Gaza, he said, civilians set upon him and beat him, and he thought to himself that this might be the moment he would die.\n\nTroufanov said he received almost no medical care in Gaza. He was taken once to a family home and once to a hospital, where his broken leg was first wrapped with a wooden broom and later braced with part of a metal grill.\n\nUnlike many other captives, he was kept almost constantly in isolation. Over his 498 days in captivity, he encountered another hostage on only two days, leaving him with virtually no human contact.\n\nInitially kept above ground, he said he spent more than six weeks locked inside a cage and was given barely enough food to survive. During that period, he says he experienced sexual harassment: a guard repeatedly tried to coerce him into a sexual act, and he believes a hidden camera filmed him during his once-a-week shower.\n\nHe said he spotted the device and tried to angle his body to avoid exposing his private parts while showering, but he took the shower anyway because he needed to wash despite the humiliation.\n\nAfter being moved into the tunnels, Troufanov said he was left alone for months, with captors dropping off food and leaving immediately. He remained in a silent, cramped, humid space so dark he could not see his own hand in front of his face.\n\nHe recalled feeling as if he were buried alive beneath the ground, saying he struggled to find hope there. Many times he lost hope entirely and told himself the place would be the last thing he ever saw.\n\nTroufanov argues the proposed measures are not enough to ensure an attack like that of 7 October does not recur.\n\nHe said that while rebuilding Gaza after the war is understandable, the priority should be ensuring that people in Gaza stop trying to harm Israel. According to Troufanov, his captors told him repeatedly, “We will do this again and again.”\n\nHe contends that reconstruction and opening the Rafah crossing will be in vain if the core issue is not addressed, arguing that efforts must focus on ending hatred and the encouragement of terrorist activity.\n\nThe former hostage now faces a lengthy process of mental and physical rehabilitation. Currently on crutches after leg surgery, he hopes to be well enough to dance at his wedding to Sapir Cohen in the coming weeks, describing that moment as a victory over hate and fear and a pledge to continue building their life together.",
						"created_at": "2026-01-29T21:46:27.309Z",
						"author": {
							"id": "37",
							"name": "Elizabeth Harris",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=elizabethharris",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Technology",
							"Policy"
						],
						"subcategory_names": [
							"New Releases",
							"Skills",
							"Feature Updates",
							"Safety & Ethics",
							"Geopolitics",
							"Regulation"
						]
					},
					{
						"entry_id": "dtc-fqMOWBYA",
						"slug": "nicki-minaj-declares-hers-7twr",
						"title": "Nicki Minaj declares herself Trump's 'number one fan,' and she displays a gold card visa",
						"sub_title": "Nicki Minaj declares herself Trump's 'number one fan,' and she displays a gold card visa",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/2c5f/live/977ebc80-fd03-11f0-9972-d3f265c101c6.jpg",
						"body": "On Wednesday, Trinidad and Tobago-born rapper Nicki Minaj proclaimed herself Donald Trump’s “number one fan” and went on to display a Trump “gold card” visa, a branded document that, according to its promoters, offers applicants residency and a pathway to US citizenship.\n\nIn Washington DC, the US President invited the star onto the stage after she voiced support for the so‑called “Trump Accounts,” described as trust funds set up for children.\n\nIn the capital, Trump quipped that he would grow his nails to imitate the rapper, then briefly clasped her hand while another speaker addressed the crowd.\n\n“I will say that I am probably the president's number one fan, and that's not going to change,” Minaj said, having been seen holding hands with Trump on the podium.\n\n“And the hate or what people have to say, it does not affect me at all. It actually motivates me to support him more.”\n\nShe added she would not allow the billionaire president’s critics to “get away with bullying him.”\n\n“He has a lot of force behind him, and God is protecting him. Amen.”\n\nMinaj also posted an image of the new card, emblazoned with Trump’s face, sharing it in a thread on X that she captioned: “Welp.”\n\nShe later wrote, “Finalising that citizenship paperwork as we speak as per my wonderful, gracious, charming president”, adding that the card had come “free of charge”.\n\nThe gold card program, launched in December, was presented as a fast‑track route for affluent immigrants like Minaj to obtain US citizenship.\n\nApplicants contribute $1 million (£723,650), plus a $15,000 (£10,854) processing fee, in exchange for US residency.\n\nThe initiative has drawn criticism for arriving as the president intensifies his crackdown on illegal immigrants.\n\nWhile the gold card grants Minaj unlimited residence in the US, it does not confer citizenship under the agreement.\n\nOnce a critic of Trump’s hardline Immigration policies, Minaj—who moved to the US with her parents as a child—has, in recent years, shifted to praising his leadership.\n\nThe Super Bass star, who has welcomed the move, reportedly wrote in a 2018 Facebook post that she “came to this country as an illegal immigrant at five years old,” while criticising the government’s family‑separation policies.\n\n“I can't imagine the horror of being in a strange place and having my parents stripped away from me at the age of five,” the post said.\n\n“This is so scary to me. Please stop this. Can you try to imagine the terror and panic these kids feel right now? Not knowing if their parents are dead or alive, if they'll ever see them again.”\n\nIn 2024, during a TikTok livestream, she added: “I'm not a citizen of America. Isn't that crazy?\n\n“I was born on a beautiful island called Trinidad and Tobago. But I've been in the States for many years. You would think that with the millions of dollars that I've paid in taxes to this country that I would have been given an honorary citizenship many, many, many thousands of years ago.”\n\nHer appearance comes amid protests following fatal shootings of US citizens involving Immigration and Customs Enforcement (ICE) agents.\n\nOnline, some fans have pushed back against Minaj over her endorsement of Trump.\n\nElsewhere, other US artists have been far more critical of the president and his Immigration policy.\n\nBruce Springsteen released an anti‑ICE song on Wednesday titled Streets Of Minneapolis, referencing the city where Alex Pretti and Renee Nicole Good were both recently killed, in separate incidents.\n\nIn a note posted on social media, the singer‑songwriter said the track responds to “the state terror being visited on the city”.\n\n“I wrote this song on Saturday, recorded it yesterday and released it to you today...” he said.\n\n“It's dedicated to the people of Minneapolis, our innocent immigrant neighbours and in memory of Alex Pretti and Renee Good. Stay free.”\n\nThe folk‑rock protest track, which name‑checks both the late Pretti and Good, includes the lyrics: “We'll remember the names of those who died / On the streets of Minneapolis”.\n\nFellow New Jerseyan Ice‑T has lately been altering the lyrics of his 1992 track Cop Killer to “ICE killer” during live shows.\n\n“I'm just protesting,” he told the Breakfast Club via Entertainment Weekly.\n\n“I think we're headed to some really ugly terrain,” he said. “And black people really ain't got nothing to do with it. It's bad. I think the moment somebody shoots an ICE agent, it's gonna get bad.”\n\nOther US stars, including Billie Eilish, Olivia Rodrigo and Ariana Grande, have also spoken out.\n\nEilish has been outspoken about ICE and the Trump administration, criticising ICE raids in her hometown of Los Angeles.\n\nFollowing the killing of Renee Nicole Good earlier this month, she shared a post referring to the enforcement agency that has been “tearing apart families, terrorising citizens, and now murdering innocent people”.\n\nAfter Alex Pretti’s subsequent death, she uploaded a selfie with the caption: “Hey my fellow celebrities, u gonna speak up?”\n\nGrande also weighed in on social media, sharing a screenshot of a post by New York Mayor Zohran Mamdani urging the agency’s abolition.\n\n“ICE terrorises our cities. ICE puts us all in danger. Abolish ICE,” the message read.\n\nAdditional reporting by Kate Moore.",
						"created_at": "2026-01-29T17:31:51.780Z",
						"author": {
							"id": "37",
							"name": "Elizabeth Harris",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=elizabethharris",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Policy",
							"Hardware"
						],
						"subcategory_names": [
							"Regulation",
							"Safety & Ethics",
							"Geopolitics",
							"Chips",
							"Military",
							"Robotics"
						]
					}
				]
			},
			{
				"tag": "Technology",
				"data": [
					{
						"entry_id": "dtc-hT6ryo1k",
						"slug": "trump-says-it-would-be-gr-erxf",
						"title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
						"sub_title": "Trump says 'it would be great' if the US didn't have to use military force against Iran",
						"img_url": "https://fast.image.delivery/venszwy.png",
						"body": "Donald Trump says he has informed Iran it must meet “two things” to avoid US military action, as Washington increases its forces in the Gulf.\n\n“Number one, no nuclear. And number two, stop killing protesters,” the US President said, asserting that “they are killing them by the thousands”.\n\n“We have a lot of very big, very powerful ships sailing to Iran right now, and it would be great if we didn’t have to use them.”\n\nHe delivered those remarks at the premiere of a documentary about his wife, Melania.\n\nThe comments follow weeks of pressure on Tehran to negotiate an agreement on its nuclear programme.\n\nEarlier in the week, Trump posted on Truth Social: “Hopefully Iran will quickly ‘Come to the Table’ and negotiate a fair and equitable deal - NO NUCLEAR WEAPONS.”\n\nHe further warned that a “massive Armada is heading to Iran”, saying it was “ready, willing, and able to rapidly fulfil its mission, with speed and violence, if necessary”.\n\nIran’s Foreign Minister Abbas Araghchi has said the armed forces stand “with their fingers on the trigger” to “immediately and powerfully respond” to any aggression.\n\nIn response, Araghchi said: “Iran has always welcomed a mutually beneficial, fair and equitable NUCLEAR DEAL - on equal footing, and free from coercion, threats, and intimidation - which ensures Iran’s rights to PEACEFUL nuclear technology, and guarantees NO NUCLEAR WEAPONS.”\n\n“Such weapons have no place in our security calculations and we have NEVER sought to acquire them,” he added.\n\nIran’s Deputy Foreign Minister Kazem Gharibabadi said there were no negotiations with the US under way, despite “exchanges of messages”.\n\nDemonstrations began in late December after a steep fall in the value of the Iranian currency, but quickly became a crisis of legitimacy for the country’s clerical leadership.\n\nResidents in Tehran told the BBC the crackdown on protesters was unlike anything they had seen before.\n\nEarlier this month, Trump said the US would come to the “rescue” of Iranian protesters if authorities resorted to violence.\n\nThough Trump initially promised that “help is on the way”, he later said he had been told on good authority that the execution of demonstrators had stopped.\n\nThe US-based Human Rights Activists News Agency (Hrana) says it has so far confirmed the killing of at least 6,479 people since the unrest began, including 6,092 protesters, 118 children and 214 people affiliated with the government.\n\nIt is also investigating approximately 17,000 more reported deaths.\n\nIranian authorities said last week that more than 3,100 people had been killed, but that most were security personnel or bystanders attacked by “rioters”.\n\nThe European Union has since added Iran’s Islamic Revolutionary Guard Corps (IRGC) to its terrorist list, and imposed new sanctions on six entities and 15 individuals in Iran.",
						"created_at": "2026-01-30T08:05:13.600Z",
						"author": {
							"id": "69",
							"name": "Jasmine Edwards",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=jasmineedwards",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Hardware",
							"Technology"
						],
						"subcategory_names": [
							"Energy (Nuclear, Grid, Sustainability)",
							"Drone",
							"New Releases",
							"Feature Updates"
						]
					},
					{
						"entry_id": "dtc-cImx19JI",
						"slug": "machine-capable-of-produc-zg2c",
						"title": "Machine capable of producing millions of illegal cigarettes seized in Sydney",
						"sub_title": "Machine capable of producing millions of illegal cigarettes seized in Sydney",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/01ce4672b1bfc6d24434725878ba1a53?impolicy=wcms_crop_resize&cropH=432&cropW=768&xPos=0&yPos=0&width=862&height=485",
						"body": "A machine capable of producing up to 3.6 million illicit cigarettes per day has been confiscated by the Australian Border Force (ABF) from a storage facility in north‑west Sydney. The industrial‑scale setup was found operating within a commercial storage environment, authorities said.\n\nDuring the operation at a Rouse Hill self‑storage unit last Thursday, officers also seized 7.53 kilograms of loose‑leaf tobacco, nearly 6,000 components for vaping devices, and eight large boxes believed to contain counterfeit tobacco packaging. The haul was discovered at the same location as the cigarette‑making machine.\n\nThe raid was coordinated by the ABF’s Illicit Tobacco Taskforce (ITTF), with support from the Australian Taxation Office, the Therapeutic Goods Administration and NSW Police. The multi‑agency team executed the action as part of ongoing efforts targeting illicit tobacco supply chains.\n\nNo arrests have been made following the discovery, and the ABF believes an organised crime syndicate was running the operation. Investigations are continuing to identify those responsible.\n\nITTF Acting Superintendent Samuel Harnden cautioned that every purchase of illicit tobacco directly bankrolls organised crime. He said the broader market for illegal cigarettes relies on consumers who seek cheaper products outside the legal system.\n\n“There are clear and established links between local illicit tobacco manufacturing in Australia and organised criminal syndicates,” he said. Harnden urged buyers to consider the criminal networks their money may be supporting.\n\nUniversity of New South Wales (UNSW) public health expert Becky Freeman said finding a cigarette‑making machine inside Australia was unusual. In her view, illicit tobacco in Australia is typically sourced elsewhere.\n\nShe said the discovery highlighted how rapidly the underground market is evolving. The find, she added, shows operators are adapting their methods to meet demand.\n\n“The majority of these products are imported into Australia — they’re manufactured in our region and then imported into Australia and sold,” she said. She noted this import‑driven model has dominated the illicit supply.\n\nPost-COVID phenomenon\n\nProfessor Freeman said Australia is oversupplied with cheap illicit tobacco products and that authorities are struggling to keep up. She described the scale of the market as overwhelming enforcement capacity.\n\n“It’s a post‑COVID phenomenon. There are more cigarettes here than can be smoked or used by anybody,” she said. The glut, she argued, is fuelling street‑level availability.\n\nViolent criminal market\n\nThe underground trade is one of the country’s fastest‑growing and most violent criminal markets, according to recent reports by the Australian Criminal Intelligence Commission and the Australian Institute of Criminology. Those assessments link the illicit tobacco economy to broader organised activity.\n\nReleased in November, the research estimated illicit tobacco cost $4 billion in 2023‑24 through lost tax revenue and healthcare costs. The figure underscored the fiscal and health impacts of the black market.\n\nIn the same month, the NSW government passed legislation making it easier for NSW Health to order retailers to shut down for 90 days if caught selling illegal tobacco. The measure was designed to give regulators stronger tools to disrupt sales.\n\nSince then, more than 50 tobacco retailers have been temporarily closed across the state. Authorities say the closures reflect stepped‑up enforcement under the new powers.\n\nLast year, NSW Premier Chris Minns urged the federal government to reduce the tobacco excise, which was first introduced in 2010 to reduce smoking rates. He renewed concerns about the affordability gap between legal and illegal products.\n\nAt the time, the premier argued the high cost of legal tobacco was pushing smokers to buy black market cigarettes, but Federal Treasurer Jim Chalmers disagreed and declined to make the changes. The federal position remained that excise settings should not be adjusted.\n\nProfessor Freeman urged the Commonwealth and state governments to stop blaming each other and instead back multi‑agency raids and investigations such as the Rouse Hill operation. She said cooperative enforcement is the most effective way to disrupt supply.\n\n“A cigarette costs about one Australian cent to make, and criminal syndicates have figured out how to sell these products in broad daylight, so the key solution to me is to shut down those shops,” she said. Shuttering points of sale, she added, would cut off the most visible distribution channels.",
						"created_at": "2026-01-30T04:17:03.539Z",
						"author": {
							"id": "58",
							"name": "Kevin Adams",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business",
							"Technology"
						],
						"subcategory_names": [
							"Press Release",
							"Funding",
							"Models",
							"Agents"
						]
					},
					{
						"entry_id": "dtc-tq9TWUxF",
						"slug": "cannington-greyhound-carn-y9ji",
						"title": "Cannington greyhound 'carnage' prompts calls to phase out",
						"sub_title": "Cannington greyhound 'carnage' prompts calls to phase out",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/bcf08703fd1a136279b6921216308683?impolicy=wcms_crop_resize&cropH=1688&cropW=3000&xPos=0&yPos=61&width=862&height=485",
						"body": "Pressure to shut down greyhound racing has escalated after a night described as “carnage” at a suburban Perth venue, where four dogs were injured and two were euthanased.\n\nRacing at the Cannington greyhound track was halted on Wednesday night after the seventh of 12 scheduled events, following injuries to four dogs, according to Racing and Wagering WA (RWWA).\n\nCanning Mayor Patrick Hall urged the state government to heed public sentiment and set a date to transition Western Australia away from greyhound racing.\n\nTrack branded Australia’s ‘most deadly’ for greyhounds\n\nSpeaking to ABC Radio Perth, Hall said the scene on Wednesday amounted to “absolute carnage,” noting it occurred on a fine evening and a dry track.\n\nHe said he took no pride in Cannington being, in his words, the most deadly greyhound track in the country, and stressed that it sits within the City of Canning.\n\nHall added that authorities needed to draw a line, step up, and meet the expectations of the local community.\n\nRWWA declined an interview and, in a statement, said track-side veterinarians and racing stewards acted to ensure all injured greyhounds received appropriate care and attention following the incidents.\n\nA spokesperson said Racing WA is conducting a comprehensive review of what occurred and assessing all available data before any further racing or trialling resumes at Cannington.\n\nThe organisation expressed sympathy to those connected to the affected greyhounds and said the care, safety and welfare of racing animals remains a priority.\n\nThe spokesperson also reiterated that the welfare of all racing animals is Racing WA’s highest priority.\n\nCannington was temporarily closed in 2024 for maintenance and a safety upgrade, which reportedly cost RWWA $3 million.\n\nAccording to data compiled by the Coalition for the Protection of Greyhounds, 119 greyhounds died on Australian tracks last year.\n\nThe Coalition identified Cannington and Mandurah in WA as the most deadly tracks, with 10 deaths recorded at each venue.\n\nParliamentary inquiry underway\n\nA parliamentary inquiry, prompted by a petition with more than 26,000 signatures calling for the industry to be phased out, is in progress.\n\nMel Harrison, president of advocacy group Free The Hounds, said Australia has more greyhound racetracks than the rest of the world combined, and has long advocated for the sport to be stopped.\n\nShe told ABC Radio Perth she wished it were the first time something like this had happened, but said it was not.\n\nHarrison argued it was disingenuous for the industry and its supporters to claim they care about greyhound welfare.\n\nIf supporters accept that dogs die for the sport, she said, they should stop hiding behind welfare rhetoric while asserting they care about the animals.\n\nShe also called for greater transparency and independent oversight across the industry.",
						"created_at": "2026-01-30T04:15:40.801Z",
						"author": {
							"id": "73",
							"name": "Paula Morris",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=paulamorris",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Policy",
							"Technology"
						],
						"subcategory_names": [
							"Regulation",
							"Safety & Ethics",
							"Geopolitics",
							"New Releases",
							"Feature Updates"
						]
					},
					{
						"entry_id": "dtc-rJu0mfJx",
						"slug": "police-respond-to-a-serio-5a54",
						"title": "Police respond to a 'serious incident' at Mosman Park home in Perth's western suburbs",
						"sub_title": "Police respond to a 'serious incident' at Mosman Park home in Perth's western suburbs",
						"img_url": "https://live-production.wcms.abc-cdn.net.au/7b99c5a8f81345cd9b5ed2d6144ea2c4?impolicy=wcms_crop_resize&cropH=1080&cropW=1920&xPos=0&yPos=180&width=862&height=485",
						"body": "WA Police say they are responding to a serious incident at a residence in Mosman Park, in Perth’s western suburbs. A heavy police presence is at a home on Mott Close, and several streets in the area have been cordoned off. People in the vicinity are being asked to stay away from the area, though authorities say there are no concerns for public safety. A St John Ambulance spokesperson said crews were responding to a critical incident, with about half-a-dozen crews on scene. WA’s Police Commissioner, Col Blanch, will hold a press conference with the head of the Major Crime Division at 11:30am local time.",
						"created_at": "2026-01-30T04:13:49.812Z",
						"author": {
							"id": "67",
							"name": "Haley Parker",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=haleyparker",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Technology",
							"Policy"
						],
						"subcategory_names": [
							"Agents",
							"Models",
							"Geopolitics",
							"Safety & Ethics"
						]
					},
					{
						"entry_id": "dtc-CBRuBvK5",
						"slug": "trump-says-putin-will-not-ny3x",
						"title": "Trump says Putin will not attack Ukrainian cities amid cold week",
						"sub_title": "Trump says Putin will not attack Ukrainian cities amid cold week",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/61a6/live/6382f330-fd51-11f0-9972-d3f265c101c6.jpg",
						"body": "US President Donald Trump said Russia's Vladimir Putin had agreed to refrain from any attack on Ukraine's capital, Kyiv, and other cities and towns for one week because of “extraordinary cold” weather.\n\nRussia has not confirmed any such agreement, yet Ukraine's President Volodymyr Zelensky welcomed Trump's announcement and said he expected Moscow to keep its promise.\n\nLater on Thursday, Zelensky wrote on social media that Trump had made an “important statement” about “the possibility of providing security for Kyiv and other Ukrainian cities during this extreme winter period.”\n\nHe added that their teams had discussed the issue in the United Arab Emirates (UAE) and said, “We expect the agreements to be implemented.”\n\nThe BBC understands that Ukraine has agreed to mirror Moscow's actions—pausing its own attacks on Russian oil refineries in response.\n\nLast week, negotiators from Russia, Ukraine and the US met in the UAE for the first trilateral talks since the war began.\n\nAll sides described the meeting as constructive, but there has been no announcement that Russia agreed to pause its attacks for the length of the extreme cold currently gripping the region.\n\nSpeaking at a televised cabinet meeting in Washington DC, the US President said he had “personally asked President Putin not to fire into Kyiv and the various towns for a week,” and that Putin “agreed to do that.”\n\nTrump added: “It was very nice. A lot of people said, ‘Don't waste the call, you're not going to get that.’ And he [Putin] did it.”\n\nHe said Ukrainians “almost didn't believe it, but they were very happy about it because they are struggling badly.”\n\nTrump did not specify when the pause would begin, but in Kyiv temperatures are forecast to plunge from Thursday night, reaching -24C (-11F) in the coming days.\n\nDuring the harsh winter, Russia has intensified attacks on Ukraine's energy infrastructure, following a pattern seen during cold spells since the full-scale invasion began in 2022.\n\nInstead, attacks have continued, crippling the power supply to major Ukrainian cities and leaving millions without heating or electricity.\n\nPower companies carry out round-the-clock repairs, but their work can be rapidly undone by Russian air attacks.\n\nEven when electricity is restored, the supply often lasts only a few hours—enough to charge appliances but not to substantially warm homes.",
						"created_at": "2026-01-30T02:04:38.885Z",
						"author": {
							"id": "61",
							"name": "Madison Carter",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=madisoncarter",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Technology",
							"Business"
						],
						"subcategory_names": [
							"Models",
							"Skills",
							"Reports",
							"Enterprise Adoption"
						]
					},
					{
						"entry_id": "dtc-49q9FvdH",
						"slug": "explaining-why-china-move-1gnr",
						"title": "Explaining why China moved swiftly to execute 11 members of a notorious mafia family",
						"sub_title": "Explaining why China moved swiftly to execute 11 members of a notorious mafia family",
						"img_url": "https://ichef.bbci.co.uk/news/1024/branded_news/90f1/live/be0faf30-fd08-11f0-a8b8-bdd2c5f9bcad.jpg",
						"body": "Few will be surprised that China swiftly put to death 11 members of an organised crime clan from north-eastern Myanmar, who had been condemned in September.\n\nChina carries out more executions than any other country, according to human rights groups, though the precise number is a state secret. Executions of officials for corruption are common. The allegations against the Ming family were far graver.\n\nSince 2009, the Ming, Bau, Wei and Liu clans have controlled the remote border town of Laukkaing in Myanmar’s impoverished Shan state.\n\nTheir ascent followed a military campaign led by General Min Aung Hlaing, now the country’s coup leader, to expel the MNDAA, an ethnic insurgent force that had dominated Laukkaing and surrounding areas since the 1980s.\n\nKnown collectively as the four families, they took charge and pivoted from the old reliance on opium and methamphetamine to a new economy built around casinos and, eventually, online fraud.\n\nThey maintained close ties to the Myanmar military; in December 2021, after seizing power in his coup, Min Aung Hlaing hosted Liu Zhengxiang, head of the Liu clan, in the capital, Nay Pyi Taw, and bestowed an honorary title for “extraordinary contributions to state development”.\n\nLiu’s Fully Light conglomerate ran profitable ventures across Myanmar. Others from the four clans stood as candidates for the USDP, the military-backed party.\n\nBut the scam compounds they operated in Laukkaing were exceptionally brutal, even compared with similar sites elsewhere in Asia. Torture was commonplace.\n\nTens of thousands of mainly Chinese workers were enticed with offers of high-paying jobs, only to end up imprisoned inside the compounds. They were coerced into orchestrating elaborate “pig-butchering” schemes, most of whose victims were also Chinese. Complaints from victims, and from relatives of those trapped, multiplied on social media.\n\nThe most infamous site was Crouching Tiger Villa, run by the Ming family. In October 2023, during what is believed to have been an escape bid, guards killed several Chinese nationals. Chinese authorities felt compelled to respond.\n\nWith what appeared to be China’s blessing, the MNDAA and allied forces attacked and retook Laukkaing as part of their offensive against the Myanmar army in the continuing civil war. The MNDAA pledged to eradicate the scam trade entirely.\n\nThey captured the heads of the four clans and transferred more than 60 relatives and associates to Chinese police. Authorities said Ming Xuechang, the family patriarch, or warlord, killed himself after being captured.\n\nDuring questioning by Chinese police, one family member is reported to have admitted killing a randomly selected person merely to show his strength.\n\nChina has publicised such accounts to justify its harsh approach. Five members of the Bau family also await execution, while proceedings against the Wei and Liu families are still under way.\n\nAll four clans are ethnic Chinese and had close connections with authorities in Yunnan on the Chinese side of the border. Their abuses were too close to home for China, and the crackdown on Laukkaing’s scam industry has been the most forceful to date.\n\nChina has also prevailed on Thailand and Cambodia to extradite two Chinese business figures accused of running scam empires: She Zhijiang, who built an entire city in Myanmar’s war-torn Karen State, and Chen Zhi, who amassed wealth and power with his Prince Group conglomerate in Cambodia. The Chinese government has also brought tens of thousands of its citizens who were working in scam compounds back to China to face trial.\n\nYet the scam trade has adapted and evolved. It is still believed to be by far Cambodia’s largest business, despite pressure from China and the US on the government there to shut it down.\n\nIt has also shifted into new parts of Myanmar, even as high-profile complexes such as KK Park and Shwe Kokko on the Thai-Myanmar border have been forced to close.",
						"created_at": "2026-01-30T02:02:08.551Z",
						"author": {
							"id": "40",
							"name": "Ryan Garcia",
							"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=ryangarcia",
							"profile_bio": "Author",
							"role": "Root"
						},
						"business_type_name": "News",
						"category_names": [
							"Business",
							"Technology"
						],
						"subcategory_names": [
							"Reports",
							"Funding",
							"Enterprise Adoption",
							"Skills",
							"Tools (Image, Video, Audio gen)",
							"Agents"
						]
					}
				]
			}
		],
		"insights": [
			{
				"entry_id": "dtc-uMKkPykR",
				"slug": "six-dead-including-child--bcx8",
				"title": "Six dead, including child, in Mississippi shootings, suspect charged",
				"sub_title": "Six dead, including child, in Mississippi shootings, suspect charged",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ada73204ef1b4cab2adb6c33784bc28d?impolicy=wcms_crop_resize&cropH=338&cropW=451&xPos=197&yPos=0&width=862&height=647",
				"body": "Warning: This story contains references to sexual assault.\n\nA 24-year-old man has been charged with murder after six people were killed in a series of shootings in north-east Mississippi.\n\nClay County Sheriff Eddie Scott said the suspect was accused of shooting his father, brother and uncle fatally in the head on Friday evening, before stealing a truck and driving to a second site.\n\nSexual assault support lines:\n\n1800 Respect National Helpline: 1800 737 732Men's Referral Service: 1300 766 491Lifeline (24-hour crisis line): 131 114Victims of Crime Helpline: 1800 819 817Full Stop Australia: 1800 385 578There, he allegedly attempted to sexually assault a seven-year-old girl, who was also related to him, before fatally shooting her in the head.\n\nA 911 call then directed law enforcement to a third site, where two more men, including a local pastor, were found fatally shot in the head.\n\nThe suspect was arrested nearby just before midnight.\n\n\"I don’t know what kind of motive you could have to kill a seven-year-old,\" Sheriff Scott said at a press conference on Saturday.\n\n\"This has really shaken our community.\n\n\"A situation like this, you've got a family member attacking their own family … whatever the reason is, we're hoping that we'll find out.\"\n\nSuspect had no criminal history, records show\n\nSheriff's Deputy Steven Woodruff identified Daricka M Moore, 24, as the man arrested.\n\nHe faces a first-degree murder charge that could be upgraded to capital murder, Sheriff Scott said.\n\nHe may also face additional murder charges.\n\nOnline court records in Clay County show he has no previous criminal charges. \n\nScott Colom, the district attorney for Mississippi's Sixteenth Circuit Court, said the incident was one of the worst he had come across.\n\n\"This is horrific. It's about as bad as it gets,\" he said.\n\nThe Mississippi Crime Lab, a state office, will conduct autopsies, Sheriff Scott said.\n\nThe shootings took place in the rural community of Cedarbluff, which is west of the county seat of West Point.\n\nAP/Reuters",
				"created_at": "2026-01-14T09:39:35.895Z",
				"author": {
					"id": "28",
					"name": "David Wilson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=davidwilson",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Benchmarks",
					"Context"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-evSIDGy1",
				"slug": "aussie-bobsleigh-star-wal-xdip",
				"title": "Aussie bobsleigh star Walker claims historic win ahead of Winter Olympics",
				"sub_title": "Aussie bobsleigh star Walker claims historic win ahead of Winter Olympics",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/9980295e243e652242b63eef759bd9cc?impolicy=wcms_crop_resize&cropH=2085&cropW=2780&xPos=174&yPos=0&width=862&height=647",
				"body": "Bree Walker is on course for a Winter Olympic monobob medal after becoming the first Australian to win a World Cup gold at the famed St Moritz-Celerina track in Switzerland. \n\nWalker's victory was her third of the World Cup season, moving the 33-year-old to second on the overall standings ahead of next month's Milano-Cortina Winter Olympics.\n\nThe Queenslander posted 1 minute and 11.98 seconds in her opening run, which was the fastest time of the round.\n\nShe showed cool nerves when she took to the track as the last competitor in the final run, clocking 1:11.29 for a combined time of 2:23.27.\n\nShe finished 0.53 ahead of Switzerland's silver medallist Melanie Hasler (2:23.80), with Austria's Katrin Beierl claiming bronze in 2:23.95.\n\nFellow Australian Sarah Blizzard (2:26.06) was 20th on the final standings.\n\nWalker, who has won six World Cup events in her career, said her coach Pierre Lueders deserved much of the credit for the victory in Switzerland.\n\n\"Pierre has been teaching me for years, and it's been a slow process,\" she said.\n\n\"He loves this track and has had so much success here, so I think I should dedicate this win to him today.\"\n\nWalker finished ninth in the previous World Cup event held in Winterberg, Germany.\n\nShe has 1,219 points on the overall World Cup standings, sitting behind German Laura Nolte (1,246 points).\n\nShe will return to the St Moritz-Celerina track on Monday AEDT for the two-woman bobsleigh event, teaming up with Kiara Reddingius.\n\nABC/AAP",
				"created_at": "2026-01-14T09:37:01.137Z",
				"author": {
					"id": "53",
					"name": "Brittany Wright",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=brittanywright",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Benchmarks",
					"Breakthroughs"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-81uFnQKs",
				"slug": "is-spin-bowling-a-dying-a-sey8",
				"title": "Is spin bowling a dying art in Australian cricket?",
				"sub_title": "Is spin bowling a dying art in Australian cricket?",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/f071f6138e5dcfc6da95b99fe9815a98?impolicy=wcms_crop_resize&cropH=3072&cropW=4096&xPos=300&yPos=0&width=862&height=647",
				"body": "Like many up-and-coming cricketers across Australia, Paawan Sharma dreams of one day donning the baggy green.\n\nThe 19-year-old bowls leg breaks for Geelong in Victoria's Premier Cricket competition.\n\nHe says life as a young spinner can be a grind on Australia's pace-friendly pitches.\n\n\"It's obviously hard with the pitches in Australia, they don't offer much to spinners,\" Sharma said.\n\n\"Pitches are favouring pace bowlers more, so spinners aren't getting much of a go.\n\n\"We obviously don't get [pitches] that turn a lot or bounce, so spinners don't get much value from spinning the ball.\"\n\nDuring the just-completed Ashes series, Australia opted against selecting a front-line spinner in three of the five Tests.\n\nThe fifth and final Test in Sydney marked the first time in 138 years that a specialist spinner did not feature in an SCG Test.\n\nThe preceding Test at the MCG was the first to be played in Australia in which not a single over of spin was bowled. \n\nHaving closely followed the series, Sharma said he was beginning to question what his future held.\n\n\"It's not great to be seeing a team with no spinners, especially in Australia,\" Sharma said.\n\n\"[Spin bowling] is always going to keep evolving, it's not going to say the same as what it was five years ago — spinners will keep finding a way to get up there because we are an important part of the team.\n\n\"I guess we just have to find a way to get up there.\"\n\nSimilar concerns were raised by 12-year-old Boyd, who messaged ABC Sport during the Sydney Test.\n\n\"As a young aspiring spinner playing under 12s, why has the Australian team made it so hard for me and other young spinners to play Test cricket?\" he asked.\n\nFormer Australian fast bowler and ABC Sport expert Jason Gillespie said he \"firmly\" believed spinners still had a key role to play at Test level.\n\n\"A spinner always plays a role, even if the surface doesn't necessarily dictate it,\" Gillespie said.\n\n\"Spinners are going to learn how to bowl on different surfaces, surfaces that may not encourage spin.\n\n\"I can kind of understand why the teams both chose not to play spin at times in this series — they probably felt that the Test matches weren't going to go for five days.\n\n\"But it's a Test match and our young spinners need to learn how to bowl in all conditions, not just in spin-friendly conditions.\"\n\nFormer Australian spinner Ray Bright said the frenetic pace of modern Test cricket was not helping.\n\n\"This Ashes series has probably been one of the shortest, so it hasn't really given wickets a chance to deteriorate,\" Bright said.\n\n\"They've been green and grassy from day one, so they haven't broken up at all in any shape or form.\n\n\"If they keep serving up the wickets they have, well you might as well play a batter [instead].\"\n\nBright believes more support for spinners coming through the lower levels is critical for Australia to find a long-term successor to Nathan Lyon.\n\n\"I don't know how much effort has been put into developing and encouraging them,\" Bright said.\n\n\"We need captains and coaches to give [young spinners] a bowl and not just go to the medium pacers all the time, particularly on good, flat wickets.\"\n\nFrankston-Peninsula Cricket Club's Peter Buchanan said the current lack of support was turning many spinners away from the craft.\n\n\"A lot of young cricketers today tend to be bowling medium pace or even faster,\" Buchanan said.\n\n\"There is the odd spinner, but nowadays boys and girls tend to rely on two or three of the skills.\n\n\"You don't see too many young cricketers that are just trying to learn how to bowl off spin and leg spin, they're generally batters who can bowl a bit.\n\nBuchanan said it was \"quite possible\" the lack of spin seen in the Ashes would accelerate that trend. \n\n\"I think there's still a place in the game for a spinner, but I just think at the moment with these drop-in pitches, they're tending to be more conducive to medium and fast bowling,\" he said.\n\n\"With the white ball format, a lot of these junior competitions, young cricketers are only allowed to bowl certain amount of overs and as a spin bowler you actually need to bowl lots of overs to … improve your craft and it takes a long time.\n\n\"So, I think it's an issue but hopefully it's not a dying art because we need to have spin bowling as an option in all games of cricket.\"",
				"created_at": "2026-01-14T09:36:12.970Z",
				"author": {
					"id": "31",
					"name": "Ashley Moore",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=ashleymoore",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Labs",
					"Benchmarks"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-MQDNNaw0",
				"slug": "mystery-grips-village-aft-ileq",
				"title": "Mystery grips village after 'priceless' trophy fleeced from museum",
				"sub_title": "Mystery grips village after 'priceless' trophy fleeced from museum",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/7168a7b6a50486e1a78148ae7d9525b1?impolicy=wcms_crop_resize&cropH=1080&cropW=1440&xPos=147&yPos=0&width=862&height=647",
				"body": "In a quiet and picturesque village in Tasmania's Midlands, a bizarre and brazen robbery has taken place.\n\nA renowned trophy has been stolen from the Tasmanian Wool Centre in Ross in a late-night smash and grab caught on CCTV.\n\nThe prestigious Ermenegildo Zegna Trophy was the only item taken from the centre, which houses a museum and gift shop, and is a popular stop for tourists along the Midland Highway.\n\nThe theft is the talk of the village.\n\nThe centre's general manager, Jessica Newton, recalls getting a \"terrible\" phone call about the robbery one night in December.\n\n\"I couldn't believe it,\" she said.\n\n\"I kept thinking … did that really happen? Was it a dream, or nightmare?\"\n\nFor decades, the \"Zegna\" trophy has represented the strong ties between premium Tasmanian wool and Italian high fashion.\n\nFrom 1963 to 2008, it was awarded to the best superfine merino fleece, and considered among the world's most coveted wool industry trophies.\n\nMs Newton described the trophy — created by renowned Tasmanian sculptor Stephen Walker — as \"spectacular\".\n\n\"It's an amazing thing to see,\" she said.\n\n\"It tells the story of wool growing in the Midlands.\"\n\nIn recent years, it had been showcased at the centre's museum.\n\nBut that all changed at 11:38pm on Friday, December 5.\n\nNothing else stolen in heist caught on CCTV\n\nCCTV footage shows a man breaking into the museum's side door and heading straight for the Zegna.\n\nClad in a hoodie, trousers and gloves, he then uses a hammer to smash through the glass casing, before taking the trophy and fleeing the scene in a white van.\n\nThe robbery was over in a matter of minutes.\n\nNo-one has been arrested and Tasmania Police say investigations are ongoing.\n\nWhile baffled by the brazen heist, Ms Newton believed the trophy was specifically targeted.\n\n\"It's made out of some beautiful things, but not a huge amount of them,\" she said.\n\n\"To go to this trouble to take it … it's a mystery.\"\n\nWill 'priceless' trophy be returned?\n\nFor those in the Tasmanian wool industry, like broker Rob Calvert, the trophy's theft has been a shock.\n\n\"We're very sad that this has happened and hopefully it turns up again,\" he said.\n\n\"The growers that won the award were regarded as producing the finest wool in the world.\"\n\nPremium Tasmanian wool continues to be popular among Italian luxury fashion brands, including Milan-based Zegna.\n\n\"It means a lot more to the industry and to Tasmania — and to those few farmers who were lucky enough to win it — than it does from a commercial point of view,\" Mr Calvert said.\n\nMore than a month after the incident, Ms Newton said locals were still talking about it.\n\n\"We've never been involved in any sort of robberies or anything like that,\" she said.\n\n\"The town is a really beautiful, small, tight-knit community.\"\n\nStill, she was hopeful the Zegna would one day be returned.\n\n\"First and foremost, it would be amazing to get it back,\" she said.\n\n\"It's priceless, and it's not the type of thing you can just sell down at the pub or offload easily.\"",
				"created_at": "2026-01-14T09:33:44.769Z",
				"author": {
					"id": "43",
					"name": "Hannah Clark",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"RAG",
					"Labs"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-URL2TRqd",
				"slug": "wa-towns-look-to-tackle-o-jhn0",
				"title": "WA towns look to tackle overtourism as 'crazy' crowds pack car parks, beaches",
				"sub_title": "WA towns look to tackle overtourism as 'crazy' crowds pack car parks, beaches",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/cc0c68426e844907da696a0242a465ba?impolicy=wcms_crop_resize&cropH=1150&cropW=1533&xPos=99&yPos=0&width=862&height=647",
				"body": "As Western Australian tourist towns experience an influx of summer visitors, some locals are worried their home towns could become too crowded unless visitor numbers are controlled at attractions and beaches.\n\nAt one of the South West's biggest attractions, the Busselton Jetty, visitation has grown by more than 60 per cent over the past decade.\n\nAs many as 10,000 people visited the jetty between Christmas and New Year's Day.\n\nStaff have been looking at ways to avoid overtourism in the future.\n\nBusselton Jetty CEO Lisa Shreeve said she was conscious of keeping the place 'special'.\n\n\"When you go to places around the world like the Trevi Fountain and you see 10,000 people standing there, it really impacts your experience if you have to be so congested,\" she said\n\n\"The Busselton Jetty is special and we don't want to lose that.\"\n\nMs Shreeve said the team would consider limiting the number of people on tours and other ways to spread out visitation.\n\n\"I don't think we would have to cap walk tickets at this stage but we definitely have to cap underwater observatory tickets and train tickets.\"\n\n'Crazy' Dunsborough tourism\n\nIn the neighbouring town of Dunsborough, the chair of the local reference group said he wanted the town's visitor numbers capped by limiting accommodation spots.\n\nJeff Forrest has lived in Dunsborough for almost 40 years and said he had seen local beaches become increasingly busy.\n\n\"Every year we see something crazy,\" he said.\n\n\"There has been times where on the coast you can't get a car park at all, not even on the side of the road.\"\n\n\"We welcome tourists, that's important, but if we're not careful overtourism will actually destroy the character, the amenity, the natural environment, the beauty of the area that we've got to sell.\"\n\nHe said he was worried the region was reaching its limit.\n\n\"How many sheep can you put in a paddock before you ruin the paddock,\" he said\n\n\"It's about working out what the real carrying capacity of the area is and then finding ways to manage and restrict the numbers that come here.\"\n\nSlice of paradise for everyone\n\nAt Meelup Beach many visitors were not keen on the idea of capping tourists to Dunsborough.\n\nKalia and Matt Alessi have lived in Syndey and said beaches in the eastern states were far busier.\n\n\"For a really busy time of the year, it's been quite a nice beach to enjoy,\" Ms Alessi said.\n\n\"Tourism boosts the economy so much [and] we want to respect locals as much as possible, but if you put a cap you might hinder other organisations.\"\n\nThe pair said they were happy to share the beach.\n\n\"The beach is for everyone, regardless of how busy it is, so I think to put a cap is a little bit selfish and greedy,\" said Mr Alessi.\n\nCouncil reluctant to intervene\n\nThe City of Busselton has already cracked down on short-stay accommodation like Airbnb.\n\nMayor Phil Cronin said the council was unlikely to intervene further.\n\nHe said the issue would fix itself before numbers grew to levels seen in some parts of Europe and the eastern states.\n\n\"If we get to a point of saturation this won't be such an attractive place to be,\" he said.\n\n\"Tourism brings in $1 billion a year just to this area ... we have to embrace tourism.\"\n\nExplore elsewhere \n\nFurther south, The Department of Biodiversity, Conservation and Attractions warned holidaymakers on social media about 'chock-a-block' car parks at places like William Bay National Park, near Denmark.\n\nRegional Leader for Parks and Visitor Services Peter Masters has urged visitors to \"go elsewhere\" if their favourite spots were full.\n\n\"A lot of national parks at times get overloved,\" he said \n\n\"We don't want damage to the vegetation. There's also increased risk of fire from starting underneath their vehicles so please park in the designated areas.\n\n\"Everyone doesn't necessarily need to go to the coast to have a good time, there's plenty of inland activities on offer.\"",
				"created_at": "2026-01-14T09:28:36.068Z",
				"author": {
					"id": "56",
					"name": "Austin Scott",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=austinscott",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"RAG",
					"Benchmarks"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-yR9AStHk",
				"slug": "grateful-dead-founding-me-8wym",
				"title": "Grateful Dead founding member Bob Weir dies at 78",
				"sub_title": "Grateful Dead founding member Bob Weir dies at 78",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/50eafd1d044236c46b8f21c7da128b3f?impolicy=wcms_crop_resize&cropH=2881&cropW=3841&xPos=243&yPos=0&width=862&height=647",
				"body": "Bob Weir, guitarist, singer and founding member of the Grateful Dead, has died at age 78.\n\nWeir's death was announced on Saturday in a statement on his Instagram page.\n\n\"It is with profound sadness that we share the passing of Bobby Weir,\" the statement said.\n\n\"He transitioned peacefully, surrounded by loved ones, after courageously beating cancer as only Bobby could. Unfortunately, he succumbed to underlying lung issues.\"\n\nWeir joined the Grateful Dead — originally the Warlocks — in 1965 in San Francisco at age 17.\n\nHe spent the next 30 years playing on endless tours with the Grateful Dead alongside fellow singer and guitarist Jerry Garcia, who died in 1995.\n\nWeir wrote or co-wrote and sang lead vocals on Dead classics, including Sugar Magnolia, One More Saturday Night and Mexicali Blues.\n\nIn the decades since, he kept playing with other projects, including Dead and Company.\n\n\"For over sixty years, Bobby took to the road,\" the Instagram statement said.\n\n\"A guitarist, vocalist, storyteller, and founding member of the Grateful Dead. Bobby will forever be a guiding force whose unique artistry reshaped American music.\"\n\nWeir's death leaves drummer Bill Kreutzmann as the only surviving original member. Founding bassist Phil Lesh died in 2024.\n\nDead and Company played a series of concerts for the Grateful Dead's 60th anniversary in July at Golden Gate Park in San Francisco.\n\nAP",
				"created_at": "2026-01-14T09:26:03.330Z",
				"author": {
					"id": "59",
					"name": "Alexis Baker",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=alexisbaker",
					"profile_bio": "Author",
					"role": "Authors"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Benchmarks",
					"Labs"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-MQYzcoJI",
				"slug": "violence-reported-across--xk7i",
				"title": "Violence reported across Iran as government signals crackdown on protests",
				"sub_title": "Violence reported across Iran as government signals crackdown on protests",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/e7dbd36dd16087874fb057b170595ddc?impolicy=wcms_crop_resize&cropH=3024&cropW=4032&xPos=0&yPos=0&width=862&height=647",
				"body": "Anti-government chants filled the streets of Iran's capital on Saturday night, as protesters pressed the biggest movement against the Islamic republic's rulers in more than three years despite a deadly clampdown under the cover of an internet blackout.\n\nIran's authorities have indicated they could intensify their crackdown on the demonstrations, as the Revolutionary Guards vow to safeguard the government.\n\nThe two weeks of demonstrations have posed one of the biggest challenges to the theocratic authorities who have ruled Iran since the 1979 Islamic revolution, although Supreme Leader Ayatollah Ali Khamenei has expressed defiance and blamed the United States.\n\nThere were fresh reports of violence across Iran, although an internet blackout made it difficult to assess the full extent of unrest.\n\nUS President Donald Trump said on Saturday his country was \"ready to help\" the movement, a day after warning Iran was in \"big trouble\" and reiterating that he could order new military action after Washington backed and joined Israel's 12-day war against the Islamic republic in June.\n\n\"Iran is looking at FREEDOM, perhaps like never before. The USA stands ready to help!!!\" Trump said in a post on Truth Social.\n\nThe demonstrations began on December 28 over the collapse of the Iranian rial currency, which trades at more than 1.4 million to $US1, as the country's economy is squeezed by international sanctions, in part levied over its nuclear program.\n\nThe protests have swelled and turned to ousting the clerical authorities.\n\nCrowds gathered again on Saturday in the north of the Iranian capital Tehran, setting off fireworks and banging pots as they shouted slogans in support of the ousted monarchy, according to video verified by news agency AFP.\n\nReza Pahlavi, the US-based son of Iran's deposed shah, had urged Iranians to stage more targeted protests on Saturday and Sunday after hailing mass protests on Friday.\n\n\"Our goal is no longer just to take to the streets. The goal is to prepare to seize and hold city centres,\" he said in a video message on social media.\n\nIranian authorities had called for \"restraint\" and announced measures to try to address grievances in the days after protests broke out on December 28, but hardened their line as they persisted.\n\nRights groups expressed alarm that authorities were intensifying a deadly crackdown under the cover of an internet blackout that has lasted 48 hours, according to monitor Netblocks.\n\nDeath toll grows amid crackdown: reports\n\nThe death toll in the protests has grown to at least 72 people, and more than 2,300 others have been detained, according to the US-based group Human Rights Activists in Iran.\n\nIranian state TV is reporting on security force casualties while portraying authorities as in control over the nation.\n\nSupreme Leader Ayatollah Ali Khamenei has signalled a coming clampdown, despite US warnings.\n\nTehran escalated its threats on Saturday, as Iran's Attorney-General Mohammad Movahedi Azad warned that anyone taking part in protests would be considered an \"enemy of God\", a death penalty charge.\n\nThe statement carried by Iranian state television said even those who \"helped rioters\" would face the charge.\n\n\"Prosecutors must carefully and without delay, by issuing indictments, prepare the grounds for the trial and decisive confrontation with those who, by betraying the nation and creating insecurity, seek foreign domination over the country,\" the statement read.\n\n\"Proceedings must be conducted without leniency, compassion or indulgence.\"\n\nAmnesty International said it was analysing \"distressing reports that security forces have intensified their unlawful use of lethal force against protesters\" since Thursday.\n\nAli Rahmani, the son of Nobel Peace Prize laureate Narges Mohammadi who is imprisoned in Iran, noted that security forces killed hundreds in a 2019 protest, \"so we can only fear the worst\".\n\n\"They are fighting, and losing their lives, against a dictatorial regime,\" Mr Rahmani said.\n\nNorway-based Iran Human Rights (IHR) group posted images it said were of bodies of people shot dead in the protests on the floor of Alghadir hospital in eastern Tehran.\n\n\"These images provide further evidence of the excessive and lethal use of force against protesters,\" IHR said.\n\nOn Friday in Tehran's Saadatabad district, protesters chanted anti-government slogans including \"death to Khamenei\" as cars honked in support, a video verified by AFP showed.\n\nOther images disseminated on social media and by Persian-language television channels outside Iran showed similarly large protests elsewhere in the capital, as well as in the eastern city of Mashhad, Tabriz in the north and the holy city of Qom.\n\nIn the western city of Hamedan, a man was shown waving a shah-era Iranian flag featuring the lion and the sun amid fires and people dancing.\n\nThe same flag briefly replaced the current Iranian flag over the country's embassy in London, when protesters managed to reach the building's balcony, witnesses told AFP.\n\nOn Thursday and Friday, an AFP journalist in Tehran saw streets deserted and plunged into darkness ahead of any protests.\n\n\"The area is not safe,\" said a cafe manager as he prepared to close the shop at about 4pm.\n\nAn AFP reporter saw shop windows broken, as well as security forces deploying.\n\nA doctor in north-western Iran said that since Friday, large numbers of injured protesters had been brought to hospitals.\n\nSome were badly beaten, suffering head injuries and broken legs and arms, as well as deep cuts.\n\nAt least 20 people in one hospital had been shot with live ammunition, five of whom later died.\n\nWorld leaders urge restraint from Iranian authorities\n\nAuthorities said several members of the security forces had been killed, and Ayatollah Ali Khamenei in a defiant speech on Friday lashed out at \"vandals\" and accused the United States of fuelling the protests.\n\nState TV on Saturday broadcast images of funerals for several members of the security forces killed in the protests, including a large gathering in the southern city of Shiraz.\n\nIt also aired images of buildings, including a mosque, on fire.\n\nIran's army said in a statement that it would \"vigorously protect and safeguard national interests\" against an \"enemy seeking to disrupt order and peace\".\n\nGlobal leaders have urged restraint from Iranian authorities, with European Union chief Ursula von der Leyen saying Europe backed Iranians' mass protests and condemned the \"violent repression\" against the demonstrators.\n\nMr Trump said on Thursday he was not inclined to meet Mr Pahlavi, a sign that he was waiting to see how the crisis plays out before backing an opposition leader.\n\nIran has had repeated bouts of unrest, including over a disputed election in 2009, against economic hardships in 2019, and in 2022 over the death in custody of a woman accused of violating dress codes.\n\nMr Trump, who joined Israel to strike Iran's nuclear sites last summer, has included Iran in lists of places in which he could intervene since sending forces to seize the president of Venezuela a week ago.\n\nOn Friday, in a warning to Iran's leaders, he said: \"You better not start shooting because we'll start shooting too.\"\n\nSome protesters on the streets have shouted slogans in support of Mr Pahlavi, such as \"Long live the shah\", although most chants have called for an end to rule by the clerics or demanded action to fix the economy.\n\nOn Friday, Mr Khamenei accused protesters of acting on behalf of Mr Trump, saying rioters were attacking public properties and warning that Tehran would not tolerate people acting as \"mercenaries for foreigners\".\n\nAirlines have cancelled some flights to Iran over the demonstrations.\n\nAustrian Airlines said on Saturday that it had decided to suspend its flights to Iran \"as a precautionary measure\" through to Monday.\n\nTurkish Airlines earlier announced the cancellation of 17 flights to three cities in Iran.\n\nAFP/Reuters/AP",
				"created_at": "2026-01-14T09:22:38.496Z",
				"author": {
					"id": "36",
					"name": "Daniel White",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=danielwhite",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Benchmarks",
					"Labs"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-EEau15TK",
				"slug": "adelaide-festival-board-m-ioub",
				"title": "Adelaide Festival board members, chair quit after author's cancellation from Writers' Week",
				"sub_title": "Adelaide Festival board members, chair quit after author's cancellation from Writers' Week",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/69ccaf380413bb5058c4ae1d96ef663b?impolicy=wcms_crop_resize&cropH=548&cropW=730&xPos=0&yPos=16&width=862&height=647",
				"body": "The Adelaide Festival chair and several board members have resigned amid controversy over the cancellation of Palestinian-Australian author Randa Abdel-Fattah from this year's Adelaide Writers' Week.\n\nLate on Sunday, the ABC exclusively confirmed that the board's chair, Tracey Whiting, had stepped down.\n\nIt has also been confirmed Daniela Ritorto, Donny Walford and Nicholas Linke have stepped down from their roles.\n\nEarly on Sunday, South Australia's Premier Peter Malinauskas — who has \"wholeheartedly\" backed the board's position — elaborated on his involvement in the matter, saying he offered his \"clear and plain\" opinion to the board but did not instruct it to change the Writers' Week schedule.\n\nDozens of authors have withdrawn from the event in support of Abdel-Fattah, who has previously faced criticism for comments she has made about Israel.\n\nAbdel-Fattah's planned appearance at this year's Writers' Week event was cancelled after the board said it would \"not be culturally sensitive to continue to program [Abdel-Fattah] at this unprecedented time so soon after Bondi\" — a reference to the December terrorist attack in which 15 people were killed.\n\nEx-Adelaide Writers' Week director Jo Dyer is among 11 former Adelaide Festival leaders who have urged her reinstatement, and said the resignations of three of its members left the board's current position in limbo.\n\n\"I don't think they have a legally constituted board at the moment. Under the [Adelaide Festival] corporation's act, the board is required to have at least two women on it, two men on it — it doesn't have that at the moment. The whole thing now is a complete debacle,\" Ms Dyer said.\n\n\"The decision that the board took last week to dis-invite Dr Abdel-Fattah has absolutely trashed the international standing of the event, and we can see that from the fact that more than 90 per cent of the invited guests to Writers' Week have withdrawn from the event in protest.\"\n\nMs Dyer earlier said literary festivals were designed \"to allow civilised debate to take place on a range of different issues\".\n\n\"It is true that by law the premier cannot direct the board to do anything but if you bring strong sustained pressure over a period of time and you are the organisation's chief funder then obviously that is pressure which is difficult to ignore,\" she said.\n\nOn Sunday, Mr Malinauskas said he did not have the power to direct the board — but said it did ask for his opinion before making its decision to revoke its invitation to Abdel-Fattah.\n\n\"My opinion was sought and it was offered, and I was more than happy to offer my opinion and make it clear and strongly known,\" he said.\n\n\"I made clear to the board every single step of the way that I have a view but I also made clear to the board that I wouldn't be instructing them or intervening on them or threatening cancelling funding or anything like that. I've made that clear and plain.\"\n\nAbdel-Fattah's criticisms of Israel include a 2024 post on social media platform X, in which she stated: \"The goal is decolonisation and the end of this murderous Zionist colony\".\n\nOn Friday, Jewish Community Council of South Australia public and government liaison Norman Schueler said the council had sent a letter to the board requesting the removal of Abdel-Fattah from the Writers' Week program.\n\n\"The board [has] completely, appropriately dis-invited her,\" Mr Schueler said.\n\n\"Personally, I'm very, very surprised it appears a large cohort of people have decided to support her.\"\n\nMr Malinauskas said while he had spoken to Mr Schueler about the matter, he did so only after he had made his \"position clear\", adding that he \"did not receive contact from the Jewish community\" prior to his communication with the board.\n\n\"What I can definitively tell you, thinking through the chronology, is I made my view to the board known about this before I received any representations from the Jewish community,\" he said.\n\n\"In this instance the board made a judgement that someone crossed a line when they advocated against the cultural safety of others, because that runs contrary to the whole idea of the event.\"\n\nLawyer writes to festival chair\n\nMr Malinauskas — who in 2023 said he strongly considered pulling state government funding from Writers' Week amid controversy involving another Palestinian author, but decided against such a move because it would have been a step \"down a path to Putin's Russia\" — said the purpose of Writers' Week was to allow exchanges of ideas.\n\n\"There have always been pro-Palestinian authors and advocates at Adelaide Writers' Week. This one is no different,\" he said.\n\nMr Malinauskas said that Abdel-Fattah herself had previously advocated for the exclusion of a pro-Israeli author at Writers' Week.\n\n\"In the beginning of 2024, Louise Adler, the director of Writers' Week and the board received correspondence from Dr Abdel-Fattah herself calling on the cancellation of a pro-Israeli speaker,\" Mr Malinauskas said.\n\nMr Malinauskas said there was an indication that the author's non-attendance was ultimately because of \"a scheduling issue\", but he suggested that was beside the point.\n\n\"Call it what you like, after the correspondence from Dr Randa Abdel-Fattah, they removed a pro-Jewish Israeli speaker. Fast forward two years and I think it's reasonable for the board to apply the same principle,\" he said.\n\nThose remarks appear to have been in reference to Jewish-American author Thomas Friedman, who did not take part in the 2024 event.\n\nAbdel-Fattah confirmed she was among several academics who had signed a letter asking for his invitation to be rescinded, but said she rejected as \"insulting\" comparisons \"between the circumstances surrounding my cancellation and the principled request\" she had made two years ago.\n\nAbdel-Fattah said the basis of her objection to Friedman's attendance in 2024 was the language used about the Middle East in a New York Times article entitled Understanding the Middle East Through the Animal Kingdom.\n\n\"We were concerned about the impact of Mr Friedman's views on socially and historically marginalised people who have been dehumanised and discriminated against,\" she said.\n\n\"The festival in fact reiterated its support for 'artistic freedom' in response to our request and Mr Friedman was not cancelled.\"\n\nAbdel-Fattah provided a letter from the Adelaide Festival Corporation dated February 2024 which stated that cancelling a writer was an \"extremely serious request\", and that while Friedman had been programmed to contribute to that year's event he would no longer be participating \"due to last-minute scheduling issues\".\n\nIn the wake of her own cancellation, Abdel-Fattah was critical of the festival board for what she described as its \"selective respect for freedom of ideas and freedom of speech\" and said she had been \"heartened by the support\" she had received from other writers.\n\n\"But this isn't just about support for me. It is about writers rejecting the correlation between me, as a writer of Palestinian background, and the Bondi atrocity which is insinuated in the Adelaide Festival board's statement,\" she said.\n\n\"It's also about writers standing up to support what writers festivals and all cultural festivals should be about — probing what may be considered difficult topics or questions, being challenged and sitting with difference.\"\n\nA lawyer for Abdel-Fattah has now written to the Adelaide Festival chair asking it to clarify its statement regarding her exclusion.\n\n\"It appears, from this statement, that the board's decision to exclude Dr Abdel-Fattah was made because of 'past statements' made by her,\" the letter stated.\n\n\"As a matter of basic procedural fairness to Dr Abdel-Fattah, please identify with specificity each of the 'past statements' made by her on which the board relied in making its decision.\"\n\nThe Adelaide Festival has been contacted for comment.",
				"created_at": "2026-01-14T09:20:07.161Z",
				"author": {
					"id": "39",
					"name": "Megan Thompson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=meganthompson",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Labs",
					"Benchmarks"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-UBFkkahg",
				"slug": "frosty-finish-as-ice-cold-tfrq",
				"title": "Frosty finish as ice-cold Sabalenka soars to second-successive Brisbane title",
				"sub_title": "Frosty finish as ice-cold Sabalenka soars to second-successive Brisbane title",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/1c83a2a220cf669865c4a43a3ef9c26c?impolicy=wcms_crop_resize&cropH=1960&cropW=2613&xPos=0&yPos=158&width=862&height=647",
				"body": "Default content body",
				"created_at": "2026-01-14T09:20:05.373Z",
				"author": {
					"id": "25",
					"name": "Emily Johnson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=emilyjohnson",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Benchmarks",
					"RAG"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-zDE5qMDT",
				"slug": "relaxed-medvedev-claims-b-w5fx",
				"title": "Relaxed Medvedev claims Brisbane International crown",
				"sub_title": "Relaxed Medvedev claims Brisbane International crown",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/cc237231fe6b41a7b5ab27f2ac95d5d4?impolicy=wcms_crop_resize&cropH=3235&cropW=4313&xPos=308&yPos=0&width=862&height=647",
				"body": "Daniil Medvedev has warmed up for the Australian Open with a comfortable straight-sets victory over Brandon Nakashima to win the Brisbane International.\n\nThe victory is Medvedev's first in a season-opening tournament since winning Sydney in 2018.\n\nThe three-time beaten Australian Open finalist was not at his best, but didn't need to be against the former junior world number three, completing a 6-2, 7-6 (1) in an hour and 34 minutes.\n\n\"I came here to play this tournament here and not just to prepare for the Australian Open or something,\" Medvedev said.\n\n\"I came here to try to start the season strong. \n\n\"To start strong after the good preparation, it's important for self confidence, so I'm happy with it. \n\n\"I'm looking forward to, of course, for the next tournament, which is Australian Open.\"\n\nIt is his 22nd title, all of which have been won in different tournaments.\n\nMedvedev flew out of the blocks — 3-0 up in the blink of an eye, his first serve firing and Nakashima foundering.\n\nPerhaps it was nerves. Once Nakashima got on the board, he challenged Medvedev's serve for the first time, even going as far as earning a break point.\n\nBut a couple of loose errors handed back Medvedev's advantage.\n\nMedvedev's demeanour has been curious all week — reacting to any missed shots with an insouciance more befitting a hit out at the local park than an ATP final.\n\n\"The most important is I always stay true to myself,\" Medvedev said.\n\n\"It's my emotions. But I also know that this emotion, they can be fun, they can be a bit too much, but many times they can cost me a bit of energy and a bit of concentration during the match. \n\n\"And so of course, now we said it's better to stay calm. \n\n\"It's easier, but then that's something I couldn't do. So I'm happy that here I managed to find kind of a flow which I was following.\"\n\nThere was irritation though when he double faulted to give Nakashima a break point while serving for the set — and again when he dropped another serve into the net at set point.\n\nBut Nakashima was not able to accept those gifts, more unforced errors from the 24-year-old Californian and some blistering aces from Medvedev sealing the set.\n\nWhen you've been in 40 ATP-level finals before this one, perhaps Medvedev could be excused for keeping his eye on the main prize — Melbourne Park in a week's time.\n\nThe Russian was trying out different tactics — if he is to deploy the drop shot in Melbourne it needs more work to be a real test to the very best — even if Nakashima's superb movement was at least partially responsible for Medvedev's looking lacklustre.\n\nBut relaxed or not, there was little doubt that Medvedev still possessed the killer touch, pouncing on a loose service game midway through the set to take a telling break at 4-2.\n\nBut Nakashima didn't quit.\n\nAs Medvedev served for the match, Nakashima fought to earn break points; the first with a rousing passing shot that Medvedev saved, the second when Medvedev fell short with a ground stoke.\n\nThe crowd roared its approval, hoping for another set of tennis to end its week on a high.\n\nBut they were to be disappointed, as Medvedev crushed the tie breaker 7-1 to win a maiden Brisbane title, setting him up nicely for another tilt at the Australian Open.\n\n\"I know that when I'm playing good there are not that many players that can beat me easily. Or at all,\" Medvedev said.\n\n\"If I manage to play good in Australia, I'm happy with my chances and then you never know.\n\n\"Sometimes a player can make a match of the year against you, or you can get Carlos [Alcaraz], Yannick [Sinner] or I don't know, someone else and they can beat you.\n\n\"So I'm happy with the way I'm playing right now. I'm happy with the title and I'm looking forward to next week.\" \n\nIn the men's doubles match earlier in the day, third seed Portuguese/Austrian pair Francisco Cabral and Lucas Miedler beat British top seeds and defending Brisbane International champions Julian Cash and Lloyd Glasspool 6-3, 3-6, 10-8.\n\nOn Show Court 1 in the inaugural wheelchair singles competition, British top seed Alfie Hewett beat second seeded Spaniard Martín de la Puente.\n\nWorld number two Hewett, a 10-time grand slam singles winner — including the defending Australian Open champion — claimed a comfortable victory 6-3, 6-1.\n\n#newsletter:abc-sport_optin",
				"created_at": "2026-01-14T09:20:01.201Z",
				"author": {
					"id": "73",
					"name": "Paula Morris",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=paulamorris",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Insights",
				"category_names": [
					"Breakthroughs",
					"RAG"
				],
				"subcategory_names": []
			}
		],
		"research": [
			{
				"entry_id": "dtc-37RNYgs3",
				"slug": "wetland-teeming-with-life-1anr",
				"title": "Wetland teeming with life in this remote Corner Country of NSW",
				"sub_title": "Wetland teeming with life in this remote Corner Country of NSW",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/24de5d9bfaaf21aa582db5d6bfa00ced?impolicy=wcms_crop_resize&cropH=2268&cropW=3024&xPos=504&yPos=0&width=862&height=647",
				"body": "In one of the most remote parts of New South Wales, a desert has turned into an oasis.\n\nWater from floods in south-west Queensland early last year have flown down the Bulloo River, through the Bulloo Overflow and into Narriearra Caryapundy Swamp, an ephemeral wetland that only fills every 10 to 20 years.\n\nThe swamp is a 17-hour drive from Sydney to the Corner Country – not far from the dog fence at the Queensland border which forms its northern boundary.\n\n\"This is an incredibly healthy system and it's just going through the natural rhythms that it's been doing for tens of thousands of years,\" river ecologist Professor Richard Kingsford said.\n\n\"I think it's one of the most incredible wetlands that we've got in the country.\"\n\nThe 70,000-hectare wetland received Ramsar listing in 2021, and is part of the larger Bulloo Overflow.\n\nProfessor Kingsford said he thought the wetland had its largest infill ever, as the 2024 floods at Thargomindah were bigger than those in the 1950s and 1970s.\n\n\"We know it's big but when you … survey it from a light aircraft and it takes you hours to go back and forth, you just realise what an amazing natural phenomenon this is,\" he said.\n\nSurvey estimates 300,000 birds\n\nSince the New South Wales government purchased the 150,000-hectare Narriearra Station about five years ago, scientists, rangers and local Indigenous people have been able to appreciate its ecological significance and cultural history.\n\nProfessor Kingsford estimated about 200,000 to 300,000 birds were in the area when it was surveyed in October 2025.\n\n\"We're flying [in an plane] at 50 metres above the water with tape recorders being like race callers and identifying and estimating the numbers of birds,\" he said.\n\nProfessor Kingsford said they spotted about 30 species including rare species like Freckled Duck.\n\n\"[There were] over 100,000 grey teal ducks, 70,000 pink-eared ducks, and even the swans were breeding there,\" he said.\n\n\"I've never seen so many swamphens in one place.\n\n\"Even one of the enigmas of water birds, these black-tailed native-hens, were all also there in their tens of thousands.\n\n\"[It's] just an incredible sight to see.\"\n\nProfessor Kingsford said it was the first bird survey done in about 35 years, with birds a good indicator of the health of a system.\n\nHe said as the water evaporated over the summer, it would become more productive.\n\n\"All those invertebrates and fish that are in the water are going to be available to a whole range of different water birds,\" he said. \n\n\"As it dries, it's got all of this moisture, so you get all the plants, animals and woodland birds and all those small animals will be able to take advantage of that high productivity that's in the system.\"\n\nMalyangapa man Mark Sutton said the water means many totem species were being replenished.\n\n\"My particular totem is the bony bream … and that particular species of fish sits in the sand, often for many years, waiting for a deluge of decent rain,\" he said.\n\n\"Once that water arrives, either flowing down through systems or from the sky, those eggs hatch.\n\n\"Within weeks, those previously dry lakes can suddenly be full of fish.\"\n\nUndisturbed cultural heritage\n\nMr Sutton said the government purchase of Narriearra Station has meant Aboriginal people can access the landscape.\n\n\"For Aboriginal people in the last 150 years, we've really not been able to access most of the landscape because … I would like to think we've respected the non-Aboriginal owners of those lands,\" he said.\n\nNSW National Parks and Wildlife Service Ranger Emma McLean said they had recorded many Indigenous artefacts in the area.\n\n\"This place is so incredibly rich in Aboriginal cultural heritage,\" she said.\n\n\"Everywhere you walk – especially once you get off tracks – everywhere you walk it's just all over the place.\n\n\"There's some really fascinating and important examples of things like hearths – which are ancient cooking fires where people would cook their food – and even stone artefacts.\"\n\nMr Sutton said a very rare greenstone axe head was found on site, which had been traded all the way up from Victoria.\n\n\"These are pretty rare now,\" he said.\n\n\"They were often collected by property owners and others prior to the amendments to the National Parks and Wildlife Act in 1974.\"",
				"created_at": "2026-01-14T09:34:30.580Z",
				"author": {
					"id": "58",
					"name": "Kevin Adams",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"Adoption",
					"Competition"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-bNnPhoOV",
				"slug": "the-wonderful-and-unusual-nl6o",
				"title": "The 'wonderful and unusual' heyday of an island's underwater observatory",
				"sub_title": "The 'wonderful and unusual' heyday of an island's underwater observatory",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/18d8297cb83d2954e1a81e6367fd0346?impolicy=wcms_crop_resize&cropH=840&cropW=1120&xPos=140&yPos=0&width=862&height=647",
				"body": "\"G'day, Coral here.\"\n\nThat's how Coral Wedd would answer the phone in the 1980s at the Middle Island Underwater Observatory's souvenir shop in the Pacific Ocean off Queensland.\n\n\"Not very many people go overseas to work each day under water by the name of Coral,\" Ms Wedd, formerly Howes, laughed.\n\n\"Coral would go to work under the water selling coral to the tourists.\"\n\nIt still makes her chuckle 40 years later.\n\n\"The typical day was the envy of everybody I think,\" she said.\n\n\"It was a wonderful time working on the observatory, it was an unusual time.\"\n\nGreat Keppel Island is 24 kilometres off the coast of Yeppoon in central Queensland.\n\nIn the crystal-clear waters not far from the island, the Middle Island Underwater Observatory was a star attraction in the 80s and 90s.\n\n\"Hundreds of tourists … would come down daily from Rockhampton to the Capricorn Coast, they would load onto the tourist boats … probably 200 people each,\" Ms Wedd recalled.\n\nThree fathoms deep into the sea, it even once hosted maritime nuptials.\n\nA month after the underwater observatory opened in 1980, souvenirs from the gift shop were moved aside to make way for guests and a wedding party.\n\nMark William Heslin and Sharee Anne Newland tied the knot underwater on October 11, 1980.\n\n\"It was quite a novelty for the underwater observatory,\" Ms Wedd reflected.\n\nIn a sad but poignant affair, she also recalled when a young man's ashes were laid to rest.\n\nHe had visited the underwater observatory in the months prior and was fascinated with the set-up and the fish, she said.\n\nThrough an unfortunate accident, he passed away and his parents asked if his ashes could be buried nearby.\n\n\"Our diver from the observatory took the ashes,\" Ms Wedd said.\n\n\"The parents stood and watched as he planted the ashes under a rock and in the sand.\n\n\"It was a bittersweet day for his parents … that was the first, too, for the observatory.\"\n\nA rare kind of tourist attraction\n\nAustralia was home to the world's first underwater observatory stationary structure in 1954 at Green Island off Cairns in Far North Queensland.\n\nBuilt from an old Navy dive chamber, the observatory — which attracted a visit from Queen Elizabeth II in 1970 — closed in 2012 after being deemed unsound.\n\nToday, the world's largest underwater observatory is at Busselton Jetty, in Western Australia, built in 2003 with a 9.5 metre observation chamber.\n\nThe Middle Island Underwater Observatory was the largest in Australia when it opened on September 25, 1980.\n\nIt was the dream of Yeppoon man Jim Nimmo, with the support of his wife Sheena.\n\nMs Wedd was there for the opening day, which involved much fanfare.\n\n\"Lots of broadcasting, radio and TV, very important people coming across, lots of people there, all excited to see it,\" she said.\n\n\"Interestingly, the most excitement was from the dignitaries that came up from Brisbane, they were quite fascinated with the construction, the transport, the sinking [of the observatory under the water].\"\n\nElectrical current to prevent corrosion\n\nThe structure was built on land by Yeppoon firm, Goodies Engineering, between 1979 and 1980.\n\nIt was filled with 500 tonnes of ballast, made of copper and ilmenite.\n\nThe material was loaded via a giant funnel and crane at the Rosslyn Bay Harbour.\n\nTo prevent corrosion, the structure was designed that an electrical current would pass through it 24 hours a day.\n\nThe structure was floated out to sea and was set down 6 metres below sea level on plated piles driven into the seabed.\n\nA Taiwanese shipwreck and other pieces of junk were sunk at the same time to create a habitat for marine life.\n\nThe 10-metre wide building had a souvenir shop on the ocean ground floor with 14 windows that looked out to the ocean.\n\nAn operator would feed the marine life twice a day to keep them lurking close by while tourists watched in awe through the windows.\n\n\"The windows of the observatory were the only ones of their kind, they were 6 foot long, not the little portholes that most of the observatories had at the time,\" Ms Wedd said.\n\n\"I think that was the only one of its kind to have a tourist shop under water, in Australia anyway.\"\n\n'Current state to be assessed'\n\nFollowing the closure of the Great Keppel Island Resort in 2008, the underwater observatory was shuttered as well.\n\nThese days, the only visitors are marine life and scuba divers or snorkellers.\n\nThe area has been rezoned as a green zone, meaning no fishing can take place, which has in turn created a thriving marine life population. \n\nCoral has formed over the old structure and sea animals use the nooks and crannies as a habitat.\n\nIt has become a popular spot with reef fresh, cod, groupers, sharks, rays and turtles often sighted. \n\nThe future of the site now lies in the hands of the state government, which rescinded the leases from former Great Keppel Island Resort owners, Tower Holdings, in 2023.\n\nEarlier this year, a tender was awarded to a demolition company to clean up abandoned buildings on Great Keppel Island, and as part of the works, an assessment was to be undertaken of the Middle Island Underwater Observatory.\n\nIn a new statement requested by the ABC, a Department of Natural Resources and Mines, Manufacturing, and Regional and Rural Development spokesperson said the condition of the underwater observatory was still under assessment. \n\nThey said the department's priority was the safety and security of the former Great Keppel Island resort site. \n\n#newsletter:abc-capricornia_optin",
				"created_at": "2026-01-14T09:30:57.886Z",
				"author": {
					"id": "46",
					"name": "Nicholas Lee",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=nicholaslee",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"Trend Watch",
					"Competition"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-7fLH6EJN",
				"slug": "sixth-tier-minnow-maccles-nfyq",
				"title": "Sixth-tier minnow Macclesfield ends Crystal Palace's FA Cup defence",
				"sub_title": "Sixth-tier minnow Macclesfield ends Crystal Palace's FA Cup defence",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/537cb35bc15f71e2e7ee6b5d7fc53b0b?impolicy=wcms_crop_resize&cropH=2626&cropW=3501&xPos=733&yPos=690&width=862&height=647",
				"body": "Macclesfield has delivered one of the biggest upsets in FA Cup history, stunning defending champion Crystal Palace 2-1 in a third-round thriller. \n\nSixth-tier Macclesfield is the first non-league team to eliminate the FA Cup holders since Crystal Palace knocked out Wolverhampton Wanderers in the 1908-09 first round.\n\nArsenal was the last holder to go out in the third round, in 2018.\n\nPaul Dawson and Isaac Buckley-Ricketts struck in each half as Macclesfield — coached by Wayne Rooney's younger brother John — bridged a gap of 117 places in England's football pyramid.\n\n\"I can't believe it, we never thought we would be in this position,\" John Rooney told the BBC.\n\n\"We were incredible from the first minute. I thought we were deserved winners. I couldn't be any prouder of the lads.\"\n\nDawson rose to head home a curled free kick from Luke Duffy in the 43rd minute.\n\nBuckley-Ricketts doubled the lead in the 60th minute when he twisted his body to wrong-foot Palace goalkeeper Walter Benitez in front of a delirious crowd at Moss Rose, which hosted an under-9s practice earlier in the day.\n\nPalace's Yeremy Pino scored with a stunning free kick in the 90th minute but Macclesfield hung on to win.\n\nThe victory was the latest chapter in a remarkable rise for Macclesfield, which was expelled from the National League five years ago, because of substantial debts.\n\nThe club was purchased by local businessman Robert Smethurst and Macclesfield entered the ninth tier in 2021-22 and has since won three promotions in four seasons.\n\nMacclesfield was also playing with heavy hearts after 21-year-old forward Ethan McLeod died in a car accident while travelling back from an away match last month.\n\nReuters",
				"created_at": "2026-01-14T09:25:22.102Z",
				"author": {
					"id": "30",
					"name": null,
					"avatar_url": null,
					"profile_bio": null,
					"role": null
				},
				"business_type_name": "Research",
				"category_names": [
					"Trend Watch",
					"New Players"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-afilnRiC",
				"slug": "brawl-contained-fireworks-v4g9",
				"title": "Brawl contained, fireworks cancelled due to fire ban as Summernats ends",
				"sub_title": "Brawl contained, fireworks cancelled due to fire ban as Summernats ends",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/c911a5c0e874a95ed0e5c47233b963b7?impolicy=wcms_crop_resize&cropH=3345&cropW=4460&xPos=279&yPos=0&width=862&height=647",
				"body": "Australia's largest car festival has roared to a close in Canberra, ending its 38th year with celebrations and a brawl that police had to contain.\n\nThe four-day event drew about 130,000 people and a record 3,000 entrants to its show car and stunt demonstrations amid challenging heat and windy conditions.\n\nAdam Bickerstaff was named Summernats Grand Champion for racing his 1956 Ford F-100, while Chris Orchard won the Pro Burnout Series, taking home $50,000.\n\nMr Bickerstaff described his Grand Champion win as \"unbelievable\" and \"surreal\".\n\n\"I cannot believe that we've come this far. We've made it. To win the sword is just next level. We never thought it'd happen,\" he said.\n\nPolice contain brawl\n\nA fight in the Burnout Stand on Saturday sparked a police response at Summernats, raising ongoing concerns about antisocial behaviour.\n\nACT Policing said an investigation was underway after officers attended the incident to support security guards.\n\nSummernats managing director Andy Lopez said the altercation had begun as a disagreement between spectators.\n\n\"It was contained reasonably quickly,\" Mr Lopez said.\n\n\"As per our protocols, there was a security and police response to diffuse the incident and a number of patrons were ejected.\"\n\nPolice had warned attendees ahead of the event to expect an increased police presence at venues and on roads. By the first day, police had already seized four cars for alleged illegal driving.\n\nExpansion across the ditch\n\nOrganisers declared the festival a success despite extreme weather, with temperatures in Canberra at times soaring above 35 degrees throughout the four days.\n\nSaturday night's fireworks display was cancelled due to the ACT's total fire ban, the territory's first in six years.\n\n\"We made a lot of changes on the fly to deal with the weather that was coming,\" Mr Lopez said.\n\nDespite the challenging conditions, Mr Lopez used the festival's final days to announce plans to expand Summernats to New Zealand, with its first event scheduled for 2027.\n\n\"We have announced Summernats's second international event. So we're in the USA in March, and we're going to be in Hamilton at Mystery Creek,\" Mr Lopez said.\n\n\"It's a 10-year dream that's coming true and we're really excited.\"\n\nMullet champion named\n\nWild weather forced Saturday's MulletFest heat indoors, where children and adults competed for the best mullet and a place in the national grand final in Kurri Kurri, NSW, in December.\n\nAdult Grand Champion Migelly Shaw said the competition was \"always a lot of fun\" and \"a real great show\".\n\nMr Shaw grew out his previously clean-shaven look three years ago, getting a mullet for his younger brother's wedding, and has not shaved it off since.\n\n\"I let it be its thing. I did get a perm recently. So it's a bit wavy, cut some length off it, and now I just rock it.\"\n\n'Somewhere to express our hobby'\n\nAdam Povey from Cooma entered his Peel P-50, a three-wheeled micro-car recognised as one of the world's smallest production cars.\n\n\"I was actually very nervous about bringing it. I bought it for the first time last year. It's been loved,\" Mr Povey said.\n\n\"The P-50 is very different to all the cars that you see here. It's unique, it's cool. Grown men love it, grown women love it and the kids absolutely adore it.\"\n\nThe car enthusiast, who has attended Summernats for 28 years, said he kept returning for the atmosphere and to catch up with friends.\n\n\"It's somewhere for us to express our hobby and share it with everyone.\"",
				"created_at": "2026-01-14T09:20:16.558Z",
				"author": {
					"id": "63",
					"name": "Sierra Roberts",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=sierraroberts",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"Adoption",
					"Competition"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-rMPIAtAC",
				"slug": "human-remains-discovered--p0ef",
				"title": "Human remains discovered near car in bushfire-ravaged area",
				"sub_title": "Human remains discovered near car in bushfire-ravaged area",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/6128671e6ec88d1541c703a3942b6ef4?impolicy=wcms_crop_resize&cropH=435&cropW=580&xPos=52&yPos=0&width=862&height=647",
				"body": "Victoria has confirmed its first fatality in the bushfire emergency ravaging the state, with police discovering human remains east of the town of Seymour.\n\nOfficers said the person's remains were discovered near a vehicle off Yarck Road in the locality of Gobur.\n\nThe location is in the footprint of the Longwood bushfire, which has been burning through vast areas of central Victoria for several days.\n\nPolice said they were able to access the fire-affected region on Sunday afternoon and discovered the remains about 100 metres from the vehicle.\n\nThe person is yet to be formally identified and a report will be prepared for the coroner.\n\nThe death is the first fatality directly linked to the state's ongoing bushfire disaster.\n\nEmergency service crews on Friday found the body of a man in his 60s in a vehicle on his private property in the bushfire-ravaged town of Harcourt, but they believed his death was not directly related to the nearby Ravenswood South fire.\n\nA report is also being prepared for the coroner in relation to that death.\n\nAustralia heatwave live updates: Read our blog for the latest news as out-of-control bushfires burn and temperatures soar for a fourth day.\n\nForest Fire Management Victoria chief fire officer Chris Hardman said the tragic news of the death was the worst fear of his firefighting crews.\n\nHe told the ABC that the preservation of life was \"at the forefront and the centre of our thinking\".\n\n\"It's what drives and motivates us,\" he said.\n\n\"This really takes all the wind out of our sails, and we feel really heartfelt feelings for the local community there and the family, friends and loved ones of the person who is deceased.\"\n\nHe said the investigation into the person's death was still in an early stage and that Victoria Police was working through its processes.\n\nMr Hardman said there had been \"some incredible work by firefighters\", but the Longwood fire was still out of control.\n\n\"It's a 300-kilometre boundary,\" he said.\n\n\"It's a lot of fire in the landscape and it's going to be with us for some time.\"\n\nThe bushfires have scorched hundreds of thousands of hectares of land, destroyed hundreds of structures and injured or killed potentially thousands of head of cattle as they have raged across the state since Wednesday.\n\nAuthorities are waiting for some affected areas to become safe enough to enter and conduct formal impact assessments.\n\nTwo blazes — the Walwa fire in the state's north-east and a fire in the Great Otway National Park — were continuing to burn at an emergency level on Sunday afternoon, but the Longwood fire was downgraded at about 5pm.\n\nFor more information on the latest fire warnings for Victoria, visit the VicEmergency website.",
				"created_at": "2026-01-14T09:20:13.563Z",
				"author": {
					"id": "41",
					"name": "Lauren Martinez",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=laurenmartinez",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"New Players",
					"Adoption"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-jIE1evbD",
				"slug": "mate-lets-go-again-firefi-l5n9",
				"title": "'Mate, let's go again': Firefighter continues shift after home burns",
				"sub_title": "'Mate, let's go again': Firefighter continues shift after home burns",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/f1c0ef0e7d793aaadf940fc9c1c633b7?impolicy=wcms_crop_resize&cropH=518&cropW=690&xPos=0&yPos=169&width=862&height=647",
				"body": "Volunteer firefighter Michael Harper had been defending homes in central Victoria against the state's catastrophic bushfires for more than 24 hours when he learned over the truck radio that his home was under threat. \n\nDeployed last Thursday as a driver of a CFA strike team — a group of CFA operatives from regional areas  — Mr Harper had spent the past few days on the front line battling blazes across central Victoria.\n\nAnd it was while he was fighting a blaze on the Maroondah Highway that Mr Harper was instructed to drive his team back to Alexandra late on Saturday to defend his home town from the incoming Longwood fire.\n\nHis team of four, which included a 20-year-old volunteer and Murrindindi Shire Council Mayor Damien Gallagher, had just returned from checking on Cr Gallagher's house, which they believed was under threat. \n\n\"Once we got up there, we found that Damien's house hadn't burnt down — which was a huge relief — but over the radio we heard that they were pulling trucks out of [my property address] because of the danger of gas bottles, and they said that they lost all assets there,\" Mr Harper said. \n\n\"I realised at that stage it was actually my house.\"\n\nPulling up to the street, Mr Harper jumped out and started walking towards his property \"speechless\", Cr Gallagher told the ABC.\n\n\"His response was deflation at first, obviously, as you would, then after a while he just started providing water to all the extra crew who had also arrived to the street. He's an incredible guy,\" he said. \n\n\"He said, 'That's OK, I can't change it.'\"\n\n\"I suppose it's about choice, isn't it? You can go down that rabbit hole of feeling sorry for yourself, but there's stuff we need to do,\" Mr Harper told the ABC. \n\nCr Gallagher said he told \"Mike\" his day on the truck was over, and took him back to the fire station. \n\nThe pair had spent the last 24 hours defending fires first from Ruffy and then to Terip Terip, before making their way between Yarck and Merton to defend the fire crossing the Maroondah Highway, where the blaze was \"as intense as fire gets\", the councillor said. \n\n\"We were putting a bandaid over a brain injury, really,\" Mr Harper said, describing the fire on Maroondah.\n\n\"I told him, 'You've done too much, so much'. But we were down to a crew of two, and Mike knew that,\" Cr Gallagher said. \n\n\"Michael came back out [of the fire station] and said, 'Mate, let's go again.'\"\n\nThe team was tasked to defend a farm under threat in Acheron and left immediately.\n\n\"That's just the kind of guy he is,\" Cr Gallagher said.\n\nYou don't think it will be you\n\nMr Harper had left his house on Thursday quickly to respond to fight fires south of Longwood, in central Victoria, and had no time to pack. \n\n\"The call came through that they needed a strike team driver for a deployment straight away, so I literally went home, threw on my fire clothes and went out the door and that's all I had with me,\" he said. \n\nThe volunteer and his wife Cathie, also an Acheron CFA volunteer, knew their property was in a high-risk area. \n\n\"We always discussed that we're in a fire-prone area and we wouldn't be there to defend our house because we knew we'd be on the trucks,\" he said. \n\nMr Harper's wife Cathie evacuated the night before with their dog. \n\n\"I didn't really believe that I needed to take anything, you don't think it's ever going to happen,\" she said. \n\nCathie watched the fire's progress with her brother and said it looked for a long time like her town had \"miraculously\" avoided disaster. \n\n\"We were all high-fiving each other, saying best outcome ever,\" she said.  \n\nAn hour later she got a call from her husband, telling her that he was walking up their driveway and that everything had gone.  \n\nShe didn't believe it until she saw photos of the destruction. \n\n\"I was shocked, devastated; so many emotions run through you.\" \n\n'We just have to play on'\n\nMr Haper said the pair just had to \"play on\". \n\n\"It is what it is, and we understand that when we're in the fire brigade. It's the first few days of the next journey in our life and we're just going to look at it that way.\"\n\n\"That's what we were meant to do.\"\n\nMr Harper said that being on the truck with such confident and capable people and \"doing what we did for that 24 hours\" was \"pretty exhilarating\".\n\n\"We run on adrenaline and you just keep going and, you do, you feel the immense pride in what you're achieving,\" he said. \n\nRead more about the bushfires and heatwaves here:\n\nCr Gallagher, who has been out with fire crews across the region, said that Mr Harper had been driving crews \"wherever they needed to go\", despite the harsh conditions. \n\n\"He was driving on fire, and there was zero visibility … you've just got to point at the heat of the fire with the water,\" he said.\n\n\"Michael was navigating that, keeping us out of ditches and away from fences, until we could sight the fire line and extinguish it.\n\n\"Where we went, vehicles shouldn't have to go. What he was able to do was just incredible.\"\n\nWhile convoying back and forth between Yarck and Merton, Mr Harper's team was saving people's homes and lives, Cr Gallagher said.\n\n\"Michael was a big part of that,\" he said.\n\nAustralia heatwave live updates: Read our blog for the latest news as out-of-control bushfires burn and temperatures soar for a fourth day.\n\nMr Harper was not the only volunteer firefighter to lose his home in Alexandra. \n\n\"Michael's story is so similar. There's been quite a few, and they're all still fighting fires and getting on with it,\" Cr Gallagher said.\n\n\"It's been inexplicable, but I throw my hat off to each and every one of the volunteers who puts themselves out there not knowing the fate of their home.\"\n\nFor more information on the latest fire warnings for Victoria, visit the VicEmergency website.",
				"created_at": "2026-01-14T09:20:12.236Z",
				"author": {
					"id": "43",
					"name": "Hannah Clark",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=hannahclark",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"New Players",
					"Adoption"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-cQc4ANtN",
				"slug": "at-least-500-killed-in-ir-bdgc",
				"title": "At least 500 killed in Iran protests as Trump weighs intervention",
				"sub_title": "At least 500 killed in Iran protests as Trump weighs intervention",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/d96d5b655210955789287808ba07ef2e?impolicy=wcms_crop_resize&cropH=2143&cropW=2857&xPos=472&yPos=0&width=862&height=647",
				"body": "Ongoing nationwide protests in Iran have killed more than 500 people, a rights group says, as Tehran warns of retaliation if US President Donald Trump carries out threats to intervene on behalf of demonstrators.\n\nAccording to its latest spreadsheet — based on activists inside and outside Iran — the US-based Human Rights Activists News Agency said it had verified the deaths of 490 protesters and 48 security personnel, with more than 10,600 people arrested.\n\nOne of the human rights organisations that is trying to piece together a picture of what is happening on the ground is the Europe-based Hengaw.\n\nIt has been verifying some of the few videos published on social media amid a near-total communication blackout.\n\nHengaw has so far been able to identify at least 60 Iranians who have been killed, with women and children among them.\n\n\"We have received at least three videos, and two of which we verified, that it is in Kahrizak morgue and warehouse where dozens of bodies seem to be piled in the hallways,\" a spokesperson for Hengaw, Arina Moradi, told the ABC.\n\n\"We have seen families searching for the bodies of loved ones, and we also talked, we have been able to talk to some eyewitnesses and families of the victims.\n\n\"It seems that the scale of violence is much bigger than we expected.\"\n\nThe US president warned Iranian leaders against using force against demonstrators and said the US stood \"ready to help\".\n\nMr Trump said he was in contact with Iranian opposition leaders. \n\nHe also said, without elaborating, that Iran's leaders had called him on Saturday wanting to negotiate, and that he might talk to them.\n\nOn Sunday, local time, Iran threatened to retaliate against Israel and US bases in the event of US strikes on the country.\n\nThe Wall Street Journal, citing multiple unnamed US officials, reported that the US president was set to be briefed on his options for how to intervene in the country on Tuesday.\n\nIranian Parliament Speaker Mohammad Baqer Qalibaf, speaking in parliament on Sunday, warned the US against \"a miscalculation\".\n\n\"Let us be clear: in the case of an attack on Iran, the occupied territories [Israel] as well as all US bases and ships will be our legitimate target,\" said Mr Qalibaf, a former commander in Iran's Revolutionary Guards.\n\nIran's president, Masoud Pezeshkian, in a televised interview, said Israel and the US were masterminding destabilisation, and that Iran's enemies had brought in \"terrorists … who set mosques on fire … attack banks, and public properties\".\n\n\"Families, I ask you: do not allow your young children to join rioters and terrorists who behead people and kill others,\" he said, adding that the government was ready to listen to the people and to resolve economic problems.\n\nHengaw's Ms Moradi said the communications blackout, now entering its fourth day, was fuelling fears the crackdown on protesters by Iranian security forces was only going to get worse.\n\n\"We have seen in the past that whenever they shut down internet, it's because they want to use, as much as possible, their violence and their method of controlling people using violence,\" she said.\n\nHengaw said in addition to the growing number of dead, there were thousands of Iranian protesters believed to be detained. So far, it had identified about 700 of them.\n\n\"The Iranian authorities keep threatening these detainees, and they are making a link between people who were detained in Iran and foreign governments — which in Iran is a big crime, and people will be punished for this kind of thing even by capital punishment.\"\n\nProtests in Australia\n\nHundreds of people have gathered at Sydney's Town Hall, urging Prime Minister Anthony Albanese to condemn the killing of protesters in Iran.\n\nThe protesters are calling for regime change, with some suggesting Iran's monarchy take the reins of the country, while others are seeking democratic independence.\n\nTina Kordrostami joined the protest on Sunday afternoon in the CBD.\n\n\"We're here in solidarity of what's happening in Iran, with all the people in Iran, we want to make sure that their voices are being heard within Sydney. We've been fighting for the last 47 years,\" she said.\n\n\"Many people here, their families in Iran are under attack, it's a very sad and sensitive time.\"\n\nWhile the rally is peaceful, there is a growing feeling of despair among attendees.\n\nMany protesters have been unable to communicate with their friends and family in Iran over the past 50 hours due to the ongoing internet blackout, and are concerned for their welfare.\n\nArta Beikzadeh, who was at a protest outside Sydney's Town Hall on Sunday afternoon, said it had been about three days since she last heard from her sisters and father in Iran.\n\n\"There is a complete blackout in Iran; they shut down everything. We are so concerned,\" Ms Beikzadeh said.\n\n\"This time, everyone says, 'Enough is enough.'\"\n\nForeign Minister Penny Wong has issued a joint statement with Canada and the EU condemning the killings and use of violence.\n\n\"We strongly condemn the killing of protesters, the use of violence, arbitrary arrests, and intimidation tactics by the Iranian regime against its own people,\" the statement read.\n\nBut protesters said they wanted to see a stronger response from the Australian government.\n\nAli Be joined the demonstrations in Sydney's CBD on Sunday, and said the government's response was \"lacking\".\n\n\"We see words of condemnations, but they're not answering to the calls of the Iranian people … they want the Islamic regime gone in its entirety,\" Mr Be said.\n\nHe said protesters were calling on the federal government to \"cut all ties with the Islamic regime\".\n\n'Miscalculation can happen'\n\nThe scale of the protests in Iran is fuelling speculation as to whether the hardline Islamic regime, which has been in power for almost 47 years, could be about to topple.\n\nBut not all analysts are convinced it is at that point just yet.\n\n\"The regime is coping with tremendous challenges … maybe the biggest since 1979,\" Danny Citrinowicz, senior fellow at Israel's Institute for National Security Studies, told the ABC.\n\nThe former senior commander in the Israeli military's defence intelligence establishment said there were no signs, at this stage, of the regime's military wing or senior leadership splintering — despite claims otherwise from the exiled crown prince of Iran, Reza Pahlavi.\n\n\"We have to remember that this regime has a concrete base of support, 20 to 30 per cent of the country's population will support [Supreme Leader Ali Khamanei] anyhow,\" Mr Citrinowicz said.\n\n\"So we have to assume that it would be very hard to topple this regime, this revolutionary regime — actually, I think we'll see a change within the regime before we see a toppling of this regime.\n\n\"And we have also to remember that the opposition is weak. Yes, they have tremendous courage, but they don't have leadership.\"\n\nThe Wall Street Journal is reporting that Mr Trump will meet with senior officials on Tuesday to consider what action the US may take against Iran, after repeated pledges to support the protesters if they are attacked by the Iranian regime.\n\nThe options on the table include everything from missile strikes to cyber attacks or further economic sanctions.\n\n\"The Iranian regime right now is on high alert; they suspect that something might happen,\" Mr Citrinowicz said.\n\n\"So definitely miscalculation can happen, and it will be very hard to find some sort of a sweet spot that will enable Trump to say 'I helped the demonstrators' without deteriorating into full-scale war.\n\n\"The dilemma in Washington is huge.\"\n\nABC/wires",
				"created_at": "2026-01-14T09:20:03.739Z",
				"author": {
					"id": "65",
					"name": "Morgan Phillips",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=morganphillips",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"Competition",
					"Adoption"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-UjjZpmHp",
				"slug": "former-uk-diplomat-says-h-mqiv",
				"title": "Former UK diplomat says he did not know about Epstein abuse",
				"sub_title": "Former UK diplomat says he did not know about Epstein abuse",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/61e311761a2f82ac03257dc977327ac3?impolicy=wcms_crop_resize&cropH=3333&cropW=4444&xPos=335&yPos=0&width=862&height=647",
				"body": "Britain's former US ambassador Peter Mandelson, who was dismissed over his links to Jeffrey Epstein last year, has apologised to the victims of the late convicted sex offender but not for his own actions.\n\nMr Mandelson was fired in September over emails that came to light revealing a much closer relationship with Epstein than previously acknowledged. \n\nThe veteran British politician called Epstein \"my best pal\" and had advised him on seeking early jail release.\n\n\"I want to apologise to those women for a system that refused to hear their voices and did not give them the protection they were entitled to expect,\" Mr Mandelson told the BBC broadcaster when asked if he wanted to say sorry for his links.\n\nHe said he would only apologise for his own ties if he had known about Epstein's actions or been complicit.\n\n\"I was not culpable, I was not knowledgeable of what he was doing,\" he said.\n\n\"I believed his story and that of his lawyer, who spent a lot of time trying to persuade me of this ... that he had been falsely criminalised in his contact with these young women. Now I wish I had not believed that story.\"\n\nThe UK government said at the time of Mandelson's dismissal that the depth of his ties to Epstein appeared \"materially different\" from what was known at the time of his appointment.\n\nIt has since named Christian Turner as its next ambassador to the US in a pivotal moment for transatlantic ties.\n\n\"Do you really think that if I knew what was going on and what he was doing with and to these vulnerable young women that I'd have just sat back, ignored it and moved on?\", Mandelson added in the interview, describing Epstein as an \"evil monster\".\n\nMr Mandelson also said he believed that, as a gay man in Epstein's circle, he was \"kept separate from what he was doing in the sexual side of his life\".\n\nReuters",
				"created_at": "2026-01-14T09:19:58.912Z",
				"author": {
					"id": "34",
					"name": "Joshua Thomas",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=joshuathomas",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"Trend Watch",
					"New Players"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-LtDpmHYH",
				"slug": "firefighters-were-tacklin-qc4l",
				"title": "Firefighters were tackling a blaze when a camera alerted them to an unseen threat",
				"sub_title": "Firefighters were tackling a blaze when a camera alerted them to an unseen threat",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ca580e9701dfe0eda260de21912346a8?impolicy=wcms_crop_resize&cropH=1080&cropW=1440&xPos=0&yPos=0&width=862&height=647",
				"body": "It's a hot day in early December, and the Tasmanian winds are fierce.\n\nFirefighting teams are stretched, with blazes burning at both Dolphin Sands and St Helens on the east coast.\n\nThey're mopping up at Dolphin Sands, where 19 homes have been lost, but the fire is still alive at St Helens.\n\nSuddenly, a remote artificial intelligence camera spots a tiny plume of smoke a few kilometres away near St Mary's, in the middle of tinder-dry bush.\n\nIt's 8:30 in the morning. An alarm pings, the real-time pictures are checked, before fire headquarters is alerted.\n\nA chopper is then deployed from the St Helens blaze to the exact coordinates, to douse the flames.\n\nFrom the first alert to extinguish, two hours have passed.\n\nFor the tired firefighters still working on the coast, it's a fire disaster averted.\n\nTech helps crews find blazes 'really quickly'\n\nThe prompt response to the fire is a big relief for Shaun Suitor from Sustainable Timber Tasmania (STT).\n\nHis organisation is one of the key agencies involved in firefighting across Tasmania's remote regions, alongside the Parks and Wildlife Service.\n\n\"The early detection allowed the STT duty officer to send staff and equipment there to put it out really quickly,\" Mr Suitor said.\n\nThe fire detection technology is developed by Indicium Dynamics, a software company based in southern Tasmania.\n\n\"The St Helens fire was spotted by remote cameras as well, although it was also called in by locals at the same time,\" the company's chief executive Rob Vernon said.\n\nIt's the remote fires, some ignited by lightning, that this technology is really expected to be a game changer for.\n\nNow with a $1.4 million federal government grant, STT and Indicium Dynamics will double their remote firefighting technology, by rolling out a new generation of remote cameras, drones, and supporting technology across Tasmania.\n\nCamera detected blaze 130 kilometres away\n\nAlready, the trial of cameras has proved their worth.\n\n\"In the 2024/25 season, they detected more than 550 fires around the state; 123 of those went directly through to fire management agencies,\" Mr Vernon said.\n\nThe trial cameras were placed on fire towers, already in place on hill tops and elevated areas, with clear views through to the horizon.\n\nThe fire towers are often manned by people fire spotting, in the fire risk season, although this tech may eventually replace the need for them.\n\n\"The fire towers have made natural sense for us to start there, given they have excellent, amazing views of the Tasmanian landscape,\" Mr Vernon said.\n\nThe cameras patrol in 360 degrees, 24/7, analysing the landscape for smoke up to 30 kilometres away.\n\n\"The AI's really good out to 20, 30 kilometres, but our daytime record is detecting fires 78 kilometres away,\" he said.\n\n\"Our night time record is picking up a fire 130 kilometres away.\"\n\nBut it is not just the fire spotting that authorities like about the technology.\n\nThe images captured by the cameras are used alongside other data points, to paint a clear picture of the fire conditions.\n\n\"We've got access to the cameras themselves, we've got weather stations that are deployed and measuring wind speed and direction, and we're subsequently able to stitch in satellite information,\" Mr Vernon said.\n\nNation's 'biggest camera detection network'\n\nThe company is also developing portable, off-grid towers and cameras and remotely operated drones that can be sent into remote areas during fire risk periods.\n\n\"It will be the biggest camera detection network in Australia, and it will hopefully allow agencies to jump on fires a lot quicker,\" Mr Suitor said.\n\n\"We need this investment to help our fire staff as much as possible.\"\n\nIt is hoped the arsenal of next-generation technology will ensure Tasmania is ready to tackle the rising number of bushfires.\n\n\"We naturally still want and need brave women and men on the front lines of any fire, but our role is to augment their capabilities, and we're really excited about our opportunity to do that,\" Mr Vernon said.",
				"created_at": "2026-01-14T09:19:57.604Z",
				"author": {
					"id": "25",
					"name": "Emily Johnson",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=emilyjohnson",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"Trend Watch",
					"New Players"
				],
				"subcategory_names": []
			},
			{
				"entry_id": "dtc-LSiik2jU",
				"slug": "why-minneapolis-was-the-p-xv7a",
				"title": "Why Minneapolis was the place where ICE launched its largest operation yet",
				"sub_title": "Why Minneapolis was the place where ICE launched its largest operation yet",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/2626473d7e49f5e03ffade158fcbe82d?impolicy=wcms_crop_resize&cropH=2075&cropW=2767&xPos=173&yPos=0&width=862&height=647",
				"body": "Somali woman Fathmo Hassan has barely left her Minneapolis home in weeks.\n\nBut with homemade sambusas and canisters of coffee ready to be dispensed, she stepped out into the pale winter day and headed to a suburban street where mourners were gathering to remember Renee Nicole Good.\n\n\"She was a mother, she was respected. She tried to help the people,\" Hassan said, standing on an icy footpath at the memorial. \"It's very, very sad.\"\n\nGood, a 37-year-old mother of three, was monitoring an Immigration and Customs Enforcement (ICE) operation when she was fatally shot through the windshield and open window of her car by an immigration officer earlier this week.\n\nShe was what is described as a legal observer, someone who volunteers their time to document ICE operations and warn communities when officers are nearby.\n\nHer killing has ignited nationwide protests and further entrenched deep political divisions over the Trump administration's increasingly violent immigration crackdown.\n\nThe nature of her killing, and the aggressive political rhetoric that quickly ensued, has enraged a city still scarred by a recent string of tragedies, and where the memory of murdered African American man George Floyd looms large.\n\nSince December, immigration officers, known as ICE, have conducted sweeping operations across the city, deploying 2,000 masked and armed officers in what it described as its largest operation to date.\n\nThe actions in Minneapolis have targeted undocumented migrants with a particular focus on Somalis — a group that President Donald Trump has referred to as \"garbage\" while criticising a federal fraud scheme involving Somali Americans in the state.\n\nAt the memorial site, Hassan shifts uncomfortably, scanning the crowd.\n\nWhen she arrived in the US in 2005, she was welcomed with typical Midwestern charm — a community of cheery, unpretentious and neighbourly people.\n\nNow, she said hostility towards her community had become common, leaving her fearful to go to work in an aged care home.\n\n\"Anytime I go outside, I'm very scared. [We are] physically attacked. They say, 'Go back to your country, this is not your country'. It's very sad,\" she said.\n\n\"I'm not garbage. I pay taxes. I want this to stop.\"\n\nA city targeted\n\nMany in Minnesota feel the state and its Democratic governor, Tim Walz — who ran against Donald Trump as vice-presidential nominee in the 2024 election — have been singled out by the Trump administration over his handling of the fraud scandal that has plagued the state.\n\nIt comes after a viral video by a 23-year-old MAGA content creator alleged, with little evidence, to have uncovered rampant fraud in Somali-run daycare centres — claims that were amplified by senior administration officials.\n\nThe allegations, which date back to 2020, involve federally funded non-profit childcare and social service providers, with prosecutors estimating the fraud could reach $US9 billion ($13 billion) — a figure state officials reject as exaggerated.\n\nA 2021 federal investigation into a series of schemes resulted in charges against 92 people with 62 convicted — many of them Somali, according to CBS News.\n\nTrump has since sought to portray Minnesota and its Somali population as a hotspot for fraud.\n\nImmigration rights groups have accused the administration of using the scandal as a scapegoat to target Somali immigrants.\n\nAttacks on the Somali community followed after a recent string of racist remarks by Donald Trump, describing them as \"garbage\" and saying he did not want them \"in our country.\"\n\nKathryn Johnson, a podcaster and spokesperson with Minnesotan Republican think tank the Center of the American Experiment, said there was a perception illegal immigrants were implicated in the scam.\n\n\"It feels really disrespectful to the taxpayers and the people of Minnesota that so much was stolen, and they went to such minimal lengths to hide it,\" she said.\n\nJohnson said the scandal had appalled Minnesotans and led to \"a lot of resentment\".\n\nGovernor Tim Walz said those involved would be prosecuted and pushed back on the federal politicisation of the issue, criticising the administration for demonising an entire community.\n\nOld wounds reopened\n\nGood was fatally shot four blocks from where African American man George Floyd was killed by a white police officer in 2020.\n\nFive years on from his murder, the memory of that historic turning point still weighs heavy in the collective psyche of many in Minneapolis.\n\nIt ignited a national reckoning over race and police brutality and left deep scars across the city.\n\nFor many, those wounds were reopened this week as Minnesotans again mobilised in protest to demand accountability for an officer's actions.\n\n\"We have been here before,\" Minneapolis Reverend Kenny Callaghan said.\n\n\"We know what to do as a city, we know how to raise ourselves up to protest against marginalisation and intimidation and abuse of human life and dignity.\n\n\"We will be out in the streets protesting this insanity until we don't need to anymore.\"\n\nSome hope Good's death will serve as a watershed moment in the administration's immigration campaign, much like George Floyd's murder did for police brutality.\n\nAnger and distrust of authorities can be felt across Minneapolis, with acrimony occasionally levelled at members of the press.\n\nIn the aftermath of her death, the ABC approached the scene where Good was killed and was met with hostile local activists who had barricaded the streets with wooden pallets, skip bins and witch's hats.\n\nRed spray paint spelled out \"ICE KILLS GOOD PEOPLE\" on the frosty sidewalk, the letters blurring and running in the snow like blood.\n\nThe memorial site of Good's death had shifted into a community event with a charged atmosphere. An abrupt noise nearby was enough to make everyone jump.\n\nSmoke rose from a bin fire into the grey winter sky as residents and activists huddled around, eyeing passers-by and handing out food.\n\nA series of barbed comments from activists made it clear the press were perceived as a hindrance to their cause.\n\nThe few network journalists on the scene were closely trailed by stern-faced security details with searching eyes.\n\nTo the left, conservative Fox News host Laura Ingraham was encircled by a group in a tense exchange.\n\nTo the right, a large sign painted in angry scrawl read: \"Dear press, you're pointing your cameras at the wrong people. Film the fascists.\"\n\nNews had filtered through that the Department of Justice had blocked the Minnesota Bureau of Criminal Apprehension from working with federal authorities on the investigation into Good's death.\n\nThe move is considered highly unusual and has contributed to the growing mistrust in any federal investigation into the incident.\n\n\"There is no accountability in this administration,\" a woman said at the memorial when the ABC returned the following day, adding that she had no faith in a fair FBI probe.\n\n\"I felt immense anger. I wanted to vomit,\" the woman recalled of the footage, having flown in from Montana to pay her respects.\n\n\"I wanted to go into a cave and come out in three years and see if we still have a country.\"\n\n'They're here for sport'\n\nThe events in Minneapolis are the latest flashpoint in the Trump administration's immigration crackdown, which has sparked widespread condemnation.\n\nThe New York Times reported that this week's deadly shooting marked the ninth time immigration officers fired on people in US cities since September — in all cases, agents fired on people in vehicles and in each case, the agents claimed self-defence.\n\nWithin 48 hours of Good's killing, another two people were shot in their car by a Customs and Border Protection agent in Portland, Oregon. The Department of Homeland Security described the action as being a \"defensive shot\".\n\nAs Americans watched the same footage of Good's death, two starkly different narratives quickly emerged.\n\nHomeland Security Secretary Kristi Noem quickly defended the officer's actions, describing the incident as an act of \"domestic terrorism\".\n\nTrump went further, posting that Good had \"violently, wilfully and viciously ran over the ICE officer\".\n\nDemocratic local and state leaders quickly condemned that characterisation, with Minneapolis Mayor Jacob Frey dismissing it as \"bullshit\", instead describing the officer's actions as a \"reckless abuse of power\".\n\nKathryn Johnson said she was careful not to jump to any conclusions too quickly but believed the ICE officer was \"in fear for his life.\"\n\nShe blamed Governor Tim Walz for inflaming tensions with political rhetoric, although she conceded that Trump had done the same.\n\n\"He [Walz] had hardly any information and he declared that this officer had essentially murdered a woman in cold blood,\" she said.\n\nShe accused Walz of calling for civil war when he mentioned he was preparing the National Guard for deployment.\n\nReverend Callaghan rejected that characterisation categorically, describing the administration's narrative as blatant lies.\n\nHaving had his own interaction with ICE, he believes their operations are driven entirely by systemic racism.\n\nAt the same time and on the same street as Good was shot dead, Callaghan had noticed ICE agents harassing a Hispanic woman.\n\n\"I said to them, 'Arrest me, take me, I'm not afraid of you' … They pointed a gun at me and before I knew it they had me in handcuffs,\" he said.\n\n\"They said, 'Are you afraid yet?' And I said, 'No'. And then they said, 'Well, you're white. You wouldn't be any fun anyway.'\"\n\nThe comment left him aghast.\n\n\"I couldn't believe it. I could not believe my ears or my eyes what I was witnessing firsthand happening in this country,\" he said.\n\n\"These ICE agents are here for sport. They're not here for immigration raids. They're here for sport.\"\n\nThe ABC has contacted the Department of Homeland Security for comment.",
				"created_at": "2026-01-14T09:19:55.263Z",
				"author": {
					"id": "47",
					"name": "Kayla Walker",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=kaylawalker",
					"profile_bio": "Author",
					"role": "Root"
				},
				"business_type_name": "Research",
				"category_names": [
					"New Players",
					"Competition"
				],
				"subcategory_names": []
			}
		]
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| User-Agent | node | string | 是 | - |

**Query**

## 获取翻译后的文章内容【新增】

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-16 17:29:03

> 更新时间: 2026-01-30 11:32:19

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/translated?entry_id=dtc-v82l8CUL&language=en

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| entry_id | dtc-v82l8CUL | string | 是 | - |
| language | en | string | 是 | 'zh', 'en', 'ar', 'ru', 'ja' |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"entry_id": "dtc-zhic6jqj",
		"language": "ar",
		"title": "'أثر' كبير على الفرق الموسيقية المجتمعية مع رفض طلبات التمويل",
		"sub_title": "أثر 'ملحوظ' على فرق المجتمع بعد رفض طلبات التمويل",
		"body": "على مدى التسعين عامًا الماضية، كانت فرقة النحاس والرياح في مدينة وولونغونغ فخورة بالحفاظ على انخفاض رسوم العضوية، لكن خسارة التمويل الوشيكة قد ألقت بظلال من الشك على مستقبل الفرقة.\n\n\"نريد أن نضم الجميع بقدر الإمكان،\" قال رئيس الفرقة نيل رايت.\n\n\"قد يقول بعض الناس إنه نوع من التخصص ... ولكن هناك الكثير من الناس الذين يقومون بذلك.\"\n\nتعتبر المجموعة التي يديرها المتطوعون واحدة من أكثر من 100 فرقة مجتمعية ومدرسية في نيو ساوث ويلز، والتي تمثلها جمعية الفرق الموسيقية في نيو ساوث ويلز (BANSW).\n\nلسنوات، حصلت الجمعية على تمويل من خلال برامج منح الفنون والثقافة التابعة لحكومة الولاية، وقد خصصت هذه الأموال للفرق المحلية لتغطية تكاليف استئجار الأماكن، والإعلانات، وتنظيم الحفلات، وشراء النوتات الموسيقية أو إصلاح الآلات.\n\nقال رئيس BANSW جيف ماركهام إن المبلغ الذي تلقوه غالبًا ما \"يتقلب\"، لكنهم تمكنوا باستمرار من تأمين حوالي 55,000 دولار كل عام على مدى العقد الماضي.\n\n\"لقد كانت لدينا يقين من التمويل مما سمح لنا بالتخطيط\"، قال.\n\nفي وولونغونغ، قال السيد رايت إن الأموال قد ساعدت في تمويل معسكرات الموسيقى وورش العمل والإعلانات على وسائل التواصل الاجتماعي.\n\n\"لقد كانت معظم منحنا موجهة لتعزيز لاعبينا الشباب الصاعدين\"، قال.\n\n\"من الجيد إدخال الشباب بشكل خاص إلى المنظمة، ولكن يجب عليك العثور على طرق لجعلهم يرغبون فعليًا في البقاء كجزء من المنظمة.\"\n\nقم بالنضال من أجل التمويل\n\nنجح أكثر من 140 منظمة في الجولة الأخيرة من التمويل، التي عملت للمرة الأولى وفق نموذج تنافسي.\n\nتمكنت المجموعات من التقدم بطلب للحصول على تمويل متعدد السنوات لفترة تمتد من عامين إلى أربعة أعوام.\n\nلكن الطلب المقدم من BANSW للحصول على التمويل تم رفضه.\n\nقال متحدث باسم Create NSW إن جولات التمويل الأخيرة كانت \"تنافسية للغاية\".\n\nقال المتحدث في بيان: \"يتم تنفيذ برنامج تمويل الفنون والثقافة من خلال عملية مفتوحة وتنافسية وموضوعية\".\n\n\"التمويل ليس مستمراً أو مضمونا.\"\n\nقالت Create NSW إنها عقدت عدة اجتماعات مع BANSW لتقديم \"التعليقات والدعم\" قبل وبعد تقديم طلبها.\n\nأثر 'كبير' على الفرق الموسيقية\n\nقال السيد ماركهام إن إمكانية عدم قدرة BANSW على تمويل الفرق المحلية في الوقت الحالي سيكون لها تأثير \"ملحوظ\" - خاصة على المجموعات التي تضم لاعبين أصغر سناً.\n\n\"إن برنامج الشباب يتطلب الكثير من العمل، ويمثل الكثير من النفقات، ويتطلب الكثير من الطاقة\"، قال.\n\nقال السيد وايت إنه إذا تم منحهم المال هذا العام، فسوف يستخدمونه في المواد الترويجية مثل الأعلام واللافتات.\n\n\"حالياً، نتجاوز الأمر دون ذلك، ونأمل أن يقترب الناس بما فيه الكفاية ويسألون أسئلة\"، قال.\n\n\"إنها مجرد أشياء بسيطة … [لكن] إذا تمكنا من الحصول على منحة، فلن نحتاج إلى التفكير في مصدر تلك الأموال.\"\n\nقال إنه قد يؤثر أيضًا على تكاليف عضويتهم.\n\n\"شيء نفخر به هو الحفاظ على رسوم الاشتراك لدينا منخفضة.\"\n\nتغييرات في الميزانية المحددة\n\nقال السيد ماركهام إنه بدون تمويل المنح، قد تضطر الفرق الموسيقية قريبًا إلى إعادة تقييم ما إذا كانت بعض فعالياتها وبرامجها تستحق تخصيص ميزانية لها.\n\n\"معظم الأشياء التي تقوم بها الفرقة في المجتمع، لا تتلقى مقابلها أجرًا\"، قال.\n\n\"بدون تلك القليل من التمويل، يجب أن تأتي كل الأموال من الفرقة نفسها، مما يعني أنه لا يوجد التزام مسبق للقيام بهذه الأشياء.\"\n\nقال السيد ماركهام إن البديل هو طلب من الأعضاء أن يمدوا يد العون من جيوبهم الخاصة للمساعدة في تغطية تكاليف الفرقة.\n\n\"كلهم يجمعون التبرعات، لكن جميع تلك الجهود لجمع التبرعات هي فقط للحفاظ على فتح الأبواب\"، قال.\n\n\"كل شيء آخر إضافي لذلك يعتمد أساساً على الأعضاء.\"\n\nالفرق الموسيقية الإقليمية تتأثر بشدة\n\nأكاديمية هيلز للموسيقى في شمال غرب سيدني تضم فرقاً شبابية وكبيرة تحتوي على حوالي 100 عضو.\n\nقال المخرج الموسيقي غاري كلارك إن الأكاديمية كانت تتلقى تمويلات من المنح بشكل دوري على مدار السنوات الـ 25 الماضية.\n\nقال إن قاعدة عضويتهم الأكبر وشراكات الفعاليات تعني أنهم لن يتأثروا بفقدان التمويل كما يتأثر نظراؤهم الإقليميون.\n\n\"المجموعات الأصغر، والمجموعات الأقل نشاطًا، ستواجه صعوبة كبيرة\"، قال.\n\n\"الكثير من المجموعات الإقليمية قد لا تتمكن حتى من العمل، لأن الأعداد ليست مرتفعة.\"\n\nقال السيد رايت إن ذلك قد يكون هو الحال مع عازفيه.\n\n\"سنقوم [ما زلنا] بتنظيم الفعاليات، إلا أنه يعني أننا لا نستطيع دعم هذه الفعاليات ... قد يكون هناك بعض اللاعبين الذين قد لا يستطيعون الحضور.\"\n\nجمع المجتمع معًا\n\nقال السيد كلارك إن السكان المحليين سيعانون في نهاية المطاف إذا لم تستطع فرقهم البقاء.\n\n\"رؤية فرقة في العلن تؤدي، تسير في الشارع، تعزف ترانيم عيد الميلاد في مركز تسوق، كل تلك الأشياء الصغيرة التي تجمع المجتمع معاً.\"\n\nقال السيد ماركهام إن أهمية الفرق الموسيقية المجتمعية غالبًا ما تُقدَر بشكل غير كاف.\n\n\"فريق المجتمع الخاص بك هو غالبًا أول مكان يتم فيه تقديم شخص ما للموسيقى الحية،\" قال.\n\n\"نحن نلعب في دور الرعاية، نلعب في الجنازات ... وغالبًا ما تكون الفرقة المجتمعية هي آخر موسيقى حية يشاهدها الكثير من الناس أيضًا.\""
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取预览文章列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-30 11:21:46

> 更新时间: 2026-01-30 11:32:04

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/reviewing

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取推荐内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-17 14:28:33

> 更新时间: 2026-03-17 14:40:08

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/recommend?entry_id=dtc-qvtu2rD2&limit=5

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| entry_id | dtc-qvtu2rD2 | string | 是 | - |
| limit | 5 | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"entry_id": "dtc-qvtu2rD2",
		"list": [
			{
				"entry_id": "dtc-32ClX5Xv",
				"slug": "ai-odyssey-part-1-the-cor-ek3s",
				"title": "AI Odyssey Part 1: The Correctness Dilemma",
				"sub_title": "AI Odyssey Part 1: The Correctness Dilemma",
				"img_url": "https://static-files.detake.com/icon-1773303901793-897174112.png",
				"created_at": "2026-03-13T04:19:31.519Z",
				"updated_at": "2026-03-13T04:19:31.519Z",
				"status": "published",
				"tags": [
					"New Releases"
				],
				"category_names": [
					"Technology"
				],
				"subcategory_names": [
					"New Releases"
				],
				"business_type_name": "News",
				"author": {
					"id": "45",
					"name": "Nicole Lewis",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=nicolelewis",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-2zI99vWa",
				"slug": "breaking-sycophantic-ai-s-ptno",
				"title": "Breaking: Sycophantic AI skews beliefs, creating certainty where there should be doubt",
				"sub_title": "Breaking: Sycophantic AI skews beliefs, creating certainty where there should be doubt",
				"img_url": "https://static-files.detake.com/article-1773375829196-1773375829200-887591088.jpg",
				"created_at": "2026-03-13T04:23:49.436Z",
				"updated_at": "2026-03-13T04:23:49.436Z",
				"status": "published",
				"tags": [
					"New Releases"
				],
				"category_names": [
					"Technology"
				],
				"subcategory_names": [
					"New Releases"
				],
				"business_type_name": "News",
				"author": {
					"id": "44",
					"name": "John Rodriguez",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=johnrodriguez",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-QJKFkBHz",
				"slug": "ai-risk-arguments-are-bei-v74d",
				"title": "AI risk arguments are being overcomplicated and needlessly complex",
				"sub_title": "AI risk arguments are being overcomplicated and needlessly complex",
				"img_url": "https://static-files.detake.com/icon-1773303901793-897174112.png",
				"created_at": "2026-03-12T18:03:43.618Z",
				"updated_at": "2026-03-12T18:03:43.618Z",
				"status": "published",
				"tags": [
					"New Releases"
				],
				"category_names": [
					"Technology"
				],
				"subcategory_names": [
					"New Releases"
				],
				"business_type_name": "News",
				"author": {
					"id": "57",
					"name": "Rebecca Green",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=rebeccagreen",
					"profile_bio": "Author",
					"role": "Root"
				}
			},
			{
				"entry_id": "dtc-LWoJIUDc",
				"slug": "ai-agent-coding-skeptic-t-70e3",
				"title": "AI agent coding skeptic tests the approach, documents process in exhaustive detail",
				"sub_title": "AI agent coding skeptic tests the approach, documents process in exhaustive detail",
				"img_url": "https://static-files.detake.com/icon-1773303901793-897174112.png",
				"created_at": "2026-03-12T21:41:09.317Z",
				"updated_at": "2026-03-12T21:41:09.317Z",
				"status": "published",
				"tags": [
					"New Releases"
				],
				"category_names": [
					"Technology"
				],
				"subcategory_names": [
					"New Releases"
				],
				"business_type_name": "News",
				"author": {
					"id": "66",
					"name": "Dylan Campbell",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=dylancampbell",
					"profile_bio": "Author",
					"role": "Authors"
				}
			},
			{
				"entry_id": "dtc-d4LCjLUR",
				"slug": "breaking-openai-likely-fa-mh2z",
				"title": "Breaking: OpenAI likely faces collapse",
				"sub_title": "Breaking: OpenAI likely faces collapse",
				"img_url": "https://static-files.detake.com/article-1773336272430-1773336272433-941786581.jpg",
				"created_at": "2026-03-12T17:24:32.668Z",
				"updated_at": "2026-03-12T17:24:32.668Z",
				"status": "published",
				"tags": [
					"New Releases"
				],
				"category_names": [
					"Technology"
				],
				"subcategory_names": [
					"New Releases"
				],
				"business_type_name": "News",
				"author": {
					"id": "41",
					"name": "Lauren Martinez",
					"avatar_url": "https://api.dicebear.com/7.x/shapes/svg?seed=laurenmartinez",
					"profile_bio": "Author",
					"role": "Root"
				}
			}
		]
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 全局搜索（文章 + 播客）

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-10 15:34:49

> 更新时间: 2026-04-10 16:03:34

**全文检索公开的文章和播客，使用 PostgreSQL FTS（GIN 索引），按相关性排序。**

**文章：status in (published, demote) + is_translated = true,播客：status = completed + is_translated = true,支持 cursor 游标分页（与 page 二选一，cursor 优先）**

**接口状态**

> 开发中

**接口URL**

> /api/v1/search?q=AI&locale=en&page=2&limit=8&cursor=eyJvZmZzZXQiOjh9

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| q | AI | string | 是 | 搜索关键词，最少1字符，最多200字符 |
| locale | en | string | 是 | 内容语言，枚举值：en / zh / ja，默认 en |
| page | 2 | integer | 是 | 页码，从1开始，默认1（cursor 存在时忽略） |
| limit | 8 | integer | 是 | 每页条数，默认8，最大20 |
| cursor | eyJvZmZzZXQiOjh9 | string | 是 | 游标 token（由上一页 next_cursor 提供，与 page 二选一，优先使用） |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Search results fetched successfully",
        "zh": "搜索结果获取成功"
    },
    "data": {
        "list": [
            {
                "type": "article",
                "entry_id": "dtc-479Hr8UX",
                "title": "The Download: Earth's tremors, and AI used for stroke",
                "sub_title": "Article subtitle or summary",
                "img_url": "https://cdn.example.com/cover.jpg",
                "slug": "the-download-earths-tremors",
                "language": "en",
                "author_name": "NICOLE LEWIS",
                "author_avatar": "https://cdn.example.com/avatar.jpg",
                "channel_name": null,
                "duration": null,
                "created_at": "2026-03-13T08:00:00Z",
                "updated_at": "2026-03-13T08:00:00Z"
            },
            {
                "type": "podcast",
                "entry_id": "dtc-AbCdEfGh",
                "title": "Bitcoin and the Future of Finance",
                "sub_title": "A deep dive into cryptocurrency trends",
                "img_url": "https://img.youtube.com/vi/xxx/maxresdefault.jpg",
                "slug": null,
                "language": "en",
                "author_name": null,
                "author_avatar": null,
                "channel_name": "CryptoChannel",
                "duration": 3600,
                "created_at": "2026-03-10T10:00:00Z",
                "updated_at": "2026-03-10T10:00:00Z"
            }
        ],
        "pagination": {
            "total": 114,
            "page": 1,
            "limit": 8,
            "next": true,
            "next_cursor": "eyJvZmZzZXQiOjh9"
        }
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 响应码，2000 为成功 |
| data.list | [] | array | 搜索结果列表 |
| data.list[].type | article | string | 结果类型：article（文章）或 podcast（播客） |
| data.list[].entry_id | dtc-479Hr8UX | string | 内容唯一ID |
| data.list[].title | The Download: AI used for stroke | string | 标题 |
| data.list[].sub_title | Article subtitle | string | 副标题/摘要（文章）或描述（播客） |
| data.list[].img_url | https://cdn.example.com/cover.jpg | string | 封面图URL，文章为 img_url，播客为 thumbnail |
| data.list[].slug | the-download | string | URL slug（仅文章有值，播客为 null） |
| data.list[].language | en | string | 内容语言 |
| data.list[].author_name | NICOLE LEWIS | string | 作者名（仅文章有值） |
| data.list[].author_avatar | https://cdn.example.com/avatar.jpg | string | 作者头像URL（仅文章有值） |
| data.list[].channel_name | CryptoChannel | string | 频道名（仅播客有值） |
| data.list[].duration | 3600 | integer | 时长秒数（仅播客有值） |
| data.list[].created_at | 2026-03-13T08:00:00Z | string | 创建时间 ISO 8601 |
| data.list[].updated_at | 2026-03-13T08:00:00Z | string | 更新时间 ISO 8601 |
| data.pagination.total | 114 | integer | 搜索结果总条数 |
| data.pagination.page | 1 | integer | 当前页码 |
| data.pagination.limit | 8 | integer | 每页条数 |
| data.pagination.next | true | boolean | 是否还有下一页 |
| data.pagination.next_cursor | eyJvZmZzZXQiOjh9 | string | 游标 token，next=false 时为 null |

* 缺少搜索关键词(200)

```javascript
{
    "code": 4004,
    "msg": {
        "en": "Search keyword is required",
        "zh": "搜索关键词不能为空"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4004 | integer | 错误码 |

* 关键词超过200字符(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "Search keyword exceeds 200 characters",
        "zh": "搜索关键词不能超过 200 个字符"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4001 | integer | 错误码 |

**Query**

# cloudflare

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-03 10:27:38

> 更新时间: 2025-07-03 10:27:41

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 清除缓存

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-03 10:27:04

> 更新时间: 2025-07-14 19:11:59

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> https://api.cloudflare.com/client/v4/zones/fb4edf0ee54fee31db50f2c696afda8a/purge_cache

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer QPQI2kWbZ3eXa5ONqt6oXTr04hcU4JrG-3p40Qg9 | string | 是 | - |
| Content-Type | application/json | string | 是 | - |

**请求Body参数**

```javascript
{
    "files": [
        "https://demo-detake.aggregation.top/articles/dtc-6z8Fo2?t=2"
    ]
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer QPQI2kWbZ3eXa5ONqt6oXTr04hcU4JrG-3p40Qg9 | string | 是 | - |
| Content-Type | application/json | string | 是 | - |

**Query**

# 管理员接口

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-22 15:34:37

> 更新时间: 2025-07-22 15:34:37

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 批量提交 Article 内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2025-07-22 15:36:00

> 更新时间: 2026-01-19 18:25:47

**创建新的内容**

**接口状态**

> 开发中

**接口URL**

> /api/v1/manager/articles/batch

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
	"auth_code": "123456",
	"articles": [
		{
			"country": "United States",
			"city": "New York",
			"title": "Byreal DEX From Bybit Officially Launches On Solana",
			"sub_title": "Byreal DEX From Bybit Officially Launches On Solana",
			"body": "Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.",
			"content_type": "article",
			"business_type": "News",
			"category": "Markets",
			"tags": [
				"DeFi",
				"NFT"
			],
			"language": "en",
			"img_url": "https://1234.png",
			"status": "draft",
			"contact": {
				"full_name": "danny burger",
				"title": "this is title",
				"company": "xxx",
				"email": "danny@163.com",
				"phone": "13888888888"
			}
		}
	]
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| url_code | - | string | 否 | 唯一标识码 |
| user_id | - | integer | 是 | 作者ID |
| title | - | string | 是 | 内容标题 |
| summary | - | string | 否 | 内容摘要 |
| content | - | string | 是 | 内容正文 |
| type | - | string | 是 | 内容类型 |
| category_id | - | integer | 否 | 分类ID |
| tag_id | - | integer | 否 | 标签ID |
| language | - | string | 否 | 语言：英文、中文等 |
| img_url | - | string | 否 | 封面图片URL |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2003,
	"msg": {
		"en": "Content updated successfully",
		"zh": "内容更新成功"
	}
}
```

* 失败(500)

```javascript
{
	"code": 6025,
	"msg": {
		"en": "No permission",
		"zh": "无权限"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 修改文章的标签和状态

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-16 17:32:59

> 更新时间: 2026-02-26 15:43:41

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/manager/articles/update-meta

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "entry_id": "dtc-OZQP9HUA",
    // "business_type": "News",
	// "category": "Climate",
	// "tags": [
	// 	"Crypto"
	// ],
	// "img_url": "https://api.dicebear.com/7.x/shapes/svg?seed=taylorhill",
    "status" : "banned"
}

```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**Query**

## 管理员用户列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-04 14:48:25

> 更新时间: 2026-03-04 15:26:30

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/manager/users

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**Query**

## 设置 Prime

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-04 15:28:44

> 更新时间: 2026-03-04 15:31:56

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/manager/users/prime

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**请求Body参数**

```javascript
{
    "user_id": "7",
    "is_prime": true
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"target_user_id": 7,
		"action_type": "SET_PRIME",
		"action_status": "SUCCESS",
		"account_status": "ACTIVE",
		"is_prime": true,
		"updated_at": "2026-03-03T23:31:46.961Z"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**Query**

## 状态设置

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-04 15:32:37

> 更新时间: 2026-03-04 16:28:33

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/manager/users/status

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**请求Body参数**

```javascript
{
    "user_id": 7,
    "status": "ACTIVE"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"target_user_id": 7,
		"action_type": "BAN",
		"action_status": "SUCCESS",
		"account_status": "BANNED",
		"updated_at": "2026-03-04T00:24:51.075Z"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**Query**

## 获取首页配置

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-10 16:46:17

> 更新时间: 2026-04-10 16:57:01

**获取首页各板块的启用状态（sections）和钉选内容配置（slots）。管理员专用接口。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/homepage/config

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer token |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Homepage config fetched",
		"zh": "首页配置获取成功"
	},
	"data": {
		"sections": {
			"latest": {
				"enabled": true
			},
			"highlights": {
				"enabled": true
			},
			"recommended_topics": {
				"enabled": true
			},
			"who_to_follow": {
				"enabled": true
			},
			"most_read": {
				"enabled": true
			},
			"news": {
				"enabled": true
			},
			"insights": {
				"enabled": true
			},
			"research": {
				"enabled": true
			}
		},
		"slots": []
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| data.sections | {} | object | 各板块启用状态，key 固定为 8 个 section 名称 |
| data.sections.latest.enabled | true | boolean | true=启用，false=禁用；缺失时前端默认视为 true |
| data.slots | [] | array | 所有已配置的钉选内容列表（跨所有 section） |
| data.slots[].resource_code | latest-1 | string | 唯一标识，规则：{section}-{position} 或 {section}-{sub_tab}-{position} |
| data.slots[].section | latest | string | 所属板块 key |
| data.slots[].sub_tab | all | string | 子 tab（仅 news 板块有），如 all / business / hardware / policy / technology |
| data.slots[].position | 1 | integer | 在该板块中的位置，从 1 开始 |
| data.slots[].entry_id | dtc-AbCdEfGh | string | 关联的内容 ID |
| data.slots[].title | Understanding DeFi | string | 内容标题（冗余存储，用于后台展示） |
| data.slots[].status | enable | string | enable 或 disable |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer token |

**Query**

## 保存首页配置

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-10 16:46:27

> 更新时间: 2026-04-10 16:53:36

**全量覆盖保存首页配置（sections 启用状态 + slots 钉选内容）。保存后自动清除首页缓存，立即生效。管理员专用接口。,注意：**

**Body 结构与 GET 返回的 data 完全一致，前端"本地草稿 + 统一保存"模式,POST 时发送完整配置，后端替换（非 merge）原有数据,sections 缺失的 key 不写入，前端默认视为 enabled=true**

**各板块最大 slot 数：
latest=6, highlights=3, recommended_topics=6, who_to_follow=5, most_read=5, insights=5, research=4, news-all/business/hardware/policy/technology=6**

**接口状态**

> 开发中

**接口URL**

> /api/v1/homepage/config

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer token |
| Content-Type | application/json | string | 是 | 内容类型 |

**请求Body参数**

```javascript
{
    "sections": {
        "latest": {
            "enabled": true
        },
        "highlights": {
            "enabled": true
        },
        "recommended_topics": {
            "enabled": true
        },
        "who_to_follow": {
            "enabled": true
        },
        "most_read": {
            "enabled": true
        },
        "news": {
            "enabled": false
        },
        "insights": {
            "enabled": true
        },
        "research": {
            "enabled": true
        }
    },
    "slots": [
        {
            "resource_code": "latest-1",
            "section": "latest",
            "position": 1,
            "entry_id": "dtc-qvtu2rD2",
            "title": "AI Odyssey Part 2: Perils of Prompting",
            "status": "enable"
        },
        {
            "resource_code": "latest-2",
            "section": "latest",
            "position": 2,
            "entry_id": "dtc-r9sRWGEq",
            "title": "Anthropic attempts last-ditch bid to salvage the Pentagon deal",
            "status": "enable"
        },
        {
            "resource_code": "latest-3",
            "section": "latest",
            "position": 3,
            "entry_id": "dtc-479Hr8UX",
            "title": "The Download: Earth's tremors, and AI used for strikes",
            "status": "enable"
        },
        {
            "resource_code": "most_read-1",
            "section": "most_read",
            "position": 1,
            "entry_id": "dtc-EMWoPkVf",
            "title": "Waymo's robotaxis now available across 10 cities",
            "status": "enable"
        }
    ]
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| sections | - | object | 是 | 各板块启用状态，key 固定为以下 8 个 section 名称 |
| slots | - | array | 是 | 钉选内容配置列表，传空数组 [] 表示清空所有钉选 |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Homepage config saved",
		"zh": "首页配置保存成功"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 2000 表示保存成功 |

* 参数错误（sections/slots 格式不正确）(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "Invalid parameters",
        "zh": "无效的参数"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4001 | integer | 4001 表示参数校验失败 |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer token |
| Content-Type | application/json | string | 是 | 内容类型 |

**Query**

# 集合管理

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-09 17:57:53

> 更新时间: 2026-01-09 17:57:53

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 创建集合

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-09 18:15:40

> 更新时间: 2026-02-09 19:10:10

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/create

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "name": "DeFi & Web3 Morning Brief",
    "description": "Early-morning summary of key DeFi, Web3, and regulatory news shaping the markets.",
    "logo_url": "https://fast.image.delivery/ltpcxoe.png",
    "image_url": "https://fast.image.delivery/hriuouv.png",
    "is_public": false,
    "bg_color": "#06A17E"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Collection created successfully",
		"zh": "集合创建成功"
	},
	"data": {
		"name": "ZKcandy Ecosystem",
		"description": "Dive into the ZKcandy Ecosystem",
		"logo_url": "https://fast.image.delivery/geaezjs.png",
		"image_url": "https://fast.image.delivery/ecggfnp.png",
		"hunters_count": 0,
		"bonus_amt": "0",
		"views_count": 0,
		"user_id": "6",
		"is_public": false
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**Query**

## 更新集合

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:13:42

> 更新时间: 2026-02-09 18:32:23

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/update

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "collection_id": "15",
    "is_public": true,
    "bg_color": "#06A17E",
    "order_in_list": "1"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Collection updated successfully",
		"zh": "集合更新成功"
	},
	"data": {
		"id": "13",
		"name": "ZKcandy Ecosystem",
		"description": "Dive into the ZKcandy Ecosystem",
		"logo_url": "https://fast.image.delivery/geaezjs.png",
		"image_url": "https://fast.image.delivery/ecggfnp.png",
		"hunters_count": 0,
		"bonus_amt": "0",
		"views_count": 0,
		"user_id": "6",
		"is_public": true
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**Query**

## 删除集合

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:28:15

> 更新时间: 2026-01-13 19:29:57

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/delete

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "collection_id": "13"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Collection has been deleted",
		"zh": "集合已删除"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**Query**

## 获取集合列表【新增】

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:13:24

> 更新时间: 2026-02-09 18:52:13

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections?page=1&limit=10

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| page | 1 | string | 是 | - |
| limit | 10 | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"list": [
			{
				"id": "19",
				"name": "test",
				"description": "Summary",
				"logo_url": "https://static-files.detake.com/ç©å½¢ 1462@1x-1770628944009-185402428.png",
				"image_url": "https://static-files.detake.com/down-1770628937409-529219065.png",
				"hunters_count": 0,
				"bonus_amt": "0",
				"views_count": 0,
				"user_id": "7",
				"is_public": true,
				"bg_color": "#06A17E",
				"order_in_list": "4"
			},
			{
				"id": "17",
				"name": "On-Chain Insight Weekly",
				"description": "A weekly digest of major on-chain movements, protocol upgrades, and market narratives.",
				"logo_url": "https://fast.image.delivery/dqhpenx.png",
				"image_url": "https://fast.image.delivery/wwszcze.png",
				"hunters_count": 0,
				"bonus_amt": "0",
				"views_count": 0,
				"user_id": "6",
				"is_public": true,
				"bg_color": "#06A17E",
				"order_in_list": "3"
			},
			{
				"id": "16",
				"name": "Crypto Daily News",
				"description": "Covering the latest daily headlines across the global crypto and blockchain industry.",
				"logo_url": "https://fast.image.delivery/ivzlysy.png",
				"image_url": "https://fast.image.delivery/xomrvpz.png",
				"hunters_count": 0,
				"bonus_amt": "0",
				"views_count": 0,
				"user_id": "6",
				"is_public": true,
				"bg_color": "#06A17E",
				"order_in_list": "2"
			},
			{
				"id": "15",
				"name": "ZKcandy Ecosystem",
				"description": "Dive into the ZKcandy Ecosystem",
				"logo_url": "https://fast.image.delivery/geaezjs.png",
				"image_url": "https://fast.image.delivery/oodukmi.png",
				"hunters_count": 0,
				"bonus_amt": "0",
				"views_count": 0,
				"user_id": "6",
				"is_public": true,
				"bg_color": "#06A17E",
				"order_in_list": "1"
			}
		],
		"next": false
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**Query**

## 获取集合详情【新增】

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:31:01

> 更新时间: 2026-02-09 19:09:52

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/detail?page=5&limit=10&collection_id=15

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| page | 5 | string | 是 | - |
| limit | 10 | string | 是 | - |
| collection_id | 15 | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"list": [
			{
				"id": "270",
				"entry_id": "dtc-fGtFQ5DJ",
				"slug": "arsenal-shows-support-for-03yx",
				"title": "Arsenal shows support for Cooney-Cross in wake of mother's cancer diagnosis",
				"sub_title": "Arsenal shows support for Cooney-Cross in wake of mother's cancer diagnosis",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/fa011ce232bdeec2348e492259b33944?impolicy=wcms_crop_resize&cropH=1105&cropW=1474&xPos=1615&yPos=1157&width=862&height=647",
				"created_at": "2026-01-14T09:33:09.190Z",
				"updated_at": "2026-01-14T09:33:09.190Z",
				"tags": [
					"Feature Updates"
				],
				"category_names": [
					"Hardware",
					"Technology"
				],
				"subcategory_names": [
					"Military",
					"Robotics",
					"New Releases",
					"Feature Updates",
					"Models"
				],
				"business_type_name": "News",
				"author_name": "Noah Sanchez",
				"author_avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=noahsanchez",
				"is_primary": false
			},
			{
				"id": "278",
				"entry_id": "dtc-uMKkPykR",
				"slug": "six-dead-including-child--bcx8",
				"title": "Six dead, including child, in Mississippi shootings, suspect charged",
				"sub_title": "Six dead, including child, in Mississippi shootings, suspect charged",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/ada73204ef1b4cab2adb6c33784bc28d?impolicy=wcms_crop_resize&cropH=338&cropW=451&xPos=197&yPos=0&width=862&height=647",
				"created_at": "2026-01-14T09:39:35.895Z",
				"updated_at": "2026-01-14T09:39:35.895Z",
				"tags": [
					"Safety & Ethics",
					"Environment"
				],
				"category_names": [
					"Benchmarks",
					"Context"
				],
				"subcategory_names": [],
				"business_type_name": "Insights",
				"author_name": "David Wilson",
				"author_avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=davidwilson",
				"is_primary": false
			},
			{
				"id": "276",
				"entry_id": "dtc-g1p60GYe",
				"slug": "the-barbie-nose-is-everyw-xic2",
				"title": "The 'Barbie nose' is everywhere. It has some experts concerned",
				"sub_title": "The 'Barbie nose' is everywhere. It has some experts concerned",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/c0ad477badb4477ec800b4a220b0bc61?impolicy=wcms_crop_resize&cropH=2000&cropW=2667&xPos=167&yPos=0&width=862&height=647",
				"created_at": "2026-01-14T09:37:50.366Z",
				"updated_at": "2026-01-14T09:37:50.366Z",
				"tags": [
					"Agents",
					"Feature Updates"
				],
				"category_names": [
					"Hardware",
					"Technology"
				],
				"subcategory_names": [
					"Drone",
					"Robotics",
					"New Releases",
					"Skills",
					"Feature Updates"
				],
				"business_type_name": "News",
				"author_name": "Alexis Baker",
				"author_avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=alexisbaker",
				"is_primary": false
			},
			{
				"id": "273",
				"entry_id": "dtc-krxPTqud",
				"slug": "gauff-beats-witek-but-pol-p8vl",
				"title": "Gauff beats Świątek but Poland advances to United Cup final",
				"sub_title": "Gauff beats Świątek but Poland advances to United Cup final",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/0f817ec240859b6ef252ccc5622c6a82?impolicy=wcms_crop_resize&cropH=2643&cropW=3524&xPos=691&yPos=110&width=862&height=647",
				"created_at": "2026-01-14T09:35:11.855Z",
				"updated_at": "2026-01-14T09:35:11.855Z",
				"tags": [
					"Feature Updates"
				],
				"category_names": [
					"Technology",
					"Business"
				],
				"subcategory_names": [
					"Agents",
					"Models",
					"Feature Updates",
					"Press Release",
					"Funding"
				],
				"business_type_name": "News",
				"author_name": "Alexis Baker",
				"author_avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=alexisbaker",
				"is_primary": false
			},
			{
				"id": "279",
				"entry_id": "dtc-zhic6jqj",
				"slug": "significant-impact-for-co-rjia",
				"title": "'Significant' impact for community bands as funding applications rejected",
				"sub_title": "'Significant' impact for community bands as funding applications rejected",
				"img_url": "https://live-production.wcms.abc-cdn.net.au/810c3cc42cfe3851421cd88d33c3509a?impolicy=wcms_crop_resize&cropH=2340&cropW=3120&xPos=940&yPos=0&width=862&height=647",
				"created_at": "2026-01-14T09:40:26.699Z",
				"updated_at": "2026-01-16T09:42:45.321Z",
				"tags": [
					"Crypto"
				],
				"category_names": [
					"Policy",
					"Business"
				],
				"subcategory_names": [
					"Geopolitics",
					"Safety & Ethics",
					"Regulation",
					"Funding",
					"Press Release"
				],
				"business_type_name": "News",
				"author_name": "Kevin Adams",
				"author_avatar": "https://api.dicebear.com/7.x/shapes/svg?seed=kevinadams",
				"is_primary": true
			}
		],
		"next": false
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 向集合添加内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:34:24

> 更新时间: 2026-01-13 19:34:42

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/add-content

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "collection_id": "14",
    "content_entry_id": "dtc-wMJODX4K"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Content has been added to collection",
		"zh": "内容已添加到集合"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**Query**

## 从集合移除内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:35:02

> 更新时间: 2026-01-13 19:35:57

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/remove-content

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "collection_id": "14",
    "content_entry_id": "dtc-wMJODX4K"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Content has been removed from collection",
		"zh": "内容已从集合中移除"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**Query**

## 批量向集合添加内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:37:40

> 更新时间: 2026-01-30 11:32:17

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/add-content/batch

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "collection_id": "18",
    "content_entry_ids": [
        "dtc-Uol04MJO",
        "dtc-0vgj8eXB",
        "dtc-3kPDr7IH",
        "dtc-MdgsfxSN",
        "dtc-B5Q5gLPA",
        "dtc-id8rBaPa",
        "dtc-m3L18bg1",
        "dtc-breURBvl",
        "dtc-UJJOlLrA",
        "dtc-20lwlv0a",
        "dtc-88tU5HwW",
        "dtc-QVNaLs9h",
        "dtc-sRg3EgKB",
        "dtc-KQNjHtSW",
        "dtc-hx78XdPb",
        "dtc-8fFeQk40",
        "dtc-N3NYsdEF",
        "dtc-kNP1NxI9",
        "dtc-oquiqmBv",
        "dtc-gGJWcchz"
    ]
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Content has been added to collection",
		"zh": "内容已添加到集合"
	},
	"data": {
		"requested_count": 2,
		"found_count": 2,
		"missing_entry_ids": [],
		"inserted_count": 1,
		"restored_count": 1,
		"skipped_count": 0
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | 可选 |

**Query**

## 批量从集合移除内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-13 19:39:08

> 更新时间: 2026-01-13 19:39:08

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/remove-content/batch

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**请求Body参数**

```javascript
{
    "collection_id": "14",
    "content_entry_ids": [
        "dtc-wMJODX4K",
        "dtc-ngxyKeQg"
    ]
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Content has been removed from collection",
		"zh": "内容已从集合中移除"
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | {{access_token}} | string | 是 | 可选 |

**Query**

## 文章置顶【新增】

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-02-09 18:51:05

> 更新时间: 2026-02-09 19:06:36

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/collections/toggle-pin

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**请求Body参数**

```javascript
{
    "collection_id": "15",
    "content_entry_id": "dtc-zhic6jqj",
    "is_primary": true
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | - |

**Query**

# Learn 文档管理

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-14 17:51:03

> 更新时间: 2026-01-14 17:51:03

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 创建(保存) Learn 内容

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-14 17:51:29

> 更新时间: 2026-01-14 18:22:32

**创建新的内容**

**接口状态**

> 开发中

**接口URL**

> /api/v1/contents/save

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**请求Body参数**

```javascript
{
	"country": "United States",
	"city": "Indiana",
	"title": "What Is a Black Hole? A Simple Guide to the Universe’s Dark Monsters",
	"sub_title": "What Is a Black Hole? A Simple Guide to the Universe’s Dark Monsters",
	"body": "A black hole is a region in space where gravity is so strong that nothing—not even light—can escape. It forms when a huge amount of mass is compressed into an extremely small volume.\n\n1. How do black holes form?\n- Stellar-mass black holes are born when very massive stars (typically more than 20 times the mass of the Sun) run out of nuclear fuel.\n- The star’s core collapses under its own gravity.\n- If the remaining core is massive enough, gravity crushes it into a black hole.\n\n2. Key parts of a black hole\n- Event horizon: The “point of no return.” Once something crosses this boundary, it cannot escape.\n- Singularity (in theory): The central region where density and curvature of spacetime become extremely large. Our current physics breaks down there.\n- Accretion disk: Hot, glowing matter swirling around some black holes before falling in.\n\n3. Can black holes “suck in” everything?\nBlack holes do not magically suck in matter from far away. Their gravity acts like that of any other object with the same mass. If the Sun were replaced by a black hole of equal mass, Earth would still orbit it at almost the same distance.\n\n4. How do we detect black holes if we cannot see them?\n- By observing the motion of nearby stars and gas.\n- By detecting X-rays from hot matter in the accretion disk.\n- By measuring gravitational waves from merging black holes.\n\n5. Why do black holes matter?\nBlack holes are laboratories for extreme physics. They test our theories of gravity, help shape galaxies, and generate some of the brightest phenomena in the universe, like quasars.",
	"content_type": "learn",
	"language": "en",
	"status": "published"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| url_code | - | string | 否 | 唯一标识码 |
| user_id | - | integer | 是 | 作者ID |
| title | - | string | 是 | 内容标题 |
| summary | - | string | 否 | 内容摘要 |
| content | - | string | 是 | 内容正文 |
| type | - | string | 是 | 内容类型 |
| category_id | - | integer | 否 | 分类ID |
| tag_id | - | integer | 否 | 标签ID |
| language | - | string | 否 | 语言：英文、中文等 |
| img_url | - | string | 否 | 封面图片URL |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2003,
	"msg": {
		"en": "Content updated successfully",
		"zh": "内容更新成功"
	}
}
```

* 失败(500)

```javascript
{
	"code": 6025,
	"msg": {
		"en": "No permission",
		"zh": "无权限"
	}
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{access_token}} | string | 是 | access token |

**Query**

## 获取Learn列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-14 17:58:17

> 更新时间: 2026-01-16 17:32:13

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles?type=learn

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| type | learn | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": "success",
	"data": {
		"list": [
			{
				"entry_id": "dtc-iGRWGYEx",
				"slug": "what-is-a-black-hole-a-si-adxx",
				"title": "What Is a Black Hole? A Simple Guide to the Universe’s Dark Monsters",
				"sub_title": "What Is a Black Hole? A Simple Guide to the Universe’s Dark Monsters",
				"created_at": "2026-01-14T09:56:54.912Z",
				"updated_at": "2026-01-14T09:56:54.912Z"
			}
		],
		"total": 1,
		"next": false
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取learn文章详情

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-14 18:21:26

> 更新时间: 2026-02-09 16:20:25

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/articles/info?entry_id=dtc-aDggB98C&type=learn

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| entry_id | dtc-aDggB98C | string | 是 | - |
| type | learn | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Success",
		"zh": "成功"
	},
	"data": {
		"entry_id": "dtc-v19v6gMM",
		"slug": "byreal-dex-from-bybit-off-v6bq",
		"title": "Byreal DEX From Bybit Officially Launches On Solana",
		"type": "article",
		"language": "en",
		"img_url": "https://1234.png",
		"status": "published",
		"body": "Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.",
		"sub_title": "Byreal DEX From Bybit Officially Launches On Solana",
		"contact": {
			"email": "danny@163.com",
			"phone": "13888888888",
			"title": "this is title",
			"company": "xxx",
			"full_name": "danny burger"
		},
		"created_at": "2025-07-08T19:42:59.246Z",
		"updated_at": "2025-07-08T19:43:50.781Z",
		"country": "United States",
		"city": "New York",
		"unique_vistor": "0",
		"page_view": "0",
		"category_name": "Markets",
		"business_type_name": "News",
		"tags": [
			"NFT",
			"DeFi"
		],
		"author": {
			"id": "5",
			"name": "dannyburger",
			"avatar_url": "https://xxx.png",
			"bio": "xxx yyy"
		}
	}
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

# robot 接口

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-15 18:22:09

> 更新时间: 2026-01-15 18:22:09

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## robot.txt

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-01-15 18:22:25

> 更新时间: 2026-01-16 17:32:16

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /robots.txt

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
User-agent: *
Disallow: /
```

* 失败(404)

```javascript
暂无数据
```

**Query**

# GA

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-04 17:39:47

> 更新时间: 2026-03-04 17:39:47

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 查询统计数据

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-04 17:40:17

> 更新时间: 2026-03-04 17:53:08

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/ga/overview?period=7d&metrics=users,views,avgViewDuration,shareRate

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| period | 7d | string | 是 | - |
| metrics | users,views,avgViewDuration,shareRate | string | 是 | - |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"success": true,
	"updatedAt": "2026-03-04T09:49:42.471Z",
	"generatedAt": "2026-03-04T09:49:42.447197+00:00",
	"propertyId": "468417216",
	"data": [
		{
			"date": "Feb 26",
			"users": 2,
			"views": 10,
			"avgViewDuration": 328.94,
			"shareRate": 0
		},
		{
			"date": "Feb 27",
			"users": 9,
			"views": 30,
			"avgViewDuration": 454.77,
			"shareRate": 0
		},
		{
			"date": "Feb 28",
			"users": 4,
			"views": 14,
			"avgViewDuration": 493.91,
			"shareRate": 0
		},
		{
			"date": "Mar 2",
			"users": 4,
			"views": 7,
			"avgViewDuration": 351.31,
			"shareRate": 0
		},
		{
			"date": "Mar 3",
			"users": 1,
			"views": 1,
			"avgViewDuration": 121.05,
			"shareRate": 0
		}
	]
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 查询地域数据

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-03-05 14:13:10

> 更新时间: 2026-03-05 14:23:56

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /api/v1/overview/regions

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{
	"success": true,
	"updatedAt": "2026-03-05T06:23:22.832Z",
	"generatedAt": "2026-03-05T06:23:22.701204+00:00",
	"propertyId": "468417216",
	"data": [
		{
			"rank": 1,
			"region": "Singapore",
			"regionCode": "SG",
			"traffic": 213,
			"change24h": 0
		},
		{
			"rank": 2,
			"region": "United States",
			"regionCode": "US",
			"traffic": 4,
			"change24h": 0
		},
		{
			"rank": 3,
			"region": "Taiwan",
			"regionCode": "TW",
			"traffic": 1,
			"change24h": 0
		}
	]
}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

# Podcasts

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 14:12:33

> 更新时间: 2026-04-09 14:12:33

**播客模块接口 - YouTube 频道订阅与播客管理**

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**Query**

## 播客列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 14:12:45

> 更新时间: 2026-04-09 18:01:25

**返回 status=completed 且 is_translated=TRUE 的播客列表，支持关键词搜索标题或频道名称。无需认证。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| page | 1 | integer | 是 | 页码 |
| limit | 10 | integer | 是 | 每页条数，最大 20 |
| keyword | 3Blue1Brown | string | 是 | 搜索 title 或 channel_name，可选 |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Podcasts fetched successfully",
        "zh": "播客列表获取成功"
    },
    "data": {
        "list": [
            {
                "id": "dtc-ab12cd34",
                "youtube_url": "https://www.youtube.com/watch?v=HEfHFsfGXjs",
                "embed_url": "https://www.youtube.com/embed/HEfHFsfGXjs",
                "title": "But what is a neural network?",
                "description": "An introduction to neural networks...",
                "channel_name": "3Blue1Brown",
                "channel_url": "https://www.youtube.com/@3Blue1Brown",
                "channel_avatar": "https://yt3.ggpht.com/ytc/xxx",
                "thumbnail": "https://i.ytimg.com/vi/HEfHFsfGXjs/maxresdefault.jpg",
                "duration": 1082,
                "view_count": 15000000,
                "published_at": "2024-01-15T08:00:00Z",
                "status": "completed",
                "created_at": "2024-01-16T10:00:00Z",
                "updated_at": "2024-01-16T10:30:00Z"
            }
        ],
        "total": 42,
        "next": true
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.list | - | array | 播客列表 |
| data.list[].id | dtc-ab12cd34 | string | 播客 ID（dtc-xxxxxxxx） |
| data.list[].youtube_url | https://www.youtube.com/watch?v=HEfHFsfGXjs | string | YouTube 视频原链接 |
| data.list[].embed_url | https://www.youtube.com/embed/HEfHFsfGXjs | string | YouTube 嵌入播放链接 |
| data.list[].title | But what is a neural network? | string | 视频标题 |
| data.list[].channel_name | 3Blue1Brown | string | 频道名称 |
| data.list[].channel_url | https://www.youtube.com/@3Blue1Brown | string | 频道主页链接 |
| data.list[].channel_avatar | - | string | 频道头像 URL |
| data.list[].thumbnail | - | string | 视频封面图 |
| data.list[].duration | 1082 | integer | 视频时长（秒） |
| data.list[].view_count | 15000000 | integer | 视频播放量 |
| data.list[].published_at | 2024-01-15T08:00:00Z | string | 发布时间 |
| data.total | 42 | integer | 总条数 |
| data.next | true | boolean | 是否有下一页 |

**Query**

## 播客详情

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 14:12:52

> 更新时间: 2026-04-09 18:02:30

**根据 ID 获取单个播客详情，仅返回 status=completed 的播客。ID 格式为 dtc-xxxxxxxx（8位字母数字）。无需认证。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/dtc-Wvf2J1fG

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Podcast fetched successfully",
		"zh": "播客详情获取成功"
	},
	"data": {
		"id": "dtc-Wvf2J1fG",
		"youtube_url": "https://www.youtube.com/watch?v=j0wJBEZdwLs",
		"embed_url": "https://www.youtube.com/embed/j0wJBEZdwLs",
		"title": "But what is a Laplace Transform?",
		"description": "Visualizing the most important tool for differential equations.\nPrevious chapter: https://youtu.be/-j8PzkZ70Lg\nInstead of sponsored ad reads, these lessons are funded directly by viewers: https://3b1b.co/support\nAn equally valuable form of support is to simply share the videos.\nHome page: https://www.3blue1brown.com\n\nPi creature car artwork by Kurt Bruns\n\nEngine animation borrowed with permission from this (excellent) blog: https://ciechanow.ski/internal-combustion-engine/\n\nTimestamps:\n0:00 - Understanding the engine\n1:16 - Key background ideas\n5:41 - Definition and intuition\n10:43 - Complex integration\n20:43 - Analytic continuation\n23:52 - The transform of exponentials\n26:15 - A deep look at cos(t)\n32:59 - What’s coming next\n\n\n------------------\n\nThese animations are largely made using a custom Python library, manim.  See the FAQ comments here:\nhttps://3b1b.co/faq#manim\n\nMusic by Vincent Rubinetti.\nhttps://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown\nhttps://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u\n\n------------------\n\n3blue1brown is a channel about animating math, in all senses of the word animate. If you're reading the bottom of a video description, I'm guessing you're more interested than the average viewer in lessons here. It would mean a lot to me if you chose to stay up to date on new ones, either by subscribing here on YouTube or otherwise following on whichever platform below you check most regularly.\n\nMailing list: https://3blue1brown.substack.com\nTwitter: https://twitter.com/3blue1brown\nBluesky: https://bsky.app/profile/3blue1brown.com\nInstagram: https://www.instagram.com/3blue1brown\nReddit: https://www.reddit.com/r/3blue1brown\nFacebook: https://www.facebook.com/3blue1brown\nPatreon: https://patreon.com/3blue1brown\nWebsite: https://www.3blue1brown.com",
		"channel_name": "3Blue1Brown",
		"channel_url": "https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw",
		"channel_avatar": "https://i.ytimg.com/vi_webp/j0wJBEZdwLs/maxresdefault.webp",
		"thumbnail": "https://i.ytimg.com/vi/j0wJBEZdwLs/maxresdefault.jpg",
		"duration": 2080,
		"view_count": "1441565",
		"published_at": "2026-04-09T09:52:45.001Z",
		"content": "[Submit subtitle corrections at criblate.com] What you're looking at, a somewhat complicated diagram that you and I are\ngoing to build up in this video, is a visualization unpacking the meaning\nbehind one of the most powerful tools used to study differential equations.\nIt's known as the Laplace transform.\nThis is one of those tools where, as a student,\nyou can learn how to use it to solve equations,\nand yet be left completely in the dark about what it's actually doing.\nThink about learning how to drive a car versus\nlearning how an internal combustion engine works.\nBoth are worthy pursuits, one is not necessarily better than the other,\nand in fact driving is probably more practical.\nBut there is something deeply satisfying about popping\nopen the hood and understanding the mechanism inside.\nSimilarly, our main goal with this video is to pop the hood and show\nyou some of the beautiful math that awaits us inside this object.\nAnd strictly speaking, a lot of what I want to show is\nnot necessary if your only goal is to solve equations.\nThat said, for the differential equation students among you,\nI think the content here should make the stuff you have to memorize a lot more\nmemorable, and after dissecting this machine, studying it piece by piece,\nyou and I will take everything for a test drive and see what it looks like to solve a\nconcrete and very interesting differential equation.\nNow before I just plop down the definition on the screen,\nlet's talk about what problem the Laplace transform is trying to solve.\nWe set up a lot of this in the previous chapter,\nand there are two primary ideas worth restating here.\nNumber one, you need to understand exponential functions,\nand I'm always going to be writing these as e^(st)\nt represents time, and then s is a number.\nIt determines what specific exponential we're talking about,\nbut very importantly for this topic, we're going to give s the freedom to take on\ncomplex number values.\nWe covered this much more thoroughly in the previous chapter,\nbut the quick summary is that if s has an imaginary part,\nthe output of your function rotates in the complex plane as time ticks forward.\nWhen the real part of s is negative, the magnitude is decaying towards zero over time,\nbut if it happens to be positive, that would mean the magnitude grows,\nnamely growing exponentially.\nIf any of that feels shaky or if you want to understand why it's true,\ndo watch the previous chapter, but from this point forward,\nI'm assuming everybody is comfortable with this notion.\nWhy do we care, though?\nWhy the hubbub about these functions?\nWell, it's because of the second thing you need to know,\nwhich is that a lot of functions, especially those arising in physics,\ncan be expressed as combinations of exponential pieces.\nThere's one very friendly example that's going to be helpful to\nreturn to repeatedly throughout this lesson, the cosine of t.\nThis undulating function can be broken up as a sum of two purely imaginary exponentials.\nBasically, if you take e^(it), that gives you rotation counterclockwise,\nand e^(-it) rotates the other way, so when you add these two together,\nperhaps imagining adding two rotating vectors tip to tail,\nthe imaginary parts cancel each other out, and what you're left with is\nsomething whose output remains locked to the real number line,\noscillating back and forth.\nNow as it stands, this sum goes between negative two and positive two,\nbut a cosine only goes between negative one and one,\nso finally you multiply everything by one half.\nMore complicated functions might break down into more exponential pieces.\nFor example, later in this lesson, you and I are going to dig into something\ncalled the driven harmonic oscillator, which is basically a mass on a spring\nthat's influenced by some external force, in our case, one that oscillates over time.\nAs a spoiler, the solution to the equation describing that\nends up looking like a sum of four exponential pieces.\nTwo of those pieces oscillate and decay in a way that matches\nthe natural resonant frequency of the spring,\nand then the other two oscillate in a way that matches the external force.\nSo for cases like this and many others, what we would like is some sort of tool,\nsome sort of mathematical machine where you can pump in a function,\nor even a differential equation describing that function,\nand that machine will somehow reveal for us what specific exponential pieces\nthat function breaks down into.\nThat is, it exposes what these values s in the exponent all are,\nas well as what the corresponding coefficients are.\nNow you might be wondering why exponential pieces, why not focus on something else.\nThe short answer is that for these functions, when you take a derivative,\nit looks precisely the same as multiplying by some number, namely s.\nWhat you'll see by the end is how this means that same machine that lets us dissect\nfunctions into exponential pieces also allows us to turn differential equations into\nalgebra, essentially because everywhere you see a derivative,\nit turns into multiplication by s.\nNow in a context like this one where we are so focused on complex-valued exponentials,\nengineers have a special name for this complex plane that I'm depicting on the left,\nrepresenting all possible values for that term s in the exponent.\nThey call it, well, the s-plane.\nA helpful mental image is to think of each individual point on\nthe s-plane as encoding the entire exponential function e^(st).\nFor this picture, the graphs I'm showing only depict the real component of the output,\nbut keep in mind, each point is representing the full complex-valued function.\nThese graphs are enough for intuition though.\nYou'll notice how bigger imaginary parts correspond to faster oscillation,\nand then as your eyes scan from left to right,\nthe real part reflects either decay or growth.\nSo with this as our goal, the machine that you and I are going to build up today,\nthe one that exposes how a function breaks into exponential pieces,\nis, as you have no doubt guessed, the Laplace transform.\nNow this word transform is a little funny, basically in the same way\nthat a function is something that takes in a number and spits out a new number,\nwe often use the word transform in math for a more meta operation that\ntakes in an entire function and spits out a new function.\nIn the case of the Laplace transform, a typical convention is to name our new function\nwith a capitalized version of whatever you use to name that original function.\nAnd in this setting, where our original function takes in time as an input,\nthe new transformed function has a new different kind of input, a complex value, s.\nI think it's helpful to quickly preview what this new function actually\ndoes before we pull up the definition and start dissecting it.\nSuppose your original function, f(t), really can be\nbroken down as a sum of several exponential pieces.\nWhen you apply this Laplace transform, giving you a new function of this new variable s,\nif you were to plot this new function over the s plane,\nin a way that I will explain in just a minute,\nwhat you see are these sharp spikes above each value of s that corresponds\nto one of those exponential pieces.\nThese spikes have a fancy name, they are called the poles of your function.\nSo even if you didn't know ahead of time how your function could be broken down as a\nsum of exponentials, if you understand this transformed version,\nand specifically if you understand the poles,\nthat can reveal for you what those exponential pieces are.\nAt this point you're probably itching to see how this thing is actually defined,\nand in its full glory this is what that definition looks like,\nwhich we can think of as two separate steps.\nFirst, you multiply your function by the expression e^(-st), and then second,\nyou integrate that result over time from t equals zero to infinity.\nWe'll talk all about that integral and its nuances in just a minute,\nbut for the moment focus on that inner expression.\nThis term s is the newly introduced parameter,\nthe one that is the input of our new transformed function.\nAs I said, it's a complex number.\nEvery time you see the letter s in this video, it's a complex number.\nAnd the way I like to think about it is that you might imagine freely moving\naround this value s on the s-plane, and it's kind of sniffing around to find\nwhich specific exponential functions line up closely with our function f(t).\nFor example, let's suppose our function is the cosine of t,\nwhich as we discussed just a minute ago, we already know can\nbe broken down as a sum of two exponentials, e^(it) and e^(-it)\nI've already previewed the idea that when you plot the final result you should\nsee these spikes over the key values of s, which in this example would mean poles\nabove plus i and negative i, and you can already get a little intuition by taking\nthis example and substituting in the expanded expression for the cosine of t.\nLooking at this expansion, I want you to take a\nmoment to think about the product of these two terms.\nWhen you multiply two exponentials, the contents of those exponents add together,\nso what you're left with is e raised to the i minus s times t.\nLet me go ahead and plot that value on the lower right,\nkeeping the s plane on the upper right. Just like the exponentials we've already seen,\nas time goes from zero to infinity, this oscillates and decays, or maybe it grows.\nThe specific shape depends on how we set that value s.\nNow in this case, as you move around that value s,\nthere is one specific value causing uniquely boring behavior.\nIf you set s equal to i, then that term in the exponent becomes zero,\nso the entire function just looks like e^0, which is stuck at the constant one.\nAnd this is a key idea for almost all values of s.\nAn exponential like this is going to change with time,\ntypically looking like some kind of spiral, but at the special value\nthat we're hunting for, in this case, s equals i, instead things get stuck at a constant.\nSo, stepping back, if you were a mathematician and you're trying to invent some\nkind of machine that will detect the exponential pieces lurking inside a function,\nfor example, detecting that a cosine has an e^(it) and an e^(-it) lurking inside it,\nyou might ask yourself, is there something I can do that can detect when one\nof the terms in a sum like this is secretly just a constant?\nIn essence, this is the role played by the integral that is wrapping everything\nup in the full definition, integrating as time goes from zero to infinity.\nAnd on the one hand, if you're comfortable with calculus,\nyou might be able to anticipate why this would result in some kind of sharp spike\nover the desired values of s.\nIf you integrate a constant from zero all the way up to infinity, it blows up.\nBut there's actually a fair bit of nuance here.\nTo start, that function inside the integral takes on complex number values.\nAnd this raises a natural question for those of us\ncurious to interpret things in a satisfying way.\nHow do you think about integrating a complex valued function?\nIf you're up for it, what I'd like to do with the next 10 minutes or so\nis really dig in and dissect what an integral like this really means,\nhow to visualize it, and to explain why the plots that I'm showing\nrepresent something slightly distinct from the literal meaning of this integral.\nAs with any new piece of math, it's best to start easy and work our way up in complexity.\nSo to kick things off, let's just ignore this function f(t)\nitself and only focus on integrating the e^(-st) part.\nAnd to warm up, before jumping into the complexity of it all,\nlet's just suppose that s is a real number, meaning this is a friendly,\nreal valued function that we can plot with a graph like normal.\nTypically, when you first learn calculus, you learn to interpret\nan integral as telling you the area under a graph like this.\nFor example, if you set the value s equal to 1,\nand you go through the procedure for actually calculating this integral, you know,\nyou take an antiderivative, you take the difference at the two different bounds,\nbecause there's an infinity, you could say you take the limiting value at that bound,\nthe way it all works out is that this expression equals 1.\nAnd you can interpret that as telling you that the area under this graph is 1,\nwhich is kind of fun.\nI guess that means that all the area under this infinite tail\nis exactly enough to fill in the rest of this unit square.\nAnd then if we reintroduce that value s and set it equal to something that's not 1,\nthe effect is to squish the graph in the horizontal direction.\nThat's always the effect if you multiply the input of a function by some constant.\nAnd so the area under this graph, which started out as 1, must now be 1 divided by s.\nThe key thing I want you to remember here is how if we let s get smaller and\nsmaller and approach the value at 0, then that area gets bigger and bigger and bigger,\nactually approaching infinity, and approaching it quite quickly too.\nBut graphs are not the only way to visualize functions,\nand area is not the only way to understand integrals,\nand you should get in the habit of flexing your mind a little bit more.\nLet me show you another way to think about this that will generalize\nmore easily once we let that function take on complex number values.\nThink about this integral just between 0 and 1, something with a unit length.\nAnd I want you to imagine all this area under the graph as a pool of water,\nwhich you let kind of slosh down until it becomes level.\nThe height of this pool is telling you the average value of that function between 0 and 1.\nAnd then because the width of this pool is just 1,\nthen its area is the same thing as its height.\nSo this integral up top, when it's over a unit interval,\nis telling you the average value of the function on that interval.\nSimilarly, the integral from 1 to 2 would be telling you the\naverage value the function takes over that interval from 1 to 2.\nAnd then same deal as you keep integrating along a bunch of other unit intervals.\nSo then, if you want the integral from 0 out to infinity,\nwhat you can think about is taking all of these average values on those intervals\nand adding them all together.\nThis is something we can work with.\nNow let's look at the complex case.\nS is going to be some complex number, and then the function e^(-st) cycles\nand decays around the complex plane as you let time go from 0 up to infinity.\nThe specific way that it cycles and decays or grows depends on that value of s,\nand we'll get a distinct path through the complex plane for each one.\nNow if you want to integrate this function on a unit interval,\nlet's say from the values t equals 0 to t equals 1,\nimagine taking a sample of all of the outputs in this range and then finding the\naverage, the center of mass for all those points.\nThat average value is the meaning of this integral,\nwhich I will represent with a little arrow.\nActually, it'll be helpful if we put this integral in its own complex plane\ndown in the lower right, because we're about to start adding them all up.\nIf you let t range from 1 up to 2 and you do the same thing,\ntake the average value on that interval, represent it with an arrow,\nand then you add that arrow to what we have on the lower right,\nthe resulting sum is basically telling you the integral from 0 all the way up to 2.\nAnd then we repeat.\nYou take an average between 2 and 3, add that, average between 3 and 4,\nadd that, and just keep going on and on and on and on.\nAnd the limiting point for this spiraling sum that you see is the value of the integral\nfrom 0 to infinity of e^(-st), exactly the expression we're trying to understand.\nAnd as we move around that input s, the resulting value of\nthis spiraling sum might wander around the complex plane.\nAs a quick sanity check, let me move that value of s over to the input 1.\nSo there's no oscillation because there's no imaginary part,\nand you'll notice that all these little arrows stack up to end up on the number 1.\nAnd this should make sense.\nBack when we were interpreting the integral the more familiar way as an area\nunder a curve, we saw that this value, when s equals 1, works out to be 1.\nAnd just as before, if I let s approach 0, getting smaller and smaller,\nthen the resulting integral gets bigger and bigger, rapidly approaching infinity.\nIn this new diagram, we can see how if s moves away from 0 in a different direction,\nmoving vertically, the resulting integral also gets smaller,\nbut for a much different reason.\nAll the oscillation in the function gives us more cancellation in that vector sum,\nso the output gets closer to 0.\nNext what I want to do is plot this value.\nSo look at that point where our spiraling sum converges to.\nI want you to think of it as a little vector in the complex plane,\nsomething that has a magnitude and a direction.\nAnd to get a little fancy, let's take that magnitude,\nand we're going to plot it above the value s in the s-plane.\nSo as I change that value s, and it changes the resulting integral,\nthe magnitude of our output might grow or shrink, and as it does so,\nwe will plot the result over the s-plane.\nAnd I'm just going to leave this on autopilot for a moment,\nwhere s is going to wander around the plane.\nAnd as it does so, take a moment to think about why we're getting the shapes that we see.\nBasically, the bigger the imaginary part of s,\nthe more spiraling there is in the expression, meaning more cancellation,\nso the magnitude of that output is smaller.\nHere's what it looks like if I graph the full plot over many possible values of s.\nThe most obvious feature is how if s gets closer and closer to 0,\nthen the magnitude of that output gets bigger and bigger, which makes sense.\nThe small real part means it has slower decay,\nand the small imaginary part means there's less cancellation.\nNow, as it stands, I'm only graphing the magnitude of that output,\nbut of course it has more information than that, it has a direction too,\nso if we associate every possible direction of that output with a unique color,\nthen one thing I could do is color the graph,\ngiving us a richer sense of what that output looks like.\nThe other thing you've probably already noticed about this plot is that it is\nconspicuously not being drawn over values of s where the real part is negative.\nAnd think about what those values actually mean.\nWhen the real part of s is negative, then the function e^(-st) grows exponentially,\nand this spiraling sum for the integral we have blows up, it does not converge.\nSo these values are not defined, at least for the moment they're not defined.\nThere's a fancy notion we'll get to shortly.\nOn the boundary, things get kind of interesting.\nIf s is purely imaginary, the value e^(-st) simply goes around in a circle,\npurely rotating, neither growing nor decaying.\nAnd as we play this game of averaging along various intervals and adding them together,\nthat vector sum we get in the lower right simply spirals around and around ad nauseam.\nNow on the one hand, this also does not converge,\nthere is not a specific value that this approaches.\nHowever, it's not too hard to make sense out of it.\nIf you let the value of s get even just a little bit of a real component,\nthen our function does decay, and our spiraling sum does approach a clear concrete value.\nAnd then if you slowly take away that real part of s,\nletting it approach the imaginary number line,\nthen that resulting integral on the lower right unambiguously approaches one clear value.\nAnd you can see that on the plot too, there's clearly some value that it wants to take on.\nAnd in fact, I can tell you precisely what value it wants to converge to.\nThink back to the real valued case where we saw\nthat the integral is equal to 1 divided by s.\nThis is a purely analytic fact that remains true even when s is a complex number.\nMaybe that's what you'd expect, but it's not at all obvious that\nthis should remain true in the more rich case of complex numbers.\nTo gut check for at least one example, we were just looking very\nclosely at what happens while s approaches the imaginary constant i.\nAnd if you focus on what's happening in the lower right,\nyou'll see that the integral is approaching negative i.\nAnd indeed, 1 divided by i is negative i.\nSo we have this nice and blessedly simple equation describing our integral,\nbut the funny thing about it is that this right hand side,\n1 divided by s, is defined everywhere on the plane.\nI can plot the result, this is what it looks like.\nNow maybe you raise an eyebrow for s equals 0,\nbut almost everywhere this has an unambiguous value.\nNow to be clear, the integral itself emphatically does not converge on the left half\nof the plane, so in that region the equation, strictly speaking, makes no sense.\nAs an example, think about setting s equal to negative 1.\nOn the right hand side, 1 divided by negative 1 is negative 1,\nbut I think you'll agree that integrating e^t from 0 to infinity sure does not\nlook like negative 1.\nHowever, this brings us to a fascinating aspect of complex valued functions,\nwhich is completely different from the world of real valued functions.\nIt's something known as analytic continuation.\nIt's a sense in which these nonsensical values beyond the domain of convergence can\nnevertheless reflect useful meaning about the expression where it really does converge.\nAlthough what follows is very firmly in the territory of more than you\nneed to know to drive the car, it is a beautiful piece of math and it's\nthe final puzzle piece to explain the plots that I'm drawing for you.\nHere's the idea.\nSuppose you have some function and it's defined only over a limited domain.\nIf this was a real valued function and you wanted to extend the definition to include\na bigger domain, you basically have infinitely many choices for how to do this.\nEven if you add some constraint, say your function is smooth in the\nsense that it has a derivative everywhere and you want your extension to also be smooth,\nthen you still have an infinity of choices.\nIt's kind of like a floppy bit of spaghetti.\nComplex valued functions though turn out to be much more constrained.\nIf you have one defined only over a limited domain,\nsomething like our integral that converges only over half the plane,\nand if that function is nice in the sense of having a well-defined derivative,\nand then if you want to extend the function in a way that keeps it nice,\nagain in the sense of having a derivative, then there's a nice little theorem\ntelling us that one of two things happens.\nEither there is no way to extend it, or if there is a way, that way is unique.\nThat's very surprising.\nYou might think you have infinite choices, but you don't.\nWhen this extension does exist, it has a fancy name.\nWe call it the analytic continuation of the original function.\nAnd a very powerful theme throughout math is that you can sometimes discover\nhidden information about a function by understanding its full extended version,\nespecially understanding the poles in that full extended version.\nOver here in our context of studying Laplace transforms,\nthe relevance is that the actual integral defining this transform\ntypically only converges for half the plane when the real part of s is sufficiently big.\nHowever, it can be very helpful to plot and to understand the\nfull extended version exposing all the poles of the function.\nAs I alluded to earlier, the poles are what exposes\nthe exponential pieces that we're hunting for.\nLooking back at this warm-up example that we've been focusing on,\nthe integral of e^(-st), as I said, that only converges when the real part of\ns is positive.\nAnd on that half plane, it equals 1 divided by s.\n1 divided by s is defined everywhere, and it is nice in the sense of having a derivative.\nSo we say this is the analytic continuation of our integral.\nThis function is the purest example of a pole.\nYou say it has a pole above s=0, and a slightly less hand-wavy definition of what\nI mean by this is that it looks approximately like dividing by 0 around that point.\nIt's not hard to see where the name comes from.\nThe plot looks kind of like a circus tent with a pole above that point.\nWonderful.\nThis is actually a very useful result.\nThis integral that we have now spent so much time on is effectively the Laplace\ntransform of one of the simplest possible functions, the constant function at 1.\nThat constant function transforms into 1 divided by s,\nwhich you should see in your mind's eye as a pole above s=0.\nThat might seem like a simple example, but almost for free,\nwe can squeeze out a much more general result,\nwhich is that the transform of any exponential function also looks like a simple pole.\nIt's just going to be above some other value on the s-plane.\nHere, let's take a moment to actually think it through.\nWhat would happen if I asked you to pump in a function like, I don't know, e^(1.5 * t)?\nWell, then the expression inside that integral combines,\nand you get e^{(1.5 - s)t}, which is nearly identical to\neverything we were just looking at, it's just things are shifted by 1.5.\nIf you wanted, I could pull up that same visual,\nwhich dissects and interprets the integral, pictured on the lower right, and again,\nthe function inside the integral is pictured on the upper right,\nand we're playing the same game of adding up averages.\nBut nothing in this diagram has substantively changed,\nit's essentially the same thing we were just looking at,\nthe only difference is that now, that special value where explosion happens and\nwe see a pole, is at s = 1.5 instead of s = 0.\nSymbolically, a little bit of rearrangement shows that this key\nintegral is almost identical to the one we were just studying,\nthe only difference is that s has been replaced by s - 1.5.\nSo the new result that we can write down in circle,\nis that the transform of our exponential function looks like 1 divided by s - 1.5.\nAnd of course, there's nothing special about 1.5, I can replace this with any constant a.\nAnd if there is only one fact that you remember from this video, let it be this one.\nThe Laplace transform of an exponential function, e^(at),\nis a new function of s that has a simple pole over s = a.\nThis is that key idea I alluded to earlier, poles in the\ntransformed function expose exponential pieces of the original.\nThe final step to fleshing out that idea, is to\nconvince ourselves that this works for combinations.\nAs an example, let's pull back in our good friend the cosine of t.\nAnd here we have two options for how to study this,\nwe can think it through symbolically, and then after, for fun,\nlet's plug it into that same visual machine and see what it looks like.\nAlright, so symbolically, as we discussed earlier,\na cosine can be broken up as 0.5 e^(it) + 0.5 e^(-it).\nWhat you can do next from here is break this outer expression into two different pieces.\nOne that looks like half times the transform of e^(it),\nand another which looks like half times the transform of e^(-it).\nIn the lingo, the way that you would phrase this is that the Laplace transform is linear,\nmeaning if you have a scaled sum of some stuff on the inside,\nyou can break everything apart to the same scaled sum of the transforms of those\ninner parts.\nIn our case, because we just saw how to take the transform of simple exponential\nfunctions, this whole expression here can be collapsed to look like 1 divided by s - i.\nA thing with a simple pole at i.\nAnd then this whole expression can collapse to become 1 over s + i,\na thing with a pole at negative i.\nSo when you read this whole expression, the sum of two fractions,\nthe image that should pop into your head is a plot with two different spikes above\ni and negative i.\nAnd in fact, if we have a little fun and we try plugging the expression cosine of t,\ne^(-st), into that big complex integrating machine that we built up,\nyou do indeed see a plot that has poles above i and negative i.\nThis time, the diagram is notably more complicated, and if I'm honest with you,\nthe symbolic reasoning is probably the easier way to understand the final answer.\nBut you and I are here to have a little fun, aren't we?\nDelving into each piston and valve of the machine that we're working with.\nSo let's see if we can take a minute or two to try\nto make sense out of what exactly we're looking at.\nOnce again, on the upper right, I'm showing the function inside the integral,\nthe cosine of t times e^(-st).\nBut now it's a lot more of a chaotic squiggle.\nTo build a little intuition, let me set s equal to a small,\npurely imaginary value, say 0.2 i.\nOn that plot in the upper right, I'll go ahead and add a vector that's just showing\nthe e^(st) part, which for the small imaginary value of s simply rotates very slowly.\nIn the full function, that term gets multiplied by cosine,\nso the path that it would trace out would oscillate back and forth,\ngiving us this nice flower petal pattern.\nAs before, the way we're visualizing the integral is by taking averages along various\nunit intervals and then adding those together, like a big tip-to-tail vector sum.\nIn this case, the diagram of adding those vectors is actually quite nice.\nIt looks like going around and around in a little star pattern.\nAnd strictly speaking, this does not converge.\nWhat's being plotted up on the left is the analytic continuation.\nIf you wanted this to converge, you can add even just a little bit of a real\ncomponent to that value s, meaning that the function decays a bit as time\ngoes out to infinity, and even a little bit of decay will be enough to cause this sum,\ndown on the lower right, to converge to a clear, unambiguous value.\nNow notice what happens as I increase the imaginary part,\nand the frequency of our exponential gets closer to the frequency of the cosine.\nWhat you get is more and more alignment, resulting in a bigger total integral.\nIn fact, when that imaginary part is 1, meaning the oscillation of the\nexponential exactly lines up with the oscillation of the cosine,\nthen the path that it traces out remains entirely confined to the right side\nof the plane, and the result is that the integral kind of gets jettisoned\nout to the right.\nFrom there, if I were to decrease the real part of s, meaning less and less decay,\nthen the integral gets closer and closer to infinity,\nhence why we see a pole above that value.\nAnd by the way, stepping back, for any of you who happened to watch the\nvideo I did many years ago about the Fourier transform,\nif all of this looks strikingly familiar, it's because it's basically the same thing.\nWhen s is a purely imaginary number, the Laplace\ntransform is nearly identical to the Fourier transform.\nIt's not quite the same expression, the lower bound on our integral is zero,\nnot negative infinity, and there's varying conventions about the\nconstants in that exponent, but the essence is really the same.\nNow this relationship between Fourier transforms and Laplace transforms will play\na much bigger role in our story in a following chapter,\nbut right here I wanted to quickly highlight how, in a sense,\nthis Laplace transform is a generalization.\nWhat it does is probe at how well a function lines up,\nnot just with purely imaginary exponentials, but with any exponential.\nNow, looking back at our symbolic result for the Laplace transform of the cosine of t,\nif you were to go and look this up, say in a big table of Laplace transforms,\nthis is actually not how it would look.\nFirst of all, it's common and useful to consider a more general cosine\nwave that has an arbitrary angular frequency omega on the inside.\nThe only change here is that everywhere you see an i, you replace it with omega times i.\nSo you can read that final expression as telling\nyou there are poles at omega i and negative omega i.\nBut even still, this is not what you would see in a table.\nLet me go ahead and just run some algebra on autopilot\nhere that's going to combine those two terms.\nAnd when all the dust settles, what you end up\nwith is s divided by s squared plus omega squared.\nNow this is the expression you would actually see.\nAnd in fact, the reason I bring it up is I want to talk about how\nthe entire logic of this example could flow the other way around.\nImagine you did not already know ahead of time that a cosine can be broken up as\na sum of two exponentials, but you were very savvy with integration by parts.\nI won't walk through details here, but you can directly calculate this equality here,\nessentially directly computing the definition for the transform.\nFrom there, you could use a process that is fancifully called partial fraction\ndecomposition to break apart this fraction into the two pieces that clearly expose the\npoles at omega i and negative omega i, and which also exposes those coefficients of\none half.\nThis in turn would be enough to tell you what the exponential pieces lurking inside are.\nThat flow of the logic is actually a lot more reflective\nof what it feels like to use this transform in practice.\nOn that note, our next step is to take this machine for a test drive\nand see what it looks like to solve an actual differential equation.\nNow my original plan was to conclude this video with a worked example,\nbut looking at the time and considering this is all part of a series anyway,\nit's probably a little better to give you the chance to stand up, stretch out,\nreflect on everything, and let's put that in a follow-on chapter.\nThe key takeaway for this video is how when a function can be broken into exponential\npieces, the Laplace transform exposes what those pieces are as poles above the s-plane.\nBut I want you to know we are not done understanding its full generality.\nMost functions cannot be expressed as discrete sums of exponentials like this.\nNevertheless, the transform offers a very powerful way to\nexpress many many more functions as combinations of exponentials.\nIt's just you combine over a continuous range, not a discrete one.\nTurning back to that analogy of driving a car versus learning how an engine works,\nthere is a third even deeper level of understanding,\nwhich is knowing how to build a car for yourself.\nIn the final chapter of this sequence, I want to show you how you could\nreinvent the Laplace transform from scratch, how it relates to Fourier\ntransforms and Fourier inversion, and how to think about it for a much\nbroader family of functions beyond these discrete sums of exponentials.\nI'll see you there.",
		"status": "completed",
		"error_message": null,
		"created_at": "2026-04-09T09:52:34.383Z",
		"updated_at": "2026-04-09T09:52:45.001Z"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.id | dtc-ab12cd34 | string | 播客 ID |
| data.youtube_url | - | string | YouTube 视频原链接 |
| data.embed_url | https://www.youtube.com/embed/HEfHFsfGXjs | string | YouTube 嵌入播放链接，可直接用于 iframe src |
| data.title | - | string | 视频标题 |
| data.description | - | string | 视频描述 |
| data.channel_name | 3Blue1Brown | string | 频道名称 |
| data.channel_url | - | string | 频道主页链接 |
| data.channel_avatar | - | string | 频道头像 URL |
| data.thumbnail | - | string | 视频封面图 |
| data.duration | 1082 | integer | 视频时长（秒） |
| data.view_count | 15000000 | integer | 视频播放量 |
| data.published_at | - | string | 发布时间 |
| data.transcript | - | array | 字幕数组，每项含 start/end（秒）和 text |
| data.status | completed | string | 处理状态 |
| data.error_message | null | string | 失败原因，成功时为 null |

* 不存在(200)

```javascript
{
    "code": 4003,
    "msg": {
        "en": "Podcast not found",
        "zh": "播客不存在"
    }
}
```

**Query**

## 删除播客（管理员）

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 14:13:04

> 更新时间: 2026-04-10 16:47:35

**管理员删除指定播客。ID 格式为 dtc-xxxxxxxx。需要管理员权限（role=1）。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/:id

**请求方式**

> DELETE

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Podcast deleted",
        "zh": "播客已删除"
    },
    "data": null
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data | null | null | 无数据返回，值为 null |

* 不存在(200)

```javascript
{
    "code": 4003,
    "msg": {
        "en": "Podcast not found",
        "zh": "播客不存在"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4003 | integer | 错误码 |

* 无权限(200)

```javascript
{
    "code": 4006,
    "msg": {
        "en": "Permission denied",
        "zh": "权限不足"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4006 | integer | 错误码 |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |

**Query**

## 添加订阅源（管理员）

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 14:13:14

> 更新时间: 2026-04-09 17:01:56

**提交 YouTube 频道或单视频 URL，后台异步处理，立即返回任务状态。支持格式：频道（/@handle、/channel/UCxxx、/c/name、/user/name）或视频（/watch?v=xxx、youtu.be/xxx、/shorts/xxx）。需要管理员权限。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/sources

**请求方式**

> POST

**Content-Type**

> json

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |
| Content-Type | application/json | string | 是 | 内容类型 |

**请求Body参数**

```javascript
{
    "url": "https://www.youtube.com/@3Blue1Brown"
}
```

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| url | https://www.youtube.com/@3Blue1Brown | string | 是 | YouTube 频道或视频 URL |

**认证方式**

> 继承父级

**响应示例**

* 成功响应（频道）(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Source created, processing in background",
        "zh": "订阅源已创建，正在后台处理"
    },
    "data": {
        "id": "dtc-ef56gh78",
        "url": "https://www.youtube.com/@3Blue1Brown",
        "type": "channel",
        "status": "pending",
        "total_videos": 0,
        "processed_videos": 0,
        "created_at": "2026-04-09T06:00:00.000Z"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.type | channel | string | 类型：channel 或 video |
| data.status | pending | string | 处理状态：pending\|processing\|completed\|failed |
| data.total_videos | 0 | integer | 总视频数（频道类型） |
| data.processed_videos | 0 | integer | 已处理视频数 |

* URL 为空(200)

```javascript
{
    "code": 4004,
    "msg": {
        "en": "YouTube URL is required",
        "zh": "YouTube URL 不能为空"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4004 | integer | 错误码 |

* URL 格式不合法(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "Invalid YouTube URL",
        "zh": "无效的 YouTube URL"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4001 | integer | 错误码 |

* URL 已提交过(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "This URL has already been submitted",
        "zh": "该链接已提交过"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 4001 | integer | 错误码 |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |
| Content-Type | application/json | string | 是 | 内容类型 |

**Query**

## 删除订阅源（管理员）

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 16:39:39

> 更新时间: 2026-04-09 17:01:49

**管理员删除指定订阅源。删除后该订阅源下关联的播客数据不会级联删除（podcasts.source_id 置为 NULL）。ID 格式为 dtc-xxxxxxxx。需要管理员权限（role=1）。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/sources/dtc-b50wi1xO

**请求方式**

> DELETE

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Source deleted",
		"zh": "订阅源已删除"
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |

* 不存在(200)

```javascript
{
    "code": 4003,
    "msg": {
        "en": "Source not found",
        "zh": "订阅源不存在"
    }
}
```

* 无权限(200)

```javascript
{
    "code": 4006,
    "msg": {
        "en": "Permission denied",
        "zh": "权限不足"
    }
}
```

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |

**Query**

## 订阅源列表

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 14:13:20

> 更新时间: 2026-04-09 14:13:20

**获取已添加的 YouTube 订阅源列表及处理进度。无需认证。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/sources

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| page | 1 | integer | 是 | 页码 |
| limit | 10 | integer | 是 | 每页条数 |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Sources fetched successfully",
        "zh": "订阅源列表获取成功"
    },
    "data": {
        "list": [
            {
                "id": "dtc-ef56gh78",
                "url": "https://www.youtube.com/@3Blue1Brown",
                "type": "channel",
                "status": "processing",
                "total_videos": 120,
                "processed_videos": 45,
                "created_at": "2026-04-09T06:00:00.000Z"
            }
        ],
        "total": 3
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.list | - | array | 订阅源数组 |
| data.list[].type | channel | string | 类型：channel 或 video |
| data.list[].status | processing | string | 处理状态：pending\|processing\|completed\|failed |
| data.list[].total_videos | 120 | integer | 该频道总视频数 |
| data.list[].processed_videos | 45 | integer | 已处理完成的视频数 |
| data.total | 3 | integer | 订阅源总数 |

**Query**

## 播客翻译版本

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-09 15:44:41

> 更新时间: 2026-04-10 11:53:45

**获取指定播客的翻译版本（title + description + body）。body 由原始字幕文本拼接而成。仅返回已完成翻译的记录，未翻译或不存在时返回 4003。无需认证。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/translated?entry_id=dtc-Wvf2J1fG&language=zh

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| entry_id | dtc-Wvf2J1fG | string | 是 | 播客 ID，格式 dtc-xxxxxxxx |
| language | zh | string | 是 | 目标语言，支持 zh / en |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Podcast translation fetched successfully",
        "zh": "播客翻译版本获取成功"
    },
    "data": {
        "entry_id": "dtc-WKGtBBtg",
        "language": "zh",
        "title": "什么是神经网络？",
        "description": "本视频深入浅出地介绍了神经网络的基本概念...",
        "body": "考虑这条曲线。\n\n我要谈论的是...\n\n深度学习的核心思想...",
        "thumbnail": "https://i.ytimg.com/vi/HEfHFsfGXjs/maxresdefault.jpg",
        "channel_name": "3Blue1Brown",
        "duration": 1082,
        "youtube_url": "https://www.youtube.com/watch?v=HEfHFsfGXjs",
        "published_at": "2024-01-15T08:00:00Z"
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.entry_id | dtc-WKGtBBtg | string | 播客 ID |
| data.language | zh | string | 翻译语言 |
| data.title | 什么是神经网络？ | string | 翻译后的标题 |
| data.description | 本视频深入浅出地介绍了神经网络的基本概念... | string | 翻译后的描述 |
| data.body | - | string | 翻译后的正文（字幕逐段拼接，\n\n 分隔） |
| data.thumbnail | - | string | 视频封面图 |
| data.channel_name | 3Blue1Brown | string | 频道名称 |
| data.duration | 1082 | integer | 视频时长（秒） |
| data.youtube_url | - | string | YouTube 视频原链接 |
| data.published_at | 2024-01-15T08:00:00Z | string | 发布时间 |

* 未翻译 / 不存在(200)

```javascript
{
    "code": 4003,
    "msg": {
        "en": "Podcast not found",
        "zh": "播客不存在"
    }
}
```

* 语言参数无效(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "Invalid content language",
        "zh": "不支持的语言"
    }
}
```

* 缺少参数(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "Invalid params",
        "zh": "参数错误"
    }
}
```

**Query**

## 播客推荐

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-10 11:53:57

> 更新时间: 2026-04-10 12:02:11

**根据指定播客获取推荐列表。优先推荐同频道其他播客（按发布时间倒序），不足时用播放量最高的其他频道播客补齐。仅返回 status=completed 且 is_translated=TRUE 的播客。无需认证。缓存 300 秒。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/recommend?entry_id=dtc-Wvf2J1fG&limit=5

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| entry_id | dtc-Wvf2J1fG | string | 是 | 当前播客 ID，格式 dtc-xxxxxxxx |
| limit | 5 | integer | 是 | 推荐数量，默认 5，最大 20 |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
    "code": 2000,
    "msg": {
        "en": "Podcast recommendations fetched",
        "zh": "播客推荐获取成功"
    },
    "data": {
        "entry_id": "dtc-ab12cd34",
        "list": [
            {
                "id": "dtc-ef56gh78",
                "youtube_url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "embed_url": "https://www.youtube.com/embed/aircAruvnKk",
                "title": "But what is a Fourier series?",
                "description": "From heat diffusion to circle animations...",
                "channel_name": "3Blue1Brown",
                "channel_url": "https://www.youtube.com/@3Blue1Brown",
                "channel_avatar": "https://yt3.ggpht.com/ytc/xxx",
                "thumbnail": "https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg",
                "duration": 1680,
                "view_count": 8000000,
                "published_at": "2023-06-10T08:00:00Z",
                "status": "completed"
            }
        ]
    }
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.entry_id | dtc-ab12cd34 | string | 请求的播客 ID |
| data.list | - | array | 推荐播客列表 |
| data.list[].id | dtc-ef56gh78 | string | 播客 ID |
| data.list[].embed_url | - | string | YouTube 嵌入播放链接 |
| data.list[].title | - | string | 标题 |
| data.list[].channel_name | 3Blue1Brown | string | 频道名称 |
| data.list[].duration | 1680 | integer | 时长（秒） |
| data.list[].view_count | 8000000 | integer | 播放量 |
| data.list[].thumbnail | - | string | 封面图 |

* 缺少参数(200)

```javascript
{
    "code": 4001,
    "msg": {
        "en": "Invalid params",
        "zh": "参数错误"
    }
}
```

**Query**

## 所有播客列表（管理员）

> 创建人: Danny B.

> 更新人: Danny B.

> 创建时间: 2026-04-10 12:08:01

> 更新时间: 2026-04-10 12:10:56

**管理员查看所有播客，不过滤 is_translated 状态，支持按状态和关键词筛选。每页最多返回 50 条，按创建时间倒序。需要管理员权限（role=1）。**

**接口状态**

> 开发中

**接口URL**

> /api/v1/podcasts/admin/list

**请求方式**

> GET

**Content-Type**

> none

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| page | 1 | integer | 是 | 页码 |
| limit | 10 | integer | 是 | 每页条数，最大 50 |
| keyword | 3Blue1Brown | string | 是 | 搜索 title 或 channel_name，可选 |
| status | completed | string | 是 | 按状态筛选：pending / processing / completed / failed，不传返回全部 |

**认证方式**

> 继承父级

**响应示例**

* 成功响应(200)

```javascript
{
	"code": 2000,
	"msg": {
		"en": "Podcasts fetched successfully",
		"zh": "播客列表获取成功"
	},
	"data": {
		"list": [
			{
				"id": "dtc-Wvf2J1fG",
				"youtube_url": "https://www.youtube.com/watch?v=j0wJBEZdwLs",
				"embed_url": "https://www.youtube.com/embed/j0wJBEZdwLs",
				"title": "But what is a Laplace Transform?",
				"description": "Visualizing the most important tool for differential equations.\nPrevious chapter: https://youtu.be/-j8PzkZ70Lg\nInstead of sponsored ad reads, these lessons are funded directly by viewers: https://3b1b.co/support\nAn equally valuable form of support is to simply share the videos.\nHome page: https://www.3blue1brown.com\n\nPi creature car artwork by Kurt Bruns\n\nEngine animation borrowed with permission from this (excellent) blog: https://ciechanow.ski/internal-combustion-engine/\n\nTimestamps:\n0:00 - Understanding the engine\n1:16 - Key background ideas\n5:41 - Definition and intuition\n10:43 - Complex integration\n20:43 - Analytic continuation\n23:52 - The transform of exponentials\n26:15 - A deep look at cos(t)\n32:59 - What’s coming next\n\n\n------------------\n\nThese animations are largely made using a custom Python library, manim.  See the FAQ comments here:\nhttps://3b1b.co/faq#manim\n\nMusic by Vincent Rubinetti.\nhttps://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown\nhttps://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u\n\n------------------\n\n3blue1brown is a channel about animating math, in all senses of the word animate. If you're reading the bottom of a video description, I'm guessing you're more interested than the average viewer in lessons here. It would mean a lot to me if you chose to stay up to date on new ones, either by subscribing here on YouTube or otherwise following on whichever platform below you check most regularly.\n\nMailing list: https://3blue1brown.substack.com\nTwitter: https://twitter.com/3blue1brown\nBluesky: https://bsky.app/profile/3blue1brown.com\nInstagram: https://www.instagram.com/3blue1brown\nReddit: https://www.reddit.com/r/3blue1brown\nFacebook: https://www.facebook.com/3blue1brown\nPatreon: https://patreon.com/3blue1brown\nWebsite: https://www.3blue1brown.com",
				"channel_name": "3Blue1Brown",
				"channel_url": "https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw",
				"channel_avatar": "https://i.ytimg.com/vi_webp/j0wJBEZdwLs/maxresdefault.webp",
				"thumbnail": "https://i.ytimg.com/vi/j0wJBEZdwLs/maxresdefault.jpg",
				"duration": 2080,
				"view_count": "1441565",
				"published_at": "2026-04-09T09:52:45.001Z",
				"content": "What you're looking at, a somewhat complicated diagram that you and I are\n\ngoing to build up in this video, is a visualization unpacking the meaning\n\nbehind one of the most powerful tools used to study differential equations.\n\nIt's known as the Laplace transform.\n\nThis is one of those tools where, as a student,\n\nyou can learn how to use it to solve equations,\n\nand yet be left completely in the dark about what it's actually doing.\n\nThink about learning how to drive a car versus\n\nlearning how an internal combustion engine works.\n\nBoth are worthy pursuits, one is not necessarily better than the other,\n\nand in fact driving is probably more practical.\n\nBut there is something deeply satisfying about popping\n\nopen the hood and understanding the mechanism inside.\n\nSimilarly, our main goal with this video is to pop the hood and show\n\nyou some of the beautiful math that awaits us inside this object.\n\nAnd strictly speaking, a lot of what I want to show is\n\nnot necessary if your only goal is to solve equations.\n\nThat said, for the differential equation students among you,\n\nI think the content here should make the stuff you have to memorize a lot more\n\nmemorable, and after dissecting this machine, studying it piece by piece,\n\nyou and I will take everything for a test drive and see what it looks like to solve a\n\nconcrete and very interesting differential equation.\n\nNow before I just plop down the definition on the screen,\n\nlet's talk about what problem the Laplace transform is trying to solve.\n\nWe set up a lot of this in the previous chapter,\n\nand there are two primary ideas worth restating here.\n\nNumber one, you need to understand exponential functions,\n\nand I'm always going to be writing these as e^(st)\n\nt represents time, and then s is a number.\n\nIt determines what specific exponential we're talking about,\n\nbut very importantly for this topic, we're going to give s the freedom to take on\n\ncomplex number values.\n\nWe covered this much more thoroughly in the previous chapter,\n\nbut the quick summary is that if s has an imaginary part,\n\nthe output of your function rotates in the complex plane as time ticks forward.\n\nWhen the real part of s is negative, the magnitude is decaying towards zero over time,\n\nbut if it happens to be positive, that would mean the magnitude grows,\n\nnamely growing exponentially.\n\nIf any of that feels shaky or if you want to understand why it's true,\n\ndo watch the previous chapter, but from this point forward,\n\nI'm assuming everybody is comfortable with this notion.\n\nWhy do we care, though?\n\nWhy the hubbub about these functions?\n\nWell, it's because of the second thing you need to know,\n\nwhich is that a lot of functions, especially those arising in physics,\n\ncan be expressed as combinations of exponential pieces.\n\nThere's one very friendly example that's going to be helpful to\n\nreturn to repeatedly throughout this lesson, the cosine of t.\n\nThis undulating function can be broken up as a sum of two purely imaginary exponentials.\n\nBasically, if you take e^(it), that gives you rotation counterclockwise,\n\nand e^(-it) rotates the other way, so when you add these two together,\n\nperhaps imagining adding two rotating vectors tip to tail,\n\nthe imaginary parts cancel each other out, and what you're left with is\n\nsomething whose output remains locked to the real number line,\n\noscillating back and forth.\n\nNow as it stands, this sum goes between negative two and positive two,\n\nbut a cosine only goes between negative one and one,\n\nso finally you multiply everything by one half.\n\nMore complicated functions might break down into more exponential pieces.\n\nFor example, later in this lesson, you and I are going to dig into something\n\ncalled the driven harmonic oscillator, which is basically a mass on a spring\n\nthat's influenced by some external force, in our case, one that oscillates over time.\n\nAs a spoiler, the solution to the equation describing that\n\nends up looking like a sum of four exponential pieces.\n\nTwo of those pieces oscillate and decay in a way that matches\n\nthe natural resonant frequency of the spring,\n\nand then the other two oscillate in a way that matches the external force.\n\nSo for cases like this and many others, what we would like is some sort of tool,\n\nsome sort of mathematical machine where you can pump in a function,\n\nor even a differential equation describing that function,\n\nand that machine will somehow reveal for us what specific exponential pieces\n\nthat function breaks down into.\n\nThat is, it exposes what these values s in the exponent all are,\n\nas well as what the corresponding coefficients are.\n\nNow you might be wondering why exponential pieces, why not focus on something else.\n\nThe short answer is that for these functions, when you take a derivative,\n\nit looks precisely the same as multiplying by some number, namely s.\n\nWhat you'll see by the end is how this means that same machine that lets us dissect\n\nfunctions into exponential pieces also allows us to turn differential equations into\n\nalgebra, essentially because everywhere you see a derivative,\n\nit turns into multiplication by s.\n\nNow in a context like this one where we are so focused on complex-valued exponentials,\n\nengineers have a special name for this complex plane that I'm depicting on the left,\n\nrepresenting all possible values for that term s in the exponent.\n\nThey call it, well, the s-plane.\n\nA helpful mental image is to think of each individual point on\n\nthe s-plane as encoding the entire exponential function e^(st).\n\nFor this picture, the graphs I'm showing only depict the real component of the output,\n\nbut keep in mind, each point is representing the full complex-valued function.\n\nThese graphs are enough for intuition though.\n\nYou'll notice how bigger imaginary parts correspond to faster oscillation,\n\nand then as your eyes scan from left to right,\n\nthe real part reflects either decay or growth.\n\nSo with this as our goal, the machine that you and I are going to build up today,\n\nthe one that exposes how a function breaks into exponential pieces,\n\nis, as you have no doubt guessed, the Laplace transform.\n\nNow this word transform is a little funny, basically in the same way\n\nthat a function is something that takes in a number and spits out a new number,\n\nwe often use the word transform in math for a more meta operation that\n\ntakes in an entire function and spits out a new function.\n\nIn the case of the Laplace transform, a typical convention is to name our new function\n\nwith a capitalized version of whatever you use to name that original function.\n\nAnd in this setting, where our original function takes in time as an input,\n\nthe new transformed function has a new different kind of input, a complex value, s.\n\nI think it's helpful to quickly preview what this new function actually\n\ndoes before we pull up the definition and start dissecting it.\n\nSuppose your original function, f(t), really can be\n\nbroken down as a sum of several exponential pieces.\n\nWhen you apply this Laplace transform, giving you a new function of this new variable s,\n\nif you were to plot this new function over the s plane,\n\nin a way that I will explain in just a minute,\n\nwhat you see are these sharp spikes above each value of s that corresponds\n\nto one of those exponential pieces.\n\nThese spikes have a fancy name, they are called the poles of your function.\n\nSo even if you didn't know ahead of time how your function could be broken down as a\n\nsum of exponentials, if you understand this transformed version,\n\nand specifically if you understand the poles,\n\nthat can reveal for you what those exponential pieces are.\n\nAt this point you're probably itching to see how this thing is actually defined,\n\nand in its full glory this is what that definition looks like,\n\nwhich we can think of as two separate steps.\n\nFirst, you multiply your function by the expression e^(-st), and then second,\n\nyou integrate that result over time from t equals zero to infinity.\n\nWe'll talk all about that integral and its nuances in just a minute,\n\nbut for the moment focus on that inner expression.\n\nThis term s is the newly introduced parameter,\n\nthe one that is the input of our new transformed function.\n\nAs I said, it's a complex number.\n\nEvery time you see the letter s in this video, it's a complex number.\n\nAnd the way I like to think about it is that you might imagine freely moving\n\naround this value s on the s-plane, and it's kind of sniffing around to find\n\nwhich specific exponential functions line up closely with our function f(t).\n\nFor example, let's suppose our function is the cosine of t,\n\nwhich as we discussed just a minute ago, we already know can\n\nbe broken down as a sum of two exponentials, e^(it) and e^(-it)\n\nI've already previewed the idea that when you plot the final result you should\n\nsee these spikes over the key values of s, which in this example would mean poles\n\nabove plus i and negative i, and you can already get a little intuition by taking\n\nthis example and substituting in the expanded expression for the cosine of t.\n\nLooking at this expansion, I want you to take a\n\nmoment to think about the product of these two terms.\n\nWhen you multiply two exponentials, the contents of those exponents add together,\n\nso what you're left with is e raised to the i minus s times t.\n\nLet me go ahead and plot that value on the lower right,\n\nkeeping the s plane on the upper right. Just like the exponentials we've already seen,\n\nas time goes from zero to infinity, this oscillates and decays, or maybe it grows.\n\nThe specific shape depends on how we set that value s.\n\nNow in this case, as you move around that value s,\n\nthere is one specific value causing uniquely boring behavior.\n\nIf you set s equal to i, then that term in the exponent becomes zero,\n\nso the entire function just looks like e^0, which is stuck at the constant one.\n\nAnd this is a key idea for almost all values of s.\n\nAn exponential like this is going to change with time,\n\ntypically looking like some kind of spiral, but at the special value\n\nthat we're hunting for, in this case, s equals i, instead things get stuck at a constant.\n\nSo, stepping back, if you were a mathematician and you're trying to invent some\n\nkind of machine that will detect the exponential pieces lurking inside a function,\n\nfor example, detecting that a cosine has an e^(it) and an e^(-it) lurking inside it,\n\nyou might ask yourself, is there something I can do that can detect when one\n\nof the terms in a sum like this is secretly just a constant?\n\nIn essence, this is the role played by the integral that is wrapping everything\n\nup in the full definition, integrating as time goes from zero to infinity.\n\nAnd on the one hand, if you're comfortable with calculus,\n\nyou might be able to anticipate why this would result in some kind of sharp spike\n\nover the desired values of s.\n\nIf you integrate a constant from zero all the way up to infinity, it blows up.\n\nBut there's actually a fair bit of nuance here.\n\nTo start, that function inside the integral takes on complex number values.\n\nAnd this raises a natural question for those of us\n\ncurious to interpret things in a satisfying way.\n\nHow do you think about integrating a complex valued function?\n\nIf you're up for it, what I'd like to do with the next 10 minutes or so\n\nis really dig in and dissect what an integral like this really means,\n\nhow to visualize it, and to explain why the plots that I'm showing\n\nrepresent something slightly distinct from the literal meaning of this integral.\n\nAs with any new piece of math, it's best to start easy and work our way up in complexity.\n\nSo to kick things off, let's just ignore this function f(t)\n\nitself and only focus on integrating the e^(-st) part.\n\nAnd to warm up, before jumping into the complexity of it all,\n\nlet's just suppose that s is a real number, meaning this is a friendly,\n\nreal valued function that we can plot with a graph like normal.\n\nTypically, when you first learn calculus, you learn to interpret\n\nan integral as telling you the area under a graph like this.\n\nFor example, if you set the value s equal to 1,\n\nand you go through the procedure for actually calculating this integral, you know,\n\nyou take an antiderivative, you take the difference at the two different bounds,\n\nbecause there's an infinity, you could say you take the limiting value at that bound,\n\nthe way it all works out is that this expression equals 1.\n\nAnd you can interpret that as telling you that the area under this graph is 1,\n\nwhich is kind of fun.\n\nI guess that means that all the area under this infinite tail\n\nis exactly enough to fill in the rest of this unit square.\n\nAnd then if we reintroduce that value s and set it equal to something that's not 1,\n\nthe effect is to squish the graph in the horizontal direction.\n\nThat's always the effect if you multiply the input of a function by some constant.\n\nAnd so the area under this graph, which started out as 1, must now be 1 divided by s.\n\nThe key thing I want you to remember here is how if we let s get smaller and\n\nsmaller and approach the value at 0, then that area gets bigger and bigger and bigger,\n\nactually approaching infinity, and approaching it quite quickly too.\n\nBut graphs are not the only way to visualize functions,\n\nand area is not the only way to understand integrals,\n\nand you should get in the habit of flexing your mind a little bit more.\n\nLet me show you another way to think about this that will generalize\n\nmore easily once we let that function take on complex number values.\n\nThink about this integral just between 0 and 1, something with a unit length.\n\nAnd I want you to imagine all this area under the graph as a pool of water,\n\nwhich you let kind of slosh down until it becomes level.\n\nThe height of this pool is telling you the average value of that function between 0 and 1.\n\nAnd then because the width of this pool is just 1,\n\nthen its area is the same thing as its height.\n\nSo this integral up top, when it's over a unit interval,\n\nis telling you the average value of the function on that interval.\n\nSimilarly, the integral from 1 to 2 would be telling you the\n\naverage value the function takes over that interval from 1 to 2.\n\nAnd then same deal as you keep integrating along a bunch of other unit intervals.\n\nSo then, if you want the integral from 0 out to infinity,\n\nwhat you can think about is taking all of these average values on those intervals\n\nand adding them all together.\n\nThis is something we can work with.\n\nNow let's look at the complex case.\n\nS is going to be some complex number, and then the function e^(-st) cycles\n\nand decays around the complex plane as you let time go from 0 up to infinity.\n\nThe specific way that it cycles and decays or grows depends on that value of s,\n\nand we'll get a distinct path through the complex plane for each one.\n\nNow if you want to integrate this function on a unit interval,\n\nlet's say from the values t equals 0 to t equals 1,\n\nimagine taking a sample of all of the outputs in this range and then finding the\n\naverage, the center of mass for all those points.\n\nThat average value is the meaning of this integral,\n\nwhich I will represent with a little arrow.\n\nActually, it'll be helpful if we put this integral in its own complex plane\n\ndown in the lower right, because we're about to start adding them all up.\n\nIf you let t range from 1 up to 2 and you do the same thing,\n\ntake the average value on that interval, represent it with an arrow,\n\nand then you add that arrow to what we have on the lower right,\n\nthe resulting sum is basically telling you the integral from 0 all the way up to 2.\n\nAnd then we repeat.\n\nYou take an average between 2 and 3, add that, average between 3 and 4,\n\nadd that, and just keep going on and on and on and on.\n\nAnd the limiting point for this spiraling sum that you see is the value of the integral\n\nfrom 0 to infinity of e^(-st), exactly the expression we're trying to understand.\n\nAnd as we move around that input s, the resulting value of\n\nthis spiraling sum might wander around the complex plane.\n\nAs a quick sanity check, let me move that value of s over to the input 1.\n\nSo there's no oscillation because there's no imaginary part,\n\nand you'll notice that all these little arrows stack up to end up on the number 1.\n\nAnd this should make sense.\n\nBack when we were interpreting the integral the more familiar way as an area\n\nunder a curve, we saw that this value, when s equals 1, works out to be 1.\n\nAnd just as before, if I let s approach 0, getting smaller and smaller,\n\nthen the resulting integral gets bigger and bigger, rapidly approaching infinity.\n\nIn this new diagram, we can see how if s moves away from 0 in a different direction,\n\nmoving vertically, the resulting integral also gets smaller,\n\nbut for a much different reason.\n\nAll the oscillation in the function gives us more cancellation in that vector sum,\n\nso the output gets closer to 0.\n\nNext what I want to do is plot this value.\n\nSo look at that point where our spiraling sum converges to.\n\nI want you to think of it as a little vector in the complex plane,\n\nsomething that has a magnitude and a direction.\n\nAnd to get a little fancy, let's take that magnitude,\n\nand we're going to plot it above the value s in the s-plane.\n\nSo as I change that value s, and it changes the resulting integral,\n\nthe magnitude of our output might grow or shrink, and as it does so,\n\nwe will plot the result over the s-plane.\n\nAnd I'm just going to leave this on autopilot for a moment,\n\nwhere s is going to wander around the plane.\n\nAnd as it does so, take a moment to think about why we're getting the shapes that we see.\n\nBasically, the bigger the imaginary part of s,\n\nthe more spiraling there is in the expression, meaning more cancellation,\n\nso the magnitude of that output is smaller.\n\nHere's what it looks like if I graph the full plot over many possible values of s.\n\nThe most obvious feature is how if s gets closer and closer to 0,\n\nthen the magnitude of that output gets bigger and bigger, which makes sense.\n\nThe small real part means it has slower decay,\n\nand the small imaginary part means there's less cancellation.\n\nNow, as it stands, I'm only graphing the magnitude of that output,\n\nbut of course it has more information than that, it has a direction too,\n\nso if we associate every possible direction of that output with a unique color,\n\nthen one thing I could do is color the graph,\n\ngiving us a richer sense of what that output looks like.\n\nThe other thing you've probably already noticed about this plot is that it is\n\nconspicuously not being drawn over values of s where the real part is negative.\n\nAnd think about what those values actually mean.\n\nWhen the real part of s is negative, then the function e^(-st) grows exponentially,\n\nand this spiraling sum for the integral we have blows up, it does not converge.\n\nSo these values are not defined, at least for the moment they're not defined.\n\nThere's a fancy notion we'll get to shortly.\n\nOn the boundary, things get kind of interesting.\n\nIf s is purely imaginary, the value e^(-st) simply goes around in a circle,\n\npurely rotating, neither growing nor decaying.\n\nAnd as we play this game of averaging along various intervals and adding them together,\n\nthat vector sum we get in the lower right simply spirals around and around ad nauseam.\n\nNow on the one hand, this also does not converge,\n\nthere is not a specific value that this approaches.\n\nHowever, it's not too hard to make sense out of it.\n\nIf you let the value of s get even just a little bit of a real component,\n\nthen our function does decay, and our spiraling sum does approach a clear concrete value.\n\nAnd then if you slowly take away that real part of s,\n\nletting it approach the imaginary number line,\n\nthen that resulting integral on the lower right unambiguously approaches one clear value.\n\nAnd you can see that on the plot too, there's clearly some value that it wants to take on.\n\nAnd in fact, I can tell you precisely what value it wants to converge to.\n\nThink back to the real valued case where we saw\n\nthat the integral is equal to 1 divided by s.\n\nThis is a purely analytic fact that remains true even when s is a complex number.\n\nMaybe that's what you'd expect, but it's not at all obvious that\n\nthis should remain true in the more rich case of complex numbers.\n\nTo gut check for at least one example, we were just looking very\n\nclosely at what happens while s approaches the imaginary constant i.\n\nAnd if you focus on what's happening in the lower right,\n\nyou'll see that the integral is approaching negative i.\n\nAnd indeed, 1 divided by i is negative i.\n\nSo we have this nice and blessedly simple equation describing our integral,\n\nbut the funny thing about it is that this right hand side,\n\n1 divided by s, is defined everywhere on the plane.\n\nI can plot the result, this is what it looks like.\n\nNow maybe you raise an eyebrow for s equals 0,\n\nbut almost everywhere this has an unambiguous value.\n\nNow to be clear, the integral itself emphatically does not converge on the left half\n\nof the plane, so in that region the equation, strictly speaking, makes no sense.\n\nAs an example, think about setting s equal to negative 1.\n\nOn the right hand side, 1 divided by negative 1 is negative 1,\n\nbut I think you'll agree that integrating e^t from 0 to infinity sure does not\n\nlook like negative 1.\n\nHowever, this brings us to a fascinating aspect of complex valued functions,\n\nwhich is completely different from the world of real valued functions.\n\nIt's something known as analytic continuation.\n\nIt's a sense in which these nonsensical values beyond the domain of convergence can\n\nnevertheless reflect useful meaning about the expression where it really does converge.\n\nAlthough what follows is very firmly in the territory of more than you\n\nneed to know to drive the car, it is a beautiful piece of math and it's\n\nthe final puzzle piece to explain the plots that I'm drawing for you.\n\nHere's the idea.\n\nSuppose you have some function and it's defined only over a limited domain.\n\nIf this was a real valued function and you wanted to extend the definition to include\n\na bigger domain, you basically have infinitely many choices for how to do this.\n\nEven if you add some constraint, say your function is smooth in the\n\nsense that it has a derivative everywhere and you want your extension to also be smooth,\n\nthen you still have an infinity of choices.\n\nIt's kind of like a floppy bit of spaghetti.\n\nComplex valued functions though turn out to be much more constrained.\n\nIf you have one defined only over a limited domain,\n\nsomething like our integral that converges only over half the plane,\n\nand if that function is nice in the sense of having a well-defined derivative,\n\nand then if you want to extend the function in a way that keeps it nice,\n\nagain in the sense of having a derivative, then there's a nice little theorem\n\ntelling us that one of two things happens.\n\nEither there is no way to extend it, or if there is a way, that way is unique.\n\nThat's very surprising.\n\nYou might think you have infinite choices, but you don't.\n\nWhen this extension does exist, it has a fancy name.\n\nWe call it the analytic continuation of the original function.\n\nAnd a very powerful theme throughout math is that you can sometimes discover\n\nhidden information about a function by understanding its full extended version,\n\nespecially understanding the poles in that full extended version.\n\nOver here in our context of studying Laplace transforms,\n\nthe relevance is that the actual integral defining this transform\n\ntypically only converges for half the plane when the real part of s is sufficiently big.\n\nHowever, it can be very helpful to plot and to understand the\n\nfull extended version exposing all the poles of the function.\n\nAs I alluded to earlier, the poles are what exposes\n\nthe exponential pieces that we're hunting for.\n\nLooking back at this warm-up example that we've been focusing on,\n\nthe integral of e^(-st), as I said, that only converges when the real part of\n\ns is positive.\n\nAnd on that half plane, it equals 1 divided by s.\n\n1 divided by s is defined everywhere, and it is nice in the sense of having a derivative.\n\nSo we say this is the analytic continuation of our integral.\n\nThis function is the purest example of a pole.\n\nYou say it has a pole above s=0, and a slightly less hand-wavy definition of what\n\nI mean by this is that it looks approximately like dividing by 0 around that point.\n\nIt's not hard to see where the name comes from.\n\nThe plot looks kind of like a circus tent with a pole above that point.\n\nWonderful.\n\nThis is actually a very useful result.\n\nThis integral that we have now spent so much time on is effectively the Laplace\n\ntransform of one of the simplest possible functions, the constant function at 1.\n\nThat constant function transforms into 1 divided by s,\n\nwhich you should see in your mind's eye as a pole above s=0.\n\nThat might seem like a simple example, but almost for free,\n\nwe can squeeze out a much more general result,\n\nwhich is that the transform of any exponential function also looks like a simple pole.\n\nIt's just going to be above some other value on the s-plane.\n\nHere, let's take a moment to actually think it through.\n\nWhat would happen if I asked you to pump in a function like, I don't know, e^(1.5 * t)?\n\nWell, then the expression inside that integral combines,\n\nand you get e^{(1.5 - s)t}, which is nearly identical to\n\neverything we were just looking at, it's just things are shifted by 1.5.\n\nIf you wanted, I could pull up that same visual,\n\nwhich dissects and interprets the integral, pictured on the lower right, and again,\n\nthe function inside the integral is pictured on the upper right,\n\nand we're playing the same game of adding up averages.\n\nBut nothing in this diagram has substantively changed,\n\nit's essentially the same thing we were just looking at,\n\nthe only difference is that now, that special value where explosion happens and\n\nwe see a pole, is at s = 1.5 instead of s = 0.\n\nSymbolically, a little bit of rearrangement shows that this key\n\nintegral is almost identical to the one we were just studying,\n\nthe only difference is that s has been replaced by s - 1.5.\n\nSo the new result that we can write down in circle,\n\nis that the transform of our exponential function looks like 1 divided by s - 1.5.\n\nAnd of course, there's nothing special about 1.5, I can replace this with any constant a.\n\nAnd if there is only one fact that you remember from this video, let it be this one.\n\nThe Laplace transform of an exponential function, e^(at),\n\nis a new function of s that has a simple pole over s = a.\n\nThis is that key idea I alluded to earlier, poles in the\n\ntransformed function expose exponential pieces of the original.\n\nThe final step to fleshing out that idea, is to\n\nconvince ourselves that this works for combinations.\n\nAs an example, let's pull back in our good friend the cosine of t.\n\nAnd here we have two options for how to study this,\n\nwe can think it through symbolically, and then after, for fun,\n\nlet's plug it into that same visual machine and see what it looks like.\n\nAlright, so symbolically, as we discussed earlier,\n\na cosine can be broken up as 0.5 e^(it) + 0.5 e^(-it).\n\nWhat you can do next from here is break this outer expression into two different pieces.\n\nOne that looks like half times the transform of e^(it),\n\nand another which looks like half times the transform of e^(-it).\n\nIn the lingo, the way that you would phrase this is that the Laplace transform is linear,\n\nmeaning if you have a scaled sum of some stuff on the inside,\n\nyou can break everything apart to the same scaled sum of the transforms of those\n\ninner parts.\n\nIn our case, because we just saw how to take the transform of simple exponential\n\nfunctions, this whole expression here can be collapsed to look like 1 divided by s - i.\n\nA thing with a simple pole at i.\n\nAnd then this whole expression can collapse to become 1 over s + i,\n\na thing with a pole at negative i.\n\nSo when you read this whole expression, the sum of two fractions,\n\nthe image that should pop into your head is a plot with two different spikes above\n\ni and negative i.\n\nAnd in fact, if we have a little fun and we try plugging the expression cosine of t,\n\ne^(-st), into that big complex integrating machine that we built up,\n\nyou do indeed see a plot that has poles above i and negative i.\n\nThis time, the diagram is notably more complicated, and if I'm honest with you,\n\nthe symbolic reasoning is probably the easier way to understand the final answer.\n\nBut you and I are here to have a little fun, aren't we?\n\nDelving into each piston and valve of the machine that we're working with.\n\nSo let's see if we can take a minute or two to try\n\nto make sense out of what exactly we're looking at.\n\nOnce again, on the upper right, I'm showing the function inside the integral,\n\nthe cosine of t times e^(-st).\n\nBut now it's a lot more of a chaotic squiggle.\n\nTo build a little intuition, let me set s equal to a small,\n\npurely imaginary value, say 0.2 i.\n\nOn that plot in the upper right, I'll go ahead and add a vector that's just showing\n\nthe e^(st) part, which for the small imaginary value of s simply rotates very slowly.\n\nIn the full function, that term gets multiplied by cosine,\n\nso the path that it would trace out would oscillate back and forth,\n\ngiving us this nice flower petal pattern.\n\nAs before, the way we're visualizing the integral is by taking averages along various\n\nunit intervals and then adding those together, like a big tip-to-tail vector sum.\n\nIn this case, the diagram of adding those vectors is actually quite nice.\n\nIt looks like going around and around in a little star pattern.\n\nAnd strictly speaking, this does not converge.\n\nWhat's being plotted up on the left is the analytic continuation.\n\nIf you wanted this to converge, you can add even just a little bit of a real\n\ncomponent to that value s, meaning that the function decays a bit as time\n\ngoes out to infinity, and even a little bit of decay will be enough to cause this sum,\n\ndown on the lower right, to converge to a clear, unambiguous value.\n\nNow notice what happens as I increase the imaginary part,\n\nand the frequency of our exponential gets closer to the frequency of the cosine.\n\nWhat you get is more and more alignment, resulting in a bigger total integral.\n\nIn fact, when that imaginary part is 1, meaning the oscillation of the\n\nexponential exactly lines up with the oscillation of the cosine,\n\nthen the path that it traces out remains entirely confined to the right side\n\nof the plane, and the result is that the integral kind of gets jettisoned\n\nout to the right.\n\nFrom there, if I were to decrease the real part of s, meaning less and less decay,\n\nthen the integral gets closer and closer to infinity,\n\nhence why we see a pole above that value.\n\nAnd by the way, stepping back, for any of you who happened to watch the\n\nvideo I did many years ago about the Fourier transform,\n\nif all of this looks strikingly familiar, it's because it's basically the same thing.\n\nWhen s is a purely imaginary number, the Laplace\n\ntransform is nearly identical to the Fourier transform.\n\nIt's not quite the same expression, the lower bound on our integral is zero,\n\nnot negative infinity, and there's varying conventions about the\n\nconstants in that exponent, but the essence is really the same.\n\nNow this relationship between Fourier transforms and Laplace transforms will play\n\na much bigger role in our story in a following chapter,\n\nbut right here I wanted to quickly highlight how, in a sense,\n\nthis Laplace transform is a generalization.\n\nWhat it does is probe at how well a function lines up,\n\nnot just with purely imaginary exponentials, but with any exponential.\n\nNow, looking back at our symbolic result for the Laplace transform of the cosine of t,\n\nif you were to go and look this up, say in a big table of Laplace transforms,\n\nthis is actually not how it would look.\n\nFirst of all, it's common and useful to consider a more general cosine\n\nwave that has an arbitrary angular frequency omega on the inside.\n\nThe only change here is that everywhere you see an i, you replace it with omega times i.\n\nSo you can read that final expression as telling\n\nyou there are poles at omega i and negative omega i.\n\nBut even still, this is not what you would see in a table.\n\nLet me go ahead and just run some algebra on autopilot\n\nhere that's going to combine those two terms.\n\nAnd when all the dust settles, what you end up\n\nwith is s divided by s squared plus omega squared.\n\nNow this is the expression you would actually see.\n\nAnd in fact, the reason I bring it up is I want to talk about how\n\nthe entire logic of this example could flow the other way around.\n\nImagine you did not already know ahead of time that a cosine can be broken up as\n\na sum of two exponentials, but you were very savvy with integration by parts.\n\nI won't walk through details here, but you can directly calculate this equality here,\n\nessentially directly computing the definition for the transform.\n\nFrom there, you could use a process that is fancifully called partial fraction\n\ndecomposition to break apart this fraction into the two pieces that clearly expose the\n\npoles at omega i and negative omega i, and which also exposes those coefficients of\n\none half.\n\nThis in turn would be enough to tell you what the exponential pieces lurking inside are.\n\nThat flow of the logic is actually a lot more reflective\n\nof what it feels like to use this transform in practice.\n\nOn that note, our next step is to take this machine for a test drive\n\nand see what it looks like to solve an actual differential equation.\n\nNow my original plan was to conclude this video with a worked example,\n\nbut looking at the time and considering this is all part of a series anyway,\n\nit's probably a little better to give you the chance to stand up, stretch out,\n\nreflect on everything, and let's put that in a follow-on chapter.\n\nThe key takeaway for this video is how when a function can be broken into exponential\n\npieces, the Laplace transform exposes what those pieces are as poles above the s-plane.\n\nBut I want you to know we are not done understanding its full generality.\n\nMost functions cannot be expressed as discrete sums of exponentials like this.\n\nNevertheless, the transform offers a very powerful way to\n\nexpress many many more functions as combinations of exponentials.\n\nIt's just you combine over a continuous range, not a discrete one.\n\nTurning back to that analogy of driving a car versus learning how an engine works,\n\nthere is a third even deeper level of understanding,\n\nwhich is knowing how to build a car for yourself.\n\nIn the final chapter of this sequence, I want to show you how you could\n\nreinvent the Laplace transform from scratch, how it relates to Fourier\n\ntransforms and Fourier inversion, and how to think about it for a much\n\nbroader family of functions beyond these discrete sums of exponentials.\n\nI'll see you there.",
				"status": "completed",
				"error_message": null,
				"created_at": "2026-04-09T09:52:34.383Z",
				"updated_at": "2026-04-09T09:52:45.001Z"
			},
			{
				"id": "dtc-DvuWLKBR",
				"youtube_url": "https://www.youtube.com/watch?v=FE-hM1kRK4Y",
				"embed_url": "https://www.youtube.com/embed/FE-hM1kRK4Y",
				"title": "Why Laplace transforms are so useful",
				"description": "Studying the forced harmonic oscillator by taking a Laplace transform and studying its poles.\nInstead of sponsored ad reads, these lessons are funded directly by viewers: https://3b1b.co/support\nAn equally valuable form of support is to simply share the videos.\nHome page: https://www.3blue1brown.com\n\nChapter on the Laplace Transform:\nhttps://youtu.be/j0wJBEZdwLs\n\nChapter on the S-plane and Simple Harmonic Motion:\nhttps://youtu.be/-j8PzkZ70Lg\n\nTimestamps:\n0:00 - Opening puzzle\n1:06 - Key properties of a Laplace Transform\n3:29 - Qualitative analysis with Laplace Transforms\n4:29 - The Laplace Transforms of a Derivative\n6:06 - The forced oscillator\n11:59 - Intuition from the transformed solution\n15:15 - Inverting to find a final answer\n17:40 - Explaining the derivative property\n\n------------------\n\nThese animations are largely made using a custom Python library, manim.  See the FAQ comments here:\nhttps://3b1b.co/faq#manim\n\nMusic by Vincent Rubinetti.\nhttps://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown\nhttps://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u\n\n------------------\n\n3blue1brown is a channel about animating math, in all senses of the word animate. If you're reading the bottom of a video description, I'm guessing you're more interested than the average viewer in lessons here. It would mean a lot to me if you chose to stay up to date on new ones, either by subscribing here on YouTube or otherwise following on whichever platform below you check most regularly.\n\nMailing list: https://3blue1brown.substack.com\nTwitter: https://twitter.com/3blue1brown\nBluesky: https://bsky.app/profile/3blue1brown.com\nInstagram: https://www.instagram.com/3blue1brown\nReddit: https://www.reddit.com/r/3blue1brown\nFacebook: https://www.facebook.com/3blue1brown\nPatreon: https://patreon.com/3blue1brown\nWebsite: https://www.3blue1brown.com",
				"channel_name": "3Blue1Brown",
				"channel_url": "https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw",
				"channel_avatar": "https://i.ytimg.com/vi_webp/FE-hM1kRK4Y/maxresdefault.webp",
				"thumbnail": "https://i.ytimg.com/vi/FE-hM1kRK4Y/maxresdefault.jpg",
				"duration": 1385,
				"view_count": "682651",
				"published_at": "2026-04-09T09:52:32.192Z",
				"content": "I want to show you this simple simulation that I put together that has a mass on a\n\nspring, but it's being influenced by an external force that oscillates back and forth.\n\nNow, if there was no external force and you pull out this mass and you just let it go,\n\nthe spring has some kind of natural frequency that it wants to oscillate at.\n\nBut here, when I'm adding that external force, like a wind blowing back and forth,\n\nit oscillates at a distinct, unrelated frequency.\n\nWhat I want you to notice is how in the beginning,\n\nyou get this very irregular looking behavior.\n\nIt gets kind of stronger, and then weaker, and then stronger again,\n\nbefore eventually it settles into a rhythm.\n\nWhat specifically is going on there?\n\nHow could you mathematically analyze what exactly this weird,\n\nwibbly startup trajectory is, and could you predict how long it takes before the\n\nsystem hits its stride?\n\nAnd when it does hit that stride, could you predict\n\nexactly how big the swings back and forth are?\n\nOne of the most powerful tools for studying systems like this and many,\n\nmany others is the Laplace transform.\n\nAnd today, I want to show you exactly how it looks to use this\n\ntool to study differential equations and analyze dynamic systems.\n\nFor context, this is the third chapter in a sequence all about this Laplace transform.\n\nAnd as a very quick recap, in the first chapter,\n\nyou and I became acquainted with functions that look like e to the s times t,\n\nwhere s is a complex number, and the output of these functions kind of spirals\n\nthrough the complex plane.\n\nThe key concept you have to have in your mind is what engineers call the s-plane,\n\nwhich is the complex plane representing all possible values of this term s in the\n\nexponent.\n\nThe idea is to think of each point of the plane as encoding the entire\n\nfunction e to the s times t, and the primary takeaway is that bigger\n\nimaginary values of s correspond to functions with more oscillation,\n\nthen negative real parts reflect decay, and positive real parts reflect growth.\n\nThe reason we care is that many functions in nature can be broken down into\n\nexponential pieces, so what we want is a machine that exposes how that breakdown looks.\n\nThis is the key motivation for what Laplace transforms even are,\n\nand we unpacked that in some detail through the last chapter.\n\nAgain, in the spirit of a quick recap, the rough way this transform looks\n\nis that it takes a function of time and translates it into a new language,\n\nturning it into a new function whose input is this complex number s.\n\nThe key conclusion from last time is that if your function really can be broken into\n\nexponential pieces, then when you plot this new transformed version over the s-plane,\n\npoles in that plot correspond to the exponential pieces hiding inside the original\n\nfunction.\n\nSymbolically, this amounts to two key properties that I want you to remember.\n\nNumber one, if you pump in an exponential function, something like e to the a times t,\n\nit transforms into one divided by s minus a, an expression which you should see in\n\nyour mind's eye as a function over the s-plane with a pole above the value a.\n\nNumber two, the transform is linear.\n\nWhat this means is if you have a scaled sum of functions and then you transform them,\n\nit's the same as applying the transform to each individual function\n\nand taking that same scaled sum of the results.\n\nSo for example, if your function going in really does look like a combination\n\nof exponential terms, then what comes out looks like this sum of fractions,\n\nwhich you should read in an expression with multiple different poles.\n\nEach pole reflects one of those exponential pieces.\n\nThese two properties alone already give you a glimpse of why this is a helpful\n\ntool for getting a qualitative sense for the dynamics of some situation.\n\nIf you have some system evolving over time, and with techniques I'll show you shortly,\n\nyou're able to find its Laplace transform, then when you see poles in this transform\n\nwith imaginary values, that tells you, hey, there's some kind of oscillation.\n\nIf those poles have negative real values, that indicates a tendency\n\nto decay towards zero, but any poles with a positive real part\n\nwould indicate instability, a tendency to explode away from zero.\n\nOften when you're studying physics, you don't know immediately what function\n\ndescribes a dynamic system, but you do know a differential equation describing it.\n\nWhat's neat is that there's a way to go directly from such a\n\ndifferential equation to the Laplace transform of its solution.\n\nThis is useful both as an intermediate step to finding an exact\n\nsolution you can circle on your page, but also equally importantly,\n\nit's a meaningful representation of the system in its own right.\n\nThe ability to do this is going to rely on a third key property that is\n\nworth remembering, one that explains how exactly Laplace transforms can\n\nconvert differential equations into algebra, hence making them easier to solve.\n\nHere's how it looks.\n\nIf you take the derivative of some function, little f of t, with respect to time,\n\nand then you take a Laplace transform of that derivative,\n\nthe effect is the same as if you had first applied the transform to the\n\noriginal function, and then multiplied that result by s, at least almost.\n\nThere's also this additional term where you subtract off the initial condition,\n\nsubtracting the value of your original function, little f, at the time t equals zero.\n\nSo in other words, the transform turns differentiation in\n\nthe time domain into multiplication over in the s domain.\n\nNow, this should feel very reminiscent of the fact that, for exponential functions,\n\ndifferentiation in time is the same as multiplication by s,\n\nand it's no coincidence that ultimately the underlying reason is the same.\n\nNow, at first glance, when you look at this rule,\n\nthat little minus f of zero term might seem like kind of an annoying\n\nquirk to an otherwise very elegant equation, but really it's a feature, not a bug.\n\nAs you apply this to differential equations, this little quirk\n\nmeans you have a built-in way to account for initial conditions.\n\nNow, I can hear you asking, why is this property true?\n\nWhere does it come from?\n\nHow exactly is this connected to the idea of differentiating an exponential,\n\nand where does that minus f of zero term come from in the first place?\n\nI will, of course, explain this.\n\nIn fact, I can think of three ways to explain it,\n\nbut let's postpone those for just a minute and instead dive into how you actually\n\nuse this property in practice.\n\nThe example I want to show starts with the simple harmonic oscillator,\n\nwhich is something you and I studied two chapters ago where you might imagine a mass\n\non a spring.\n\nAs a reminder, one component of the force that acts on that mass pulls it towards a\n\nmiddle position with a strength that's proportional to its distance away from that\n\nmiddle.\n\nWe write that as negative k times x.\n\nAnd it's also common to include a damping force,\n\nwhich acts by slowing down this mass's movement with a strength\n\nproportional to its velocity, again using some negative proportionality constant.\n\nAnd then the algebra always ends up looking very nice if we move\n\nall of these terms to just one side of the equation, like this.\n\nWith no further modification, this right here is a very friendly linear equation.\n\nWe talked all about how to solve it simply by substituting in e to the st, which,\n\ndepending on your perspective, is either a frustratingly unmotivated guess,\n\nor that's just the established procedure you do once you've learned the\n\nfundamental fact that linear equations like this always have an exponential solution.\n\nThat's all previous material, but this time we're going to imagine there\n\nis a third force acting on the mass, some kind of external force,\n\nwhich in our example will oscillate back and forth according to a cosine function,\n\nlike a wind with periodic gusts to the left and to the right.\n\nImportantly, the frequency of this external force will generally have\n\nnothing to do with the natural resonant frequency for the spring.\n\nAnd this is not an arbitrary example that came up for us before on this\n\nchannel when we studied why light slows down in a medium like glass.\n\nIn that context, once we were deep into the video,\n\nthe relevant oscillator was a little charge inside the material,\n\nand the external force was an incoming light wave.\n\nFaced with an equation like this, which is no longer a linear equation,\n\nit's more complicated to solve, here's a preview of the general strategy.\n\nWhat you do is you take a Laplace transform of all of the terms,\n\nand then you can solve that result to reveal the transformed version of the solution,\n\nand then from there you can invert the process to recover that solution\n\nin our usual language, in the time domain instead of the s domain.\n\nOkay, that's the high-level view, but let's roll up our\n\nsleeves and actually step through this piece by piece.\n\nFollowing the usual convention, I'm going to write the transform for little\n\nx of t as capital X of s, and then using the rule that we just talked all about,\n\nthe transform for its derivative is going to look like s times capital X,\n\nall minus an initial condition, which I'm going to write as little x naught.\n\nAnd then for the second derivative, what should that look like?\n\nThis is actually a good chance to pause and try it out as an exercise.\n\nIt basically looks like applying that key rule we just talked about, but twice in a row.\n\nApplying it once, you get that the transform of the second derivative should look\n\nlike s times the transform of the first derivative, all minus x prime of zero.\n\nThat term is the same as the initial velocity, so I'll write it as v naught.\n\nThis is where, in the whole procedure, that part of the\n\ninitial condition is kind of automatically accounted for.\n\nAnd from here, you can substitute in the Laplace transform of that derivative as,\n\nagain, s times capital X of s, all minus an initial condition.\n\nWe can distribute a couple terms here, substitute it back up in what we had,\n\nand if we bring along those other constants, m, mu, and k for the ride,\n\nwe get this kind of large but not wholly unreasonable expression.\n\nAnd what I want to draw your attention to are these three terms here,\n\nthe ones that include a component of capital X of s.\n\nIf we add those together and factor out the whole capital X part,\n\nwhat we're left with is a nice little quadratic polynomial.\n\nWhat would be very clean and pretty is if that's all we had,\n\nbut messing up the elegance is that we have all of these initial condition terms\n\nkind of riding along.\n\nAnd I say they're messing up the elegance, but again I want to point\n\nout it actually is very nice to have a baked-in way to incorporate initial conditions,\n\nthat's not going to be some added step later on.\n\nNevertheless, for the sake of a clean initial example,\n\nlet's assume that both the initial position and the initial velocity are zero,\n\nso our spring on a mass starts off completely stationary.\n\nKeep in mind, for a more general solution, you might want to keep these constants around.\n\nWhat's nice about ignoring them is that it shines a light on a characteristic pattern of\n\napplying Laplace transforms, where this part of our differential equation,\n\nthe left-hand side on the top, basically gets turned into a polynomial that looks like\n\na kind of mirror image of it, one that has all the same constants,\n\nand where each higher-order derivative, like that x double prime,\n\nturns into some power of s, in this case s squared.\n\nThat is really the essence of why this tool works.\n\nDifferential expressions turn into polynomials,\n\nand polynomials are something we can do algebra with.\n\nBut of course, for this example, what makes it interesting is that we have this\n\nother oscillating force on the right-hand side,\n\nand taking a Laplace transform of a cosine expression is something we talked\n\nall about in the previous episode.\n\nIn practice, this is the kind of thing you would either have memorized or look up,\n\nbut if you want to pause, I think this is a good chance for an exercise to take a\n\nmoment and see if you remember why the transform of a cosine expression should have\n\ntwo different poles, in this case one pole at omega i,\n\nand the other pole at negative omega i, and take a moment to quickly gut check that\n\nthat lines up with the expression you're looking at here,\n\nwith this denominator s squared plus omega squared.\n\nWhat I really want to pop into your mind's eye when you see that in the denominator\n\nis the idea of poles at omega i and omega negative i,\n\nand with a nice intuition of the s-plane, that should feel in your bones like\n\noscillation with a frequency of omega.\n\nThe next step when it comes to just pushing around the\n\nsymbols on the page is to divide out by this component here.\n\nAnd with that, you now have an exact final expression, fully describing,\n\nwell not the solution of your system, but the Laplace transform of its solution.\n\nAs I previewed, the final step will be to invert the Laplace transform process,\n\nrevealing the original mystery function, but before that, even just at this step,\n\nI want you to notice how by seeing this transformed version,\n\nyou already get a lot of intuition for the dynamics of the system.\n\nRemember, the key question over in the s domain is where are all the poles,\n\nand this expression has a pole wherever its denominator is equal to zero.\n\nIn this example, there are four different values of s that make this denominator zero.\n\nTwo of them come from the roots of this polynomial here,\n\nthe one I described as a mirror image of the harmonic oscillator equation.\n\nAny of you who watched the previous chapters will remember how this looks.\n\nIt amounts to applying the quadratic formula, and as you tweak the constants k,\n\nmu, and m, the roots of that polynomial fall in different places on the S-plane.\n\nBut generally, they have a negative real part, and,\n\nassuming the damping coefficient is not too big, they have an imaginary part.\n\nAnd when you see points on the S-plane like that,\n\nwhat should pop into your mind's eye is the notion of oscillation with\n\nsome kind of decay.\n\nIn other words, even when you add this external force to the oscillator,\n\nthe solution of the unforced oscillator, what it would do on its own,\n\nis still lurking inside.\n\nHidden somewhere in there is the oscillation matching\n\nthe natural resonant frequency of the spring system.\n\nThe other poles of our transformed function come from the roots of this part right here,\n\nwhich are omega i and negative omega i, and those correspond to the cosine external\n\nforce.\n\nIn other words, another component of the final dynamics,\n\nreally the dominant component in this case, is a tendency to oscillate in sync\n\nwith that external force.\n\nAnd this should feel intuitive.\n\nIf you go and push a kid on a swing, but with a frequency that doesn't\n\nnecessarily match the natural resonant frequency of the swing,\n\nwhat ultimately happens to their motion is that they also oscillate\n\nin a way that matches your frequency, not the natural one of the swring.\n\nHere, this might all make a little bit more sense if I return\n\nback to that simulation that I opened with, that has a graph on\n\nthe top showing the position of this mass on a spring over time.\n\nAgain, notice how that graph has this weird initial startup period where it's sort\n\nof wibbling about finding its stride, but eventually it does fall into that rhythm\n\nand follow this consistent sine wave pattern, synced up with the external force.\n\nWhat's going on here is that the solution can be\n\nthought of as a sum of two different components.\n\nOne component corresponds to those poles on the left half of the S-plane,\n\nand it matches a solution to the unforced equation,\n\nwhat the spring would do without any external influence.\n\nThe other component corresponds to the two poles of the Laplace transform on\n\nthe imaginary axis, meaning it's pure oscillation with no growth or decay,\n\nand it's simply a cosine wave matching the rhythm of that external force.\n\nFrom this perspective, you can recognize how that initial period of wibbling\n\nabout corresponds to the time when that first component is still relevant.\n\nYou have these two distinct frequencies competing with each other,\n\nand that first one has not yet decayed away into obscurity,\n\nbut eventually it does, leaving behind only the pure cosine.\n\nOkay, okay, okay, I hear some of you saying, that's all well and good,\n\nbut what is the actual solution?\n\nI have an exam tomorrow, and I need to circle some expression at the bottom of my paper.\n\nWell, if you do want an exact analytic solution,\n\nthis next part is not exactly fun, but it is straightforward.\n\nIf you have a fraction like this one that we found,\n\nand you know the roots of its denominator, like the four roots that we just discussed,\n\nyou can break it up as a sum of four fractions where the denominator of each one looks\n\nlike s minus one of those roots.\n\nThe work you have to do goes into solving for these constants up in the numerator.\n\nThere's a process for it, it's called partial fraction decomposition.\n\nI'm not going to walk through the details, I don't think you want me to walk\n\nthrough the details, but I'll leave up the key idea as a little on-screen note.\n\nOnce you do solve for those constants, because you know that an\n\nexponential term transforms into a simple fraction, like the ones we're looking at,\n\ninverting the process amounts to inverting that one key rule.\n\nYou turn each of these fractions into the appropriate exponential term.\n\nSo the locations of each pole, those roots of the denominator,\n\ncorrespond to the values in the exponents sitting in front of the time t.\n\nAnd those constants that you have to put in the work to solve for\n\nremain as the constants in front of each of these exponentials.\n\nIf you're the kind of person who likes homework and enjoys digging into the formulas,\n\nand you choose to take on the challenge of solving for those constants,\n\nthere's one very interesting conclusion of that exercise I want you to focus on.\n\nLook at the first two terms, corresponding to the poles +ωi and -ωi.\n\nWhen you solve for the two relevant constants,\n\nthe expressions you get are not quite the same, but if mu is very close to zero,\n\neach one is approximately this shared expression that we can factor out.\n\nNow, you know that two imaginary exponentials like this combine to make a cosine.\n\nSo this part you're looking at is that final steady-state\n\ncosine rhythm that the mass eventually falls into.\n\nAnd inside that big expression that you solve for,\n\nthe exercise I want to leave you with as homework is to think deeply\n\nabout how the amplitude of this final expression depends on the difference\n\nbetween the resonant frequency of the spring and the frequency of that external force.\n\nIn particular, what happens as both of those frequencies get closer together?\n\nAnd how might this be relevant to anyone wishing to\n\nbuild a bridge that they don't want to wobble into ruin?\n\nStepping out from the trees to look over the forest,\n\nyou see what I mean about how Laplace transforms can turn a differential equation into\n\nalgebra, and how it's all rooted in this third key property where a derivative in time\n\nturns into multiplication by s.\n\nSo naturally, the burning question is, why is this property true in the first place?\n\nAnd like I said, I can think of three different ways to explain it.\n\nOne that's elementary but limited, one that's general but a bit opaque,\n\nand then there's my favorite, which requires a little added theory to describe.\n\nThe first one is actually not a complete explanation.\n\nThe idea is that any time you see a new formula in math,\n\nit's never a bad idea to just try it out on an example you know well.\n\nThat way you build a little intuition.\n\nIn this case, what's an example that you and I know very well?\n\nWell, we have emphasized to death the fact that if you pump in an exponential function,\n\nsomething like e to the a t, then its Laplace transform looks like 1 divided by s minus\n\na.\n\nSo let's see what happens for this example.\n\nYou know how to take the derivative of an exponential like this.\n\nIt's delightfully simple, you just multiply by that constant a.\n\nAnd then, because of linearity, this means the Laplace\n\ntransform also just picks up that added factor of a.\n\nAnd at first, this actually seems wrong.\n\nIt seems inconsistent with the desired conclusion.\n\nWe're not multiplying by s, the input of our new transformed function.\n\nInstead, the thing we're multiplying by is this random constant a\n\nthat characterizes what specific exponential we happened to throw in.\n\nBut this is really just a matter of some gentle algebraic massaging.\n\nNotice what happens if I add this fraction, s minus a over s minus a,\n\nwhich is the same as adding 1, so I have to subtract off 1 to account for it.\n\nWhen you combine these two fractions here, you get some nice\n\ncancellation in the numerator, leaving behind this clean factor of s.\n\nAnd you'll notice we're now subtracting off something from the whole expression, 1.\n\nAnd that happens to be the initial condition.\n\nIt's what you get if you plug in t equals 0 to the original function we pumped in.\n\nSo in fact, it really is consistent with the desired conclusion.\n\nNow of course, this is just one very specific function,\n\nthis is not a general explanation, but it holds within it the seeds of much\n\nmore generality.\n\nIf you like exercises, take a moment to convince yourself that this\n\nresult is also true for any combination of exponential functions.\n\nThis really just amounts to leaning hard on linearity again,\n\nboth linearity of the transform and of the derivative.\n\nThis is still not a complete explanation, it only applies to combinations\n\nof exponentials, but to be fair that includes every example we've seen so far,\n\nand an overarching theme of this whole series will be how many,\n\nmany things really can be broken into exponentials with the right point of view.\n\nThe second explanation I want to at least briefly flash\n\nup here is the one that you'll see in most textbooks.\n\nThe idea is to simply pull up the definition of a Laplace transform,\n\nwhich somewhat bizarrely we actually haven't had to look at ever since the last chapter,\n\nand then to evaluate it, you apply integration by parts.\n\nThis is another case where I think it's best to just leave the details on screen\n\nfor any curious and calculus-savvy students who want to pause and think it through.\n\nIt's a perfectly fine and tidy derivation, really short actually,\n\nbut sometimes I feel like whenever you appeal to integration by parts,\n\nyou can almost see the intuition evaporating away from the audience in front of you.\n\nAnd in this case, if you stop and ask yourself where that times s really came from,\n\nor why we're subtracting an initial condition,\n\nboth of them kind of feel like things that happened to fall out.\n\nThe third explanation, at least in my own head,\n\nis what really shows why the property is not just true,\n\nbut woven into the fabric of what a Laplace transform was born to do.\n\nThe caveat is that it requires understanding something we haven't talked about yet,\n\nknown as the inverse Laplace transform.\n\nThis is something you might have already started wondering about.\n\nIf you look back at our differential equation example,\n\nin that very last step where we inverted the process to recover the original function,\n\na perfectly reasonable question to ask would be how is this supposed to\n\nwork if you can't necessarily break the result into these clean fractional pieces?\n\nThat question is very closely tied to the question of what Laplace\n\ntransforms mean if your original function cannot be broken down\n\ninto a discrete sum of exponential pieces in the first place.\n\nThis inverse transform is a big enough topic that it deserves its own chapter.\n\nFor example, it involves a fun new concept for us known as a contour integral.\n\nWhat I'd like to do with that next chapter is walk through how you could reinvent this\n\ntool for yourself, starting from a desire to create something that has this third key\n\nproperty we've been focusing on, where derivatives turn into a kind of multiplication.\n\nI think there's a very natural storyline where slowly tugging\n\non a certain logical thread leads you to inventing both the\n\nLaplace transform and its inversion formula as a unified pair.\n\nAlong the way, you also get to see how it relates\n\nto Fourier transforms and Fourier inversion.\n\nIf you're feeling up for a jaunt into the deeper theory of the subject,\n\ncome join me in the next chapter.",
				"status": "completed",
				"error_message": null,
				"created_at": "2026-04-09T09:52:21.648Z",
				"updated_at": "2026-04-09T09:52:32.192Z"
			},
			{
				"id": "dtc-YjM7Jg8W",
				"youtube_url": "https://www.youtube.com/watch?v=BHdbsHFs2P0",
				"embed_url": "https://www.youtube.com/embed/BHdbsHFs2P0",
				"title": "The Hairy Ball Theorem",
				"description": "Unexpected applications and a beautiful proof.\nLooking for a new career? Check out https://3b1b.co/talent\nSupporters get early access to new videos: https://3b1b.co/support\nAn equally valuable form of support is to simply share the videos.\nHome page: https://www.3blue1brown.com\n\nCredits:\nSenia Sheydvasser: Co-writing and sphere deformation animations, made in Blender\nPaul Dancstep: Those lovely fluffy sphere animations, made in Cinema4D\nVince Rubinetti: Music\n\nSphere Eversion clip by Carsten Steger\nhttps://commons.wikimedia.org/wiki/File:Thurston_Sphere_Eversion.webm\n\nTimestamps:\n0:00 - To comb a hairy ball\n1:24 - Applications\n8:46 - The puzzle of one null point\n12:12 - The proof outline\n16:41 - Defining orientation\n21:44 - Why inside-out is impossible\n25:59 - 3b1b Talent\n27:44 - Final food for thought\n\n------------------\n\nThese animations are largely made using a custom Python library, manim.  See the FAQ comments here:\nhttps://3b1b.co/faq#manim\n\nMusic by Vincent Rubinetti.\nhttps://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown\nhttps://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u\n\n------------------\n\n3blue1brown is a channel about animating math, in all senses of the word animate. If you're reading the bottom of a video description, I'm guessing you're more interested than the average viewer in lessons here. It would mean a lot to me if you chose to stay up to date on new ones, either by subscribing here on YouTube or otherwise following on whichever platform below you check most regularly.\n\nMailing list: https://3blue1brown.substack.com\nTwitter: https://twitter.com/3blue1brown\nBluesky: https://bsky.app/profile/3blue1brown.com\nInstagram: https://www.instagram.com/3blue1brown\nReddit: https://www.reddit.com/r/3blue1brown\nFacebook: https://www.facebook.com/3blue1brown\nPatreon: https://patreon.com/3blue1brown\nWebsite: https://www.3blue1brown.com",
				"channel_name": "3Blue1Brown",
				"channel_url": "https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw",
				"channel_avatar": "https://i.ytimg.com/vi_webp/BHdbsHFs2P0/maxresdefault.webp",
				"thumbnail": "https://i.ytimg.com/vi/BHdbsHFs2P0/maxresdefault.jpg",
				"duration": 1779,
				"view_count": "2586203",
				"published_at": "2026-04-09T09:52:19.133Z",
				"content": "These days, whenever I look at the back of my beloved 7 month old baby's head,\n\nthis little swirl of tiny hairs reminds me of one of the most\n\nridiculously named facts in math, the hairy ball theorem.\n\nI promise this is a genuinely serious bit of math,\n\nwhere informally the statement is that if you have a ball that's covered in hair,\n\nand you try to comb it down, there is no way to do it without having the hair\n\nstick up at at least one point.\n\nFor example, let's say you try to comb it all counterclockwise around some axis.\n\nThen at the top and the bottom, you end up with these little swirls,\n\nand the hair at the centermost point of those swirls would have nowhere to go.\n\nIt's forced to stick up.\n\nIt's actually very fun to play around with this in your mind,\n\nwhere no matter how you try to flatten out the hair,\n\nit is a mathematical guarantee that you will be left with at least one tuft like this.\n\nIn fact, even getting it down to just a single problem point,\n\nas opposed to two, is a bit of a challenge.\n\nIt is possible, and if you like puzzles, I encourage\n\nyou to try thinking of how it could work.\n\nLater on in this video, I'm going to show you\n\nat least one way you can think about doing it.\n\nFor the moment, though, I imagine there's a more burning question,\n\nwhich is that you might be wondering why a mathematician would care about combing fluffy\n\nspheres like this.\n\nAnd of course the answer is, they don't.\n\nThe name and the informal statement are a bit tongue-in-cheek.\n\nI will of course share the more formal statement,\n\nand in fact my real reason for making this video is to share an\n\nunusually elegant way to prove it, one that I think will delight any math lovers.\n\nBut before any of that, let's motivate things with an example of\n\nthe kind of situation where these fluffy spheres naturally arise in practice,\n\nin a context that initially seems completely unrelated.\n\nOkay, so imagine that you are a game developer,\n\nand you're programming some game where you have a 3D model of an airplane,\n\nand what you want is to be able to take an arbitrary trajectory for this plane to fly\n\nalong, presumably something user-defined, and your job is to write a function that\n\norients the plane correctly as it moves along that trajectory.\n\nSo, for example, let's say you're at a given point on some given trajectory.\n\nYou obviously want to move the center of the model to be on that point,\n\nbut you're left with ambiguity on how it should be rotated in 3D space.\n\nThe obvious constraint here is that you know the nose of that plane should\n\npoint along the tangent vector of the path, but even that leaves some ambiguity.\n\nHow is the plane rotated about this nose-to-tail axis?\n\nOne way you could think about defining that last degree of freedom is in\n\nterms of where this perpendicular vector along the left wing direction points.\n\nThe task for you, as the programmer of this video game,\n\nis to figure out what that perpendicular wing direction should be at every single\n\npoint along a given trajectory.\n\nNow, there is a correct way to do this, which would involve calculating the second\n\nderivative of the trajectory, working out how to get this to match the lift force from\n\nthe wings together with gravity, but maybe that seems a little complicated right now.\n\nResourceful and lazy programmer that you are, you might think, hey,\n\nis there just some reasonable thing I can do to choose some wing direction\n\nthat's perpendicular to a given velocity vector, the heading direction of the plane?\n\nHere's one way you might think about it.\n\nAll of the possible ways this plane could point in space,\n\nthe various heading directions that I'm colouring in red,\n\nmake up the points of a unit sphere.\n\nWhat you want is to write a function that takes in a given vector on this sphere and\n\nreturns some choice for a vector perpendicular to it,\n\nthe ones that I'm colouring in pink.\n\nThe only real constraint is that you want this association to be continuous,\n\notherwise it would mean the plane's orientation could sharply jump,\n\nwhich would be a very clear glitch in the game.\n\nAnd if you know nothing else, it really feels like this should be a possible task.\n\nAfter all, for a given heading direction, you are not starved for choices.\n\nYou have infinitely many wing directions to choose from,\n\nan entire circle's worth of options.\n\nSo how hard could it be to make some reasonable choice\n\nfor every point on the sphere that varies continuously?\n\nYou might see where I'm going with this.\n\nChoosing a perpendicular direction like this is equivalent to\n\nchoosing a unit tangent vector to that point of the sphere.\n\nSo if you're assigning a specific perpendicular to every possible\n\ndirection that plane could be pointed, that's basically the same\n\nthing as defining a tangent vector at every point on a sphere.\n\nNow this is starting to look a little bit more like a hairy ball.\n\nAnd in fact, now is as good a time as any to step back and\n\ndescribe what the hairy ball theorem actually says more formally.\n\nIf you have a sphere and you choose some point on that sphere and a plane tangent\n\nto the sphere at that point, then any vector that you choose within that plane,\n\nwhich is rooted at that point, is called a tangent vector of the sphere.\n\nIf you assign a tangent vector to every single point on the sphere,\n\none for each possible tangent plane, we call it a vector field on the sphere.\n\nAnd whenever you're drawing vector fields like this,\n\nit's always standard to scale the vectors down so that you can avoid clutter.\n\nAnd the other thing to keep in mind is that even though an illustration\n\nlike this necessarily only shows a finite set of vectors,\n\nrooted at a finite set of points on the sphere,\n\nof course a vector field consists of infinitely many vectors,\n\none for every single point on the continuous surface.\n\nSo the theorem, our main character for today, states that if your vector field is\n\ncontinuous, meaning there are no sudden jumps in its direction,\n\nthen it must have at least one point with a null vector,\n\nmeaning a vector whose length is zero.\n\nFor example, look back at our 3D model case.\n\nThe function that I was using for many of the animations there was essentially\n\ntrying to keep the roof of the plane pointed as upward as possible.\n\nAnd when you express this function as a vector field, where again,\n\neach possible direction for the nose of the plane is thought of as a\n\npoint on the sphere, and each corresponding wing direction is thought of\n\nas a tangent vector at that point of the sphere,\n\nthen it turns out that function I was using gives a vector field that\n\nspirals around the vertical axis.\n\nThis actually does give reasonable enough animations in most cases,\n\nbut the problem is that it has a discontinuity at the poles.\n\nSo if ever I let the plane point straight up or straight down using this function,\n\nyou would get this glitching behavior as it passes through that direction.\n\nNow, if you're just a programmer messing around with this,\n\nyou might think you can tweak things to avoid glitches like that,\n\nbut actually, the Harry Ball Theorem guarantees, no matter how clever you are,\n\nyou are doomed to have some direction producing this kind of glitch.\n\nSo for robust animations, you cannot simply use the direction\n\nof the nose of the plane to determine its full orientation.\n\nYou have no choice but to step back and incorporate more\n\ninformation from the trajectory than the velocity vector alone.\n\nAs another example, think about the wind velocity at every point on the Earth,\n\nsay, at some constant altitude.\n\nA pretty reasonable assumption is that wind velocity varies continuously,\n\nso the Harry Ball Theorem should apply.\n\nThe wind pattern I'm animating here is completely unrealistic from a meteorological\n\nstandpoint, but the point is that whatever wind pattern you dream up, realistic or not,\n\nthe Harry Ball Theorem is going to guarantee that there is always one place on\n\nthe Earth for a given altitude where the wind velocity is exactly zero.\n\nNow, if we're being pedantic, you could say atmosphere is three-dimensional,\n\nso the more accurate statement would be that the component of\n\nwind velocity parallel to the ground is zero.\n\nYou know, it could be going straight up or straight down,\n\nbut still, it is kind of counterintuitive.\n\nA slightly more pragmatic example is if you want a radio signal that\n\nis completely identical in every direction of 3D space,\n\nin the sense that everyone a given distance away from the source\n\nreceives an identical radio wave, same phase and amplitude at all points of time.\n\nThat might seem like a reasonable objective, but if you know a little bit\n\nabout electromagnetic waves, you'll know that they are oscillations in two\n\ndistinct vector fields, the electric and the magnetic fields specifically.\n\nImportantly, the direction of oscillation for each one of these fields is always\n\nperpendicular to the direction of propagation, at least far away from the source.\n\nSo, think about what that means.\n\nAt a given distance away from the source, either one of these fields looks\n\nlike a tangent vector field on the sphere, and the hairy ball theorem\n\nstates at least one point of that vector field has to be zero,\n\nso the only way to have a completely identical signal in every direction\n\nof 3D space is for the signal itself to be zero, which presumably defeats the point.\n\nI bring up these examples just to say that this seemingly playful fact\n\nabout fluffy spheres really does pop up in unusual places,\n\nbut what I really want to do with this video, the fun that I want to have,\n\nis to let you explore this idea the way that a pure mathematician might.\n\nFirst, that puzzle that I mentioned at the start actually gives a really\n\ngreat way to flex your mind and see how what feels obvious is not always true.\n\nAnd then after that, I want to share a completely\n\nbeautiful proof that explains why this theorem is true.\n\nSo, to the puzzle.\n\nI don't know about you, but when I was first playing around with\n\nthis idea in my mind to build some intuition,\n\nit was really not at all obvious that reducing to a single null point is even possible.\n\nFor most of the vector fields I could dream up,\n\nyou get at least one swirl going one way, and another swirl going the other way.\n\nOr maybe a source at one point, and a sink at another.\n\nThis makes it really tempting to suggest that there should be\n\nsome universal law about needing at least two different null\n\npoints with something opposite about them that has to cancel out.\n\nSomething like the north and south poles of a magnet.\n\nTempting as that is, with a little cleverness, it is possible to get just one null point.\n\nAnd a nice way to define this is by using something known as a stereographic projection,\n\nwhere every point on the sphere, except for the north pole,\n\ngets mapped to a unique point on the xy-plane.\n\nThe way this works is very pretty.\n\nYou imagine a light shining from that north pole,\n\nand every ray of light that passes some point on the sphere also hits one and\n\nonly one point of the xy-plane.\n\nAnd it goes the other way around too.\n\nEvery point of the xy-plane corresponds to a unique point on that sphere,\n\nmeaning that plane can get mapped onto every point of the sphere,\n\nexcept for the north pole.\n\nThis is a favorite mapping among mathematicians,\n\nand the way we can use it here is to imagine having some vector field on the\n\nxy-plane that's never zero.\n\nThat's simple enough to define.\n\nYou could just take a constant vector field, always pointing one unit to the right.\n\nIf you project that vector field back onto the sphere,\n\nthis gives you something that's non-zero everywhere, except for the north pole.\n\nAdmittedly, the way I'm showing it right now makes it kind of\n\nhard to parse what exactly is going on around that north pole.\n\nThe basic reason is that if you take a uniform sample of points on the plane,\n\nthey get infinitely dense around that north pole under this projection.\n\nSo let me show you a second way I could illustrate things, which also,\n\nby the way, lends itself to a more rigorous definition for what I\n\neven mean by projecting a vector field onto a sphere like this.\n\nImagine a fluid flowing on the plane with a uniform velocity one unit\n\nper second to the right, and then consider what the projection of each\n\nparticle of that fluid would look like on the sphere during its motion.\n\nIf you take the velocity vectors for those projected particles on the sphere,\n\nthat defines the vector field that I'm talking about.\n\nAnd illustrated this way, you can really nicely see how the flow\n\nlines all form perfect circles on the sphere,\n\nall of which are mutually tangent with the velocity of zero at that north pole.\n\nIt really is a lovely projection.\n\nThe point is, even if initial mental play and intuition might suggest\n\nthat vector fields on a sphere have to have at least two null points,\n\na little creativity can give you a field that just has one.\n\nSo, how do you know that it stops there?\n\nHow can you rigorously prove that no matter how clever and creative you are,\n\nit is simply not possible to define a continuous vector field\n\nwithout forcing at least one point to have a zero vector?\n\nThis is where the real cleverness kicks in.\n\nThe way that we're going to approach this is with a proof by contradiction,\n\nmeaning you will assume that such a non-zero vector field on the sphere is possible,\n\nand then deduce that something impossible would have to follow.\n\nLike I said, the argument I want to show is just really beautiful,\n\nand I think it's made all the more so if you feel like it's something you could have\n\ndiscovered for yourself.\n\nSo, as always, please do pause and ponder whenever you feel like you see the key idea.\n\nThis argument is not my own, it came my way via the mathematician Senia Sheydvasser,\n\nwho also very kindly put together the following animation to illustrate the core idea.\n\nThe basic outline is that if such a non-zero continuous vector field really did exist,\n\nyou could use it to create a continuous deformation of the\n\nsphere that turns that sphere inside out.\n\nAnd then we're going to prove why it's actually impossible to turn a sphere inside out,\n\nat least in a certain manner of speaking.\n\nIt's at this point that viewers of classic math YouTube will be yelling at their screens,\n\nbut bear with me, I promise I will get to that.\n\nOkay, so this continuous deformation is a little weird to define, but here's how it works.\n\nImagine that your sphere is centered at the origin for some coordinate system in 3D space.\n\nFor a given point on that sphere, consider the vector attached to that point,\n\nthe one from our vector field.\n\nIf you slice the sphere along a plane, which is defined by that vector\n\nand the radial line to the origin, the plane intersects the sphere at a\n\ncertain great circle, meaning a circle that's also centered at the origin.\n\nWhat you're going to do is let that point of the sphere move along this circle\n\nin the direction of that initial vector until it gets precisely halfway around.\n\nJust to be clear, I'm not saying that it flows\n\nalong the general vector field of the sphere.\n\nIts motion is entirely determined just by the one vector that it started out on.\n\nThe two important facts to highlight are that it ends up on the negative\n\nof where it started, and then also because its motion is entirely defined\n\nby what vector it started on, and because we're assuming the whole vector\n\nfield is continuous, nearby points are going to have nearby trajectories.\n\nRight now, I'm just showing you one point moving along its prescribed half-circle path,\n\nbut we could just as well highlight a handful of other points on the sphere,\n\neach of which has its own vector associated with it,\n\neach of which defines a great circle to walk along,\n\nand you could watch all of those points wander along the assigned paths.\n\nNow remember, we're assuming that the vector field is non-zero everywhere.\n\nWe hope to contradict that, but that's the assumption.\n\nAnd what that means is that every single point on the infinite\n\ncontinuous sphere has a similarly well-defined trajectory.\n\nSo naturally, you want to see what it looks like\n\nfor the entire sphere to undergo that motion.\n\nBut it's at this point that animations become a little tricky,\n\nbecause of something intrinsically paradoxical about illustrating a proof by\n\ncontradiction.\n\nThink about it.\n\nWe want to show what this motion looks like, as defined by\n\nsome hypothetical vector field that is non-zero everywhere.\n\nBut of course, the whole point is that no such vector field exists.\n\nAs the next best thing, we're going to use that special vector field\n\nthat we just defined, only a single null point at the North Pole.\n\nThat way, if we chop away the North Pole, we can at least see the kind\n\nof thing that this motion would do to most of the sphere,\n\neven if there's something impossible about this being applied to all of the sphere.\n\nI'll go ahead and remove the vectors themselves to avoid clutter.\n\nAnd this right here is what it looks like for every point on the surface\n\nto undergo that bizarre, specially defined motion,\n\neach one marching along its own half-circle path,\n\ndefined by whatever vector it started on.\n\nAnd actually, that's kind of confusing to follow.\n\nSo let me roll back the clock a bit here, where you see that\n\nthe whole sphere ends up awkwardly crossing through itself.\n\nTo clarify things, we might perturb the motion a little by\n\nletting the radius of the points vary during the motion.\n\nAnd it also makes things clear if we widen out that hole on the top.\n\nThis makes it much, much easier to follow, at least for this subset of the sphere,\n\nyou can clearly see two important features of the motion.\n\nNumber one, the sphere gets turned inside out.\n\nNumber two, at no point in time does any part of the sphere cross the origin.\n\nAnd that should make sense.\n\nEach individual point is just following a half-circle centered at the origin,\n\nso of course it never passes through the origin.\n\nThose are the two key ingredients.\n\nFor our proof, what we want to say is that these two facts are somehow incompatible.\n\nBefore we can do that though, we need to linger on this first point.\n\nWhy exactly does this motion turn the sphere inside out?\n\nAnd actually, what do we even mean by the phrase inside out here?\n\nAnd in fact, let me start with an even more basic question.\n\nIf you're standing at some point on the sphere,\n\nhow do you know which way is outside and which way is inside?\n\nI realize that might sound like a very dumb question.\n\nYou might say just look at whichever way is pointed away from the origin.\n\nWhat's wrong with you?\n\nThe real conundrum here though comes from the fact that we intend to let\n\nthe surface warp and deform and get all manipulated in some crazy way.\n\nSo really what you want is a clear notion of what we mean by\n\ninside and outside that remains clear even after you manipulate\n\nand massage and contort the whole surface however you dream up.\n\nThe easiest way to do this I think is going to be something familiar to any\n\ngraphics programmers, which is that you start by assigning a coordinate system\n\nto the sphere, something like our usual notion of latitude and longitude.\n\nThe image you should have in your mind is that every point of the\n\nsphere has a little label attached to it with a pair of numbers.\n\nAnd importantly, these labels could follow along during\n\nany motion or manipulation you apply to the sphere.\n\nAround a given point, consider the direction of increasing longitude and constant\n\nlatitude and draw a tangent vector in that direction,\n\nand then draw a line of increasing latitude with constant longitude and draw a\n\ntangent vector in that direction.\n\nFrom here, the way we define orientation is using what's known as the right hand rule.\n\nYou can point your index finger along that first vector and your middle finger along that\n\nsecond vector, and then when you stick out your thumb, it'll be perpendicular to both.\n\nNotice using our right hand, the thumb is pointed outside.\n\nAnd in fact, this is how we are going to define what we even\n\nmean by outside with respect to the given coordinate system.\n\nDoing this at every point, you get what are known in the business as unit normal vectors.\n\nAs I referenced, these are very important in computer graphics,\n\nwhere for example they let you compute how light should reflect off of a given surface.\n\nAnd for our story, the thing we care about is how,\n\nno matter how you manipulate or warp the surface,\n\nbecause that coordinate system you give to it can kind of come along for the ride,\n\nyou can always play this game of pointing your index finger along the direction\n\nwhere the first coordinate increases, and your middle finger along the direction\n\nwhere that second coordinate increases, and sticking out your thumb.\n\nIt's otherwise surprisingly tricky to define what you mean by inside\n\nand outside in a way that naturally follows along for any function.\n\nSo, why are we doing this?\n\nThink now about that strange deformation induced by a vector field on the sphere.\n\nHow can we conclude beyond any doubt that this must turn the sphere inside out?\n\nWell, remember how each individual point starting at p ends up at negative p?\n\nThe much more straightforward way to get there, literally,\n\nwould be to reflect through the origin, like this.\n\nSo consider that picture that we just had of an example point,\n\ntogether with the oriented lines of latitude and longitude passing through it.\n\nNotice what it looks like if we let every point in that diagram move over to its negative.\n\nAgain, you might imagine all the coordinate labels of the surface riding along with it,\n\nso when you play the same game of pointing your index finger in the direction\n\nwhere that first coordinate increases, and your middle finger in the direction\n\nwhere that second coordinate increases, now, after everything has been negated,\n\nnotice that your thumb is pointing towards the origin instead of away.\n\nThis is all to say, the function that maps every point p of a\n\nsphere to its negative necessarily turns the sphere inside out,\n\nin the sense of reversing orientation the way we just defined it.\n\nIn particular, that very weird deformation that we described in terms of a hypothetical\n\nvector field must reverse orientation because it's mapping each point p to negative p.\n\nYou can also see this effect with a much simpler\n\nmotion that gets us to the same final place.\n\nImagine rotating the sphere 180 degrees around the z-axis,\n\nand then reflecting through the xy-plane.\n\nThat results in every point p landing on its negative,\n\nand notice how all the unit normal vectors that started pointing outward end up pointing\n\ninward, and as it's rendered here with a blue exterior and a brown interior,\n\nthose two colors end up getting swapped.\n\nAnd it's at this point that viewers of classic math videos all might\n\nbe bringing to mind an absolute banger of a video that was produced\n\nin 1994 by the Geometry Center at the University of Minnesota.\n\nThis is really one of the true classics in all of math exposition.\n\nIt walks through this mind-blowing way to turn a sphere\n\ninside out using a certain continuous deformation.\n\nThe reason I bring this up for any of you who watched that\n\nis to say that the context there was a little bit different.\n\nThe phenomenon that they were trying to avoid was creating\n\ncusps and creases on the sphere during the process.\n\nBut over here, for our purposes, we don't really care about that.\n\nHowever, there is one feature of our bizarre vector\n\nfield-induced deformation that really would be impossible.\n\nNo point of the sphere ever passes through the origin.\n\nAnd there is a very beautiful way to see why turning a sphere\n\ninside out without crossing the origin just could never happen.\n\nMaybe the most fun way to illustrate this is with a physical model.\n\nImagine a fountain at the origin spewing out water uniformly in all directions,\n\nsay at a rate of one liter every second.\n\nThe way I'm animating it here is with a bunch of droplets spewing away,\n\nbut in principle, I want you to think of this as a continuous flow of an\n\nincompressible fluid, something uniform in all directions,\n\nand with that incompressibility, we'll imagine that the density of water through\n\nall of space stays constant.\n\nThat's important.\n\nIf you have some oriented surface, something like our sphere with its unit normal\n\nvectors, you can measure how much water is flowing through that surface per unit time.\n\nPhysicists have a special name for this.\n\nThey call it the flux, where on a given patch of area,\n\nthe flux measures how much water passes through it per second,\n\nand you count it as positive when the water flows from inside to outside,\n\naligned with the unit normal vectors of the surface,\n\nwhereas flux would be negative if it's going the other way,\n\ngoing against those normal vectors.\n\nWhen you add all of this up over the whole surface, this gives you the total flux,\n\nand the key observation is that this total flux has to match the amount of water\n\nbeing produced inside the surface, that one liter per second,\n\nand the cool part is that this will remain true even if you warp or deform the\n\nsphere just a little bit.\n\nThat total flux stays at one liter per second,\n\neven if the flux through a particular patch of area changes during the process,\n\nand the basic reason is that we're treating the water as an incompressible\n\nfluid with a constant uniform density through space,\n\nso every little bit of water produced at the origin has to be cancelled\n\nout by one that is exiting the surface.\n\nImportantly, for what I just said to be true, we have to be counting flux with a sign.\n\nFor example, let's say you warp the sphere so that it kind of folds over\n\nitself like this, then you'll notice along a certain line,\n\nthe water goes out of the surface, and then back into it, and then back out again.\n\nSo you would want to count this flux as positive whenever it goes from inside to outside,\n\nbut negative when it goes from outside to inside,\n\nso that you're not counting those particles three different times.\n\nAnd from here, you can maybe see the key point I'm getting at towards our contradiction.\n\nThe only way that you could ever change the net flux through a surface\n\nlike this is if part of that surface crosses through the origin.\n\nFor example, if you pull it over to the side so that it\n\ndoesn't include the source at all, the net flux would be zero.\n\nThere are as many water molecules flowing in as there are flowing out.\n\nSo with that in mind, think about everything we've been talking about.\n\nIf you could define this non-zero vector field on a sphere that lets you create this\n\nbizarre deformation that turns the sphere inside out, what happens to the flux?\n\nWell, what we mean by turning the sphere inside out is that all\n\nthe unit normal vectors end up pointing inside instead of outside.\n\nSo for any particular patch of area, at some point the flux through it\n\ntransitions from being positive to negative, and overall, at the end,\n\nthat total flux would have to end at negative one liters per second.\n\nBut at the same time, if it never crosses the origin, the net flux can never change.\n\nIt starts at positive one, so it has to end at positive one.\n\nThis is the contradiction.\n\nNo deformation with these two properties can possibly exist.\n\nAnd there you have it.\n\nA non-zero continuous vector field on the sphere would be impossible.\n\nYou truly cannot comb a hairy ball.\n\nI don't know about you, but I think that's so beautiful.\n\nVery often topology is this game where seemingly intuitive facts have these surprising\n\nbut kind of frustrating counter-examples, but the real insights and the creativity\n\noften comes from the other side of the coin, where you take something that seems\n\nintuitive, but you find the construction that really justifies why it's fundamentally\n\ntrue.\n\nNow there is more to say about making the argument I just showed you fully rigorous,\n\nand also more to say about how this whole thing does and does\n\nnot generalize to other dimensions.\n\nBut before that, if you'll indulge me in shifting gears entirely for a minute here,\n\nI want to tell you about an experimental new thing that I'm starting up this year,\n\nwhich I'm thinking of as a kind of virtual career fair.\n\nIf you go to 3b1b.co/talent, what you'll find is\n\na set of companies that have two things in common.\n\nThe first one, essentially by definition, is that\n\nthey are interested in recruiting from this audience.\n\nThey value the kind of mathematical and technical curiosity clearly to\n\nbe found in someone like you, who's watching a video like this for fun.\n\nIf you go and explore the page and see the kind of puzzles and\n\nchallenges and technical work that each one has chosen to share with you,\n\nyou'll pretty quickly get a sense of the shared values here.\n\nThe second thing they have in common is that the\n\npeople working there really love what they do.\n\nAnd this one's important to me.\n\nI was pretty careful about it while setting this whole thing up,\n\nbecause all of this only makes sense to do if it's actually valuable to the audience.\n\nSo I took some time to sit down and chat with the technical teams at each group,\n\nand inclusion only really made sense if they clearly like what they do.\n\nPretty universally, a core reason that the people enjoyed their\n\nwork was out of a very sincere respect for all of their teammates.\n\nIn the hopes of making this relevant to you, whoever you might be,\n\nthere is a range of job types available across a range of industries,\n\nincluding senior roles, new careers, internships, or even part-time tutoring gigs.\n\nFor broader context, if you're curious, I recorded a whole video on\n\nthe second channel explaining why I started this, what the deal is.\n\nOne thing that I mention over there is how I'm looking to make a few hires myself,\n\nand whenever this is the case, I will include my own page up on this virtual career\n\nfair, where you can go and find the description of what I'm looking for and the\n\napplications.\n\nThe whole page will stay updated as time goes on,\n\nso even if you're not looking for a job now, but you are sometime in the future,\n\nbe sure to check it out.\n\nAlright, so back to the hairy ball theorem.\n\nThe argument at the end rested on this whole idea of flux,\n\nwhich admittedly is a little hand-wavy without further details,\n\nso I'll leave up on screen a set of exercises outlining one way that you\n\ncould make this more rigorous if you have a background with multivariable\n\ncalculus and the divergence theorem.\n\nThere is another, deeper way to get at the same basic idea,\n\nusing something called a homology group, but that one is certainly beyond the\n\nscope for today.\n\nThe last point I want to leave you pondering on is the nature of other dimensions.\n\nIt's not hard to see that you can comb down the hairs on a fluffy circle,\n\neven though you can't do it for a sphere, and in general the rule is that spheres in\n\nall the even dimensions can be combed down, but those in all the odd-numbered dimensions\n\ncannot.\n\nNow what I like about the argument that we just talked about for this\n\nwhole video is that it offers a pretty direct clue for why that's the rule,\n\nat least if you're comfortable with the notion of orientation.\n\nIn all the even dimensions, the function that maps a point to\n\nits negative is an orientation-preserving function,\n\nwhereas in all the odd dimensions, that's an orientation-reversing function.\n\nYou might enjoy taking a moment to pause and ponder on why that means the proof we just\n\noutlined works in all of the odd dimensions, and even though it doesn't explicitly tell\n\nyou that nothing could work in the even dimensions,\n\nit's a fun puzzle to see if you can construct an explicit example of a non-zero vector\n\nfield in all of those even dimensions.\n\nFor example, how do you comb down the hairs on a hypersphere in four dimensions.",
				"status": "completed",
				"error_message": null,
				"created_at": "2026-04-09T09:52:08.851Z",
				"updated_at": "2026-04-09T09:52:19.133Z"
			},
			{
				"id": "dtc-a7xZaiDt",
				"youtube_url": "https://www.youtube.com/watch?v=fsLh-NYhOoU",
				"embed_url": "https://www.youtube.com/embed/fsLh-NYhOoU",
				"title": "The most beautiful formula not enough people understand",
				"description": "On the volumes of higher-dimensional spheres\nExplore the 3b1b virtual career fair: See https://3b1b.co/talent\nBecome a supporter for early views of new videos: https://3b1b.co/support\nAn equally valuable form of support is to simply share the videos.\nHome page: https://www.3blue1brown.com\n\nThanks to UC Santa Cruz for letting me film there, and special thanks to \nPedro Morales-Almazan for arranging everything.\n\nMy video on Numberphile with a fun application of this problem: https://youtu.be/6_yU9eJ0NxA\n\nTimestamps:\n0:00 - Introduction\n1:01 - Random puzzle\n6:16 - Outside the box\n14:35 - Setting up the volume grid\n21:14 - Why 4πr^2\n25:21 - Archimedes in higher dimensions\n36:17 - The general formula\n40:40 - 1/2 factorial\n44:58 - Why 5D spheres are the biggest\n50:16 - Concentration at the surface\n54:27 - A unit-free interpretation\n57:50 - 3b1b Talent\n59:13 - Explaining the intro animation\n\n------------------\n\nThese animations are largely made using a custom Python library, manim.  See the FAQ comments here:\nhttps://3b1b.co/faq#manim\n\nMusic by Vincent Rubinetti.\nhttps://vincerubinetti.bandcamp.com/album/the-music-of-3blue1brown\nhttps://open.spotify.com/album/1dVyjwS8FBqXhRunaG5W5u\n\n------------------\n\n3blue1brown is a channel about animating math, in all senses of the word animate. If you're reading the bottom of a video description, I'm guessing you're more interested than the average viewer in lessons here. It would mean a lot to me if you chose to stay up to date on new ones, either by subscribing here on YouTube or otherwise following on whichever platform below you check most regularly.\n\nMailing list: https://3blue1brown.substack.com\nTwitter: https://twitter.com/3blue1brown\nBluesky: https://bsky.app/profile/3blue1brown.com\nInstagram: https://www.instagram.com/3blue1brown\nReddit: https://www.reddit.com/r/3blue1brown\nFacebook: https://www.facebook.com/3blue1brown\nPatreon: https://patreon.com/3blue1brown\nWebsite: https://www.3blue1brown.com",
				"channel_name": "3Blue1Brown",
				"channel_url": "https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw",
				"channel_avatar": "https://i.ytimg.com/vi_webp/fsLh-NYhOoU/maxresdefault.webp",
				"thumbnail": "https://i.ytimg.com/vi/fsLh-NYhOoU/maxresdefault.jpg",
				"duration": 3623,
				"view_count": "955033",
				"published_at": "2026-04-09T09:52:05.160Z",
				"content": "Thank you very much.\n\nIt is good to be here.\n\nI don't know if you people realize what a beautiful campus\n\nyou have and how you basically just study in heaven.\n\nToday, I want to talk with you about what I think is one of the\n\nmost underappreciated formulas, not because those who know it don't appreciate it,\n\nbut because not enough people know about this.\n\nAnd more importantly, not enough people understand where it comes from.\n\nAnd this should be one of the gems.\n\nIt's this should be the e to the pi i of the mathematical community.\n\nBut I really want you to come away knowing not just what it is,\n\nbut why it's true and what it represents.\n\nNow, before I dive straight into it, I think the scene\n\nis best set if we start with two different puzzles.\n\nThe first puzzle is just going to give us a sense of the meaning of what\n\nwe're about to do because it runs the risk of feeling pretty abstract.\n\nAnd then the second puzzle is going to be a kind of forewarning,\n\nnot to trust our intuitions.\n\nSo let's start with the first puzzle.\n\nThis is our warm up for today.\n\nWe're going to start by imagining that there's a random number.\n\nI'm going to call it X.\n\nIt's going to sit between negative one, positive one, chosen uniformly.\n\nX is going to have a friend, another random number, Y,\n\nchosen between negative one and positive one uniformly.\n\nAnd we're going to ask a question, a probability question about both of these,\n\nwhich is, what's the probability that if you square X and then you add it to\n\nthe square of Y, you end up with something which is less than or equal to one?\n\nSo let me throw this out to the audience.\n\nAnyone want to raise their hand and throw out probability that you choose this random X,\n\nchoose this random Y, you add their squares, it's going to be less than one.\n\nLet's see.\n\nSo I see a blue shirt up here.\n\nYeah, do you want to pass it out?\n\nI mean, X squared plus Y squared makes like a unit circle.\n\nSo my guess would be it be related to the area of\n\nthe unit circle over the area of like a unit square.\n\nAmazing.\n\nSo I asked this question and immediately in your mind, there's an image that pops up.\n\nAnd the point I want to make is this is an analytical question.\n\nThis is just a question about two numbers.\n\nIf you're savvy with your probability, you could set up some integrals not thinking\n\nabout geometry and answer the question, but that would feel a little bit like a crime.\n\nThe question is kind of screaming out at you that it wants to be a picture.\n\nThe natural way that this wants to be answered is to think of that pair of numbers,\n\nX and Y, as a point in a two-dimensional space.\n\nAnd that way, when you're thinking of a random choice for X independent\n\nfrom a random choice of Y, you're choosing a random point inside.\n\nWell, in this case, it's a square that goes from X equals negative 1 to positive 1.\n\nSame with Y.\n\nSo it's a two-by-two square.\n\nNow, the reason it's screaming out to be geometric is because this constraint of X\n\nsquared plus Y squared being less than equal to 1 is the meaning of being inside a\n\ncircle.\n\nAnd it's saying if X squared plus Y squared is equal to 1,\n\nthat would actually land you on the boundary.\n\nThis follows straight from the Pythagorean theorem.\n\nYou can draw a nice little right triangle.\n\nX gives you one leg, Y gives you the other leg.\n\nAnd you end up answering, in this case, area of that circle divided by area of the square.\n\nAll you need to know is the area of a circle.\n\nPi R squared, this is one of those formulas we learned in high school.\n\nSo you can write down pi divided by 4.\n\nAll well and good.\n\nAnd then we can bump it up.\n\nI could say, what if instead of choosing two random numbers,\n\nX and Y, they had a third friend, Z?\n\nSame deal, uniform between negative 1 and 1.\n\nYou square it.\n\nYou want to ask the probability that the sum of\n\nall those numbers is less than or equal to 1.\n\nIn your mind's eye, it's screaming to you, hey,\n\nI want to be a three-dimensional picture now.\n\nIt doesn't have to be.\n\nYou could answer it purely analytically, but it would somehow\n\nfeel wrong not to turn this into a three-dimensional picture.\n\nBecause in this case, that constraint of X squared plus Y squared plus\n\nZ squared being less than 1 means sitting inside of a unit sphere.\n\nAnd so in this case, to answer the probability question,\n\nyou just need to know what's the volume of that unit sphere as it compares to the\n\nvolume of this 2 by 2 by 2 cube.\n\nThis is another one of those formulas we might\n\nhave learned in middle school or high school.\n\nVolume of a sphere ends up being 4 thirds pi times its radius squared.\n\nRadius in this case is 1.\n\nYou work it all out, and you get, I guess, a little above 50%.\n\nNow, there's no reason that we'd have to stop there.\n\nThis is three numbers, but what if I asked about four numbers?\n\nNow, at this point, your mind's eye is going to start kind of squinking a little\n\nbit because it's like, I know what I want to be seeing right now in the same way\n\nthat the first problem screamed out that it wants you to be thinking about a circle.\n\nThis one wants you to be thinking about whatever the\n\nfour-dimensional equivalent of circles and spheres should be.\n\nBut again, it's a perfectly reasonable question.\n\nIt's a very empirical question.\n\nIt's very real, and I don't have to stop there.\n\nWe could say, what if you had 100 different numbers, you add up all their squares,\n\nand I want to know the probability that they add up to be something less than 1?\n\nTo ask that question is to kind of force yourself to\n\nwant to know the volume of a 100-dimensional unit ball.\n\nNow, that might seem kind of weird.\n\nIf you just heard a mathematician off the street saying that\n\nthey found some formula for the volumes of high-dimensional balls,\n\nthat risks sounding like something which is just nonsense.\n\nIt's so divorced from reality because we're used to living in three dimensions.\n\nBut the point I want to make is that higher-dimensional geometry is real.\n\nJust because it's not describing a literal physical space\n\ndoesn't mean that it doesn't have a kind of utility.\n\nNow, it probably doesn't need to be emphasized nowadays\n\nbecause machine learning is awash in high-dimensional geometry.\n\nEssentially, any time that you're representing something with a long list of numbers,\n\nyou could choose to interpret that as a point in a high-dimensional space.\n\nAnd one of the big lessons of geometry is that that's a fruitful choice to make.\n\nIt helps your problem solving.\n\nIt makes certain things that would have been really hard,\n\nlike setting up 100 different integrals for this probability question,\n\nturn into something easier.\n\nI don't think I need to emphasize this to you because these days,\n\nwe have things like large language models.\n\nAnd if you dig under the hood and say, what's really going on when you interact with\n\nChatGPT or Claude or Gemini or whichever one your favorite one is,\n\nthe under-the-hood scheme basically looks like breaking up all of your text into\n\nlittle chunks.\n\nAnd each of those chunks gets turned into a long, long list of numbers.\n\nAnd you don't have to think about that as a point in high-dimensional space.\n\nYou could just say, oh, it's this big, long list of numbers.\n\nBut to try to understand what these models are doing,\n\nit ends up being really fruitful to think about those long\n\nlists of numbers that the words turn into as being points in a space.\n\nWhen people do research to interpret these things,\n\nall of their language is centered around talking about points in some kind\n\nof high-dimensional space.\n\nThat's all to say, high dimensions are useful.\n\nBut this is a little bit of a problem because\n\nhigh-dimensional geometry can get very counterintuitive.\n\nAnd the second puzzle here is just an absolute classic.\n\nThis is one of those things where I think everybody, sometime, you know,\n\nif they're entering a STEM field, going into college,\n\nthey should see this example at some point as a kind of like Aesop's fable of\n\nsomething you might want to avoid.\n\nSo here's going to be the setup.\n\nWe're again going to have a 2 by 2 square centered at the origin,\n\ngoes from x equals negative 1 to y equals positive 1.\n\nI'm going to put a circle at each one of its corners.\n\nSo the corners are sitting at 1, 1, negative 1, 1, negative 1, negative 1, on and on.\n\nI'm going to put a unit circle on each one of those.\n\nAnd so by definition, those corner circles have a radius of 1.\n\nAnd the question I'm going to ask here is to say,\n\nwhat if I was to give them another friend, a circle that sits on the inside,\n\nthat gets as big as it can to be tangent to all of them on the outside?\n\nWhat's the radius of that inner circle?\n\nJust a geometry question, just a little puzzle.\n\nWe're still in the warm-up phase.\n\nAgain, anyone want to raise their hand and kind of toss out a proposed answer here?\n\nAll right, we got a raised hand over here.\n\nYou can take a look at the diagonal, calculate the length of that bag,\n\nand then subtract from that vr twice.\n\nLove it.\n\nSo we're going to look at the diagonal from the origin to the corner of that cube.\n\nAnd that looks like square root of, well, in this case, the legs are 1 and 1.\n\nSo square root of 1 squared plus 1 squared, that distance is square root of 2.\n\nAnd then we're going to subtract off the radius of that outer circle.\n\nSubtract off the one that was, by definition, radius 1.\n\nSo the answer, square root of 2 minus 1, you work it out.\n\nIt's about 0.4.\n\nYou look at the picture, you say, I don't know, seems reasonable.\n\nWhy is this an interesting question?\n\nI say, wait, wait, wait, you'll see, you'll see.\n\nSo then you could go to three dimensions, and we're going to do the same setup.\n\nWe're going to have a unit ball on each one of the corners.\n\nSo in this case, we're going to have not four, but eight different unit spheres.\n\nEach one of them has a radius 1.\n\nThey're sitting on all of the corners.\n\nAnd we're going to play the same game.\n\nI say, introduce a new sphere centered at the origin that is as big as it can be,\n\nmeaning it gets as big as it needs to be to be tangent to those eight outer spheres.\n\nSame question, what is the radius of that inner sphere?\n\nIn this case, anybody want to raise their hands,\n\ntoss out a proposed answer to the radius of this one?\n\nUp close?\n\nRoot 3 minus 1.\n\nOkay, so you say root 3 because you understand Pythagorean theorem in three dimensions.\n\nI might belabor the point here.\n\nForgive me if this is telling you something you already know.\n\nI really want to emphasize why the distance rule is what it is.\n\nBecause the result I'm about to get to is so counterintuitive that when I've\n\nput it online before, there have been comments to the effect of maybe distance\n\nin higher dimensions just doesn't work the way that we think it does.\n\nWhat I want to emphasize is everything's just stemming from the rule in two dimensions.\n\nSo if you have a unit cube, you can play the same\n\ntwo dimensional Pythagorean theorem game.\n\nBecause having that diagonal of one square, that could be one\n\nleg of a new right triangle, where another leg is this z axis.\n\nAnd then from there, you do the normal two dimensional Pythagorean theorem.\n\nSo we're not imbuing 3D space with a new rule.\n\nIt's more like it's inheriting the rule from all its two dimensional subspaces.\n\nYou work it out, you end up with root 3.\n\nSo in this case, that means the final answer, root 3 minus 1.\n\nAgain, you do the calculation, looks to be about 0.7.\n\nYou say, seems reasonable.\n\nWhy is this interesting?\n\nBut let's just keep upping it.\n\nUp in four dimensions, I don't know how to draw a four dimensional cube.\n\nThis is my best attempt.\n\nIt's something that would look like a cube, but it's got another\n\ncube as the top cap and some lines connecting the vertices.\n\nBut we know how to calculate the distance.\n\nThe exact same logic is going to let us go up one more,\n\nwhere you would be drawing a two dimensional right triangle,\n\nwhere one leg is that root 3, that's the diagonal of a unit cube.\n\nAnd then you just step up in some fourth direction.\n\nNow, this one's kind of cute because the distance to the corner is square root of 4,\n\nwhich means it's a whole number, it's 2.\n\nAnd in this case, whatever that diagram should look like in four dimensions,\n\nit's got 16 different corners, 16 different unit balls.\n\nOne thing that's really nice about four dimensions is that a\n\nunit ball fits nice and snugly right in the middle of them.\n\nSo this gives you a little instinct for what sphere\n\npacking in four dimensions can look like.\n\nNow, where this gets more interesting is if we think in generality.\n\nIf we say, okay, not just for three or four dimensions,\n\nbut for n dimensions, what would this look like?\n\nThe distance to the corner of that cube is going to look like square root of n.\n\nWe're always subtracting off the radius of that corner sphere, which is by definition 1.\n\nSo for example, up in 10 dimensions, it looks like root 10 minus 1, which is about 2.16.\n\nNow, if you just look at that and you kind of nod along with the formulas,\n\nyou might say, okay, seems reasonable, I guess that's what things would be.\n\nBut it gets really, really weird when you try\n\nto interpret it geometrically and physically.\n\nBecause here's what I'm going to do.\n\nI'm going to draw a new box outside of the entire diagram that we had.\n\nSo before we introduce that center circle, I'm going to\n\ndraw this 4 by 4 by 4 bounding box outside of everything.\n\nAnd if in two dimensions I said, notice that inner circle is inside all of those,\n\nor in three dimensions, the inner sphere is inside of that whole bounding box,\n\nyou'd say, yeah, obviously, like, it seems like by definition, it must be inside of it.\n\nBut the weird part is the distance from your origin to the edge of that bounding box,\n\nbecause it's 4 by 4, ends up being 2 to get to that edge.\n\nSo if we're saying up in 10 dimensions, whatever this diagram should\n\nlook like with its 2 to the 10th different corners,\n\nwhole bunch of little unit balls up there, expanding some sort of inner sphere,\n\nthat inner sphere is actually dramatically bigger than all your corner spheres.\n\nIt's even bigger than that bounding box.\n\nIt pokes outside the bounding box.\n\nNow that's just bizarre.\n\nAnd it's so bizarre, there's this common phrase that I've heard\n\nfrom other people who've described this problem where they say,\n\nthis suggests that higher dimensional spheres are very spiky.\n\nI don't know if anyone's heard this intuition would say,\n\nyeah, high dimensional spheres are spiky.\n\nI hate this.\n\nBecause they're not.\n\nThey're very round.\n\nThey're round because they are defined to be round.\n\nWhat is a sphere in a high number of dimensions?\n\nIt's all of the points that are a given distance from the origin.\n\nSo it is as round as round could be.\n\nSpheres are not the problem.\n\nThis is counterintuitive, but spheres, they're fine.\n\nYou know who's the problem?\n\nIt's the cubes.\n\nCubes are messed up in higher dimensions.\n\nAt the very least, they defy our intuition.\n\nBecause what's really going on with this example is we've got this very high dimensional\n\ncube where to get from the origin to the edge of it,\n\nthat point that a high dimensional sphere on the inside could bounce outside of,\n\nlet's say this is a two by two box, it's just going to be a distance one to get to\n\nthe edge of that two by two box.\n\nBut to get to the corner, that's actually a lot longer.\n\nBecause up in 10 dimensions, to get to that corner,\n\nyou've got to walk in your first dimension, then your second dimension,\n\nthen your third dimension, then your fourth dimension, then your sixth,\n\non and on and on 10 times.\n\nNow, even if you're not taking perpendicular steps and you take the shortcut\n\nto just go straight across, you know, the shortcut can only get you so much.\n\nSo it gets you a square root speed up, but not anything better than that.\n\nSo the very loose schematic picture I have in my head for high dimensional cubes,\n\nand take this with a grain of salt, is it's something like this,\n\nwhere your corners are just way, way, way farther away than the edge.\n\nAgain, grain of salt because it's not like their sides are curved,\n\nbut just cram this intuition into two dimensions.\n\nThat's what we have to do.\n\nSo for this example, if we're thinking what's going on,\n\nwhen we put those unit spheres on the corners, those unit spheres are just way far away.\n\nThey're just way off there.\n\nSo when we have that inside one that's growing as big as it\n\nneeds to be tangent to all of those, it's got to get massive.\n\nNow, this picture is also still not quite right because I'm cramming it into two\n\ndimensions and I'm only showing four corners, but there's many, many, many corners.\n\nThere's two to the n different corners.\n\nSo the new loose schematic that you might have for this is something where\n\nrather than just those four corners, you have a whole bunch of corners.\n\nSo very vaguely speaking, this is the picture to have\n\nin your mind for what's going on with that example.\n\nSo the inner sphere does bust out, but in some\n\nsense it's still contained by all of those corners.\n\nSo this is all to say, high dimensional geometry for all\n\nof its utility is unfortunately very counterintuitive.\n\nAnd I think maybe the better way of framing is that it risks being counterintuitive.\n\nI think if you find the right ways to think about these shapes,\n\nthey actually can become your friends.\n\nAnd this is what brings us to the real me.\n\nThe real reason we're all here.\n\nI don't want to talk about how it's real and useful.\n\nI don't even want to talk about how it's counterintuitive.\n\nI want to talk about something that's just completely\n\nbeautiful about higher dimensional spheres specifically.\n\nAnd this is that formula that I referenced.\n\nWhat it's going to describe is the volume of a ball up in a higher number of dimensions.\n\nYou can focus on a ball with radius one, but just add an R to the end there if you want.\n\nSo we're going to build up to this.\n\nWe're going to talk about where it comes from.\n\nI want it to feel like it's deep in your bones,\n\nsomething that you really felt like you could have discovered it yourself.\n\nAnd in order to get up there, I think it's worth just spending\n\nsome time with the familiar friends that we have,\n\nwhich are the relevant formulas you might have come across already in school.\n\nAnd so there's four main ones here.\n\nYou've got the circumference of a circle.\n\nSo this is measuring the boundary in two dimensions.\n\nAnd this is 2 pi times the radius.\n\nThis is basically the definition of pi.\n\nSo after here, everything is a derivation.\n\nBut this one you could call a definition.\n\nThis is what the constant pi even means.\n\nNow below it, I'm going to draw pi R squared.\n\nThat's measuring the interior of the square.\n\nSo still in two dimensions, interior, our good old friend pi R squared.\n\nUp in three dimensions, the boundary, that surface area looks like 4 pi R squared.\n\nVery fun.\n\nVery suspicious because it's exactly four times the circle.\n\nSo that might be worth revisiting.\n\nAnd then the interior, the volume of a sphere, is 4 thirds pi R cubed.\n\nSo these are the ones we might have seen.\n\nI'm going to put them inside a chart.\n\nAnd our goal today is basically to fill out this chart.\n\nSo the way I'm orchestrating this, I'm going to label that bottom row BN,\n\nmeaning a ball in N dimensions.\n\nSo for example, a ball in two dimensions, that's a filled in circle.\n\nA ball in three dimensions, that's the thing we would usually call a ball.\n\nBut we're going to use this as a very general term across all the dimensions.\n\nAnd then above that, I'm going to label things with this\n\nlittle Dell symbol that you often use to mean partial.\n\nSo this is just a bit of notation.\n\nIn this case, it doesn't mean partial.\n\nIt actually means the boundary.\n\nSo the boundary of a ball in N dimensions.\n\nSo the boundary of a ball in two dimensions, that's the circle.\n\nIn three dimensions, it's the shell of the sphere.\n\nNow the notation that kind of looks like a little D kind of gives some calculus vibes.\n\nI actually think is helpful for an important rule about this chart.\n\nI want you to think a little bit, because I know all of you have\n\nprobably had some kind of exposure to calculus in your background.\n\nI want you to think about the relationship between the bottom row and the top row.\n\nAnd again, I'm going to just throw this out.\n\nAnyone want to raise their hands and kind of say what is the relationship?\n\nSo right over here.\n\nYeah.\n\nIt's a derivative, right?\n\nHow many of you like thought this was very fun the first time?\n\nI don't know.\n\nMaybe this is the first time you've seen it.\n\nThe first time I saw this, I remember thinking, that's weird.\n\nWhy is that true?\n\nNow it's but a little calculus student who maybe didn't\n\nhave a deep enough intuition for what the whole field was.\n\nBut there's a very good reason this is true in terms of the meaning of a derivative.\n\nSo if you think of what would it mean to take the derivative of the area formula,\n\nyou're kind of saying, well, suppose you were to increase that\n\nradius of a circle by a little amount, some little dr.\n\nHow much has that area changed?\n\nWhat is the resulting change to that area that we might call da?\n\nAnd what this is saying is approximately, it's about\n\nthe circumference of that circle times that little dr.\n\nNow this is wrong if you interpret dr and da as literal amounts,\n\nsome kind of actual tiny nudge like a physicist.\n\nBut the idea is that it becomes less wrong if you let that dr get smaller and smaller.\n\nI'm a fan of the physicist's perspective.\n\nI don't mean that in a derogatory way.\n\nI actually think it's the way we should all teach it.\n\nBut the technical meaning of this would be this is not actually an equation.\n\nIt's something that becomes less and less wrong as you let that\n\nlittle dr approach something close to zero or approach zero rather.\n\nAnd then same intuition the other way around is basically saying you could think of\n\nthe interior of the circle as kind of integrating together a whole bunch of boundaries.\n\nAnd when you integrate all of those boundaries that grow proportionally to r,\n\ntaking that integral looks like turning the r into r squared and dividing by two.\n\nThat division is going to be very important for us.\n\nSo remember it.\n\nSame deal in three dimensions just to state it all.\n\nYou've got a ball.\n\nIf you were looking at its volume and you want to know what's\n\nthe rate of change of its volume, a really nice way to think\n\nabout that is that it is based on the surface area of that sphere.\n\nYou're saying what is the tiny change in volume caused by a tiny change to the radius?\n\nWell, it's about the area of that shell times the thickness that you've given it.\n\nNow that's wrong as stated with a literal number that you plug in for little dr.\n\nBut it becomes less wrong if you let dr shrink and shrink and shrink closer to zero.\n\nAnd then on the flip side too, you can think of it by integrating together a\n\nbunch of shells and integrating the r squared turns into one third r cubed.\n\nAnd that one third is important.\n\nThat idea that integration gives us that division is going to matter a lot.\n\nSo we know how to go up and down in this diagram.\n\nThat's the important part.\n\nIf you know something on the bottom row, you can step up.\n\nNow our real question is how do we go left and right?\n\nAnd before we go in the interesting direction to all the higher dimensions,\n\nlet's give a little love to the first dimension because we do a lot of two dimensional\n\ngeometry.\n\nWe do a lot of three dimensional geometry.\n\nOne dimensional geometry always kind of gets the short\n\nshift and maybe it's because it's a little less fun.\n\nBut take a moment to think what should the volume\n\nof the interior of a one dimensional ball be?\n\nAnyone want to hazard an answer?\n\nWhat should the formula be for one dimensional ball?\n\nYeah, here.\n\nWould it just be a constant because it's kind of like a line?\n\nWell, it's going to be...\n\nIt is a line, but it's not going to be constant\n\nbecause we want to think of with respect to a radius.\n\nSo as you increase that radius...\n\n2 times r.\n\nYeah, exactly.\n\n2 times r.\n\nSo we say what is a ball in one dimension?\n\nWell, it's all the points within a distance r from some center point.\n\nThat ends up looking like a line.\n\nAnd in the same way that in two dimensions, the way that\n\nwe're measuring like volume is with area in three dimensions.\n\nIt's our normal meaning of volume.\n\nDown here, what I mean by the volume of a one dimensional ball,\n\nusing this word volume in a general sense across all the dimensions would just be the\n\nlength and the length is 2r.\n\nAnd what's fun here is if we just try to blindly follow the rule\n\nof taking a derivative to get up top, we end up with the idea\n\nthat the volume of the boundary of a one dimensional ball is 2.\n\nWhich at first seems weird because what's the boundary of a one dimensional ball?\n\nWe think about it and say, well, it's just two different\n\npoints and what should zero dimensional volume be?\n\nI guess just counting those points seems as reasonable as anything,\n\nbut it follows the pattern.\n\nSo that gives us a little reassurance and that'll\n\nbe a general theme as we move forward here.\n\nSomething that seems a little suspicious at first,\n\nbut that follows the pattern kind of gives us a comfortable feeling in our hearts.\n\nNow, of course, I know you want to see how we move to the right.\n\nHow do we get into those higher dimensions?\n\nBut to get a running start at it, I want to linger a little bit on\n\nwhere exactly those three dimensional formulas are coming from.\n\nBecause the logic that gets us an understanding of, for example,\n\nthe surface area of a sphere is going to actually carry us even farther if we think\n\nabout it the right way.\n\nSo I alluded to the fact that a sphere is kind of suspicious because\n\nit's got this area that's exactly four times the area of a circle.\n\nThat may make you wonder, like, where does it come from?\n\nWhy do we get such a nice formula?\n\nAnd there's a really lovely way of thinking about\n\nthis surface area that dates a long time back.\n\nIt goes all the way back to Archimedes.\n\nAnd he had this very clever idea, which was to say,\n\nwe can think about the area of the surface of a sphere by imagining taking\n\nall these little patches on it and projecting them out onto a cylinder that\n\nencloses that sphere.\n\nNow, you might think this act of projecting and kind of warping\n\nit is going to be such a violent affair that it changes the area.\n\nOf course, it should change the area.\n\nBut Archimedes very cleverly pointed out that if you think of one little\n\nrectangle of area on that sphere and you imagine what happens as you\n\nproject it out onto that cylinder, there are two competing effects.\n\nIt doesn't end up the same.\n\nBut what happens is it gets stretched out in one direction.\n\nBut then because it's kind of casting a shadow of something at an angle,\n\nit effectively gets squished down in another direction.\n\nAnd those two effects actually cancel each other out perfectly.\n\nAnd it's not too hard to reason about why either.\n\nSo let's think about one of them.\n\nWe're going to slice open the sphere.\n\nWe're going to put some names to things.\n\nLet's say the radius of the whole sphere is capital R.\n\nAnd then the distance between the z-axis and our specific choice of a little rectangle,\n\nI'm going to call that little d.\n\nHow much does it get stretched out, say, on the bottom in terms of capital R and little d?\n\nAnd here you can draw two different similar triangles.\n\nWe could think of the triangle that's isosceles and has a tip on that z-axis point.\n\nAnd its base is the original base of that little rectangle.\n\nAnd then you say, think of a new triangle whose base is the\n\nprojected version of that little rectangle that was on the sphere.\n\nAnd when you project it out, you're going to get a similar triangle.\n\nAnd because they're similar, the ratios of all of their sides should be the same.\n\nSo in particular, we know the ratio of the long sides of\n\nthose isosceles triangles is going to be capital R to d.\n\nSo that should also be the ratio of that little side,\n\nmeaning that's the factor by which it gets stretched out in that direction\n\nwhen we project.\n\nNow, what about the other way, this competing factor?\n\nWhat's going on there is you kind of think about casting a shadow.\n\nSo the height of that rectangle looks like this diagonal line here.\n\nAnd then it gets projected down onto something that\n\nis perpendicular to the direction of projection.\n\nSo how much does that get scaled?\n\nWhat's that factor?\n\nWe can do a nice little angle chasing argument to point out that this little blue right\n\ntriangle that I've drawn showing us that projection factor is actually similar to this\n\nbrown right triangle, which again has the side lengths little d and then a hypotenuse R.\n\nSo finding that is just kind of chase some angles, see what has to be equal,\n\nand you end up deducing that these have to be the same.\n\nAnd what that ends up telling you is the factor by which it gets\n\nsquished down in the other direction is that same R divided by d.\n\nSo when you do this to all of your little rectangles,\n\neach one of them is stretched in one direction, squished in another.\n\nBut the idea is that it's area preserving.\n\nAnd because it's area preserving, we just have to ask the area of the cylinder,\n\nwhich is a lot easier.\n\nBecause with a cylinder, you can just unwrap it.\n\nYou can basically imagine slicing it like a piece of paper,\n\nunwrapping it, and you get a rectangle where one edge of that\n\nrectangle came from the circumference of that sphere, which would be 2 pi R.\n\nAnd then the other edge just came from the height on that Z axis, the 2 times R.\n\nWhen you multiply those together, you get yourself that 4 pi R squared.\n\nSo that's where that formula comes from, or at least\n\none way of seeing where that formula comes from.\n\nAnd then like I said, if you're at one row of this diagram,\n\nyou can just take derivatives and integrals to get yourself up and down.\n\nSo knowing the surface area is enough to give you the boundary on the inside.\n\nNow here's the key question.\n\nThis is a very clever thing that Archimedes did.\n\nI don't know if Archimedes ever took a moment to think about four dimensional balls,\n\nor five dimensional balls.\n\nBut if he ever did, I have to imagine he might have wondered,\n\nis there some way I could generalize that really nice argument to\n\ntalk about the boundary of a three dimensional ball and how to measure it?\n\nHow do I generalize that?\n\nAnd I want you to think about this for a moment,\n\nbecause this is really the crux of everything we're going to talk about today,\n\nis taking this clever Archimedean idea, but somehow using it to let us take\n\nrightward steps in our diagram.\n\nAnd what I want to convince you of is that kind of the right way to think about\n\nwhat Archimedes was really doing is that he was making a knight's move in this.\n\nMight sound a little bit weird.\n\nLet me explain.\n\nSo it's a knight's move where you might think of it combined with that 2 pi r factor.\n\nBecause if we think of that unwrapped cylinder and we say,\n\nwhere did those two side lengths come from?\n\nWe were multiplying two amounts.\n\nWhere did they come from?\n\nOne of them at the top came from the boundary of a two dimensional ball, that is a circle.\n\nThat was your 2 pi r.\n\nAnd even though initially it might just look like, oh,\n\nthat other side, it was a line, because it started off as a line.\n\nI want to try to convince you the right way to think\n\nabout that other side is that it's a one dimensional ball.\n\nIt's the interior of a one dimensional ball.\n\nAnd here's what I mean.\n\nSo we're thinking about a three dimensional sphere.\n\nWhat is that?\n\nWhat does it mean to be on the boundary of a three dimensional sphere?\n\nWell, really, in terms of coordinates, it means you take three numbers, x, y, and z.\n\nAnd as long as the sum of the squares of those numbers is one,\n\nthat's what it means to be on the boundary of a sphere.\n\nNow, we could say, suppose I ask you, hey, I would like\n\nyou to give me a point on the boundary of a sphere.\n\nOne way you could do that, it's kind of a weird way,\n\nbut one way you could do it is to say, first, I'm going to choose my z value.\n\nAnd as long as z squared is less than or equal to one, I'm going to be safe.\n\nThat's going to give me enough room to find an x squared and a y squared.\n\nAnd then after choosing a value for z, you have a\n\ncircle's worth of options for x squared and y squared.\n\nThat's going to be everything such that the sum of\n\nthose squares is one minus whatever z squared was.\n\nNow, usually, you couldn't use this kind of breakdown to make a nice surface\n\narea calculation because there's this dependence where the size of that\n\nvalue z is influencing the size of the circle of options that remains.\n\nSo you can't just take the length of that line on the z-axis and then\n\nmultiply it by the size of that circle because that circle is changing size.\n\nAnd it's actually really not obvious, even if you're savvy with\n\nmultivariable calculus and you want to set this all up and sign this away.\n\nIt's really not obvious how you can get those two numbers to relate to each other.\n\nBut the core point of the Archimedean idea was to basically say,\n\nyou don't have to do that.\n\nNow, before I draw that, actually, I want to take the same diagram\n\nwe're kind of moving z squared and we're letting that influence x and y.\n\nBut I want to show the same animation in a way that's\n\ngoing to generalize to the four dimensional case.\n\nSo it's not going to rely on me to drawing that three dimensional picture.\n\nBasically, as you move z farther away from zero, it constricts that circle.\n\nAnd you have this dependence between what z you happened\n\nto choose and the circle's worth of options left over.\n\nOK, so what did Archimedes do, basically?\n\nHe said, well, it's actually going to be the same as if there was no dependence,\n\nas if you took those circles worth of options and you just projected it out.\n\nSo at all different values of z, it happened to be a unit circle.\n\nThat's what we mean by a cylinder.\n\nIf you are comfortable with the language of set theory,\n\nyou could say that cylinder is a Cartesian product between the line segment\n\nand then the circle.\n\nAnd the really nice thing about taking a product like that,\n\nwhere what's happening on one of those sets is just completely\n\nindependent from the other one, is if you want to calculate the area,\n\nin this case, you can just multiply those two numbers because of that independence.\n\nSo that's what I mean by taking a knight's move here,\n\nis that if we're taking that interior of a one-dimensional ball and each\n\none is kind of getting turned into a circle, projected out,\n\nand because of this Archimedean idea, it's independent enough that we're\n\nsafe to just multiply those numbers.\n\nNow, what's this going to look like in four dimensions?\n\nOK, so we're going to give some notation here.\n\nWe could say the boundary of a three-dimensional ball looks like the interior of a\n\none-dimensional ball times the boundary of a two-dimensional ball, just a circle.\n\nOK, I take that.\n\nHere's what it looks like in four dimensions.\n\nWe're going to say the boundary of a four-dimensional ball is going to look like\n\nmultiplying the area of the interior of a two-dimensional ball by a circle again.\n\nAnd again, let's think in terms of the coordinates.\n\nWhy does this make sense?\n\nWhat do we mean by the boundary of a four-dimensional ball?\n\nWell, we mean all the points x, y, z, w, got four coordinates now,\n\nwhere you add up their squares and you equal one.\n\nOne way you could think to make a choice for such a point on that boundary is to first,\n\nI'm going to choose a z and a w, and if they're going to give me a valid option,\n\nall I need is that the sum of their squares is less than equal to one.\n\nIf that's the case, I'll be safe.\n\nI'll have some choice for my x and y.\n\nAnd then after that, that leaves you with a circle's worth of options,\n\nsome x squared plus y squared that would have to equal this thing that depends\n\non z and w.\n\nAnd initially, that would mean you can't just\n\nnaively multiply these because of that dependence.\n\nSo the equivalent of the animation we had earlier would be basically saying,\n\nif the choice of z and w was farther away from the origin,\n\nthat constricts the circle's worth of options you have left over.\n\nAnd in general, it's very non-trivial to use this kind of relationship to somehow say,\n\nhow am I going to figure out the volume of the boundary of this\n\nfour-dimensional ball using this breakdown?\n\nBut the clever thing is that that same Archimedean idea,\n\nwhere you take various points with a constant z value and you\n\nproject them out onto a cylinder, the same logic ends up holding.\n\nBut in this case, instead of a constant z value,\n\nyou'd be choosing constant z and w, but you still take that x,\n\ny's worth of options and project them out onto something with radius one.\n\nYou'll still have the same effect where that stretches things in one direction,\n\nbut it squishes things in another, and the ratios work out\n\nthat those perfectly cancel each other out.\n\nAnd in terms of what we have on screen here, what that basically\n\nmeans is we can pretend like there is no dependence on z and w.\n\nAs far as a volume calculation is concerned, we can just take that\n\ninterior of the circle and then multiply it by the boundary of the circle.\n\nAnd this is very bizarre for me to think about because the product of the\n\ninterior of a circle and a circle like this is going to be a solid donut.\n\nSo whereas Archimedes was projecting onto a cylinder,\n\nsomehow the four-dimensional version of Archimedes would be\n\nimagining projecting his hypersphere onto a donut that encloses the sphere.\n\nI can't visualize that either, but we can do the\n\nanalysis to say this must be what's going on.\n\nSo in our diagram, we're making another knight's move,\n\nbut this time we're shifting everything over.\n\nWhat is the volume of the boundary of a four-dimensional sphere?\n\nWell, we're going to take that pi r squared, we multiply it by the two pi,\n\nor two pi r, rather, and there we go.\n\nEvidently, that volume looks like two pi squared times r cubed.\n\nThis is kind of fun because we picked up another factor of pi.\n\nMaybe you weren't expecting that.\n\nAnd again, once you have something in one column of this diagram,\n\nyou just take derivatives and integrals to go up and down.\n\nSo if we want to know the volume, or rather the four-dimensional equivalent\n\nof volume of a hypersphere, you just take an integral to go down.\n\nIn this case, integrating r cubed looks like turning\n\nit into an r to the fourth and then dividing by four.\n\nSo as far as the constant is concerned, what we've done here is basically divided by four.\n\nAgain, that division is going to be very important.\n\nAnd so we end up with this conclusion where evidently,\n\nthe volume of a four-dimensional ball looks like pi squared over two times\n\nr to the fourth.\n\nNow that's very pretty.\n\nIt's kind of a nice formula.\n\nAnd maybe you don't believe me.\n\nMaybe you think, I don't know, Grant, you're pulling\n\nthe wool over my eyes in some way here.\n\nLike, I don't know if that Archimedean trick really necessarily works.\n\nMaybe you're skeptical about the integration step.\n\nBut I want to emphasize again, this is not just\n\nwe claim it and we hand it down from on high.\n\nThis is an empirical question.\n\nIf you want to test whether this is true, whether you've done your math right,\n\nthis wouldn't be a proof, but you could just go and run a simulation.\n\nYou can ask that probability question we had at the start.\n\nGo type up some, whatever your favorite programming language is.\n\nYou have a choose four random numbers between negative one and one.\n\nYou add up their squares and you just sample when do and don't,\n\nthe sum of those squares end up bigger or smaller than one.\n\nAnd what you'll find is the numerical answer to that ends up lining up very,\n\nvery closely the bigger your simulation is with the formula that I just gave you.\n\nThat nice beautiful pi squared divided by two.\n\nSo that's fun.\n\nAnd it's also generalizable.\n\nWe could just keep going.\n\nWe can make that same knight's move if we want to go up to the fifth dimension.\n\nAnd just to spell it all out, what this is going to end up looking like,\n\nI won't do this for every single one of them because boy,\n\nare we stretching what we can even draw in pictures on the screen now.\n\nBut we're going to say the boundary of a five dimensional ball is in some sense,\n\nthought of as a product between the interior of one and three dimensions,\n\na solid three dimensional ball and a circle.\n\nAnd what I actually mean by that is if you choose a point on that boundary, well,\n\nwhat we mean is choosing five numbers for the sum of the squares of those numbers is\n\nequal to one.\n\nAnd you could think of that as saying, first, I'm going to choose three of those numbers.\n\nAnd I'm safe to do that as long as the sum of their squares is\n\nless than one meaning point inside a three dimensional ball.\n\nAnd I have a circle's worth of options left.\n\nAnd this is a tongue in cheek equation.\n\nIt's not the case that the boundary of the ball is literally like a product,\n\na Cartesian product between your interior of a ball and a circle.\n\nBut what I'm saying is there's a volume preserving move that takes you from that boundary\n\nof a five dimensional ball onto the thing that literally is that Cartesian product.\n\nSo we might as well think of it as being that as far as\n\nvolume calculations are concerned, which is very fun.\n\nNow, in terms of our diagram, all that means is to make this night's move,\n\nyou do the same thing.\n\nYou multiply by two pi r.\n\nAnd sometimes people ask, why are you staying constant at that two pi r?\n\nEverything else is moving over.\n\nWhy does that one stay fixed?\n\nAnd the basic idea is that when you're making this Archimedean\n\nmove where you want to project out, it's important that you\n\nhave two distinct actions that are canceling each other out.\n\nOne that's stretching in one direction and the other one which is casting a shadow.\n\nSo if you tried to break down your choice of a point on the boundary of some high\n\ndimensional sphere, not as a bunch of things and then two more,\n\nbut a bunch of things and three more or four more,\n\nyou wouldn't run into that same really nice cancellation.\n\nSo every time you make this night's move in the diagram and\n\nthen you integrate to go down, it gives us one more column.\n\nAnd again, that integration, as far as the constant is concerned,\n\nup in five dimensions, it just means dividing by five.\n\nThat r fourth turns into r to the fifth and you\n\nhave that integration factor divided by five.\n\nAnd we can just keep this going on autopilot.\n\nEvery time you make one of these moves, getting into\n\nthat night's move looks like multiplying by two pi r.\n\nSo you kind of have this two pi jump up into the\n\nright and then an integration factor to get down.\n\nAnd we just fill in the whole diagram and in some sense, we're done.\n\nIn some sense, this gives you the rule that you could use to\n\ndecide on the volume of any dimensional sphere that you want.\n\nBut of course, we want a nice formula for this.\n\nWe want to come away with formula.\n\nWe want to analyze the formula.\n\nWe want to think about what it means.\n\nSo let's take a moment to see if we can write down what that should be.\n\nSo the way I'm going to do this, each one of these volumes in higher\n\ndimensions looks like some constant times r to that number of dimensions.\n\nSo for example, in one dimension, that constant is two.\n\nIn two dimensions, that constant is pi.\n\nIn three dimensions, four thirds pi, on and on and on.\n\nWhat we really want to know is what is this constant.\n\nAnd the key rule that we have is a recursive one.\n\nIt's saying if you want to know that constant in some dimension,\n\nlook two dimensions earlier.\n\nAnd it should be the same as taking that but multiplying by two pi and dividing by n.\n\nAnd that's the formulaic way of basically capturing this knight's move and integrate idea.\n\nYou take a knight's move to get up and to the right, that multiplies you by two pi.\n\nAnd then you integrate to get down, that's going to divide you by n.\n\nSo if you have this recurrence relation, it kind of tells you everything you need to know.\n\nFor example, let's say a couple months from now, you find yourself in one of your exams.\n\nFor some unbeknownst reason, your exam asks, what\n\nis the volume of an eight dimensional ball?\n\nAnd you're like, grand told me this, but I forgot.\n\nDon't worry, it's okay if you forget because all you need to know,\n\nif you want to know the volume of an eight dimensional ball,\n\nis the volume of a six dimensional ball.\n\nYou take pi divided by half the dimensions and then multiply it by that.\n\nAnd you say, ah crap, I also forget the volume of a six dimensional ball.\n\nNot a worry, not a worry at all.\n\nAll you have to remember is the volume of a four dimensional ball.\n\nYou take pi divided by half the dimension, so in this case half of six would be three,\n\npi divided by half the dimension, multiply it by that.\n\nAnd you're like, well now this is embarrassing because\n\nI also forget the volume of a four dimensional ball.\n\nBut not a worry, you go down one more, you multiply by pi divided by half the dimension.\n\nNow at this point, presumably you do know the volume of a two dimensional ball,\n\nwhich is to say the area of a circle.\n\nBut if you're a programmer at heart and you're looking at this,\n\nand you're thinking, I'm defining a recursive function.\n\nIf you ever wrote a recursive function, your base case was at n equals two,\n\nit would be very embarrassing to submit that pull request.\n\nSo looking at this diagram, it kind of screams out to you,\n\nhang on a second, maybe we should actually be venturing farther back.\n\nEven though I know the area of a circle, like should I be going one further?\n\nShould I have a base case of zero?\n\nAnd I mentioned one dimension was unloved, but like poor zero dimensions.\n\nWe didn't even think about zero dimensional geometry.\n\nAnd say, okay, what would this mean?\n\nWell, in terms of the formulas, we know what it wants us to\n\nbe saying if we want this recurrence relation to be true.\n\nThe volume of a zero dimensional unit ball should be one.\n\nAnd we're like, hang on, where are we?\n\nZero dimensions.\n\nCan't move left, can't move up, I can't move anywhere, just a point.\n\nSo a unit ball is everything, I guess.\n\nAnd the volume of everything is one.\n\nSeems reasonable.\n\nWhat's the boundary of a unit ball?\n\nLike the boundary of everything, I guess, would be nothing.\n\nSo zero, which I guess makes sense.\n\nAnd I actually once gave this talk at Stanford, and you know how at the end of talks,\n\nlike people come up for Q&amp;As, and there's always the annoying person who doesn't\n\nunderstand the Q part of Q&amp;A, and they're like, I have a thing to say.\n\nSo someone comes up, he's like, I have three points I want to say.\n\nIt was okay though, because this person was Donald Knuth.\n\nAnd he was like, in the zero dimensional case,\n\nyou can still write the program to verify the answer,\n\nbecause you just choose zero numbers and ask the probability that the sum of\n\ntheir squares is less than one, and it's probability one.\n\nI was like, yeah, touche Donald Knuth.\n\nThanks.\n\nSo point is, we've got this answer to our eight dimensional question,\n\nbut it's not hard to see how it generalizes.\n\nWe were playing this little hopscotching game going back,\n\nand you're basically multiplying pi in the numerator by half the dimensions\n\nnumber of times.\n\nAnd then that denominator, because we were always dividing by that half dimension,\n\nit's just a factorial.\n\nSo in this specific example, it's four factorial,\n\nbut more generally, it's half the number of dimensions factorial.\n\nSo we can clean things up.\n\nWe take that constant, like I was saying, it's multiplied by an r to the n,\n\nand I can tell you, wonderful.\n\nWe can use this.\n\nIt lets you hopscotch two dimensions up if you think of it as a recurrence,\n\nbut you can also just zero shot your way into whatever you want\n\nif we're going to ask this for, say, 100 dimensions.\n\nAnd I say, what a beautiful formula.\n\nAs promised, we have a beautiful formula.\n\nAnd you might say, well, hang on a second.\n\nYou're not done, because there's something kind of awkward about this formula,\n\nwhich is what's going on at all the odd numbers,\n\nbecause the denominator is asking us to take something like half factorial,\n\nor three halves factorial, or five halves factorial, which feels kind of weird,\n\nbut we shouldn't have a rule that's different for the odd number dimensions,\n\nbecause in terms of all the logic that we were applying with this Knight's move\n\nand integrate, nothing about that logic was telling us, hey,\n\nonly do this for an even number of dimensions.\n\nSo we kind of want in our souls for this to be something that applies to everything,\n\nbecause the recurrence rule applies to everything.\n\nLike if you forgot the volume of a seven-dimensional ball,\n\nand it's a crucial fact that comes up on your homework for some forsaken reason,\n\nyou could still find your way up to it.\n\nYou play this game where you keep multiplying by pi divided by half the dimension.\n\nAnd actually, in this case, I think it's kind of\n\nnicer to put that two back up in the numerator.\n\nSo if you wanted to think about what is it that takes us from,\n\nsay, a one-dimensional ball up to a three-dimensional ball,\n\nyou're multiplying that two pi, and then you're dividing by three.\n\nAnd so maybe next time you look at the volume of a sphere,\n\nyou can think about it as saying, hmm, actually it is a one-dimensional ball,\n\nbut we did that Knight's move, which is two pi and divided by three.\n\nAnd that's what gets you that four-thirds pi factor.\n\nBut you could keep going from there.\n\nTo get up to five, you multiply by another two pi and divide by five,\n\nmultiply by another two pi from there, divide by seven.\n\nAnd if you had been looking at those odd-numbered cases and thinking that the numbers\n\nwere very ugly, like for example, we have this 945 in one of the denominators.\n\nAnd initially, you see that you go, where did that number come from?\n\nHere, it's actually nice to think about.\n\nIt's like a factorial, but just where you do all the odd numbers.\n\nThat's nine times seven times five times three.\n\nAnd then the numerator always looks like a power of two times a power of pi.\n\nBut if we wanted this to all be true for our general formula,\n\nwe don't want to have one rule that we write for the even case,\n\none rule that we write for the odd case, like, I don't know,\n\nThanksgiving with divorced parents or something, where you have to make a choice.\n\nIt's nice if our parents get back together, right?\n\nLike, let's think about what would be required for this to make sense.\n\nAnd in this case, the marriage counselor just suggests looking\n\nat the n equals one case and asking what has to be true there.\n\nSo what this formula would say for n equals one would be that the volume of\n\na one-dimensional ball, which again is just a line segment,\n\nlooks like pi to the one-half, and raising to the one-half is the same as\n\ntaking a square root, divided by one-half factorial, whatever the heck that should be,\n\ntimes r.\n\nBut we do a little arrangement and we say, well,\n\nthis is kind of telling us what one-half factorial would have to be, if, you know,\n\nmom and dad are getting back together.\n\nIt would have to be square root of pi divided by two.\n\nAnd once you have that, you actually have the rest of them.\n\nBecause if you think about factorials again in a recursive way, what should it mean?\n\nLike n factorial, recursively, is defined to be n times whatever n minus one factorial is.\n\nSo what is three-halves factorial?\n\nWell, it's going to be three-halves times whatever one-half factorial is,\n\nwhich we're saying should be square root of pi over two.\n\nWhat's five-half factorials?\n\nWell, five-halves times three-halves times whatever one-half factorial should be.\n\nSo basically, if we take this one suggestion from the mathematical universe,\n\nthat one-half factorial should be square root of pi over two,\n\nour whole formula works out.\n\nAnd what's reassuring here, some of you might actually\n\nknow that there is a way to generalize the factorial.\n\nIt doesn't just generalize to half integers.\n\nIt's based on something called the gamma function.\n\nIt generalizes it to real numbers, to complex numbers.\n\nAnd if this was a much longer lecture, we could have a whole other discussion about the\n\ngamma function and how there's a completely parallel path that you could use to derive\n\nthe volumes of higher dimensional spheres that comes from basically studying Gaussian\n\ndistributions in high dimensions, where if you want to integrate them and understand\n\nwhat it looks like to integrate a Gaussian function,\n\nthere's a certain trick that you can apply.\n\nAnd that trick will give you a formula for the higher\n\ndimensional spheres in terms of the gamma function.\n\nAnd what that ends up telling us is the way that we want to extend our factorial\n\ndefinition, which is kind of like forcing this formula to be true,\n\nit actually does align with the way that it gets generalized even more broadly in a\n\ndifferent corner of math.\n\nNow, in addition to just having a beautiful formula to gawk at symbolically,\n\nI want to take a moment to look at the actual numbers behind it and\n\nplug in some amounts and see if we can interpret what's going on.\n\nSomething very strange actually happens when you do that.\n\nSo let's think about this.\n\nI'm going to draw the volume of a unit ball in all of our dimensions.\n\nSo starting with zero dimensions, no longer does zero dimension get no love,\n\nwe're going to give it the love it deserves.\n\nThat constant is one.\n\nIn one dimension, the volume of a unit ball is two.\n\nIn two dimensions, it's pi, just area of a unit circle.\n\nIn three dimensions, it's four-thirds pi.\n\nAnd all these numbers are going up.\n\nYou might be like, yeah, of course they're going up because\n\neach sphere in one dimension contains the smaller ones.\n\nSo it's getting bigger.\n\nThey should be getting bigger.\n\nUp in four dimensions, it gets bigger still.\n\nWe end up around 4.93.\n\nFive dimensions is bigger still, but it's kind of slowing down, which might give us pause.\n\nThen it gets very worrying because at six dimensions, it's smaller.\n\nLike that's weird.\n\nSeven is smaller.\n\nEight is smaller.\n\nNine is smaller still.\n\nIt starts decreasing very rapidly.\n\nLike, hang on a second.\n\nUp in, for example, 10 dimensions, that's actually smaller than the two-dimensional ball.\n\nAnd that's a little strange to interpret, to say the least.\n\nAnd so if you draw the curve for this, where we're going to fill it in not just for\n\nintegers, but for everything using the gamma function, here's what it looks like.\n\nAnd let's think about why.\n\nLike, why does it turn around?\n\nWhy does it turn around at five?\n\nThat's kind of weird.\n\nWhat's special about five dimensions?\n\nAnd then what happens as we go out towards an even higher number of dimensions?\n\nAnd the nice thing about the fact that you and I have landed here,\n\nnot because I just gave you the formula and said trust me that it's true,\n\nbut because you see where it comes from, is we can think about these questions in\n\nterms of where it came from.\n\nUltimately, it's rooted in this recurrence relation,\n\nwhere understanding what happens in one dimension, you look two dimensions earlier,\n\nand then you do that knight's move that takes you two pi,\n\nand then you do an integration, which gives you that division by n.\n\nSo every time we're stepping two units to the right in this diagram,\n\nyou're multiplying two pi divided by n, where n is kind of the x coordinate of\n\nwhere you land.\n\nSo for example, jumping from one up to three, that's two pi thirds.\n\nTwo pi is bigger than three, so that's why you're growing.\n\nFrom two up to four, you multiply by two pi over four.\n\nTwo pi is bigger than four, so you're still growing.\n\nTwo pi is bigger than five, not by as much, so you're not growing as much.\n\nFrom four to six, two pi is bigger than six, but now just barely.\n\nAnd then it's at that point that it turns around, where as you go from five up to seven,\n\nyou're taking two pi divided by seven, but now the denominator is starting to win out.\n\nAnd in fact, it starts to win out by more and more and more,\n\nbecause as you get into a higher dimension, that integration\n\nfactor is playing a bigger and bigger role, and it starts to dominate.\n\nSo if you wanted to ask why was five the biggest, basically because at that value of n,\n\nwhere the numerator and denominator are as close as they can be,\n\nwhen it's equal to six, that's straddling this number five.\n\nAnd so that's the point at which the change on this graph is going to be around zero.\n\nSo if we keep going though, what ends up being very surprising,\n\nand I think this is one of those just genuinely baffling facts about higher dimensions,\n\nis that your unit balls, they don't just get small, they get downright infinitesimal.\n\nFor example, let's take a 100 dimensional ball.\n\nUsing our formula, it looks like pi to the 50.\n\nCool, that's big, nice big number, but divided by 50 factorial,\n\nwhich is way bigger, right?\n\nBecause all of those factors of pi in the numerator on average are much,\n\nmuch smaller than the terms that you're multiplying in the denominator.\n\nAlmost all of them are much bigger than pi.\n\nNumerically, this is around 2.37 times 10 to the negative 40th.\n\nSo a ball in 100 dimensions, it's nothing.\n\nIt's just absolutely nothing.\n\nAnd this again is an empirical fact.\n\nThat question I asked at the very beginning, I said,\n\nimagine you choose 100 different random numbers, each between negative one and one,\n\nyou square them.\n\nYou want to know the probability that the sum of those squares is less than one.\n\nOn the one hand, you could say, well, it's very\n\nexpected that this should be a small number, right?\n\nBecause think about the coincidence that's required here.\n\nAll 100 of your numbers have to happen to be so small that\n\nwhen you add up all those squares, you end up less than one.\n\nAnd I'd say, I agree, that's surprising.\n\nI would have thought that smallness is taken into\n\naccount by that two to the 100 in the denominator.\n\nI would look at it and be like, well, there's the source of your smallness.\n\nThe thing that's surprising here is that it's not just the denominator\n\nthat makes it small, but the numerator is also working against you.\n\nThat numerator is a puny number as well.\n\nThis volume of higher dimensional spheres being very small and downright negligible,\n\nit actually comes up a lot.\n\nPeople who study machine learning, they have to think about quirks in higher dimensions.\n\nThis is one of them.\n\nYour balls are just puny.\n\nCryptographers, same deal.\n\nYou don't clap, you can't clap.\n\nThere's a time for clapping and that's not it.\n\nIf you study cryptography, this fact comes up a lot as well.\n\nQuantum mechanics comes up as well.\n\nAnd I think it's worth just a little moment to divert all\n\nof your attention away from the concept of puny balls.\n\nAnd instead on the question of like, why?\n\nWhere did that come from?\n\nAnd really what's happening here is the integration factor when you're dividing by that n.\n\nFor example, when you're thinking about the volume of a three-dimensional ball,\n\nyou're kind of adding together all of these shells.\n\nYou're integrating together all these things that are proportional to r squared.\n\nAnd we're saying that that effectively gives you this one third factor.\n\nIt's very similar actually, if you have, let's say like a square\n\npyramid and you think of it as being built up from a whole\n\nbunch of squares whose side lights are increasing linearly.\n\nYou know how with the pyramid, it looks like one third times its base times the height.\n\nBasically the same thing is going on here where that's where the one third comes from.\n\nAnd in general, when you're doing this in a higher number of dimensions,\n\nthat factor is getting bigger and bigger.\n\nAnd this actually relates to a distinct fact about higher dimensional spheres,\n\nwhich is also relevant in all of these fields.\n\nIf you want to get a little bit of an intuition for how distances behave.\n\nAnd this has to do with not just what the volume of a sphere is, but where that volume is.\n\nAnd it's basically almost all right next to the boundary.\n\nAnd it's not too hard to explain why.\n\nSo let's say we're in two dimensions and I want to understand how much of the area of\n\nthat circle, let's say it's a unit circle, is within a distance of like 0.01 of the\n\nboundary.\n\nIt's kind of within 1% of the boundary.\n\nWell, you could calculate that as you could say,\n\nall right, the area of the entire circle is pi r squared.\n\nAnd then if we chop out everything other than that boundary,\n\nthat would be another circle, but whose radius was scaled down by 99%.\n\nAnd if you scale that down by 99%, the area gets scaled down by its square,\n\nwhich is approximately 0.98 in this case, 0.9801.\n\nBut the idea is that 2% of the area of that circle is close to the boundary.\n\nBut circles are actually very unusual in this respect,\n\nin the scope of all of the possible spheres across all the dimensions.\n\nBecause let's think about what this would be in like some really big,\n\nlike 10,000 dimensions.\n\nSo we know the volume.\n\nIt's fun.\n\nWe have a formula for it.\n\nIt's not really the point here though.\n\nIf you wanted to play the same game of saying how much of the volume is right next to\n\nthe boundary, you can take the entire ball and then you say, let's scale it down by 99%.\n\nAnd then ask what's the volume of that smaller one.\n\nThen initially you might think it's only slightly smaller.\n\nBut in this case, when you scale it down, it's\n\nnot just getting scaled down in two directions.\n\nBy definition of what we mean being in 10,000 dimensions,\n\nit's getting scaled down in 10,000 different directions.\n\nSo the factor by which its volume decreases looks like 0.99 raised to the 10,000.\n\nThat is effectively zero.\n\nIt's 2 times 10 to the negative 44.\n\nSo this is saying, essentially all of the volume is sitting right there on that boundary.\n\nAnd this is related to what we were just looking at,\n\nwhere as you're going from the boundary to the interior,\n\nyou're making this division that becomes more and more significant.\n\nBecause if you think about it, what does it mean when we're talking\n\nabout the surface area of a sphere, of a unit sphere, is 4 pi,\n\na number that's around 12, and the interior of it is 4 thirds pi.\n\nOn the one hand, you're comparing different units.\n\nOne is an area, one's a volume.\n\nBut you could say you take that area and you multiply it just by a tiny little amount,\n\nand it's giving you a disproportionate amount of the entire sphere.\n\nSo that's actually a nice intuition to have just\n\nif you are working with high dimensional data.\n\nEssentially everything, if you're dealing with something inside a ball,\n\nis just right next to the surface, effectively right on the surface.\n\nWhile we're here, there's another fact this is kind of tied to,\n\nwhere let's say you want to know on that boundary, where is most of that boundary volume?\n\nFor example, most of the surface area of a sphere.\n\nNow in a sphere, it's nicely distributed across everything.\n\nBut if this picture was being drawn in many, many, many more dimensions,\n\nwhat ends up happening is almost all the masses at the equator.\n\nAnd the reason is tied to what we were just talking about,\n\nwhere as you scale it a little bit, because there's so many dimensions to scale in,\n\nit basically disappears.\n\nSo if you think of the circles that aren't the equator, and I say circle,\n\nthe D minus two dimensional boundaries that aren't the equator,\n\nbut are just a little bit upward or just a little bit down from it,\n\nthose ones end up becoming effectively nothing,\n\nbecause that tiny bit of scaling that's required to get just a little up or\n\njust a little down, essentially makes their volume disappear.\n\nNow the last thing I want to linger on is how,\n\nlike this idea that the size of your spheres in higher dimensions is shrinking,\n\nfeels a little bit, like it feels like it's not even a sensible comparison,\n\nbecause we're messing with different units.\n\nLike what does it mean to compare the volume of a one dimensional\n\nball to that of a two dimensional ball to a three dimensional one?\n\nBecause one is a length, one is an area, one is a volume.\n\nBecause in some literal sense, like a three dimensional ball is not\n\nsmaller or bigger than the four dimensional ball, it's just incomparable.\n\nAnd so let's try to think about what this number actually means.\n\nHow can we give kind of a unit free interpretation of it?\n\nAnd in a literal sense, I guess what we're saying is\n\nwe're really comparing it to the volume of a unit cube.\n\nThat pi for the area of a unit circle, that's basically area of a\n\ncircle as compared to the area of a square with side length one.\n\nAnd then three dimensions, what do we mean by that four thirds pi?\n\nWell, we're comparing the volume of that sphere to the volume of a unit cube.\n\nAnd so in some sense, the fact that this is getting smaller is really\n\njust telling you that up in many dimensions, the size of a cube compared\n\nto the size of a sphere ends up getting really, really disproportionate.\n\nThe cubes are huge and the spheres are small.\n\nAnd that I was thinking, actually that reminds me of that earlier puzzle.\n\nAnd in fact, there's a different visual that you can\n\nthink of for what this number is really telling you.\n\nBecause let's pull up that second puzzle that we\n\nlooked at where we had all these corner spheres.\n\nWhat if I wanted to ask how much of this diagram is\n\nrepresented in those corner spheres versus in that cube?\n\nAnd in this case, there's eight distinct corner\n\nspheres and each one of them has radius one.\n\nAnd then the cube is a two by two by two cube.\n\nSo you'd be taking eight times the volume of a\n\nunit sphere and you're dividing it by eight.\n\nSo that's just getting us back to where we are because that factor of eight cancels out.\n\nWhatever this picture looks like up in a hundred dimensions,\n\nyou've got two to the 100 corner spheres and then you've got\n\nthis big old cube that's volume two to the 100, those cancel out.\n\nAnd the fact that a 100 dimensional sphere is very small could be interpreted as saying,\n\nwhatever this diagram should be up in a hundred dimensions,\n\nthose corner spheres are basically none of it.\n\nThey're effectively none of the volume that you're looking at.\n\nAnd that kind of ties to the visual I was giving earlier,\n\nwhere the very loose heuristic for this high dimensional cube is that it's super spiky.\n\nIt's something where the distance to the edge is much,\n\nmuch smaller than the distance to the corner.\n\nAnd so all those corner spheres are basically none of your diagram.\n\nAnd so with all that, I just want to end you up with you on a very small note,\n\nwhich is that there's a lot of beautiful items that you can come across in math,\n\nbut actually recognizing that beauty sometimes requires looking at something\n\nthat was very familiar, whether that's the factorial or area of a circle,\n\nand then putting it in the context of something more general.\n\nThe beauty that underlies factorials and the beauty that underlies the volume formula for\n\na sphere is actually only visible once you've stepped back to see things general enough.\n\nOtherwise it would not at all be visible that a pie is secretly hiding\n\ninside your factorial calculations, or that there's some unifying\n\nformula sitting between your area of a circle and your volume of a sphere.\n\nSo that's all I have for you.\n\nI want to end it here.\n\nThank you everyone for coming.\n\nHi there, me again, but from the office this time.\n\nI wanted to chime in with a quick little end note,\n\npartly to talk about that very first animation I showed at the\n\nbeginning and explain what that actually is, how it relates to high dimensional spheres.\n\nBut before then, given that you are demonstrably the kind of person who watches a lecture\n\nabout high dimensional spheres, I have a suspicion that you would be a good fit for the\n\nnew experimental thing I'm doing this year, which is essentially a virtual career fair.\n\nSo take a moment to go to 3b1b.co slash talent.\n\nAnd there, what you'll find is a set of career opportunities from\n\nvarious different organizations who are interested in people like you,\n\nthe kind of people who watch these videos and the curiosity that represents,\n\nwhich tends to correlate with very technically talented people.\n\nSo for every group that you find there, I've personally\n\ntaken a chance to chat with the teams there.\n\nAnd I can tell you the people that I've met there are just clearly very smart.\n\nThey're very curious in the sense of truth seeking.\n\nA lot of them are just high agency people.\n\nThey clearly take charge of what they actually do.\n\nThey don't just wait to follow instructions.\n\nAnd if that sounds like the kind of person who you want to work alongside,\n\nI would highly encourage you to at least check it out,\n\nlisten to some of the interviews I conducted with the people there.\n\nAnd if you're looking for a new career, hopefully\n\nthis gives you a helpful new batch of considerations.\n\nSince the last video, when I very first mentioned this,\n\nthere have been actual hires made, which is pretty cool to me.\n\nSo who knows?\n\nMaybe if you go and explore the page, you'll be the next one.\n\nAll right.\n\nSo for that animation at the very, very beginning,\n\nI initially showed this circle that turns into the various lines of latitude on a\n\nsphere, a sphere in three dimensions.\n\nAnd our minds are very good at seeing that it's a three-dimensional sphere.\n\nAfter that, I basically show the same thing, same code,\n\nbut stepping it up in one dimension.\n\nI represent all of the spheres of latitude on a four-dimensional sphere.\n\nSo they're kind of a bunch of four tuples of numbers.\n\nBut if you change the perspective on that before you project down into three dimensions,\n\nyou get all of these different views of what those spheres of latitude end up looking\n\nlike, which as you rotate that hypersphere, ends up looking just very trippy.\n\nAnd I don't think this is explanatory in the sense of you look at this and you see,\n\nah, pi squared over two.\n\nBut it is very fun.\n\nSo thought I'd share that with you.\n\nAlso, if you want to see a fun application of this formula for high-dimensional\n\nsphere volumes, you might enjoy a video I did with Numberphile a couple of\n\nyears back that includes a puzzle that incorporates this into its answer.",
				"status": "completed",
				"error_message": null,
				"created_at": "2026-04-09T09:51:54.733Z",
				"updated_at": "2026-04-09T09:52:05.160Z"
			}
		],
		"total": 4,
		"next": false
	}
}
```

| 参数名 | 示例值 | 参数类型 | 参数描述 |
| --- | --- | ---- | ---- |
| code | 2000 | integer | 状态码 |
| data.list[].id | dtc-ab12cd34 | string | 播客 ID |
| data.list[].status | completed | string | 处理状态：pending/processing/completed/failed |
| data.list[].error_message | null | string | 失败原因，成功时为 null |
| data.total | 233 | integer | 总条数 |
| data.next | true | boolean | 是否有下一页 |

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Authorization | Bearer {{manager_access_token}} | string | 是 | Bearer Token，管理员 JWT |

**Query**
