import { Box, Button, Loader } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { MRT_TableInstance } from 'mantine-react-table';
import { Metrics } from '~/types/Metrics';
import { WfInstance } from '~/types/WfInstance';

function download(wfInstances: WfInstance[], ids: string[]) {
    const zip = new JSZip();

    const root_folder = zip.folder("WfInstances");

    wfInstances.forEach((wfInstance: WfInstance, index: number) => {
        root_folder!.file(ids[index], JSON.stringify(wfInstance, null, 4));
        // zip.file(ids[index], JSON.stringify(wfInstance, null, 4));
    });

    zip.generateAsync({type: 'blob'}).then((content) => {
        FileSaver.saveAs(content, 'WfInstances.zip');
    });
}

export function DownloadButton({ 
    table,
}: {
  table: MRT_TableInstance<Metrics>
}) {
    const ids = table.getSelectedRowModel().flatRows.map((row) => row.getValue('id')) as string[];
    const { isFetching, refetch } = useQuery({
        enabled: false,
        queryKey: ['ids', ids],
        queryFn: () => 
            fetch('http://localhost/wf-instances/public/', {
                method: 'POST',
                headers: {                              
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify(ids)
            }).then(res => res.json())
                .then(res => {
                    download(res.result, ids);
                    return res.result;
                })
    });
  
    return (
        <Button
            disabled={!table.getIsSomeRowsSelected()}
            onClick={() => refetch()}
            variant="filled"
        >
      Download 
            <Box ml={3}>
                {isFetching ? (
                    <Loader type="dots" color="white" size="xs" />
                ) : (
                    <IconDownload size={20}/>
                )}
            </Box>
        </Button>
    );
}
