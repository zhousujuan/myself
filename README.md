# 周素娟的个人网站

这是一个零依赖静态个人网站，首页作为目录入口，聚合两个主要页面：

- `index.html`：个人网站首页，展示目录入口。
- `trade.html`：外贸知识库，保留原外贸获客知识图谱和 Google 获客路径。
- `resume.html`：个人简历介绍页面。
- `src/home.css`：首页样式。
- `src/styles.css`、`src/app.js`：外贸知识库样式与交互。
- `data/graph.js`、`data/google-path.js`：外贸知识库数据。

## 本地使用

直接用浏览器打开 `index.html` 即可访问首页。

## 部署

项目是纯静态页面，不需要 Node.js、数据库或后端服务。部署到 Nginx 时，确保上传以下内容：

```text
index.html
trade.html
resume.html
data/
src/
README.md
DEPLOY.md
```

也可以使用内置脚本打包或部署：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1 -PackageOnly
```

完整部署配置见 `DEPLOY.md`。
