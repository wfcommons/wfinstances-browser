import type { MetaFunction } from "@remix-run/node";
import { Container } from '@mantine/core';
import { MetricsTable } from "~/components/MetricsTable";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Metrics } from "~/types/Metrics";

export const meta: MetaFunction = () => {
    return [
        { title: "WFInstances browser" },
    ];
};

export const loader = async () => {
    const response = await fetch(`${process.env.API_BASE_URL}/metrics/private`);
    const jsonResponse = await response.json();
    const metrics: Metrics[] = await jsonResponse.result;
    return json({ metrics });
};

export default function Index() {
    const { metrics } = useLoaderData<typeof loader>();
    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <Container size="xl">
                <MetricsTable data={metrics} />
            </Container>
        </div>
    );
}
