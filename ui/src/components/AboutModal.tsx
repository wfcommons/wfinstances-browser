import {Center, Container, Image, Modal} from '@mantine/core';
import classes from './style/AboutModal.module.css';
import wfcommonslogo from "../../public/images/wfcommons-horizontal.png";
import uhmlogo from "../../public/images/logo-uhm.png";
import ornlogo from "../../public/images/logo-ornl.png";
import nsflogo from "../../public/images/logo-nsf.png";

export function AboutModal({
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
                                <Image className={classes.biglogo} src={wfcommonslogo} />
                            </a>
                        </p>
                    </Center>
                </Container>
                <Container>
                    <p>
                        The WfInstances browser is part of the <a rel="noreferrer" target="_blank" href={"https://wfcommons.org"}>WfCommons project</a>,
                        which aims to provide datasets and tools for <strong>scientific workflows research and development</strong>.
                        These datasets consist of <i>workflow instances</i>, i.e.,
                        JSON descriptions of the specification and past execution of scientific workflow applications.
                        These instances are described using the <a rel="noreferrer" target="_blank" href={"https://github.com/wfcommons/wfformat"}>WfFormat schema</a> and
                        are hosted on the <a rel="noreferrer" target="_blank" href={"https://github.com/wfcommons/wfinstances"}> WfInstances GitHub repository</a>.
                    </p>
                    <p>
                        <strong>The WfInstances browser is a convenient front-end to the WfInstances repository and makes it convenient to browse,
                            select, inspect, and even visualize (small) workflow instances.</strong>
                    </p>
                </Container>
                <Container className={classes.logoboxouter}>
                    <Container className={classes.logoboxinner}>
                        <a href={"https://hawaii.edu"} target={"_blank"} rel={"noreferrer"}>
                            <Image className={classes.uhmlogo} src={uhmlogo} />
                        </a>
                        <a href={"https://ornl.gov"} target={"_blank"} rel={"noreferrer"}>
                            <Image className={classes.ornllogo} src={ornlogo} />
                        </a>
                        <a href={"https://nsf.gov"} target={"_blank"} rel={"noreferrer"}>
                            <Image className={classes.nsflogo} src={nsflogo} />
                        </a>
                    </Container>
                </Container>
            </Modal>
        </>
    );
}
