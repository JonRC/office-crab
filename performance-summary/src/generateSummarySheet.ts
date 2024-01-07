import { Column } from "exceljs";
import { TestResult } from "./toTestResult";
import * as R from "ramda";
import { describeInstanceType } from "./describeInstanceType";
import { InstanceTypeInfo } from "@aws-sdk/client-ec2";
import { Workbook } from "exceljs";
import { initGetInstancePrice } from "./initGetInstancePrice";

type SummaryRow = {
  instanceType: string;
  arc: string;
  cores: number;
  threads: number;
  memory: number;
  secondsPerBillion: number;
  hoursPerBillion: number;
  threadsPerCore: number;
  samples: number;
  costPerHour: number;
  costPerBillion: number;
  cpuCreditCostPerHour: number;
};

const columns: (Partial<Column> & { key: keyof SummaryRow })[] = [
  {
    key: "instanceType",
    header: "Instance Type",
    width: 13,
  },
  {
    key: "arc",
    header: "Arc",
    width: 8,
  },
  {
    key: "cores",
    header: "Cores",
    width: 8,
  },
  {
    key: "threadsPerCore",
    header: "Threads / Core",
    width: 13,
  },
  {
    key: "memory",
    header: "Memory (MiB)",
    width: 13,
  },
  {
    key: "threads",
    header: "Threads",
    width: 8,
  },
  {
    key: "costPerHour",
    header: "Cost / Hour",
    width: 11,
    style: {
      numFmt: "0.0000",
    },
  },
  {
    key: "cpuCreditCostPerHour",
    header: "CPU Credit Cost / Hour",
    width: 11,
    style: {
      numFmt: "0.0000",
    },
  },
  {
    key: "secondsPerBillion",
    header: "Duration (s) / B",
    width: 14,
    style: {
      numFmt: "0",
    },
  },
  {
    key: "hoursPerBillion",
    header: "Duration (h) / B",
    width: 14,
    style: {
      numFmt: "0.0",
    },
  },
  {
    key: "costPerBillion",
    header: "Cost / B",
  },
  {
    key: "samples",
    header: "Samples",
  },
];

export const generateSummarySheet = async (testResults: TestResult[]) => {
  const resultGroups = R.groupBy(
    (testResult: TestResult) => `${testResult.instanceType}-${testResult.arch}`,
    testResults
  );

  const instanceTypeDic: Record<string, InstanceTypeInfo | undefined> = {};

  for (const result of testResults) {
    if (instanceTypeDic[result.instanceType]) continue;

    const instanceTypeInfo = await describeInstanceType(result.instanceType);

    if (!instanceTypeInfo) continue;

    instanceTypeDic[result.instanceType] = instanceTypeInfo;
  }

  const getInstancePrice = await initGetInstancePrice(
    testResults.map((testResult) => testResult.instanceType)
  );

  const summaryRows = Object.values(resultGroups)
    .map((testResults) => {
      if (!testResults) return null;
      if (testResults.length === 0) return null;

      const instanceType = testResults[0].instanceType || "";

      const instanceDescription = instanceTypeDic[instanceType];
      if (!instanceDescription) return null;

      const secondsPerBillion =
        testResults
          .map((result) => {
            const durationPerIteration = result.duration / result.iterations;
            const durationPerBillion = durationPerIteration * 10 ** 9;
            return durationPerBillion;
          })
          .reduce((sum, value) => sum + value, 0) / testResults.length;

      const hoursPerBillion = secondsPerBillion / 60 / 60;
      const costPerHour = getInstancePrice(instanceType) || 0;
      const isTFamilyInstance = instanceType.startsWith("t");
      const cpuCreditCostPerHour = isTFamilyInstance
        ? 0.05 * (instanceDescription.VCpuInfo?.DefaultVCpus || 0)
        : 0;
      const costPerBillion =
        (costPerHour + cpuCreditCostPerHour) * hoursPerBillion;

      const summaryRow: SummaryRow = {
        instanceType: instanceType,
        arc: testResults[0].arch || "",
        cores: instanceDescription.VCpuInfo?.DefaultCores || 0,
        memory: instanceDescription.MemoryInfo?.SizeInMiB || 0,
        secondsPerBillion,
        hoursPerBillion: secondsPerBillion / 60 / 60,
        samples: testResults.length,
        threadsPerCore:
          instanceDescription.VCpuInfo?.DefaultThreadsPerCore || 0,
        threads:
          (instanceDescription.VCpuInfo?.DefaultCores || 0) *
          (instanceDescription.VCpuInfo?.DefaultThreadsPerCore || 0),
        costPerHour,
        cpuCreditCostPerHour,
        costPerBillion,
      };

      return summaryRow;
    })
    .filter(R.isNotNil);

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Summary");
  worksheet.columns = columns;
  worksheet.addRows(
    summaryRows.sort((a, b) => a.costPerBillion - b.costPerBillion)
  );

  await workbook.xlsx.writeFile("summary.xlsx");
};
