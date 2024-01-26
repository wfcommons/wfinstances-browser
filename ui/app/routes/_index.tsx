import type { MetaFunction } from "@remix-run/node";
import { Navbar } from "~/components/Navbar";

export const meta: MetaFunction = () => {
  return [
    { title: "WFInstances Browser" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Navbar/>
    </div>
  );
}
