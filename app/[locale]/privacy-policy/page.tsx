import type { Metadata } from "next";
import { LegalDocumentPage } from "@/app/_components/site/legal-document-page";
import { privacyPolicyDocument } from "@/data/legal-documents";

export const metadata: Metadata = {
  title: "Privacy Policy | Noon",
  description: privacyPolicyDocument.summary,
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage document={privacyPolicyDocument} />;
}
