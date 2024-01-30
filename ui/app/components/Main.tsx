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

export function Main( fetchedData: any ) {
const data: Workflow[] = fetchedData;
console.log(data);
const columns = useMemo<MRT_ColumnDef<Workflow>[]>(
  () => [
    {
      accessorKey: 'id',
      header: 'id',
    },

    {
      accessorKey: 'githubRepo',
      header: 'Github Repository',
    },
    {
      accessorKey: 'numTasks',
      header: 'Number of Tasks',
    },
    {
      accessorKey: 'numFiles',
      header: 'Number of Files',
    },
    {
      accessorKey: 'totalBytesRead',
      header: 'Total Bytes Read',
    },
    {
      accessorKey: 'totalBytesWritten',
      header: 'Total Bytes Written',
    },
    {
      accessorKey: 'work',
      header: 'Total Work',
    },
    {
      accessorKey: 'depth',
      header: 'Depth of Workflow',
    },
    {
      accessorKey: 'minWidth',
      header: 'Minimum Width',
    },
    {
      accessorKey: 'maxWidth',
      header: 'Maximum Width',
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
