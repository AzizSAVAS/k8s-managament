@echo off
title Antigravity RKE2 Cluster Hub
cd /d "%~dp0cluster-dashboard"
start "" http://localhost:5050
node server.js
pause
