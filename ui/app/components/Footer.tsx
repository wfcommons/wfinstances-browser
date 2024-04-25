import { Anchor, Group, ActionIcon, rem, Container } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import classes from './style/Footer.module.css';

const links = [
  { link: 'https://docs.wfcommons.org/en/latest/', label: 'Documentation' },
  { link: 'https://wfcommons.org/publications', label: 'Publications' },
  { link: 'https://wfcommons.org/usages', label: 'Usages' },
  { link: 'https://wfcommons.org/format', label: 'Format' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      size="sm"
      target="_blank"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner} size="xl">

        <Group className={classes.links}>{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" variant="default" radius="xl">
            <Anchor c="dimmed" href='https://github.com/ICS496WfCommons' target='_blank'>
              <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </Anchor>
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}