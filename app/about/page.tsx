import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { AboutPage } from "@/components/about-page";

export const metadata: Metadata = { title: "MRIGA — Origins & Manifesto" };

export default function Page() {
  return (
    <SiteFrame>
      <AboutPage />
    </SiteFrame>
  );
}
