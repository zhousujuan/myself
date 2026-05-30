# 部署到 Nginx 服务器

这个项目是纯静态页面，只需要 Nginx。当前部署脚本的服务器、目录和 Nginx 路径统一从 `deploy/deploy.config.ps1` 读取。

## 1. 修改部署配置

先确认 `deploy/deploy.config.ps1`：

```powershell
$ServerHost = "159.75.236.209"
$ServerUser = "root"
$ServerPort = 22
$ServerName = "159.75.236.209"

$RemoteRoot = "/www/wwwroot/trade-kg"
$RemoteArchive = "/root/trade-kg-deploy.tar.gz"
$NginxConfPath = "/www/server/panel/vhost/nginx/trade-kg.conf"
$NginxBin = "/www/server/nginx/sbin/nginx"
```

如果绑定域名，把 `$ServerName` 改成域名；如果不使用宝塔面板，把 `$RemoteRoot`、`$NginxConfPath` 和 `$NginxBin` 改成你的服务器实际路径。

生产环境建议使用非 `root` 用户，并给该用户配置站点目录和 Nginx reload 权限。

## 2. 确认服务器端口

在云服务器安全组 / 防火墙中放通：

- TCP `80`：HTTP 访问。
- TCP `443`：后续启用 HTTPS 时使用。

## 3. 本地打包测试

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1 -PackageOnly
```

执行后会生成 `trade-kg-deploy.tar.gz`，该产物已加入 `.gitignore`，不需要提交。

打包前脚本会自动执行 `deploy/build-home.ps1`，把 `src/home.template.html`、`src/page.template.html` 和 `src/home-sections/` 合成为最终的首页与子页面。

## 4. 一键部署

确认本地能 SSH 登录服务器后执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1
```

脚本会完成：

1. 根据模板和片段合成 `index.html`、`advantage.html`、`capability.html`、`evidence.html`、`workflow.html`。
2. 打包首页、子页面、`trade.html`、`resume.html`、运行所需 CSS / JS 和文档文件。
3. 上传压缩包到 `$RemoteArchive`。
4. 解压到 `$RemoteRoot`。
5. 写入 Nginx 配置到 `$NginxConfPath`。
6. 执行 `nginx -t` 并 reload。

部署完成后访问：

```text
http://159.75.236.209
```

如果配置了域名，则访问 `http://你的域名` 或后续 HTTPS 地址。

## 5. 手动部署参考

如果不用脚本，手动上传核心文件即可：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\build-home.ps1
scp -r index.html advantage.html capability.html evidence.html workflow.html trade.html resume.html src/home.css src/home-particles.js src/trade.css src/trade.js README.md DEPLOY.md root@159.75.236.209:/www/wwwroot/trade-kg/
```

然后在服务器上测试并重载 Nginx：

```bash
/www/server/nginx/sbin/nginx -t
/www/server/nginx/sbin/nginx -s reload
```

## 6. HTTPS 与域名

绑定域名时：

1. 在 DNS 中添加 A 记录指向服务器 IP。
2. 把 `deploy/deploy.config.ps1` 里的 `$ServerName` 改成域名。
3. 按云厂商和服务器面板要求申请证书并开启 HTTPS。
