import * as R from "ramda";

import {
  EC2Client,
  DescribeInstanceTypesCommand,
  _InstanceType,
  PricingDetail,
} from "@aws-sdk/client-ec2";

const client = new EC2Client({ region: "us-east-1" });

export const describeInstanceType = R.memoizeWith(
  String,
  async (instanceType: string) => {
    if (!isInstanceType(instanceType)) return null;

    const command = new DescribeInstanceTypesCommand({
      InstanceTypes: [instanceType],
    });

    const response = await client.send(command);

    const instanceInfo = response.InstanceTypes?.[0];

    if (!instanceInfo) return null;

    return instanceInfo;
  }
);

export const isInstanceType = (value: string): value is _InstanceType =>
  Object.values(_InstanceType).includes(value as _InstanceType);
