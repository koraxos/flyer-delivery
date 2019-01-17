killall node
rm app.log
nohup node app.js > app.log &
exit 0
