import { MantineProvider, Text, Rating } from '@mantine/core';

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Text>Welcome to Mantine!</Text>
      <Rating defaultValue={2} />
    </MantineProvider>
  );
}