#!/bin/bash
cd /home/kavia/workspace/code-generation/tictacweb-61935-b14bee43/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

