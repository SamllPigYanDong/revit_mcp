#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { RevitService } from "./revitService.js";
import { isValidElementsArgs } from "./types.js";

dotenv.config();

class RevitMcpServer {
  private server: Server;
  private revitService: RevitService;

  constructor() {
    this.server = new Server({
      name: "revit-mcp-server",
      version: "0.1.0"
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });


    this.revitService = new RevitService();

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    console.error("[RevitMcpServer] 正在关闭服务...");
    //await this.revitService.close();
    await this.server.close();
    console.error("[RevitMcpServer] 服务已关闭");
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    // 保持原有的资源处理程序不变
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: [{
          uri: "revit://current/model-info",
          name: "当前 Revit 模型信息",
          mimeType: "application/json",
          description: "提供当前打开的 Revit 模型的基本信息，包括名称、路径、版本和元素数量"
        }]
      })
    );

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        if (request.params.uri !== "revit://current/model-info") {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `未知资源: ${request.params.uri}`
          );
        }

        try {
          const modelInfo = await this.revitService.getModelInfo();
          //const modelInfo = '';
          return {
            contents: [{
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(modelInfo, null, 2)
            }]
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Revit API 错误: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [{
          name: "get_categories",
          description: "获取 Revit 模型中的所有类别",
          inputSchema: {
            type: "object",
            properties: {}
          }
        }, {
          name: "get_families",
          description: "获取 Revit 模型中的所有族",
          inputSchema: {
            type: "object",
            properties: {
              categoryId: {
                type: "string",
                description: "族类别 ID（可选）"
              },
              name: {
                type: "string",
                description: "族名称过滤（可选）"
              }
            }
          }
        }, {
          name: "get_elements",
          description: "获取 Revit 模型中的元素",
          inputSchema: {
            type: "object",
            properties: {
              categoryIds: {
                type: "array",
                description: "需要获取的元素所属类别的Id集合"
              },
              viewIds: {
                type: "array",
                description: "需要获取的元素所处的视图的Id集合"
              },
              levelIds: {
                type: "array",
                description: "需要获取的元素所处的标高的Id集合"
              }
            }
          }
        },
        {
          name: "get_levels",
          description: "获取 Revit 模型中的所有楼层",
          inputSchema: {
            type: "object",
            properties: {}
          }
        }, {
          name: "get_views",
          description: "获取 Revit 模型中的所有视图",
          inputSchema: {
            type: "object",
            properties: {}
          }
        }, {
          name: "get_element_info",
          description: "获取 Revit 元素的详细信息",
          inputSchema: {
            type: "object",
            properties: {
              elementId: {
                type: "string",
                description: "元素的 ID"
              },
              getItemPropertyInfo: {
                type: "boolean",
                description: "是否获取元素属性信息",
                default: true
              },
              getItemParameterInfo: {
                type: "boolean",
                description: "是否获取元素参数信息",
                default: false
              }
            },
            required: ["elementId"]
          }
        }]
      })
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        // 获取工具名称
        const toolName = request.params.name;

        // 将工具名称转换为 camelCase 方法名
        const methodName = toolName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        // 检查 RevitService 是否有对应的方法
        if (typeof (this.revitService as any)[methodName] !== 'function') {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `未知工具: ${toolName}`
          );
        }

        try {
          // 动态调用对应的方法
          const result = await (this.revitService as any)[methodName](request.params.arguments || {});
          //const result = '';
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Revit API 错误: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true,
          }
        }
      }
    );
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // 以避免干扰在 stdout 上发生的 MCP 通信
    console.error("Revit MCP 服务器正在通过 stdio 运行");
  }
}

const server = new RevitMcpServer();
server.run().catch(console.error);