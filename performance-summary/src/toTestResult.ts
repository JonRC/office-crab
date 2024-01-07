export type TestResult = {
  instanceType: string;
  arch: string;
  timestamp: string;
  iterations: number;
  performanceDetail: Record<string, number>;
  method: string;
  duration: number;
};

export const toTestResult = (input: {
  fileContent: string;
  fileName: string;
}): TestResult | null => {
  const [instanceType, arch, fromNth, toNth, timestamp] = input.fileName.split(
    "-"
  ) as (string | undefined)[];

  if (!instanceType || !arch || !fromNth || !toNth || !timestamp) return null;

  if (!isValidNumber(fromNth) || !isValidNumber(toNth)) return null;

  const iterations = Number(toNth) - Number(fromNth) + 1;

  const performanceDetail = input.fileContent
    .split(/[\r\n]+/)
    .reduce((performanceDetail, line) => {
      const [method, time] = line.split(":") as (string | undefined)[];

      if (!method || !time) return performanceDetail;
      if (!isValidNumber(time)) return performanceDetail;

      return { ...performanceDetail, [method]: Number(time) };
    }, {} as Record<string, number>);

  const bestPerformance = Object.entries(performanceDetail).reduce(
    (best, [method, duration]) => {
      if (duration > best.duration) return best;

      return { method, duration };
    },
    { method: "", duration: Infinity }
  );

  const testResult: TestResult = {
    arch,
    instanceType,
    iterations,
    performanceDetail,
    timestamp,
    duration: bestPerformance.duration,
    method: bestPerformance.method,
  };

  return testResult;
};

const isValidNumber = (value: string) => {
  if (value === "") return false;
  if (value === null) return false;
  if (typeof value === "boolean") return false;

  const number = Number(value);
  return !Number.isNaN(number);
};
