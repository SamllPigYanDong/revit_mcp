export interface RevitModelInfo {
  name: string;
  path: string;
  version: string;
  elements_count: number;
  last_modified: string;
}

export interface RevitElement {
  id: string;
  category: string;
  family: string;
  type: string;
  name: string;
  level: string;
  parameters: Record<string, any>;
}

export interface GetElementsArgs {
  category?: string;
  family?: string;
  type?: string;
  level?: string;
  limit?: number;
}

// 类型守卫，用于验证查询参数
export function isValidElementsArgs(args: any): args is GetElementsArgs {
  return (
    typeof args === "object" && 
    args !== null && 
    (args.category === undefined || typeof args.category === "string") &&
    (args.family === undefined || typeof args.family === "string") &&
    (args.type === undefined || typeof args.type === "string") &&
    (args.level === undefined || typeof args.level === "string") &&
    (args.limit === undefined || typeof args.limit === "number")
  );
}