import type { MetaFunction } from "@remix-run/node";
import { Container } from '@mantine/core';
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { Metrics, MetricsTable } from "~/components/MetricsTable";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "WFInstances Browser" },
  ];
};

export const loader = async () => {
  const response = await fetch('http://localhost:8081/wf-instance-metrics');
  const metrics: Metrics[] = await response.json();
  return json({ metrics });
};

export default function Index() {
  const { metrics } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Navbar/>
        <Container fluid>
        <MetricsTable
          data= {metrics}
        />
        </Container>
      <Footer/>
    </div>
  );
}
