import { useMemo, useState } from 'react';
import {
    MantineReactTable,
    useMantineReactTable,
    type MRT_ColumnDef,
    MRT_GlobalFilterTextInput,
    MRT_ToggleFiltersButton,
    MRT_ShowHideColumnsButton,
    MRT_Row,
} from 'mantine-react-table';
import 'mantine-react-table/styles.css';
import { useDisclosure } from '@mantine/hooks';
import {ActionIcon, Tooltip, Box, Flex} from '@mantine/core';
import {IconEye, IconChartHistogram} from '@tabler/icons-react';
import { DownloadButton } from './DownloadButton';
import { GraphModal } from '~/components/GraphModal';
import { SimulateModal } from '~/components/SimulateModal';
import { Metrics } from '~/types/Metrics';
// import classes from "~/components/style/Navbar.module.css";

function formatBytes(bytes: number) {
    return `${(bytes /  (1024 ** 2)).toFixed(2)} MB`;
}

function formatRuntime(work: number) {
    return `${(work / 60).toFixed(2)} min`;
}

export function MetricsTable({
    data,
    client_ip,
} : {
    data: Metrics[]
    client_ip: string;
}) {
    const [openedGraphModal, { open:openGraphModal, close:closeGraphModal }] = useDisclosure(false);
    const [openedSimulateModal, { open:openSimulateModal, close:closeSimulateModal}] = useDisclosure(false);
    const [selectedRowViz, setSelectedRowViz] = useState<MRT_Row<Metrics> | null>(null);
    const [selectedRowSimulate, setSelectedRowSimulate] = useState<MRT_Row<Metrics> | null>(null);

    const handleRowMenuActionViz = (row: MRT_Row<Metrics>) => {
        setSelectedRowViz(row);
        openGraphModal();
    }

    const handleRowMenuActionSimulate = (row: MRT_Row<Metrics>) => {
        setSelectedRowSimulate(row);
        openSimulateModal();
    }

    // Columns to be used in the table.
    const columns = useMemo<MRT_ColumnDef<Metrics>[]>(
        () => [
            {
                id: 'workflow',
                header: 'Workflow instance',
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
                        header: 'Github Repo',
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
                        header: '# of Tasks',
                        size: 40,
                        columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
                        filterFn: 'between',
                    },
                    {
                        accessorKey: 'numFiles',
                        header: '# of Files',
                        size: 40,
                        columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
                        filterFn: 'between',
                    },
                    {
                        accessorFn: (row) => formatBytes(row.sumFileSizes),
                        id: 'sumFileSizes',
                        header: 'Sum File Sizes',
                        size: 50,
                        columnFilterModeOptions: ['fuzzy', 'contains', 'between', 'betweenInclusive'],
                    },
                    {
                        accessorFn: (row) => formatBytes(row.totalReadBytes),
                        id: 'totalBytesRead',
                        header: 'Total MB Read',
                        size: 50,
                        columnFilterModeOptions: ['fuzzy', 'contains', 'between', 'betweenInclusive'],
                    },
                    {
                        accessorFn: (row) => formatBytes(row.totalWrittenBytes),
                        id: 'totalBytesWritten',
                        header: 'Total MB Written',
                        size: 50,
                        columnFilterModeOptions: ['fuzzy', 'contains', 'between', 'betweenInclusive'],
                    },
                    {
                        accessorFn: (row) => formatRuntime(row.totalRuntimeInSeconds),
                        id: 'totalRuntimeInSeconds',
                        header: 'Runtime',
                        size: 30,
                        columnFilterModeOptions: ['fuzzy', 'contains', 'startsWith',],
                    },
                    {
                        accessorKey: 'depth',
                        header: 'Depth',
                        size: 30,
                        columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
                        filterFn: 'between',
                    },
                    {
                        accessorKey: 'minWidth',
                        header: 'Min Width',
                        size: 30,
                        columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
                        filterFn: 'between',
                    },
                    {
                        accessorKey: 'maxWidth',
                        header: 'Max Width',
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
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: '',
                size: 10
            },
        },
        enableRowSelection: true,
        initialState: {
            showGlobalFilter: true,
            columnVisibility: {
                id: true,
                githubRepo: false,
                numTasks: true,
                numFiles: true,
                sumFileSizes: true,
                totalBytesRead: false,
                totalBytesWritten: false,
                work: true,
                depth: false,
                minWidth: false,
                maxWidth: false,
            },
            pagination: { pageIndex: 0, pageSize: 50 }
        },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        mantinePaginationProps: {
            radius: 'xl',
            size: 'lg',
        },
        mantineSearchTextInputProps: {
            placeholder: 'Search workflow instances',
        },
        renderRowActions: ({ row }) => {
            // Access the metrics object from the row
            const metrics = row.original;

            // Determine whether the viz ActionIcon should be disabled
            const vizMaxTasks = 250
            const vizIsDisabled = (metrics.numTasks > vizMaxTasks);

            // Tooltip message
            const vizTooltipMessage = vizIsDisabled
                ? 'Viz disabled for workflow instances with >= ' + vizMaxTasks + ' tasks' // Message when disabled
                : 'Visualize workflow instance'; // Message when enabled

            // Determine whether the simulate ActionIcon should be disabled
            const simMaxTasks = 1000
            const simIsDisabled = (metrics.numTasks > simMaxTasks);

            // Tooltip message
            const simTooltipMessage = simIsDisabled
                ? 'Simulation disabled for workflow instances with >= ' + simMaxTasks + ' tasks' // Message when disabled
                : 'Simulate workflow instance'; // Message when enabled

            return (
                <Box style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                    <Tooltip label={vizTooltipMessage} position="top">
                        <ActionIcon
                            onClick={() => handleRowMenuActionViz(row)}
                            disabled={vizIsDisabled}
                        >
                            <IconEye />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label={simTooltipMessage} position="top">
                        <ActionIcon
                            onClick={() => handleRowMenuActionSimulate(row)}
                            disabled={simIsDisabled}
                        >
                            <IconChartHistogram />
                        </ActionIcon>
                    </Tooltip>
                </Box>
            );
        },
        renderTopToolbar: ({ table }) => {
            return (
                <Flex p="md" justify="space-between">
                    <Flex>
                        <DownloadButton table={table} />
                    </Flex>
                    <Flex gap="xs">
                        <MRT_ToggleFiltersButton table={table} />
                        <MRT_ShowHideColumnsButton table={table}/>
                        <MRT_GlobalFilterTextInput table={table} />
                    </Flex>
                </Flex>
            );
        }
    });

    return (
        <>
            <MantineReactTable table={table} />
            {selectedRowSimulate && <SimulateModal id={selectedRowSimulate.original.id} client_ip={client_ip} opened={openedSimulateModal} onClose={closeSimulateModal} />}
            {selectedRowViz && <GraphModal id={selectedRowViz.original.id} client_ip={client_ip} opened={openedGraphModal} onClose={closeGraphModal} />}
        </>
    );
}
