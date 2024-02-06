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

// Definition of Metrics structure
export type Metrics = {
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
          filterVariant: 'range-slider',
          mantineFilterRangeSliderProps: {
            color: 'indigo',
            label: (value) => value,
          }
        },
        {
          accessorKey: 'numFiles',
          header: 'Number of Files',
          size: 40,
          filterVariant: 'range-slider',
          mantineFilterRangeSliderProps: {
            color: 'indigo',
            label: (value) => value,
          }
        },
        {
          accessorKey: 'totalBytesRead',
          header: 'Total Bytes Read',
          size: 50,
        },
        {
          accessorKey: 'totalBytesWritten',
          header: 'Total Bytes Written',
          size: 50,
        },
        {
          accessorKey: 'work',
          header: 'Total Work',
        },
        {
          accessorKey: 'depth',
          header: 'Depth of Workflow',
          size: 30,
          filterVariant: 'range-slider',
          mantineFilterRangeSliderProps: {
            color: 'indigo',
            label: (value) => value,
          }
        },
        {
          accessorKey: 'minWidth',
          header: 'Minimum Width',
          size: 30,
          filterVariant: 'range-slider',
          mantineFilterRangeSliderProps: {
            color: 'indigo',
            label: (value) => value,
          }
        },
        {
          accessorKey: 'maxWidth',
          header: 'Maximum Width',
          size: 30,
          filterVariant: 'range-slider',
          mantineFilterRangeSliderProps: {
            color: 'indigo',
          }
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
      const handleDownload = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          // TODO: Add in downloading functionality.
          console.log("Dowloading " + row.getValue('id'));
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
