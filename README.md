# 周素娟的个人网站

一个零构建的静态个人作品集，首页聚合简历、项目证据和外贸知识库。浏览器直接打开即可运行，也可以部署到 Nginx。

## 核心页面

- `index.html`：个人作品集首页，突出 AI 原生产品经理定位、AI 应用设计、全栈原型开发和项目交付能力。
- `advantage.html`：个人定位和三句记忆点页面。
- `capability.html`：能力矩阵页面。
- `evidence.html`：项目证据链页面。
- `workflow.html`：AI 产品工作流页面。
- `resume.html`：简历展示页，偏打印 / PDF 视觉。
- `trade.html`：外贸获客与触达知识库，内容主体与页面结构。
- `src/home.template.html`：首页外壳模板，通过 include 标记引用各模块。
- `src/home-sections/`：首页模块片段，按 hero、优势、能力、项目证据、工作流拆分维护。
- `src/trade.css`、`src/trade.js`：外贸知识库样式与交互。
- `src/home.css`、`src/home-particles.js`：首页样式与粒子背景。
- `deploy/`：Nginx 配置和 PowerShell 部署脚本。

## 本地使用

直接用浏览器打开 `index.html`。如果需要检查外贸知识库，可以打开 `trade.html`。

首页和四个子页面都由静态片段生成。修改 `src/home-sections/`、`src/home.template.html` 或 `src/page.template.html` 后，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\build-home.ps1
```

脚本会重新生成 `index.html`、`advantage.html`、`capability.html`、`evidence.html` 和 `workflow.html`。

## 部署

项目不需要 Node.js、数据库或后端服务。部署到 Nginx 时上传以下内容：

```text
index.html
advantage.html
capability.html
evidence.html
workflow.html
trade.html
resume.html
src/home.css
src/home-particles.js
src/trade.css
src/trade.js
README.md
DEPLOY.md
```

也可以使用内置脚本打包或部署：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1 -PackageOnly
```

部署脚本会先自动合成首页，再打包运行文件。完整部署配置见 `DEPLOY.md`。实际服务器、目录和 Nginx 路径以 `deploy/deploy.config.ps1` 为准。
