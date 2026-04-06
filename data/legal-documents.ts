import type { LegalDocument } from "@/app/_components/site/legal-document-page";

const legalContactDetails = [
  { label: "Email", value: "noon.message@gmail.com", href: "mailto:noon.message@gmail.com" },
  { label: "Location", value: "Wilmington, Delaware, United States" },
] as const;

export const privacyPolicyDocument: LegalDocument = {
  title: "Privacy Policy",
  subtitle: "Website, Contact, Maxwell, and related service communications.",
  summary:
    "This Policy explains how Noon collects, uses, discloses, stores, and protects personal information when you visit Noon's website, submit a contact inquiry, start a conversation through Maxwell, request a proposal, become a client, or otherwise interact with Noon's services.",
  overview: [
    "This Policy applies to personal information collected through Noon's public website, Contact page, Maxwell intake flow, project discovery communications, proposal-related communications, and related support or maintenance communications.",
    "It also applies when Noon receives information directly from you by email, through forms on the website, or through materials you send during pre-sales or project delivery.",
    "This Policy does not replace any privacy, confidentiality, or data-processing terms that may later appear in a signed proposal, statement of work, client agreement, or other written contract for a specific engagement.",
  ],
  details: [{ label: "Effective date", value: "March 31, 2026" }, ...legalContactDetails],
  sections: [
    {
      title: "1. Who this Policy applies to",
      bullets: [
        "This Policy applies to personal information collected through Noon's public website, Contact page, Maxwell intake flow, project discovery communications, proposal-related communications, and related support or maintenance communications.",
        "It also applies when Noon receives information directly from you by email, through forms on the website, or through materials you send during pre-sales or project delivery.",
        "This Policy does not replace any privacy, confidentiality, or data-processing terms that may later appear in a signed proposal, statement of work, client agreement, or other written contract for a specific engagement.",
      ],
    },
    {
      title: "2. Information Noon collects",
      paragraphs: [
        "Noon collects only the categories of information reasonably necessary to operate the website, handle inquiries, support Maxwell, deliver requested services, maintain records, and comply with legal obligations.",
      ],
    },
    {
      title: "2.1 Information you provide directly",
      bullets: [
        "Contact and identity details, such as your full name, email address, company or organization name, role, and country or region, when you choose to provide them.",
        "Inquiry and project information, such as what you need, project goals, business context, desired features, budget range, timeline, and related information you submit through Contact or Maxwell.",
        "Communications and materials, such as emails, project briefs, notes, drafts, approvals, feedback, and any files or links you choose to send to Noon.",
        "Client and billing information, if you engage Noon for paid services directly, such as billing contact details, invoicing information, tax-related information if needed, and limited transaction metadata required for billing, accounting, fraud prevention, and recordkeeping.",
        "Authentication information, if Noon enables account or login functionality for a given flow or client portal, such as email address, account identifiers, and credentials or authentication tokens managed directly or through Noon's providers.",
      ],
    },
    {
      title: "2.2 Information collected automatically",
      bullets: [
        "Technical and device information, such as IP address, browser type, operating system, device type, language settings, and approximate diagnostic data needed to render, secure, and troubleshoot the website and related services.",
        "Usage and interaction information, such as pages visited, timestamps, referring URLs, navigation events, basic session state, and limited server or application logs used to operate, secure, and improve the service.",
        "Security and abuse-prevention information, such as logs or signals reasonably necessary to detect misuse, protect the site, investigate incidents, and preserve service integrity.",
      ],
    },
    {
      title: "2.3 Cookies and similar technologies",
      bullets: [
        "Noon uses strictly necessary and functional technologies needed to operate the website, maintain session behavior where applicable, remember basic preferences, and support core site features.",
        "As of the effective date of this Policy, Noon does not state that the public website uses third-party advertising cookies or sells or shares personal information for cross-context behavioral advertising.",
        "If Noon later enables analytics, advertising, or additional measurement tools that materially change these practices, Noon will update this Policy and the related Cookies Policy before or at the time those practices change.",
      ],
    },
    {
      title: "3. How Noon uses personal information",
      bullets: [
        "To operate, provide, secure, and maintain the website, Maxwell flow, contact flows, and related service communications.",
        "To review, route, and respond to project requests, general questions, partnership inquiries, collaboration requests, or other communications submitted to Noon.",
        "To understand your request, assess project fit, prepare diagnostics, clarify scope, create proposals, plan delivery, and communicate next steps.",
        "To deliver services you request from Noon, including design, development, AI-assisted outputs, support, maintenance, and related operational work.",
        "To authenticate users, support client portals or account-enabled flows if those features are used, and preserve continuity across permitted sessions.",
        "To generate invoices, support billing and accounting, maintain records, and comply with financial, tax, audit, or legal obligations.",
        "To detect, prevent, investigate, and respond to fraud, abuse, security incidents, unlawful conduct, and violations of Noon's terms or agreements.",
        "To improve reliability, usability, and service quality, including debugging and internal operational analysis consistent with this Policy.",
      ],
    },
    {
      title: "4. Maxwell, AI features, and customer content",
      bullets: [
        "If you use Maxwell or any other AI-assisted feature provided by Noon, Noon may process prompts, text, context, files, links, and related materials you submit in order to generate the requested output, continue the conversation, maintain continuity of your request, or support Noon's internal review and response process.",
        "Noon may also retain and review that content when reasonably necessary to maintain the feature, investigate problems, support quality control, preserve project history, or continue a sales or service process that you initiated.",
        "Noon does not use customer content to train its own foundation models without your explicit permission.",
        "Where AI or automation features depend on third-party providers, those providers may process relevant input and output under Noon's instructions or under the operational terms necessary to provide the feature.",
      ],
    },
    {
      title: "5. How Noon discloses personal information",
      bullets: [
        "Noon may disclose personal information to service providers and processors that help operate the website and services, such as hosting or infrastructure providers, form or email delivery providers, database or authentication providers, AI or automation providers, payment processors, customer support tools, and professional advisors.",
        "Noon may disclose information when reasonably necessary to comply with law, regulation, legal process, court order, government request, or to protect rights, safety, security, property, or users.",
        "Noon may disclose information as part of a merger, acquisition, financing, reorganization, sale of assets, or similar corporate transaction, subject to ordinary confidentiality and legal requirements.",
        "Noon does not state in this Policy that it sells personal information, and Noon does not state that it shares personal information for cross-context behavioral advertising.",
      ],
    },
    {
      title: "6. Data retention",
      bullets: [
        "Noon keeps personal information only for as long as reasonably necessary for the purposes described in this Policy, including service delivery, follow-up, recordkeeping, legal compliance, and dispute resolution.",
        "Typical retention ranges may include contact and inquiry records for up to 24 months after the last meaningful interaction; project and support records for the duration of the engagement and a reasonable period afterward; billing, invoicing, and tax records for up to 7 years; and technical logs for approximately 12 to 18 months, unless a longer period is required for security, legal, or operational reasons.",
        "If account-enabled features or client portals are used, Noon may retain related account records while the account is active and for a reasonable period afterward to support continuity, security, compliance, and dispute handling.",
        "Noon may retain information longer where required by law, where necessary to enforce agreements, where needed to resolve disputes, or where legitimate operational or security needs justify continued retention.",
      ],
    },
    {
      title: "7. Your choices and privacy rights",
      bullets: [
        "You may request access to, correction of, or deletion of personal information held by Noon, subject to applicable law and verification requirements.",
        "You may opt out of non-essential marketing communications by using the unsubscribe mechanism in those messages or by contacting Noon directly. Operational, legal, billing, and service-related messages may still be sent where necessary.",
        "You can manage cookies through your browser settings and any controls Noon may later make available. Blocking strictly necessary technologies may cause parts of the site or service to function poorly.",
        "California residents may have rights to know, access, correct, or delete personal information, and the right not to be discriminated against for exercising applicable rights. Noon will take reasonable steps to verify requests before acting on them.",
        "Because Noon does not state in this Policy that it sells personal information or shares it for cross-context behavioral advertising, this Policy does not provide a sale or sharing opt-out mechanism at this time.",
      ],
    },
    {
      title: "8. Security",
      bullets: [
        "Noon uses reasonable administrative, technical, and organizational measures appropriate to the nature of the information it handles. These measures are intended to help protect against unauthorized access, misuse, alteration, loss, or disclosure.",
        "No system is perfectly secure. You should use appropriate caution when sending information electronically and avoid sending highly sensitive information unless it is reasonably necessary and requested in a secure context.",
      ],
    },
    {
      title: "9. International transfers",
      bullets: [
        "Noon may store, access, or process personal information in the United States, Mexico, or other jurisdictions where Noon or its service providers operate.",
        "Data protection laws may differ across jurisdictions. When transfers occur, Noon applies reasonable contractual, operational, and security safeguards appropriate to the circumstances.",
      ],
    },
    {
      title: "10. Children",
      bullets: [
        "Noon's website and services are not directed to children under 13, and Noon does not knowingly collect personal information from children under 13.",
        "If Noon learns that it has collected personal information from a child under 13 without appropriate authorization, Noon will take reasonable steps to delete that information. A parent or guardian who believes this may have happened should contact Noon using the contact details below.",
      ],
    },
    {
      title: "11. Changes to this Policy",
      bullets: [
        "Noon may update this Policy from time to time to reflect changes in the website, services, legal requirements, business operations, or data practices.",
        "If Noon makes a material change, Noon will post the updated version here and, where appropriate, provide additional notice before the change takes effect.",
      ],
    },
    {
      title: "12. Contact",
      paragraphs: [
        "If you have questions about this Policy or wish to exercise applicable privacy rights, you may contact Noon using the details below.",
      ],
      bullets: ["Noon", "Wilmington, Delaware, USA", "Email: noon.message@gmail.com"],
    },
  ],
};

export const termsAndConditionsDocument: LegalDocument = {
  title: "Terms and Conditions",
  summary:
    "These Terms and Conditions govern access to and use of Noon's website, intake flows, contact forms, templates, prototype references, communications, and related development services.",
  overview: [
    "Effective date: March 31, 2026.",
    "Governing law: Delaware, USA.",
    "Contact: noon.message@gmail.com.",
  ],
  details: [
    { label: "Effective date", value: "March 31, 2026" },
    { label: "Governing law", value: "Delaware, USA" },
    ...legalContactDetails,
  ],
  sections: [
    {
      title: "1. Scope and Acceptance",
      paragraphs: [
        "These Terms and Conditions govern your access to and use of Noon's websites, pages, forms, intake flows, template references, communications, and related software development services provided by Noon.",
        "By accessing or using the Services, submitting an inquiry, starting a conversation through Maxwell, requesting a proposal, or otherwise engaging with Noon, you agree to these Terms. If you do not agree, do not use the Services.",
        "These Terms apply to the public website and to pre-contract interactions. Project-specific deliverables, pricing, acceptance criteria, support scope, and commercial details may also be governed by a written proposal, statement of work, invoice, order form, or similar written agreement. If there is a conflict between these Terms and a signed or accepted Project Agreement, the Project Agreement will control for that project.",
      ],
    },
    {
      title: "2. Eligibility",
      paragraphs: [
        "You must be at least 13 years old to use the Services. If you are between 13 and 17 years old, you may use the Services only with the involvement and consent of a parent or legal guardian. The Services are not directed to children under 13.",
      ],
    },
    {
      title: "3. What Noon Provides",
      paragraphs: [
        "Noon provides custom technology services and related pre-contract tools, which may include software discovery, project intake, prototypes, template references, web solutions, mobile solutions, AI and automation solutions, internal tools, dashboards, custom platforms, support arrangements, and related implementation services.",
        "Materials shown on the website, including templates, example builds, category pages, intake guidance, concept outputs, and responses produced through Maxwell or similar tools, are provided to help define needs and evaluate possible solutions. Unless expressly included in a Project Agreement, these materials are illustrative, informational, or pre-contractual and do not by themselves constitute a final deliverable, production deployment, or binding commitment to build a particular scope.",
      ],
    },
    {
      title: "4. Proposals, Project Start, and Activation",
      paragraphs: [
        "Noon may provide estimates, proposals, scopes, prototypes, or other preliminary materials before a project begins. Unless otherwise stated in writing, these materials are non-binding and may be revised by Noon before acceptance.",
        "A project does not begin merely because a user submitted a form, exchanged messages, received a prototype, or requested a proposal. A project begins only when the relevant scope and commercial terms are accepted in writing or through an approved commercial flow, and any required initial payment or activation amount identified by Noon has been received.",
        "Any proposal or commercial offer remains valid only for the period stated in that proposal or offer. If no validity period is stated, Noon may withdraw, revise, or reprice the proposal before it is accepted.",
      ],
    },
    {
      title: "5. Client Responsibilities",
      paragraphs: [
        "To allow Noon to perform efficiently, the client is responsible for providing accurate information, timely feedback, required content, approvals, credentials, accesses, and other dependencies reasonably needed for the work. Delays, rework, or additional costs resulting from missing, inaccurate, or late inputs are outside Noon's responsibility and may affect timelines, sequencing, or fees.",
        "The client is also responsible for reviewing deliverables, drafts, prototypes, and project communications within a reasonable time. Silence or delay may impact schedule and delivery sequencing.",
      ],
    },
    {
      title: "6. Fees, Billing, and Payment",
      paragraphs: [
        "Fees, payment structure, taxes, and billing cadence will be defined in the applicable Project Agreement, invoice, or proposal. Noon may invoice directly or use a third-party payment processor. Noon does not need to store full payment card numbers in order to process payments.",
        "Unless otherwise stated in writing, fees are quoted exclusive of applicable taxes, duties, bank charges, and processor fees; payments are due according to the schedule stated in the applicable proposal or invoice; Noon may pause or withhold work, delivery, deployment, access, or transfer until due amounts are paid; and the client is responsible for costs arising from failed payments, reversals, chargebacks, or payment disputes initiated by or attributable to the client.",
        "If a project is structured in phases, each phase may carry its own payment and delivery milestone. Noon is not required to begin a later phase before the prior required payment has been received.",
      ],
    },
    {
      title: "7. Cancellations, Refunds, and Project Pauses",
      paragraphs: [
        "Refund eligibility, if any, will be governed by the applicable Project Agreement. Unless otherwise stated in writing or required by law, fees already earned for work performed, reserved production time, accepted scoping work, approved creative or technical work, and non-recoverable third-party costs are non-refundable.",
        "If a client pauses a project, Noon may reschedule the remaining work based on team availability. If a project remains inactive for an extended period, Noon may require a revised timeline, updated scope, updated pricing, or a restart fee before resuming.",
        "Where a project depends on phased payment, Noon may pause further work if the next required payment is not made. Any such pause does not waive amounts already due.",
      ],
    },
    {
      title: "8. Intellectual Property, Ownership, and Licenses",
      paragraphs: [
        "Except as expressly transferred under a Project Agreement, Noon and its licensors retain all rights, title, and interest in and to the Services, the website, Maxwell, templates, framework elements, pre-existing tools, libraries, systems, know-how, internal methods, utilities, and all other pre-existing or independently developed Noon materials.",
        "Ownership of project deliverables is determined by the commercial model. For full-payment projects, ownership of the final agreed deliverable transfers to the client once the relevant deliverable has been completed, delivered, and fully paid. For phased projects, ownership transfers only to the scope that has actually been paid for and delivered. Unpaid scope, incomplete scope, unreleased internal work, and Noon Materials remain with Noon unless otherwise agreed in writing.",
        "Memberships, support plans, retainers, hosting arrangements, and other continuing service relationships do not by themselves transfer additional ownership. In those models, the relevant system or portions of it may continue operating as part of an ongoing Noon service for the client, subject to the agreed service terms.",
        "As between Noon and the client, the client retains ownership of the client's own business data, content, records, and information submitted to or generated for the client's project. Noon receives only the rights reasonably necessary to host, access, process, back up, maintain, support, secure, and deliver the Services for the client.",
        "Noon Materials and any third-party or open-source components remain subject to their own ownership and license terms. To the extent Noon Materials are embedded in a final deliverable transferred to a client, Noon grants the client a non-exclusive, perpetual license to use those Noon Materials only as incorporated into that deliverable and only as reasonably necessary to operate it, unless a different arrangement is stated in writing.",
      ],
    },
    {
      title: "9. Prototypes, Templates, and AI-Assisted Outputs",
      paragraphs: [
        "Noon may use AI-assisted workflows, internal tools, templates, and rapid prototyping methods to accelerate scoping, design, implementation, or support. Such use does not reduce Noon's right to determine its delivery methods and does not, by itself, change ownership, payment, support, or acceptance terms.",
        "Outputs generated through Maxwell, AI tools, prototype systems, or template references may require validation, refinement, additional engineering, design work, or written approval before becoming final deliverables. The client is responsible for reviewing outputs and confirming that they meet the intended business need before relying on them in production.",
        "Unless expressly stated in a Project Agreement, Noon is not obligated to implement every feature, concept, or assumption reflected in an early prototype, example, or AI-assisted output.",
      ],
    },
    {
      title: "10. Third-Party Services, Integrations, and Open Source",
      paragraphs: [
        "The Services may rely on third-party providers for infrastructure, hosting, cloud services, AI APIs, communications, authentication, payment processing, analytics, integrations, and other operational functions. Third-party services may also be recommended, embedded, or integrated into a client solution.",
        "Noon is not responsible for the products or services of third parties, for downtime or policy changes caused by those providers, or for obligations that arise directly under third-party terms. Open-source components are governed by their respective licenses. Clients are responsible for complying with third-party usage restrictions, subscription terms, or vendor policies that apply to their chosen stack or integrations.",
      ],
    },
    {
      title: "11. Accounts, Access, and Security",
      paragraphs: [
        "Certain parts of the Services may involve user accounts, authentication, restricted routes, or saved sessions. You are responsible for safeguarding credentials under your control and for notifying Noon promptly of suspected unauthorized use.",
        "Noon may suspend or rotate credentials, revoke access, or require additional verification where reasonably necessary to protect users, systems, deliverables, or client data.",
      ],
    },
    {
      title: "12. Acceptable Use",
      bullets: [
        "You may not violate law or third-party rights.",
        "You may not upload, transmit, or distribute malicious code, abusive content, or unlawful material.",
        "You may not probe, scan, overload, disrupt, or attempt unauthorized access to systems, accounts, or data.",
        "You may not use the Services to build or train competing tools, datasets, or products in a manner that misuses Noon's website, content, or systems.",
        "You may not misrepresent your identity, authority, budget, or project intent in a material way.",
      ],
      paragraphs: [
        "Noon may restrict access, refuse inquiries, or suspend activity that reasonably appears unlawful, abusive, deceptive, high-risk, or incompatible with the Services.",
      ],
    },
    {
      title: "13. Confidentiality and Use of Information",
      paragraphs: [
        "Each party may receive non-public information from the other in the course of a project or inquiry. A receiving party must use reasonable care to protect the disclosing party's non-public information and may use it only for the purpose for which it was shared, except where disclosure is required by law, professional obligation, or legitimate operational need under appropriate controls.",
        "This obligation does not apply to information that is already public without breach, was lawfully known without confidentiality duty, is lawfully received from a third party without restriction, or is independently developed without use of the protected information.",
      ],
    },
    {
      title: "14. Support, Maintenance, and Post-Delivery Arrangements",
      paragraphs: [
        "Unless expressly included in a Project Agreement, Noon is not required to provide ongoing maintenance, hosting, monitoring, updates, or support after delivery. Such services may be offered under a separate support plan, maintenance arrangement, retainer, or continuing service model.",
        "Where support or maintenance is purchased, scope, response expectations, coverage hours, infrastructure responsibility, and escalation handling will be governed by the applicable support arrangement rather than implied from the public website alone.",
      ],
    },
    {
      title: "15. Publicity and Portfolio Use",
      paragraphs: [
        "Unless the parties agree otherwise in writing, and subject to any confidentiality commitments, Noon may identify the client by name and refer generally to the nature of the work in Noon's portfolio, credential materials, or case studies after the relevant work is publicly launched or otherwise no longer confidential.",
      ],
    },
    {
      title: "16. Warranties and Disclaimers",
      paragraphs: [
        "The Services are provided on an 'as is' and 'as available' basis to the maximum extent permitted by law. Noon disclaims all implied warranties, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, and any warranty arising from course of dealing or usage of trade.",
        "Noon does not guarantee that the website, Maxwell, contact flows, templates, deliverables, or third-party integrations will be uninterrupted, error-free, or suitable for every intended use. Unless expressly agreed in writing, the client is responsible for final business review, legal review, compliance review, and acceptance of deliverables before live deployment.",
      ],
    },
    {
      title: "17. Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, Noon will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenue, lost business opportunity, loss of goodwill, or loss of data, even if advised of the possibility of such damages.",
        "To the maximum extent permitted by law, Noon's total aggregate liability arising out of or relating to the Services will not exceed the total amounts actually paid by the client to Noon for the specific Services giving rise to the claim during the twelve months immediately preceding the event that gave rise to the claim.",
        "Nothing in these Terms limits liability to the extent such limitation is prohibited by applicable law.",
      ],
    },
    {
      title: "18. Indemnification",
      paragraphs: [
        "You agree to indemnify, defend, and hold harmless Noon and its personnel from claims, liabilities, damages, losses, and reasonable costs, including legal fees, arising out of or related to your unlawful use of the Services; your content, instructions, materials, or data supplied by you in violation of law or third-party rights; or your breach of these Terms or a Project Agreement.",
      ],
    },
    {
      title: "19. Suspension and Termination",
      paragraphs: [
        "Noon may suspend, restrict, or terminate access to all or part of the Services where reasonably necessary to protect systems, comply with law, enforce these Terms, address non-payment, prevent abuse, or mitigate security or operational risk.",
        "You may stop using the public website at any time. Termination of access does not affect accrued payment obligations, rights regarding completed work, intellectual property provisions, confidentiality obligations, or any other clause that by its nature should survive termination.",
      ],
    },
    {
      title: "20. Changes to the Services or These Terms",
      paragraphs: [
        "Noon may update the website, Maxwell, intake flows, offerings, and these Terms from time to time. The current version will be posted on the website with its effective date. Material changes will apply prospectively unless otherwise required by law. Continued use of the Services after the effective date of revised Terms constitutes acceptance of the updated Terms.",
      ],
    },
    {
      title: "21. Governing Law and Venue",
      paragraphs: [
        "These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law rules. Any dispute arising out of or relating to these Terms or the Services that is not otherwise resolved by the parties will be brought exclusively in the state or federal courts located in Delaware, and each party consents to the jurisdiction and venue of those courts.",
      ],
    },
    {
      title: "22. Contact",
      bullets: ["Noon", "Wilmington, Delaware, USA", "Email: noon.message@gmail.com"],
    },
  ],
};

export const cookiesPolicyDocument: LegalDocument = {
  title: "Cookies Policy",
  subtitle: "Website policy for Noon's public website and related web experiences that link to this notice.",
  summary:
    "As of the effective date of this policy, Noon uses only cookies and similar technologies that are necessary to operate the website and limited functional tools that remember basic user choices or preserve interaction state where relevant.",
  overview: [
    "Noon does not use analytics or advertising cookies on the website at this time.",
    "If that changes, this policy will be updated before those tools are enabled where required.",
  ],
  details: [{ label: "Effective date", value: "March 31, 2026" }, ...legalContactDetails],
  sections: [
    {
      title: "1. Scope of this Policy",
      bullets: [
        "This policy explains how Noon uses cookies and similar technologies on its website and related web experiences that link to this policy.",
        "It should be read together with Noon's Privacy Policy. If there is any inconsistency between this Cookies Policy and the Privacy Policy, the more specific statement about cookies and similar technologies controls for that topic.",
      ],
    },
    {
      title: "2. What cookies and similar technologies are",
      bullets: [
        "Cookies are small text files placed on your device by a website. Similar technologies may include local storage, session storage, pixels, tags, SDK-like tools, or comparable browser-based mechanisms that help a website function properly or remember information between visits.",
        "For simplicity, this policy refers to all of these tools collectively as 'cookies,' unless a distinction matters.",
      ],
    },
    {
      title: "3. What Noon currently uses",
      bullets: [
        "Strictly necessary cookies or equivalent technologies. These are used to operate the website, maintain basic security, support core navigation, and keep essential features working.",
        "Functional cookies or equivalent technologies. These may be used to remember limited user choices or preserve interaction state where relevant, such as language preferences, partially completed forms, or continuity within a website feature if that feature is available.",
        "As of the effective date of this policy, Noon does not use analytics, measurement, advertising, or cross-context behavioral advertising cookies on the website. If Noon later enables any such tools, this policy will be updated accordingly before use where required.",
      ],
    },
    {
      title: "4. What Noon does not use at this time",
      bullets: [
        "Noon does not currently use cookies for ad targeting, retargeting, or cross-context behavioral advertising on the website.",
        "Noon does not currently use website analytics or performance-tracking cookies on the website.",
        "Noon does not currently use a cookie consent preference center because only essential and limited functional technologies are used at this time. If future tracking or optional cookies are introduced, Noon may implement additional controls and update this policy accordingly.",
      ],
    },
    {
      title: "5. Why Noon uses cookies",
      bullets: [
        "To keep the website working correctly and securely.",
        "To remember limited site preferences or interaction state where relevant.",
        "To support core website experiences such as forms, navigation, login continuity, or session continuity if and when those features are available.",
      ],
    },
    {
      title: "6. Third-party services",
      bullets: [
        "Noon may use third-party services to support hosting, infrastructure, authentication, databases, AI functionality, email delivery, or similar operational needs. If those services place cookies or similar technologies required for the website or a related feature to function, Noon treats them as part of the website's operational use.",
        "If Noon enables third-party analytics, advertising, embedded media, or comparable non-essential tools in the future, this policy will be updated to reflect that change before those tools are used where required.",
        "Third-party websites or services linked from Noon's website are governed by their own policies, not this one.",
      ],
    },
    {
      title: "7. How long cookies stay on your device",
      bullets: [
        "Some cookies last only while your browser session is open and are deleted when you close it.",
        "Other cookies or similar technologies may remain for a limited period so the website can remember a preference or preserve continuity between visits.",
        "Actual duration depends on the purpose of the cookie, the way the relevant feature is implemented, and your browser or device settings.",
      ],
    },
    {
      title: "8. Your choices",
      bullets: [
        "Most browsers let you block, restrict, or delete cookies through browser settings.",
        "If you block strictly necessary cookies, parts of the website may not work properly.",
        "Because Noon does not currently use analytics or advertising cookies on the website, there is no analytics or advertising cookie opt-out tool to manage at this time. If that changes, Noon will update this policy and provide any required controls or notices.",
      ],
    },
    {
      title: "9. Children",
      bullets: [
        "Noon does not knowingly use cookies to collect personal information from children under 13 through the website.",
        "If you believe a child under 13 has provided personal information through the website, contact Noon at noon.message@gmail.com so the issue can be reviewed.",
      ],
    },
    {
      title: "10. Changes to this Policy",
      bullets: [
        "Noon may update this Cookies Policy from time to time to reflect operational, legal, or website changes.",
        "When Noon makes material changes, the updated version will be posted with a new effective date.",
      ],
    },
    {
      title: "11. Contact",
      paragraphs: ["If you have questions about this Cookies Policy, you may contact Noon using the details below."],
      bullets: ["Noon", "Wilmington, Delaware, USA", "Email: noon.message@gmail.com"],
    },
  ],
};

export const legalNoticeDocument: LegalDocument = {
  title: "Legal Notice",
  summary:
    "This Legal Notice governs the institutional information, ownership statements, and general legal notices relating to Noon's public website.",
  overview: [
    "It identifies the operator of the site, describes the general scope of the website, and states baseline rules regarding content, intellectual property, contact, and use.",
  ],
  details: [{ label: "Effective date", value: "March 31, 2026" }, ...legalContactDetails],
  sections: [
    {
      title: "1. Website operator",
      paragraphs: [
        "The website is operated by Noon. For website and general legal contact purposes, the public contact details currently used by Noon are website contact email: noon.message@gmail.com and location reference: Wilmington, Delaware, United States.",
        "Unless and until Noon publishes updated corporate details on the website or in its legal documents, these are the contact details that apply to this Legal Notice.",
      ],
    },
    {
      title: "2. Scope of this website",
      paragraphs: [
        "This website is an institutional and commercial website for Noon's software development and technology services. It may present information about Noon, its service categories, its workflow, templates, capabilities, contact routes, and related initiatives.",
        "The website is intended to help visitors understand Noon's services, submit project or general inquiries, and begin a guided intake process through Maxwell or other contact routes made available by Noon.",
        "Nothing on the website should be interpreted as a guarantee that every inquiry will be accepted, quoted, or converted into an active engagement. Any project, service scope, deliverable, timeline, commercial term, or ownership transfer is subject to a separate proposal, statement of work, agreement, or other written confirmation issued by Noon.",
      ],
    },
    {
      title: "3. Informational nature of website content",
      paragraphs: [
        "The content published on this website is provided for general informational and commercial presentation purposes. Noon makes reasonable efforts to keep the website accurate and current, but the website may be updated, refined, or corrected over time.",
        "Website content does not, by itself, create a binding development agreement, service commitment, or guarantee of availability. Binding obligations arise only when expressly agreed in writing between Noon and the relevant client or counterparty.",
      ],
    },
    {
      title: "4. Intellectual property",
      paragraphs: [
        "Unless otherwise stated, the website, its structure, text, interface elements, branding, visual materials, layouts, and other original content are owned by Noon or used by Noon under applicable rights or licenses.",
        "No part of the website may be copied, reproduced, republished, distributed, modified, or exploited for commercial purposes without prior written permission, except where such use is permitted by applicable law.",
        "References to third-party technologies, frameworks, tools, or services remain the property of their respective owners. Their appearance on the website does not transfer ownership or imply that Noon claims rights over those third-party marks or assets.",
      ],
    },
    {
      title: "5. Use of the website",
      paragraphs: [
        "Visitors may use the website only for lawful purposes and in a way that does not damage, disable, overload, interfere with, or misuse the website or its supporting services.",
      ],
      bullets: [
        "Submit unlawful, infringing, abusive, deceptive, or malicious content.",
        "Attempt unauthorized access to systems, data, or accounts.",
        "Interfere with the operation, security, or integrity of the website.",
        "Use the website in a way that violates applicable law or the rights of Noon or third parties.",
      ],
    },
    {
      title: "6. Third-party services and links",
      paragraphs: [
        "The website may contain links to third-party websites, platforms, tools, or services, or may rely on third-party infrastructure to support hosting, communication, analytics, payments, AI functionality, or related operations.",
        "When you leave Noon's website or interact with third-party tools or services, additional terms, policies, or notices may apply. Noon is not responsible for the independent content, security, availability, or policies of third-party services that it does not control.",
      ],
    },
    {
      title: "7. Privacy and cookies",
      paragraphs: [
        "The handling of personal information and the use of cookies or similar technologies are addressed in Noon's Privacy Policy and Cookies Policy, which should be read together with this Legal Notice.",
        "If the website introduces new data collection, analytics, tracking, authentication, or related functionality, Noon may update its legal documents accordingly.",
      ],
    },
    {
      title: "8. Service proposals, ownership, and client data",
      paragraphs: [
        "This website may describe Noon's services, workflow, and engagement model at a high level. Final commercial and legal terms are not established by this Legal Notice alone.",
      ],
      bullets: [
        "Project proposals may include specific scope, pricing, timing, and delivery conditions.",
        "Ownership transfer depends on the commercial model actually agreed with the client.",
        "Support or membership arrangements do not, by themselves, transfer additional ownership rights.",
        "Client data remains the client's data, even where Noon continues to operate a hosted or service-based arrangement.",
      ],
    },
    {
      title: "9. Availability and changes",
      paragraphs: [
        "Noon may modify, suspend, replace, or remove any part of the website, including pages, routes, content, legal texts, forms, or functionality, at any time and without prior notice where permitted by law.",
        "Noon may also update this Legal Notice when the website, legal posture, or operating model changes. The updated version becomes effective on the date stated at the top of the document unless a different date is expressly provided.",
      ],
    },
    {
      title: "10. No professional advice",
      paragraphs: [
        "Nothing on the website constitutes legal, financial, tax, cybersecurity, regulatory, or other professional advice. Visitors should obtain advice from qualified professionals where needed before relying on website content for legal or commercial decisions.",
      ],
    },
    {
      title: "11. Governing law",
      paragraphs: [
        "To the extent applicable and unless a different governing-law clause is established in a specific agreement with Noon, this Legal Notice and the use of the website are intended to be interpreted consistently with the laws of the State of Delaware, United States, without regard to conflict-of-laws rules.",
      ],
    },
    {
      title: "12. Contact",
      paragraphs: [
        "If you need to contact Noon regarding this Legal Notice or the website's legal information, you may use the details below.",
      ],
      bullets: ["Noon", "Wilmington, Delaware, United States", "noon.message@gmail.com"],
    },
  ],
};
