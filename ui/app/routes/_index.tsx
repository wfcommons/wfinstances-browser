import type { MetaFunction } from "@remix-run/node";
import { Container } from '@mantine/core';
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { Main } from "~/components/Main";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type Workflow = {
  id: string;
  githubRepo: string;
  numTasks: number;
  numFiles: number;
  totalBytesRead: string;
  totalBytesWritten: string;
  work: string;
  depth: number;
  minWidth: number;
  maxWidth: number;
};

export const meta: MetaFunction = () => {
  return [
    { title: "WFInstances Browser" },
  ];
};

export const loader = async () => {
  const response = await fetch('http://localhost:8081/wf-instance-metrics');
  const workflows: Workflow[] = await response.json();
  return json({ workflows });
};

export default function Index() {
  const { workflows } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Navbar/>
        <Container fluid>
        <Main
          fetchedData= {workflows}
        />
        </Container>
      <Footer/>
    </div>
  );
}
