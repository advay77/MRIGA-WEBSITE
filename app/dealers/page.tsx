import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { DealersPage } from "@/components/dealers-page";

export const metadata: Metadata = { title: "MRIGA — Dealer & Franchise Network" };

export default function Page() {
  return (
    <SiteFrame>
      <DealersPage />
    </SiteFrame>
  );
}
