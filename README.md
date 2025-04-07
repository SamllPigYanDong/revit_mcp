# 🏗️ Revit MCP Server

A Model Context Protocol server for Revit integration, enabling seamless communication between Claude AI and Autodesk Revit.

[English](./README.md) | [中文](./README.zh-CN.md)

## 🎯 Overview

This TypeScript-based MCP server provides a bridge between Claude AI and Revit, allowing direct interaction with Revit models through a WebSocket connection. It implements the Model Context Protocol to enable:

- ⚡ Real-time access to Revit model information
- 🔍 Element querying and filtering
- 👀 View and level management
- 🛡️ Robust error handling with fallback mock data

## ✨ Features

### 🔌 Revit Integration
- 📡 WebSocket-based communication with Revit plugin
- 🔄 Real-time model data access
- 🔁 Graceful fallback to mock data when connection fails
- ⚙️ Configurable connection settings via environment variables

### 🚀 Core Functionalities
- **📊 Model Information**
  - Access basic model metadata (name, path, version)
  - Get element counts and last modification date
  - Real-time model state synchronization

- **🏗️ Element Management**
  - Query elements with flexible filtering
  - Access element properties and geometry
  - Batch element operations

- **🎪 View & Level Control**
  - List all available views
  - Access level information
  - Navigate through model hierarchy

## 💻 Development

### 📋 Prerequisites
- Node.js (v14 or higher)
- npm
- Autodesk Revit (2023 or later)
- Revit WebSocket Plugin (companion plugin)

### 🔧 Installation

Install dependencies:
```bash
npm install
```
Build the server:

```bash
npm run build
 ```

For development with auto-rebuild:

```bash
npm run watch
 ```

### ⚙️ Configuration
The server can be configured using environment variables:

```plaintext
REVIT_HOST=127.0.0.1    # Revit plugin WebSocket host
REVIT_PORT=8080         # Revit plugin WebSocket port
 ```

## 🔗 Integration with Claude Desktop
Add the server configuration to Claude Desktop:

Windows:

```bash
%APPDATA%/Claude/claude_desktop_config.json
 ```

Configuration format:

```json
{
  "mcpServers": {
    "revit-mcp-server": {
      "command": "D:/path/to/revit-mcp-server/build/index.js"
    }
  }
}
 ```

### 🐛 Debugging


For debugging the MCP communication:

1. Use the built-in MCP Inspector:
```bash
npm run inspector
 ```

2. Monitor WebSocket communication with Revit plugin
3. Check server logs for connection and operation status
## ⚠️ Error Handling
The server implements robust error handling:

- Automatic fallback to mock data when Revit connection fails
- Detailed error logging
- Graceful connection recovery
## 📄 License
MIT License

## 🤝 Contributing
Contributions are welcome! Please feel free to submit pull requests.

## 📬 Contact

If you have any questions or suggestions, feel free to reach out:

- 📧 Email: 353554036@qq.com
- 💬 WeChat  Account: modian4500

