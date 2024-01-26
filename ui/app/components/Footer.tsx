import { Anchor, Group, ActionIcon, rem, Container } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import classes from './Footer.module.css';

const links = [
  { link: '#', label: 'Documentation' },
  { link: '#', label: 'Publications' },
  { link: '#', label: 'Usages' },
  { link: '#', label: 'Format' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container size="md" className={classes.inner}>

        <Group className={classes.links}>{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}