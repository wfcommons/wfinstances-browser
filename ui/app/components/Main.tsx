import React from 'react';
import { Container, Text, Button, Group } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import classes from './style/Main.module.css';

// TODO: Rehaul and rework this with the main Mantine-react-table part of our application.
export function Main() {
  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
        <h1 className={classes.title}>
          This is a {' '}
          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            test
          </Text>{' '}
          main section of the page.
        </h1>

        <Text className={classes.description} color="dimmed">
          Until we are able to implement the mantine react table into the application which will be done in another ticket.
        </Text>

        <Group className={classes.controls}>
          <Button
            size="xl"
            className={classes.control}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Doesn't work
          </Button>

          <Button
            component="a"
            href="https://github.com/mantinedev/mantine"
            size="xl"
            variant="default"
            className={classes.control}
            leftSection={<IconBrandGithub style={{ width: 20 }} stroke={1.5} />}
          >
            GitHub
          </Button>
        </Group>
      </Container>
    </div>
  );
}