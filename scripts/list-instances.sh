aws ec2 describe-instances \
--filters "Name=instance-state-name,Values=running" \
--query "Reservations[].Instances[].{Id: InstanceId, Type: InstanceType, Ip: NetworkInterfaces[].PrivateIpAddresses[].Association[].PublicIp[] | [0]}" \
--no-cli-pager