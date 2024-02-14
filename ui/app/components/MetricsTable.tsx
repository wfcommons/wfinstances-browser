import { useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
} from 'mantine-react-table';
import { Box, Button, Flex, Menu, Text, Title } from '@mantine/core';
import { submitMethod } from '~/routes/_index';

// Definition of Metrics structure
export type Metrics = {
  id: string;
  githubRepo: string;
  numTasks: number;
  numFiles: number;
  totalBytesRead: number;
  totalBytesWritten: number;
  work: number;
  depth: number;
  minWidth: number;
  maxWidth: number;
};

function formatBytes(bytes: number) {
  if (bytes == 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatWork(work: number) {
  var days = Math.floor(work / (3600 * 24));
  var hours = Math.floor((work % (3600 * 24)) / 3600);
  var minutes = Math.floor((work % 3600) / 60);
  var seconds = Math.floor(work % 60);

  var result = '';
  if (days > 0) {
    result += days + 'd';
  }
  if (hours > 0 || days > 0) {
    result += hours + 'h';
  }
  if (minutes > 0 || days > 0 || hours > 0) {
    result += minutes + 'm';
  }
  result += seconds + 's';
  return result.trim();
}

export function MetricsTable({
  data
} : {
  data: Metrics[]
}) {
// Creation of the columns to be used in the table.
const columns = useMemo<MRT_ColumnDef<Metrics>[]>(
  () => [
    {
      id: 'workflow',
      header: 'Workflow',
      columns: [
        {
          accessorKey: 'id',
          header: 'id   ',
          size: 50,
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          enableHiding: false,
        },
        {
          accessorKey: 'githubRepo',
          header: 'Github Repository',
          size: 50,
          enableClickToCopy: true,
          enableHiding: false,
        },

      ],
    },
    {
      id: 'metrics',
      header: 'Metrics',
      columns: [
        {
          accessorKey: 'numTasks',
          header: 'Number of Tasks',
          size: 40,
          columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
          filterFn: 'between',
        },
        {
          accessorKey: 'numFiles',
          header: 'Number of Files',
          size: 40,
          columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
          filterFn: 'between',
        },
        {
          accessorKey: 'totalBytesRead',
          header: 'Total Bytes Read',
          size: 50,
          columnFilterModeOptions: ['fuzzy', 'contains', 'endsWith'],
          Cell: ({ cell }) =>(
            <Box>
            {formatBytes(cell.getValue<number>())}
            </Box>
          )
        },
        {
          accessorKey: 'totalBytesWritten',
          header: 'Total Bytes Written',
          size: 50,
          columnFilterModeOptions: ['fuzzy', 'contains', 'endsWith',],
          Cell: ({ cell }) =>(
            <Box>
            {formatBytes(cell.getValue<number>())}
            </Box>
          )
        },
        {
          accessorKey: 'work',
          header: 'Total Work',
          size: 30,
          columnFilterModeOptions: ['fuzzy', 'contains', 'startsWith',],
          Cell: ({ cell }) =>(
            <Box>
            {formatWork(cell.getValue<number>())}
            </Box>
          )
        },
        {
          accessorKey: 'depth',
          header: 'Depth of Workflow',
          size: 30,
          columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
          filterFn: 'between',
        },
        {
          accessorKey: 'minWidth',
          header: 'Minimum Width',
          size: 30,
          columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
          filterFn: 'between',
        },
        {
          accessorKey: 'maxWidth',
          header: 'Maximum Width',
          size: 30,
          columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
          filterFn: 'between',
        },
      ],
    },
  ],
  [],
);

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnDragging: false,
    enableFacetedValues:true,
    enableGrouping: true,
    enablePinning: true,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: { showGlobalFilter: true,
      columnVisibility: {
        id: true,
        githubRepo: true,
        numTasks: true,
        numFiles: true,
        totalBytesRead: false,
        totalBytesWritten: false,
        work: false,
        depth: false,
        minWidth: false,
        maxWidth: false,
      }
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantinePaginationProps: {
      radius: 'xl',
      size: 'lg',
    },
    mantineSearchTextInputProps: {
      placeholder: 'Search Workflows',
    },
    renderRowActionMenuItems: () => (
      <>
        <Menu.Item>Visualize Workflow</Menu.Item>
      </>
    ),
          
    
    renderTopToolbar: ({ table })  => {
      // HANDLE WORKFLOW DOWNLOADING
      const handleDownload = async () => {
        const ids: String[] = table.getSelectedRowModel().flatRows.map((row) => {
          return row.getValue('id');
        });
        submitMethod(ids);
      };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table}/>
          </Flex>
          <Flex>
            <Button
              color="blue"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleDownload}
              variant="filled"
            >
              Download
            </Button>
          </Flex>
        </Flex>
      );
    }
  });

  return <MantineReactTable table={table} />;
};
