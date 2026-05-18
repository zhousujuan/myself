# 部署到 CentOS 服务器

这个项目是纯静态页面，只需要 Nginx 即可部署。以下示例默认服务器系统为 CentOS，站点目录为 `/var/www/trade-kg`。

## 1. 在腾讯云放通端口

在轻量云服务器控制台进入当前实例，检查防火墙/安全组：

- 放通 TCP `80` 端口，用于 HTTP 访问。
- 如果后续绑定域名并配置 HTTPS，再放通 TCP `443` 端口。

## 2. 连接服务器

在本地 PowerShell 里连接服务器：

```powershell
ssh root@159.75.236.209
```

如果你不是 `root` 用户，把 `root` 换成你的服务器用户名。

## 3. 安装 Nginx

CentOS 常用命令：

```bash
yum install -y nginx
systemctl enable nginx
systemctl start nginx
```

如果提示 `yum` 不可用，可以尝试：

```bash
dnf install -y nginx
systemctl enable nginx
systemctl start nginx
```

## 4. 上传项目文件

在服务器上创建站点目录：

```bash
mkdir -p /var/www/trade-kg
```

在本地项目目录执行上传：

```powershell
scp -r index.html trade.html resume.html data src README.md root@159.75.236.209:/var/www/trade-kg/
scp deploy/nginx-trade-kg.conf root@159.75.236.209:/etc/nginx/conf.d/trade-kg.conf
```

## 5. 启用站点

回到服务器 SSH 里执行：

```bash
nginx -t
systemctl reload nginx
```

然后访问：

```text
http://159.75.236.209
```

## 6. 后续更新

每次本地改完页面后，重新上传静态文件即可：

```powershell
scp -r index.html trade.html resume.html data src README.md root@159.75.236.209:/var/www/trade-kg/
```

## 一键部署更新脚本

项目已内置 PowerShell 部署脚本：

- `deploy/deploy.config.ps1`：服务器地址、部署目录和 Nginx 路径。
- `deploy/deploy.ps1`：本地打包、上传、服务器解压、生成 Nginx 配置并重载。

首次使用前，确认本地电脑可以通过 SSH 登录服务器。没有密码时，可以在腾讯云控制台重置密码，或给服务器配置 SSH 密钥。

只本地打包测试：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1 -PackageOnly
```

部署并更新服务器：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1
```

如果你绑定了域名，修改 `deploy/deploy.config.ps1` 里的 `$ServerName`，例如：

```powershell
$ServerName = "example.com"
```

## 绑定域名和 HTTPS

如果你要绑定域名：

1. 在域名 DNS 中添加 A 记录，指向服务器 IP。
2. 把 `deploy/nginx-trade-kg.conf` 里的 `server_name _;` 改成你的域名。
3. 按腾讯云和服务器所在地要求完成域名备案、证书申请和 HTTPS 配置。
