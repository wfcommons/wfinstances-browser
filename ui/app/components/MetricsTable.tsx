import { useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
} from 'mantine-react-table';
import { Box, Button, Flex, Menu } from '@mantine/core';

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

type WfInstance = {

}

function formatBytes(bytes: number) {
  if (bytes == 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatWork(work: number) {
  const days = Math.floor(work / (3600 * 24));
  const hours = Math.floor((work % (3600 * 24)) / 3600);
  const minutes = Math.floor((work % 3600) / 60);
  const seconds = Math.floor(work % 60);

  let result = '';
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
  data,
} : {
  data: Metrics[],
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
            filterVariant: 'multi-select',
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
    initialState: { 
      showGlobalFilter: true,
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
      const handleDownload = () => {
        const ids: string[] = table.getSelectedRowModel().flatRows.map((row) => row.getValue('id'));
        fetch('http://localhost:8081/wf-instances', {
          method: 'POST',
          headers: {                              
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(ids)
        })
          .then(res => res.json())
          .then(res => {
            const wfInstances = res.result;
            wfInstances.forEach((wfInstance: any) => {
              const a = document.createElement('a');
              a.setAttribute('download', wfInstance.id);

              delete wfInstance.id;
              const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(wfInstance, null, 4))}`;
              a.setAttribute('href', data);
              
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            });
          });
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
