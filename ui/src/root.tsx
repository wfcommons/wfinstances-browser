// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from '@remix-run/react';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme({
    primaryColor: 'green'
});

export const links: LinksFunction = () => [
    ...(cssBundleHref
        ? [{ rel: 'stylesheet', href: cssBundleHref }]
        : []),
];

export default function App() {
    const queryClient = new QueryClient();
  
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                />
                <Meta />
                <Links />
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider theme={theme}>
                    <QueryClientProvider client={queryClient}>
                        <Navbar/>
                        <Outlet />
                        <Footer/>
                        <ScrollRestoration />
                        <Scripts />
                        <LiveReload />
                    </QueryClientProvider>
                </MantineProvider>
            </body>
        </html>
    );
}