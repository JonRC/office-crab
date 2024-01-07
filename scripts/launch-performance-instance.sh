#!/bin/bash

INSTANCE_TYPE=$1
ARCH=$2

cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"

if [ -z "$INSTANCE_TYPE" ]
then
  echo "Please provide an instance type"
  exit 1
fi

if [ "$ARCH" != "x86" ] && [ "$ARCH" != "arm" ]
then
  echo "Please provide a valid architecture (x86 or arm)"
  exit 1
fi

if [ "$ARCH" == "x86" ]
then
  INSTANCE_IMAGE="ami-0c7217cdde317cfec" #Ubuntu 20.04
fi

if [ "$ARCH" == "arm" ]
then
  INSTANCE_IMAGE="ami-02cd6549baea35b55"
fi

aws ec2 run-instances \
  --image-id $INSTANCE_IMAGE \
  --instance-type $INSTANCE_TYPE \
  --key-name office-password \
  --iam-instance-profile Arn="arn:aws:iam::810375230537:instance-profile/ec2-office-password-role" \
  --user-data file://$SCRIPT_DIR/ec2-performance.sh \
  --no-cli-pager \
  > /dev/null