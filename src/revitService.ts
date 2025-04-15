import { RevitModelInfo, RevitElement, GetElementsArgs,GetElementInfoArgs } from './types.js';
import { RevitSocketClient } from './revitSocketClient.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 从环境变量获取 Socket 连接信息，默认为 localhost:8080
const REVIT_HOST = process.env.REVIT_HOST || '127.0.0.1';
const REVIT_PORT = parseInt(process.env.REVIT_PORT || '8080', 10);

// 模拟 Revit 模型数据 (仅在无法连接到 Revit 插件时使用)
const mockModelInfo: RevitModelInfo = {
  name: "Office Building.rvt",
  path: "C:\\Projects\\Office Building.rvt",
  version: "2023",
  elements_count: 5243,
  last_modified: new Date().toISOString()
};


export class RevitService {
  private client: RevitSocketClient;
  private useMockData: boolean = false;

  constructor() {
    this.client = new RevitSocketClient(REVIT_HOST, REVIT_PORT);
    
    // 尝试连接到 Revit 插件
    this.client.connect().catch(error => {
      console.error('[RevitService] 无法连接到 Revit 插件，将使用模拟数据:', error);
      this.useMockData = true;
    });
  }

  /**
   * 获取当前 Revit 模型信息
   */
  async getModelInfo(): Promise<RevitModelInfo> {
   

    try {
      return await this.client.getModelInfo();
    } catch (error) {
      console.error('[RevitService] 获取模型信息失败，使用模拟数据:', error);
      this.useMockData = true;
      return mockModelInfo;
    }
  }

  /**
   * 根据条件查询 Revit 元素
   */
  async getElements(args: GetElementsArgs): Promise<RevitElement[]> {
    

    try {
      return await this.client.getElements(args);
    } catch (error) {
      console.error('[RevitService] 获取元素失败，使用模拟数据:', error);
      throw error; // 不使用模拟数据，直接抛出错误
    }
  }

  async getElementInfo(args: GetElementInfoArgs): Promise<any> {
    try {
      return await this.client.getElementInfo(args);
    } catch (error) {
      console.error('[RevitService] 获取元素信息失败:', error);
      throw error;
    }
  }

  

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (!this.useMockData) {
      await this.client.disconnect();
    }
  }

  /**
   * 获取所有楼层
   */
  async getLevels(): Promise<any[]> {
    try {
      return await this.client.getLevels();
    } catch (error) {
      console.error('[RevitService] 获取楼层失败，使用模拟数据:', error);
      throw error; // 不使用模拟数据，直接抛出错误
    }
  }

  /**
   * 获取所有视图
   */
  async getViews(): Promise<any[]> {
    try {
      return await this.client.getViews();
    } catch (error) {
      console.error('[RevitService] 获取视图失败:', error);
      throw error; // 不使用模拟数据，直接抛出错误
    }
  }

  /**
   * 获取所有类别
   */
  async getCategories(): Promise<any[]> {
    try {
      return await this.client.getCategories();
    } catch (error) {
      console.error('[RevitService] 获取类别失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有族
   */
  async getFamilies(): Promise<any[]> {
    try {
      return await this.client.getFamilies();
    } catch (error) {
      console.error('[RevitService] 获取族失败:', error);
      throw error;
    }
  }
}