# DataForge

一个基于 Web 的多格式数据转换与查询工具，支持 JSON、YAML、TOML、XML、CSV 等常见数据格式的互转、编辑和查询。

DataForge 以纯前端交互为主：你可以在浏览器里直接粘贴数据、转换格式、做路径查询、复制/下载结果，无需额外后端服务。

## 功能特性

### 格式转换
- 支持 JSON、YAML、TOML、XML、CSV 五种格式互转
- 自动检测输入数据格式
- 格式化（美化）和压缩（Minify）功能

### 数据编辑
- 代码编辑器支持语法高亮行号显示
- 树形结构可视化浏览数据
- 支持在树形视图中内联编辑节点
- 撤销/重做功能（Ctrl+Z / Ctrl+Shift+Z）

### 数据查询
- 路径查询语法（如 `.users[0].name`）
- 通配符查询支持（如 `.users[*].email`）
- 查询历史记录
- 常用查询收藏功能

### 导入导出
- 支持本地文件导入（.json, .yaml, .yml, .toml, .xml, .csv）
- 转换结果复制到剪贴板
- 下载转换后的文件
- 内置示例数据快速体验

### 用户体验
- 深色/浅色主题切换
- 响应式三栏布局，面板可调整大小
- 操作提示和错误反馈

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 6 |
| UI 库 | React 19 |
| 样式 | Tailwind CSS 4 |
| 组件库 | shadcn/ui (New York style) |
| 图标 | Lucide React |

### 核心依赖

| 依赖 | 用途 |
|------|------|
| `yaml` | YAML 解析与序列化 |
| `@iarna/toml` | TOML 解析与序列化 |
| `fast-xml-parser` | XML 解析与构建 |
| `papaparse` | CSV 解析与序列化 |
| `sonner` | Toast 通知 |
| `react-resizable-panels` | 可调整大小的面板 |

## 快速开始

### 环境要求

- Node.js 24+
- pnpm（推荐）或 npm

### 安装

```bash
# 克隆项目
git clone https://github.com/Ylemir/DataForge
cd DataForge

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 即可使用。

### 构建

```bash
# 生产构建
pnpm build

# 启动生产服务
pnpm start
```

## 项目结构

```
data-forge/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/
│   ├── data-forge/         # 应用核心组件
│   │   ├── data-forge-app.tsx   # 主应用组件
│   │   ├── code-editor.tsx      # 代码编辑器
│   │   ├── tree-view.tsx        # 树形视图
│   │   ├── query-panel.tsx      # 查询面板
│   │   ├── output-panel.tsx     # 输出面板
│   │   └── toolbar.tsx          # 工具栏
│   └── ui/                 # shadcn/ui 组件
├── hooks/                  # 自定义 Hooks
│   ├── use-clipboard.ts    # 剪贴板操作
│   ├── use-formatter.ts    # 格式化操作
│   └── use-mobile.ts       # 移动端检测
├── lib/
│   ├── data-forge/         # 核心逻辑
│   │   ├── parsers.ts      # 数据解析器
│   │   ├── types.ts        # 类型定义
│   │   └── samples.ts      # 示例数据
│   └── utils.ts            # 工具函数
└── public/                 # 静态资源
```

## 使用指南

### 基本使用

1. **输入数据**：在左侧编辑器中粘贴或输入数据
2. **选择格式**：工具栏下拉菜单选择目标格式
3. **转换输出**：右侧面板显示转换结果，可复制或下载

### 数据查询

在查询面板输入路径表达式：
- `.users[0].name` - 获取第一个用户的名称
- `.users[*].email` - 获取所有用户的邮箱
- `.metadata.total` - 获取嵌套属性

### 文件操作

- **导入**：点击工具栏"导入"按钮选择本地文件
- **导出**：点击输出面板的"复制"或"下载"按钮

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `Tab` | 编辑器中插入缩进 |

## 开发

### 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动（生产构建后）
pnpm start
```

### 代码检查

```bash
# TypeScript 类型检查
pnpm exec tsc --noEmit
```

### 代码规范

- 使用 2 空格缩进
- 单引号字符串
- 无分号
- TypeScript 严格模式
- 组件使用命名导出

## 部署

### Vercel（推荐）

1. Fork 或导入项目到 Vercel
2. 自动检测 Next.js 配置
3. 部署完成

### Docker

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install && pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 许可证

[MIT License](LICENSE)
