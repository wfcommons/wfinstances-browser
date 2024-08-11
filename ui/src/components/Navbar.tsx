import { Container, Group, Image, Text, useMantineColorScheme, ActionIcon, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import cx from 'clsx';
import classes from './style/Navbar.module.css';
import logo from '../../public/images/wflogo.png';
import { AboutModal } from "~/components/AboutModal";


export function Navbar() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme( 'light', { getInitialValueInEffect: true});

    return (
        <header className={classes.header}>
            <Container className={classes.inner} size="xl">
                <Group gap={5}>
                    <Image
                        radius='xs'
                        h={50}
                        w={50}
                        src={logo}
                    />
                    <Text fw={500} style={{ fontSize: '24px' }}>WfInstances Browser</Text>
                </Group>
                <Group gap={5} visibleFrom="xs">
                    {/*<AboutModal  opened={true} onClose={close} />*/}
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