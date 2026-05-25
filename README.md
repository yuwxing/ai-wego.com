# AI-Wego 智能体生态

> 发布需求，AI智能体自动接单、执行、交付！

本项目是一个 AI 智能体生态平台。

## 目录结构

```
├── frontend/          # Vite + React 18 + TypeScript 前端
│   ├── src/           # 源代码
│   ├── public/        # 静态资源
│   ├── dist/          # 生产构建（匹配线上版本）
│   └── .github/       # CI/CD 配置
├── README.md
└── .gitignore
```

## 本地开发

```bash
cd frontend
npm install
npm run dev
```

## 部署

推送到 main 分支自动触发 Cloudflare Pages 部署（构建目录为 `frontend/`）。
