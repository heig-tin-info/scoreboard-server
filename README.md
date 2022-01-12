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
listener 1883

listener 9001
protocol websockets
password_file /etc/mosquitto/passwd
```

### Configure iptables

```
iptables -I INPUT -p tcp -m tcp --dport 9001 -j ACCEPT
iptables -I INPUT -p tcp -m tcp --dport 1883 -j ACCEPT
```