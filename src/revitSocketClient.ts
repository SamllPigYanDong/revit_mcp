import * as net from 'net';
import { GetElementsArgs, RevitModelInfo, RevitElement } from './types.js';

export class RevitSocketClient {
  private socket: net.Socket | null = null;
  private isConnected = false;
  private pendingRequests = new Map<string, { 
    resolve: (value: any) => void, 
    reject: (reason: any) => void 
  }>();
  private reconnectInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private buffer = '';

  constructor(private host: string = '127.0.0.1', private port: number = 8080) {}

  /**
   * 连接到 Revit Socket 服务器
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        console.error(`[Revit Socket] 正在连接到 ${this.host}:${this.port}...`);
        this.socket = new net.Socket();

        this.socket.on('connect', () => {
          console.error('[Revit Socket] 连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
          resolve();
        });

        this.socket.on('data', (data: Buffer) => {
          try {
            // 将接收到的数据添加到缓冲区
            this.buffer += data.toString();
            
            // 尝试解析完整的 JSON 响应
            try {
              const response = JSON.parse(this.buffer);
              this.buffer = ''; // 清空缓冲区
              
              // 处理响应
              if (response.error) {
                // 如果响应包含错误，找到对应的请求并拒绝
                const pendingRequestIds = Array.from(this.pendingRequests.keys());
                if (pendingRequestIds.length > 0) {
                  const id = pendingRequestIds[0]; // 取第一个待处理请求
                  const { reject } = this.pendingRequests.get(id)!;
                  this.pendingRequests.delete(id);
                  reject(new Error(response.error));
                }
              } else {
                // 如果响应成功，找到对应的请求并解析
                const pendingRequestIds = Array.from(this.pendingRequests.keys());
                if (pendingRequestIds.length > 0) {
                  const id = pendingRequestIds[0]; // 取第一个待处理请求
                  const { resolve } = this.pendingRequests.get(id)!;
                  this.pendingRequests.delete(id);
                  resolve(response);
                }
              }
            } catch (e) {
              // 如果解析失败，说明数据不完整，继续等待更多数据
            }
          } catch (error) {
            console.error('[Revit Socket] 消息解析错误:', error);
          }
        });

        this.socket.on('error', (error: Error) => {
          console.error('[Revit Socket] 连接错误:', error);
          if (!this.isConnected) {
            reject(error);
          }
        });

        this.socket.on('close', () => {
          console.error('[Revit Socket] 连接关闭');
          this.isConnected = false;
          this.attemptReconnect();
        });

        // 连接到服务器
        this.socket.connect(this.port, this.host);
      } catch (error) {
        console.error('[Revit Socket] 初始化错误:', error);
        reject(error);
      }
    });
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (this.reconnectInterval || this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    this.reconnectInterval = setInterval(() => {
      if (this.isConnected) {
        clearInterval(this.reconnectInterval!);
        this.reconnectInterval = null;
        return;
      }

      this.reconnectAttempts++;
      console.error(`[Revit Socket] 尝试重新连接 (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
      
      this.connect().catch(() => {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
          console.error('[Revit Socket] 达到最大重连次数，停止重连');
          clearInterval(this.reconnectInterval!);
          this.reconnectInterval = null;
        }
      });
    }, 5000); // 每5秒尝试重连一次
  }

  /**
   * 关闭连接
   */
  public async disconnect(): Promise<void> {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.socket && this.isConnected) {
      this.socket.destroy();
      this.isConnected = false;
    }
  }

  /**
   * 发送请求到 Revit 插件并等待响应
   */
  private async sendRequest<T>(command: string, args: any = {}): Promise<T> {
    if (!this.isConnected || !this.socket) {
      await this.connect();
    }

    return new Promise<T>((resolve, reject) => {
      try {
        const id = Date.now().toString();
        const request = {
          command,
          args
        };

        this.pendingRequests.set(id, { resolve, reject });
        
        // 设置超时
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error(`请求超时: ${command}`));
          }
        }, 30000); // 30秒超时

        this.socket!.write(JSON.stringify(request));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取 Revit 模型信息
   */
  public async getModelInfo(): Promise<RevitModelInfo> {
    const response = await this.sendRequest<any>('getModelInfo', {});
    return {
      name: response.name,
      path: response.path,
      version: response.version,
      elements_count: response.elements_count,
      last_modified: response.last_modified
    };
  }

  /**
   * 根据条件查询 Revit 元素
   */
  public async getElements(args: GetElementsArgs): Promise<RevitElement[]> {
    const response = await this.sendRequest<RevitElement[]>('get_elements', args);
    return response;
  }

  /**
   * 获取所有楼层
   */
  public async getLevels(sortByElevation: boolean = true): Promise<any[]> {
    const response = await this.sendRequest<any[]>('get_levels', {  });
    return response;
  }

  /**
   * 获取所有视图
   */
  public async getViews(): Promise<any[]> {
    const response = await this.sendRequest<any[]>('get_views', {});
    return response;
  }
}