import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { ModelPage } from "@/components/model-page";

export const metadata: Metadata = { title: "MRIGA — VIRA" };

export default async function Page({ searchParams }: { searchParams: Promise<{ colour?: string }> }) {
  const query = await searchParams;
  return (
    <SiteFrame>
      <ModelPage model="vira" initialColour={query.colour} />
    </SiteFrame>
  );
}
