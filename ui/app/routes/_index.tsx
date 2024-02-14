import type { MetaFunction } from "@remix-run/node";
import { Container } from '@mantine/core';
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { Metrics, MetricsTable } from "~/components/MetricsTable";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";

type JSONResponse = {
  detail: string,
  result: Array<Metrics>,
}

export const meta: MetaFunction = () => {
  return [
    { title: "WFInstances Browser" },
  ];
};

export const loader = async () => {
  const response = await fetch('http://localhost:8081/metrics');
  const testConv = await response.json();
  const metrics: Metrics[] = await testConv.result;
  return json({ metrics });
};

export function submitMethod(ids: String[]) {
  const submit = useSubmit();
  return submit(JSON.stringify(ids), {
    action: 'http://localhost:8081/',
    method: 'POST',
    encType: "application/json"
  });
}

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
