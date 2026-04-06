import type { Metadata } from "next";
import { LegalDocumentPage } from "@/app/_components/site/legal-document-page";
import { legalNoticeDocument } from "@/data/legal-documents";

export const metadata: Metadata = {
  title: "Legal Notice | Noon",
  description: legalNoticeDocument.summary,
};

export default function LegalNoticePage() {
  return <LegalDocumentPage document={legalNoticeDocument} />;
}
