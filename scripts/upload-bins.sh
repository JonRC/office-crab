#!/bin/bash

-e

cargo build --release
aws s3 cp target/release/one_thread_per_password s3://office-password/bin/one_thread_per_password --region us-east-1 --quiet
aws s3 cp target/release/one_thread_per_batch s3://office-password/bin/one_thread_per_batch --region us-east-1 --quiet
aws s3 cp target/release/async_with_rayon s3://office-password/bin/async_with_rayon --region us-east-1 --quiet
aws s3 cp target/release/async_with_tokio s3://office-password/bin/async_with_tokio --region us-east-1 --quiet
aws s3 cp target/release/single_thread s3://office-password/bin/single_thread --region us-east-1 --quiet

echo "Finished uploading binaries"