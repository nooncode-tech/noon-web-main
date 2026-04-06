import type { Metadata } from "next";
import { LegalDocumentPage } from "@/app/_components/site/legal-document-page";
import { cookiesPolicyDocument } from "@/data/legal-documents";

export const metadata: Metadata = {
  title: "Cookies Policy | Noon",
  description: cookiesPolicyDocument.summary,
};

export default function CookiesPolicyPage() {
  return <LegalDocumentPage document={cookiesPolicyDocument} />;
}
