# chenyang 斗地主 (Fight the Landlord)

一个基于 React + Tailwind CSS + Framer Motion 开发的专业级“斗地主”扑克游戏。

## 功能特点

- **正宗规则**：采用 52 张牌玩法（不含大小王），地主 20 张，农民 16 张。
- **智能 AI**：内置自动出牌逻辑，支持多种牌型识别。
- **推荐出牌**：玩家回合支持“提示”功能，自动寻找最优解。
- **精美 UI**：对角线对称纸牌设计，丝滑的动画效果。
- **响应式设计**：适配手机与电脑端。

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

## 部署到 Vercel

本项目已配置 `vercel.json`，可直接导入 Vercel 部署。

1. 将代码推送到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 框架预设选择 **Vite**。
4. 点击 **Deploy** 即可。
