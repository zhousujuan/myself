# Server connection
# Production hardening tip: use a dedicated deploy user instead of root when the
# server permissions are ready.
$ServerHost = "159.75.236.209"
$ServerUser = "root"
$ServerPort = 22
$ServerName = "159.75.236.209"

# Optional SSH private key path. Leave empty to use default ssh/scp authentication.
$SshKeyPath = ""

# Remote paths
$RemoteRoot = "/www/wwwroot/trade-kg"
$RemoteArchive = "/root/trade-kg-deploy.tar.gz"

# Nginx paths on the current server
$NginxConfPath = "/www/server/panel/vhost/nginx/trade-kg.conf"
$NginxBin = "/www/server/nginx/sbin/nginx"
