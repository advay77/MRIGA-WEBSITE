import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { ModelPage } from "@/components/model-page";

export const metadata: Metadata = { title: "MRIGA — VIRA" };

export default function Page() {
  return (
    <SiteFrame>
      <ModelPage model="vira" />
    </SiteFrame>
  );
}
