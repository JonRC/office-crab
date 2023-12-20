#!/bin/bash

-e

curl https://sh.rustup.rs -sSf | sh -s -- -y
rustup install "1.74.1"
rustup default "1.74.1"

TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`
INSTANCE_TYPE=curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/instance-type
INSTANCE_ID=curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/instance-id
TIME=`date +%s`
FILE_NAME=$INSTANCE_TYPE-$TIME.txt

./scripts/performance.sh $FILE_NAME

aws s3 cp $FILE_NAME s3://office-password/performance/$FILE_NAME --region us-east-1 --quiet

aws ec2 terminate-instances --instance-ids $INSTANCE_ID --no-cli-pager --region us-east-1