# Scoreboard App

## Backend installation

This app use MQTT.

```
sudo apt-get install -y mosquitto mosquitto-clients
```

Create file and write this

```
student: la-fleur-en-bouquet-fane
frontend: et-jamais-ne-renaît
```

Execute this, the file will be encrypted.

```
mosquitto_passwd -U p.txt

$ sudo cp p.txt /etc/mosquitto/passwd
```

```
$ cat /etc/mosquitto/conf.d/score.conf
allow_anonymous false
port 1883

listener 9001
protocol websockets
password_file /etc/mosquitto/passwd
```

### Configure iptables

```
iptables -I INPUT -p tcp -m tcp --dport 9001 -j ACCEPT
iptables -I INPUT -p tcp -m tcp --dport 1883 -j ACCEPT
```

Or use UFW

```
sudo ufw allow 9001
sudo ufw allow 1883
```

## Configure NGINX

To configure NGINX, you need to install certbot. Then run `letsencrypt` to get a certificate.

### Backend

```nginx
server {
    root /srv/scoreboard.chevallier.io;
    index index.html;
    server_name scoreboard.chevallier.io;
    location / {
            try_files $uri $uri/ =404;
    }
    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/scoreboard.chevallier.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/scoreboard.chevallier.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = scoreboard.chevallier.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    server_name scoreboard.chevallier.io;
    listen 80;
    listen [::]:80;
    return 404; # managed by Certbot
}
```

### Websocket

```nginx
upstream mqtt.chevallier.io {
  server localhost:9001;
}
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
server {
  # listen on both hosts
  server_name mqtt.chevallier.io;

  location / {
     proxy_http_version 1.1;
     proxy_pass http://localhost:9001;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
     proxy_set_header Host $host;
  }

  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/mqtt.chevallier.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mqtt.chevallier.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
  if ($host = mqtt.chevallier.io) {
    return 301 https://$host$request_uri;
  } # managed by Certbot


  server_name mqtt.chevallier.io;
  listen 80;
  return 404; # managed by Certbot

}
```