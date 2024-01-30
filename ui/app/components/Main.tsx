import { useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';

type Workflow = {
  id: string;
  githubRepo: string;
  numTasks: number;
  numFiles: number;
  totalBytesRead: string;
  totalBytesWritten: string;
  work: string;
  depth: number;
  minWidth: number;
  maxWidth: number;
};

export function Main({
  fetchedData
} : {
  fetchedData: Workflow[]
}) {
const data: Workflow[] = fetchedData;
const columns = useMemo<MRT_ColumnDef<Workflow>[]>(
  () => [
    {
      accessorKey: 'id',
      header: 'id   ',
    },

    {
      accessorKey: 'githubRepo',
      header: 'Github Repository',
    },
    {
      accessorKey: 'numTasks',
      header: 'Number of Tasks',
      size: 60,
    },
    {
      accessorKey: 'numFiles',
      header: 'Number of Files',
      size: 60,
    },
    {
      accessorKey: 'totalBytesRead',
      header: 'Total Bytes Read',
      size: 75,
    },
    {
      accessorKey: 'totalBytesWritten',
      header: 'Total Bytes Written',
      size: 75,
    },
    {
      accessorKey: 'work',
      header: 'Total Work',
    },
    {
      accessorKey: 'depth',
      header: 'Depth of Workflow',
      size: 50,
    },
    {
      accessorKey: 'minWidth',
      header: 'Minimum Width',
      size: 50,
    },
    {
      accessorKey: 'maxWidth',
      header: 'Maximum Width',
      size: 50,
    },
  ],
  [],
);

  const table = useMantineReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return <MantineReactTable table={table} />;
};
