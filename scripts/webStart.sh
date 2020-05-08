#!/bin/bash

APP_DIR=$(cd `dirname $0`/../; pwd)
echo "$APP_DIR"
cd $APP_DIR
npm i


nohup npm start 2>&1& echo $! > $APP_DIR/configs/node.pid
echo "start web ok"

