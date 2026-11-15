import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { CollectionPage } from "@/components/collection-page";

export const metadata: Metadata = { title: "MRIGA — Explore" };

export default function Page() {
  return (
    <SiteFrame>
      <CollectionPage />
    </SiteFrame>
  );
}
