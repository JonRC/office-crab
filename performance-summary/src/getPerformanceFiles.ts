import {
  GetObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const getPerformanceFiles = async () => {
  const bucket = "office-password";

  const client = new S3Client({ region: "us-east-1" });

  const listObjectsCommand = new ListObjectsCommand({
    Bucket: bucket,
    Prefix: "performance",
  });

  const response = await client.send(listObjectsCommand);

  if (!response.Contents?.length) return [];

  let fileDownloading = response.Contents.map(async (content) => {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: content.Key,
    });

    const response = await client.send(getObjectCommand);
    const file = await response.Body?.transformToByteArray();
    if (!file) return null;

    const fileNameRegex = /\/(.*)\..*/;
    const fileName = content.Key?.match(fileNameRegex)?.[1];
    if (!fileName) return null;

    return {
      fileName,
      fileContent: Buffer.from(file).toString("utf-8"),
    };
  });

  const files = await Promise.all(fileDownloading).then((files) =>
    files.filter(isNotNull)
  );

  return files;
};

const isNotNull = <T>(value: T | null): value is T => value !== null;
