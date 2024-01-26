import { Container, Group, Burger, Image, Text, useMantineColorScheme, ActionIcon, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import cx from 'clsx';
import { useDisclosure } from '@mantine/hooks';
import classes from './style/Navbar.module.css';


export function Navbar() {
  const [opened, { toggle }] = useDisclosure(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme( 'light', { getInitialValueInEffect: true});

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <Group gap={5}>
          <Image
              radius='xs'
               h={25}
              src="https://avatars.githubusercontent.com/u/80002382?s=200&v=4"
          />
          <Text fw={500}>WfCommons</Text>
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