#!/usr/bin/bash

echo "Launching wrench-daemon..."
wrench-daemon --num-commports 50000 &

echo "Launching uvicorn..."
uvicorn src.main:app --host 0.0.0.0 --port 8081 




