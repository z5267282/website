#!/usr/bin/env dash

# run in root-level of frontend folder
# go back to root-level of website
cd ..

[ -d content] && rm -rf content
mkdir content
curl -fL https://github.com/z5267282/content/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=1 -C content
