import type { Metadata } from "next";
import { LegalDocumentPage } from "@/app/_components/site/legal-document-page";
import { termsAndConditionsDocument } from "@/data/legal-documents";

export const metadata: Metadata = {
  title: "Terms and Conditions | Noon",
  description: termsAndConditionsDocument.summary,
};

export default function TermsAndConditionsPage() {
  return <LegalDocumentPage document={termsAndConditionsDocument} />;
}
