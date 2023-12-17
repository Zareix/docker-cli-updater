#!/bin/sh

socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock &
echo "Docker socket exposed on port 2375 (process $!)"
