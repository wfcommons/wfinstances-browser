import type { MetaFunction } from "@remix-run/node";
import { Container } from '@mantine/core';
import { Metrics, MetricsTable } from "~/components/MetricsTable";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type APIResponse = {
  detail: string,
  result: Array<Metrics>,
}

export const meta: MetaFunction = () => {
  return [
    { title: "WFInstances Browser" },
  ];
};

export const loader = async () => {
  const response = await fetch(`${process.env.API_URL_BASE}/metrics`);
  const jsonResponse: APIResponse = await response.json();
  const metrics: Metrics[] = await jsonResponse.result;
  return json({ metrics });
};

export default function Index() {
  const { metrics } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Container fluid>
        <MetricsTable data={metrics} />
      </Container>
    </div>
  );
}
