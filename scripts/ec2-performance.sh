#!/bin/bash
set -e

cd /home/ubuntu
rm -rf performance
mkdir performance
cd performance


aws s3 cp s3://office-password/bin/one_thread_per_password one_thread_per_password --region us-east-1 --quiet
aws s3 cp s3://office-password/bin/one_thread_per_batch one_thread_per_batch --region us-east-1 --quiet
aws s3 cp s3://office-password/bin/async_with_rayon async_with_rayon --region us-east-1 --quiet
aws s3 cp s3://office-password/bin/async_with_tokio async_with_tokio --region us-east-1 --quiet
aws s3 cp s3://office-password/bin/single_thread single_thread --region us-east-1 --quiet

sudo chmod +x one_thread_per_password
sudo chmod +x one_thread_per_batch
sudo chmod +x async_with_rayon
sudo chmod +x async_with_tokio
sudo chmod +x single_thread

TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_REGION
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -v "http://169.254.169.254/latest/meta-data/instance-id")
INSTANCE_TYPE=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -v "http://169.254.169.254/latest/meta-data/instance-type")
INSTANCE_ARCH=$(uname -m)
TIME=$(date +%s)
FILE_NAME="$INSTANCE_TYPE-$INSTANCE_ARCH-$TIME.txt"

echo "starting testing for $FILE_NAME"

echo "single_thread:$(./single_thread 0 100000)" >> $FILE_NAME
echo "single_thread finished"

echo "one_thread_per_password:$(./one_thread_per_password 0 100000)" >> $FILE_NAME
echo "one_thread_per_password finished"

echo "one_thread_per_batch:$(./one_thread_per_batch 0 100000)" >> $FILE_NAME
echo "one_thread_per_batch finished"

echo "async_with_rayon:$(./async_with_rayon 0 100000)" >> $FILE_NAME
echo "async_with_rayon finished"

echo "async_with_tokio:$(./async_with_tokio 0 100000)" >> $FILE_NAME
echo "async_with_tokio finished"


aws s3 cp $FILE_NAME s3://office-password/performance/$FILE_NAME --region us-east-1 --quiet

# aws ec2 terminate-instances --instance-ids $INSTANCE_ID --no-cli-pager --region us-east-1