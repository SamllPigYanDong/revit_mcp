# 🏗️ Revit MCP 服务器

Revit 集成的模型上下文协议服务器，实现 Claude AI 与 Autodesk Revit 之间的无缝通信。

[English](./README.md) | [中文](./README.zh-CN.md)

## 🎯 概述

这是一个基于 TypeScript 的 MCP 服务器，通过 WebSocket 连接在 Claude AI 和 Revit 之间建立桥梁，实现与 Revit 模型的直接交互。它实现了模型上下文协议，提供以下功能：

- ⚡ 实时访问 Revit 模型信息
- 🔍 元素查询和过滤
- 👀 视图和楼层管理
- 🛡️ 具备模拟数据回退机制的错误处理

## ✨ 特性

### 🔌 Revit 集成
- 📡 基于 WebSocket 的插件通信
- 🔄 实时模型数据访问
- 🔁 连接失败时优雅回退到模拟数据
- ⚙️ 通过环境变量配置连接设置

### 🚀 核心功能
- **📊 模型信息**
  - 访问基本模型元数据（名称、路径、版本）
  - 获取元素数量和最后修改日期
  - 实时模型状态同步

- **🏗️ 元素管理**
  - 灵活的元素查询过滤
  - 访问元素属性和几何信息
  - 批量元素操作

- **🎪 视图与楼层控制**
  - 列出所有可用视图
  - 访问楼层信息
  - 导航模型层次结构

## 💻 开发

### 📋 前置要求
- Node.js (v14 或更高版本)
- npm
- Autodesk Revit (2023 或更高版本)
- Revit WebSocket 插件（配套插件）

### 🔧 安装

安装依赖：
```bash
npm install

构建服务器：

```bash
npm run build
 ```

用于开发的自动重构建：

```bash
npm run watch
 ```

### ⚙️ 配置
服务器可以通过环境变量进行配置：

```plaintext
REVIT_HOST=127.0.0.1    # Revit 插件 WebSocket 主机
REVIT_PORT=8080         # Revit 插件 WebSocket 端口
 ```

## 🔗 Claude Desktop 集成
将服务器配置添加到 Claude Desktop：

Windows：

```bash
%APPDATA%/Claude/claude_desktop_config.json
```

配置格式：

```json
{
  "mcpServers": {
    "revit-mcp-server": {
      "command": "D:/path/to/revit-mcp-server/build/index.js"
    }
  }
}
```

### 🐛 调试
MCP 通信调试：

1. 使用内置的 MCP 检查器：
```bash
npm run inspector
 ```

2. 监控与 Revit 插件的 WebSocket 通信
3. 检查服务器日志以了解连接和操作状态
## ⚠️ 错误处理
服务器实现了健壮的错误处理机制：

- Revit 连接失败时自动回退到模拟数据
- 详细的错误日志记录
- 优雅的连接恢复机制
## 📄 许可证
MIT 许可证

## 🤝 贡献
欢迎贡献！请随时提交拉取请求。

## 📬 联系方式

如果您有任何问题或建议，欢迎通过以下方式联系我们：

- 📧 Email: 353554036@qq.com
- 💬 微信号: modian4500
