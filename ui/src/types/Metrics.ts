export type Metrics = {
    id: string;
    githubRepo: string;
    numTasks: number;
    numFiles: number;
    sumFileSizes: number,
    totalReadBytes: number;
    totalWrittenBytes: number;
    totalRuntimeInSeconds: number;
    depth: number;
    minWidth: number;
    maxWidth: number;
}
  