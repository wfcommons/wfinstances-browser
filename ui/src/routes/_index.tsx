import type { MetaFunction } from "@remix-run/node";
import { Container } from '@mantine/core';
import { MetricsTable } from "~/components/MetricsTable";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Metrics } from "~/types/Metrics";

// export let clientIp: string;

export const meta: MetaFunction = () => {
    return [
        { title: "WfInstances browser" },
    ];
};

export const loader = async ({ request }: { request: Request }) => {

    // Obtain the client's IP address
    let clientIp = request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP') || "unknown";

    const response = await fetch(`${process.env.API_BASE_URL}/metrics/private`);
    const jsonResponse = await response.json();
    const metrics: Metrics[] = await jsonResponse.result;
    return json({ metrics , clientIp});
};

export default function Index() {
    const { metrics , clientIp} = useLoaderData<typeof loader>();
    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <Container size="xl">
                <MetricsTable data={metrics} client_ip={clientIp}/>
            </Container>
        </div>
    );
}
