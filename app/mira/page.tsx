import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { ModelPage } from "@/components/model-page";

export const metadata: Metadata = { title: "MRIGA — MIRA" };

export default async function Page({ searchParams }: { searchParams: Promise<{ colour?: string }> }) {
  const query = await searchParams;
  return (
    <SiteFrame>
      <ModelPage model="mira" initialColour={query.colour} />
    </SiteFrame>
  );
}
