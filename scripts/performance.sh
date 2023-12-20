#!/bin/bash
-e # Exit on error

FILE_NAME=${1:-local.txt}

rm -f $FILE_NAME
touch $FILE_NAME

cargo build --release

echo "Running tests for $FILE_NAME"

echo "single_thread:$(./target/release/single_thread 0 5000)" >> $FILE_NAME
echo "one_thread_per_password:$(./target/release/one_thread_per_password 0 5000)" >> $FILE_NAME
echo "one_thread_per_batch:$(./target/release/one_thread_per_batch 0 5000)" >> $FILE_NAME
echo "async_with_rayon:$(./target/release/async_with_rayon 0 5000)" >> $FILE_NAME
echo "async_with_tokio:$(./target/release/async_with_tokio 0 5000)" >> $FILE_NAME