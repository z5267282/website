#!/bin/sh

# run in root-level of frontend folder
# stop at the first failing step
set -e

# go to the parser crate
cd ../parser

# compile to WASI so the parser can run under node with file access
# --target controls the type of binary that is built
# wasm32-wasip1 has access to std::fs compared to browser target which cannot access files
cargo build --release --target wasm32-wasip1

# copy the module into the frontend, where parse-content.mjs loads it from
mkdir -p ../frontend/bin
cp target/wasm32-wasip1/release/parser.wasm ../frontend/bin/parser.wasm
