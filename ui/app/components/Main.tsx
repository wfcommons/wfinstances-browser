import { useEffect, useMemo, useState } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from 'mantine-react-table';


type UserApiResponse = {
  data: Array<Workflow>;
  meta: {
    totalRowCount: number;
  };
};

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

const Table = () => {
  //data and fetching state
  const [data, setData] = useState<Workflow[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  //if you want to avoid useEffect, look at the React Query example instead
  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const response = await fetch('http://localhost:8081/wf-instance-metrics', {mode: 'cors'});
        const json = (await response.json()) as UserApiResponse;
        setData(json.data);
        setRowCount(json.meta.totalRowCount);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters, //refetch when column filters change
    globalFilter, //refetch when global filter changes
    pagination.pageIndex, //refetch when page index changes
    pagination.pageSize, //refetch when page size changes
    sorting, //refetch when sorting changes
  ]);

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
    data,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: true },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: 'red', children: 'Error loading data' }
      : undefined,
  });

  return <MantineReactTable table={table} />;
};

export default Table;

export function Main() {
  return (
    <Table/>
  );
}