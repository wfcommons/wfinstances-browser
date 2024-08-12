import {Center, Container, Image, Modal, List, ListItem, ThemeIcon} from '@mantine/core';
import classes from './style/HelpModal.module.css';
import {IconFilter, IconEye, IconColumns, IconDownload} from '@tabler/icons-react';
import wfcommonslogo from "../../public/images/wfcommons-horizontal.png";


export function HelpModal({
                              opened,
                              onClose
                          }: {
    opened: boolean,
    onClose: () => void
}) {

    return (
        <>
            <Modal title="" opened={opened} onClose={onClose} size='100%'>
                <Container>
                    <Center>
                        <p>
                            <a href={"https://wfcommons.org"} target={"_blank"} rel={"noreferrer"}>
                                <Image className={classes.logo} src={wfcommonslogo} />
                            </a>
                        </p>
                    </Center>
                </Container>
                <Container>
                    <p>
                        <strong>The WfInstances browser displays an interactive table where each row corresponds to a workflow
                            instance's JSON file (in the <a rel="noreferrer" target="_blank"  href={"https://github.com/wfcommons/wfformat"}>WfFormat
                                schema</a>) available on <a href={"https://github.com/wfcommons/wfinstances"} target="_blank" rel="noreferrer">WfInstances GitHub repository</a></strong>.
                    </p>
                    <List >
                        <ListItem
                            style={{ marginBottom: '20px' }}
                            icon={
                                <ThemeIcon size={30} radius="xl">
                                    <IconColumns size="1rem" />
                                </ThemeIcon>
                            }>
                            <strong>Showing/hiding metrics </strong> &#8212; The rightmost columns
                            display metrics computed from the data in workflow instance JSON files. Default metrics are displayed
                            but more metrics are available and can be displayed/hidden at will by clicking on <IconColumns size="1rem" style={{marginBottom: '-2px'}}/>.
                        </ListItem>
                        <ListItem
                            style={{ marginBottom: '20px' }}
                            icon={
                                <ThemeIcon size={30} radius="xl">
                                    <IconFilter size="1rem"/>
                                </ThemeIcon>
                            }>
                            <strong>Sorting/filtering workflow instances </strong> &#8212; Click on the header
                            of a metric column to sort workflow instances by that metric.
                            Click on <IconFilter size="1rem" style={{marginBottom: '-2px'}}/> to specify metric value ranges for
                            filtering out workflow instances.
                        </ListItem>
                        <ListItem
                            style={{ marginBottom: '20px' }}
                            icon={
                                <ThemeIcon size={30} radius="xl">
                                    <IconDownload size="1rem" />
                                </ThemeIcon>
                            }>
                            <strong>Downloading workflow instances</strong> &#8212; Use the checkboxes on the left side of the
                            table to select particular workflow instances for download as a zip archive.
                        </ListItem>
                        <ListItem
                            style={{ marginBottom: '20px' }}
                            icon={
                                <ThemeIcon size={30} radius="xl">
                                    <IconEye size="1rem" />
                                </ThemeIcon>
                            }>
                            <strong>Visualizing workflow instances</strong> &#8212; Click on <IconEye size="1rem" style={{marginBottom: '-2px'}}/> to visualize the structure of
                            workflow instances with fewer than 250 tasks.
                        </ListItem>
                    </List>
                </Container>
            </Modal>
        </>
    )
    ;
}
