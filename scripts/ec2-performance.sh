#!/bin/bash

echo "Starting user data script"

FROM=0
TO=100000

#Installing zip
apt-get update
apt-get install zip curl -y

HAS_AWS=$(which aws)
ARCH=$(uname -m)

set -e

if [ -z "$HAS_AWS" ] 
then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-$ARCH.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
fi

#Work directory
cd /home/ubuntu
sudo rm -rf performance
mkdir performance
cd performance

#Downloading binaries
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

#Getting instance metadata
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -v "http://169.254.169.254/latest/meta-data/instance-id")
INSTANCE_TYPE=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -v "http://169.254.169.254/latest/meta-data/instance-type")
REGION=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -v "http://169.254.169.254/latest/meta-data/placement/availability-zone" | sed 's/\(.*\)[a-z]/\1/')
TIME=$(date +%s)



FILE_NAME="$INSTANCE_TYPE-$ARCH-$FROM-$TO-$TIME.txt"


#Running tests
echo "starting testing for $FILE_NAME"

echo "single_thread:$(sudo ./single_thread $FROM $TO)" >> $FILE_NAME
echo "single_thread finished"

echo "one_thread_per_password:$(sudo ./one_thread_per_password $FROM $TO)" >> $FILE_NAME
echo "one_thread_per_password finished"

echo "one_thread_per_batch:$(sudo ./one_thread_per_batch $FROM $TO)" >> $FILE_NAME
echo "one_thread_per_batch finished"

echo "async_with_rayon:$(sudo ./async_with_rayon $FROM $TO)" >> $FILE_NAME
echo "async_with_rayon finished"

echo "async_with_tokio:$(sudo ./async_with_tokio $FROM $TO)" >> $FILE_NAME
echo "async_with_tokio finished"


aws s3 cp $FILE_NAME s3://office-password/performance/$FILE_NAME --region us-east-1 --quiet

aws ec2 terminate-instances --instance-ids $INSTANCE_ID --no-cli-pager --region $REGION