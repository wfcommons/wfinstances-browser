import { Container, Group, Image, Text, useMantineColorScheme, ActionIcon, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import cx from 'clsx';
import classes from './style/Navbar.module.css';
import logo from '../../public/images/wflogo.png';


export function Navbar() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme( 'light', { getInitialValueInEffect: true});

  return (
    <header className={classes.header}>
      <Container className={classes.inner} size="xl">
        <Group gap={5}>
          <Image
            radius='xs'
            h={25}
            src={logo}
          />
          <Text fw={500}>WfInstances Browser</Text>
        </Group>
        <Group gap={5} visibleFrom="xs">
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