import {
    Container,
    Group,
    Image,
    Text,
    useMantineColorScheme,
    ActionIcon,
    useComputedColorScheme,
    Button
} from '@mantine/core';
import {IconSun, IconMoon, IconHelpSquareRounded, IconInfoSquareRounded} from '@tabler/icons-react';
import cx from 'clsx';
import classes from './style/Navbar.module.css';
import logo from '../../public/images/wfcommons-vertical.png';
import { AboutModal } from "~/components/AboutModal";
import { HelpModal } from "~/components/HelpModal";
import {useDisclosure} from "@mantine/hooks";


export function Navbar() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme( 'light', { getInitialValueInEffect: true});

    const [openedAboutModal, { open:openAboutModal, close:closeAboutModal}] = useDisclosure(false);
    const [openedHelpModal, { open:openHelpModal, close:closeHelpModal}] = useDisclosure(false);

    return (
        <header className={classes.header}>
            <AboutModal opened={openedAboutModal} onClose={closeAboutModal} />
            <HelpModal opened={openedHelpModal} onClose={closeHelpModal} />
            <Container className={classes.inner} size="xl">
                <Group gap={5}>
                    <a href={"https://wfcommons.org"} target={"_blank"} rel={"noreferrer"}>
                        <Image className={classes.logo} src={logo} />
                    </a>
                    <Text fw={500} style={{ fontSize: '32px', marginBottom: '30px', marginLeft: '20px' }}>WfInstances browser</Text>
                </Group>
                <Group gap={5} visibleFrom="xs">
                    <Button variant="default" onClick={() => {openHelpModal();}}>Help &nbsp;<IconHelpSquareRounded size={25}/></Button>
                    <Button variant="default" onClick={() => {openAboutModal();}}>About &nbsp;<IconInfoSquareRounded size={25}/></Button>
                    <ActionIcon
                        onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                        variant='default'
                        size='lg'
                        aria-label='Toggle site color scheme'
                    >
                        <IconSun className={cx(classes.icon, classes.light)} stroke={1.5}/>
                        <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5}/>
                    </ActionIcon>
                </Group>
            </Container>
        </header>
    );
}