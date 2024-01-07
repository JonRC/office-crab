import { generateSummarySheet } from "./generateSummarySheet";
import { getPerformanceFiles } from "./getPerformanceFiles";
import { toTestResult } from "./toTestResult";

const main = async () => {
  const performanceFiles = await getPerformanceFiles();
  const testResults = performanceFiles.map(toTestResult).filter(isNotNull);

  generateSummarySheet(testResults);
};

const isNotNull = <T>(value: T | null): value is T => value !== null;

main();
