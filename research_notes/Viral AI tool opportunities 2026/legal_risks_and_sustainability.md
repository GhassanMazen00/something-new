# Legal, Liability and Sustainability Constraints for a Solo Developer in Egypt Launching a Free AI Web Tool (late 2026)

> Method note for the report writer: research date is 2026-10-26. In this session every full-page fetch failed (WebFetch returned DNS errors for every domain, and the outbound proxy refused direct downloads with HTTP 403). So the findings below come from search-engine extracts of the cited pages, not from reading each page in full. Where extracts conflicted, or where a claim came from a vendor or aggregator rather than a primary source, I say so. None of this is legal advice. Where I say "a lawyer is genuinely needed", I mean it.

## 1. Egypt's Personal Data Protection Law (PDPL, Law 151/2020) and its Executive Regulations: what they require for a tool that handles documents, photos, voice notes, IDs or health data; PDPC licensing; cross-border transfers to US AI APIs

### Takeaway
The PDPL is now fully operative. Its Executive Regulations (ER) were issued on 1 Nov 2025, and the one-year grace period ends around 31 Oct / 1 Nov 2026, which is this week. Two things matter most for a tool that sends user uploads to a US model API. First, processing **sensitive data** (health, biometrics, children's data and, per the law's definition, financial data) needs a PDPC licence. Second, **any transfer or storage of personal data outside Egypt** needs a licence or permit, unless a narrow exception such as explicit consent applies. Fines for cross-border breaches reach EGP 5M and can come with imprisonment. Actual enforcement against small actors has not started, and the regulator's operational readiness is unclear.

### Cited Findings
**Status and timing**
- The ER were issued on 1 Nov 2025 as Decree No. 816 of 2025. Sources disagree on whether it is a Ministerial (MCIT) or Prime Ministerial decree. It entered into force the day after publication in the Official Gazette — [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/); [CMS](https://cms.law/en/are/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins); [Al Tamimi](https://www.tamimi.com/law_update_articles/from-policy-to-practice-egypt-issues-executive-regulations-of-the-personal-data-protection-law/); [Shalakany PDF](https://shalakany.com/wp-content/uploads/2025/12/New-Executive-Regulations-for-Egypts-Personal-Data-Protection-Law-.pdf)
- Baker McKenzie gives the effective date as 2 Nov 2025 and the compliance deadline as about 1 Nov 2026 — [Baker McKenzie, Jan 2026](https://www.bakermckenzie.com/-/media/files/insight/publications/2026/01/egypt--important-data-protection-update.pdf?sc_lang=en&rev=8774eef94d094895907450477889b8f0&hash=8058E1112638D4F78DA981423A341168). Other commentary puts the end of the grace period at 31 Oct 2026 — [Clyde & Co, Jan 2026](https://www.clydeco.com/en/insights/2026/01/egypt-regulatory-update-on-data-privacy); [Legal 500 / Al Tamimi](https://www.legal500.com/intelligence/egypt/privacy/from-policy-to-practice-egypt-issues-executive-regulations-of-the-personal-data-protection-law)
- A mid-2026 tracker describes the regulator (the Personal Data Protection Center, PDPC) as "established 2025, not yet operational" and says it is unclear whether licence applications are being processed — [LawLab Africa](https://research.lawlab.africa/egypt/)
- Commentary says regulators will first focus on large-scale data holders, and reports no public enforcement action to date — summarised in search extracts of [Chambers](https://chambers.com/articles/a-first-look-at-egypt-s-personal-data-protection-executive-regulations) and [DataGuidance](https://www.dataguidance.com/news/egypt-pdpc-issues-executive-regulations-personal-data). The extract did not say which of the two made which statement.

**Licensing framework and fees**
- Collecting, processing, retaining and protecting personal data is governed by a PDPC licence/permit framework. The law caps licence fees at EGP 2,000,000 and permit or certification fees at EGP 500,000. A permit is a time-limited authorisation of no more than one year, and it is renewable — [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/); [CMS](https://cms.law/en/are/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins)
- One fee table in the ER commentary lists **1–100,000 records as "Exempt"** from fees, with fees starting at EGP 200/year for the next tier. The cross-border licence fee is **50% of the controller/processor licence fee** for the same record-count tier — search extracts of [Consortio Law Firm (ER English)](https://consortiolawfirm.com/egypt-data-protection-law-executive-regulations-2025-english/) and [Raqmix](https://raqmix.net/insights/pdpl-executive-regulations-egypt). I could not open either page to confirm which one carries the table, and I did not check the figures against the Gazette text.

**Sensitive data (health, biometrics, children, IDs)**
- Controllers and processors may not collect, transfer, store, keep, process or make available sensitive personal data **except under a licence from the PDPC** — [Legal 500 / Al Tamimi](https://www.legal500.com/intelligence/egypt/privacy/from-policy-to-practice-egypt-issues-executive-regulations-of-the-personal-data-protection-law)
- Health data is treated as sensitive data with heightened protection, not as an exempt category — [Recording Law summary](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/egypt-data-privacy-laws/)
- Children's data is sensitive in every case. Baker McKenzie says the ER require **explicit written guardian consent for children under 15**. Kennedys refers to age-linked guardian-consent thresholds, so sources are not consistent on the age — [Baker McKenzie](https://connectontech.bakermckenzie.com/egypt-important-data-protection-update/); [Recording Law](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/egypt-data-privacy-laws/); [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/)
- My understanding of Article 1 of Law 151 is that "sensitive data" covers data revealing psychological, mental, physical or genetic health, biometric data, **financial data**, religious beliefs, political opinions and security status, with children's data always sensitive. This comes from prior knowledge of the law text, not from a page read in this session, so check it against the [law text (Andersen-hosted PDF)](https://eg.andersen.com/wp-content/uploads/2025/06/Law-No.-151-OF-2020.pdf).

**Cross-border transfers (e.g., sending data to US model APIs)**
- Transferring, storing, sharing or processing personal data outside Egypt requires a licence or permit. It is allowed only to jurisdictions assessed as giving an adequate level of protection — [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/); [CMS](https://cms.law/en/are/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins)
- The ER define cross-border transfer to **include storage abroad** — [Raqmix, "Storage abroad is a transfer"](https://raqmix.net/insights/pdpl-executive-regulations-egypt)
- Article 15 has narrow exceptions, including the data subject's **explicit consent** — search extract of [Consortio, cross-border guide](https://consortiolawfirm.com/cross-border-data-transfer-egypt-pdpl/)
- Penalty for cross-border transfers that breach Articles 14–16: **at least 3 months' imprisonment and/or a fine of EGP 500,000–5,000,000**, doubled for repeat offences — search extract of [Consortio](https://consortiolawfirm.com/cross-border-data-transfer-egypt-pdpl/). Another source gives a general non-compliance range of EGP 200,000–5M plus mandatory public disclosure of violations — [Recording Law](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/egypt-data-privacy-laws/)

**Other obligations**
- Breach notification goes to the PDPC **within 72 hours**, or immediately where national security is involved. Affected individuals must be told within **3 working days** of the PDPC notice — [Baker McKenzie](https://connectontech.bakermckenzie.com/egypt-important-data-protection-update/); [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/)
- Appointing and registering a DPO is mandatory "in applicable cases". One report flags personal liability for DPOs — [Shahid & Partners](https://www.shandpartners.com/insights/briefings/telecoms-media-technology/the-issuance-of-the-executive-regulations-of-the-data-protection-law-and-the-establishment-of-the-data-protection-centre/); [ResearchGate report](https://www.researchgate.net/publication/403761172_Report_Egypt's_Personal_Data_Protection_Law_Implementation_Challenges_and_Additional_Compliance_Requirements)
- Foreign controllers and processors handling data of people in Egypt may be in scope and must appoint an Egypt-based representative. One academic report calls the extraterritorial wording unclear — [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/); [ResearchGate report](https://www.researchgate.net/publication/403761172_Report_Egypt's_Personal_Data_Protection_Law_Implementation_Challenges_and_Additional_Compliance_Requirements)

**Model API data terms (relevant to transfers and sensitive data)**
- On the **free (unpaid) Gemini API tier**, Google may use submitted content and responses to "provide, improve, and develop Google products", and "human reviewers may read, annotate, and process your API input and output". There is reportedly no opt-out on that tier. On paid Gemini API / Vertex, Google says it does not use prompts or responses to improve products. Developers serving EEA, Swiss or UK users must use the paid service only — [Simon Willison on Gemini API terms](https://simonwillison.net/2024/Oct/17/gemini-terms-of-service/); [Meetily](https://meetily.ai/llm-privacy/gemini); [GAGE Academy vendor ledger](https://www.gage.academy/tools/ai-vendor-data-ledger/records/AVD-2026-0010-google-gemini-api-unpaid-tier)
- A secondary source says Anthropic and OpenAI do not train on API data by default. I did not verify this against first-party terms — [nihardaily](https://www.nihardaily.com/posts/does-the-free-ai-api-tier-train-on-your-data)

### Inferences
- A solo developer is a "controller" under the PDPL. Running a public web tool is not the personal/household use that the law excludes. Every upload of a document, photo, voice note or ID that goes to a US API is a **cross-border transfer**, and many of these uploads also contain **sensitive data**: health records, ID photos (biometric face images), bank statements (financial data), and children's photos.
- Risk ranking by input type, from lowest to highest:
  1. Text the user writes about a non-personal topic.
  2. Generic documents with no personal data, such as a product manual or a public law text.
  3. Personal documents such as CVs and contracts.
  4. Voice notes and photos of people (biometric arguments).
  5. National IDs, medical reports, prescriptions, lab results and bank documents.
  6. Anything about children.
  Tools built around inputs 4–6 need a PDPC licence for sensitive data and a cross-border licence, or a defensible explicit-consent basis. The first two inputs are close to PDPL-neutral.
- The design choices that most reduce risk:
  - Process **ephemerally**: no server-side storage of uploads, outputs discarded after the session, and no logging of raw content.
  - Get **explicit, granular consent** before upload. The notice should say in Arabic and English that content is sent to a named provider in the USA.
  - Discourage uploads of IDs, health data and children's data, or block them with client-side detection.
  - Strip EXIF/metadata on the client.
  - Do OCR or redaction **in the browser** where feasible, so only redacted text leaves the device.
  - Use **paid** API tiers with no-training terms. Never use the free Gemini tier for user personal data, because of the human-review clause.
  - Publish a short privacy notice that covers the breach-notification commitment.
- The fee exemption for 1–100,000 records, if accurate, suggests the regime is not meant to bankrupt micro-operators. But a free tool that goes viral could pass 100k users within weeks. The licence and fee questions for sensitive data and cross-border transfers may also apply whatever the volume (unverified).
- Because the grace period ends this week and the PDPC's readiness is unclear, a late-2026 launch should assume compliance obligations are formally live, even if enforcement is still slow. This is where a short consultation with an Egyptian data-protection lawyer is genuinely needed: confirming whether the explicit-consent exception covers a specific US-API data flow, and whether a sole proprietor must register or apply.

### Gaps
- I could not read the ER text or the PDPC's own site. I could not confirm whether the PDPC is accepting licence applications in Oct 2026, or what a natural-person licence application looks like.
- I could not confirm whether the 1–100,000 record exemption applies to sensitive-data and cross-border licences, or only to the basic controller licence.
- The age threshold for children's consent (under 15 per Baker McKenzie, versus other figures) is unresolved.
- I found no confirmation of whether the PDPC has issued an adequacy list, and whether the USA is on it.
- I found no reported PDPL enforcement action against any company as of the search date.

## 2. Restrictions on non-lawyers giving legal information/advice (Advocacy Law 17/1983) and non-doctors giving medical information; how Egyptian/Arab legal-tech and health-tech startups handle it

### Takeaway
Egypt reserves the *practice of law* to lawyers enrolled with the Bar. Historically, the penalties for exercising lawyer functions without enrolment were small fines, but posing as a lawyer carried imprisonment. I could not confirm whether general legal *information* is covered. For medicine, no telemedicine or AI-specific statute exists, but the Ministry of Health publicly warned the public against AI diagnosis in Dec 2025. The practical line is the same in both fields: give general information that cites official sources, never position the tool as a lawyer or doctor, and hand individualised advice to licensed professionals. That is how the main Egyptian legal-tech example, Hekouky, which was founded by a lawyer and connects users with lawyers, is set up.

### Cited Findings
**Legal**
- Only registered lawyers may practise law and call themselves lawyers in Egypt. In principle, practice is restricted to Egyptian lawyers enrolled with the Bar Association, and foreign lawyers can act only by exception with the Justice Minister's authorisation, subject to reciprocity — [IBA Cross-Border Legal Services ME Report 2019](https://www.ibanet.org/document?id=ITILS-Middle-East-2019); [GAFI "Practicing Law" guide](https://www.investinegypt.gov.eg/PublishingImages/Lists/ContentPageDetails/AllItems/Practicing%20Law.pdf)
- A 2018 academic article quotes the pre-2008 Article 227. Falsely claiming to be a lawyer carried imprisonment of at least one month plus a fine. Exercising lawyer functions without being on the Roll carried a fine of **EGP 200–500**. Article 3 is the provision that triggers the Article 227 penalties. These figures are historical and may have been amended — [The Legal Profession and the Rule of Law in the New Egypt (manshurat.org)](https://manshurat.org/file/13315/download?token=6OVTA1dx)
- Egyptian legal-tech example: **Hekouky**, founded by lawyer Hala Riad, aims to make Egyptian law accessible and answers legal questions by connecting lawyers with clients and building an online community — [Egyptian Streets, Nov 2020](https://egyptianstreets.com/2020/11/19/legal-tech-startup-hekouky-is-committed-to-making-egyptian-law-accessible/). **Avocato** is listed as an Egyptian legal-services startup — [Startup List Africa](https://startuplist.africa/industry/legal-tech)
- International cautionary case: in the US, the FTC alleged that DoNotPay, the self-styled "robot lawyer", could not substantiate its claims. DoNotPay agreed to pay **$193,000**, must notify its 2021–2023 subscribers of the service's limits, and must stop unsupported claims that it can substitute for professional services. The order was finalised in Jan 2025, and sources give inconsistent dates for the original settlement — [ABA Journal](https://www.abajournal.com/news/article/robot-lawyer-website-donotpay-settles-ftc-claims-it-couldnt-deliver-on-promises); [MLex](https://www.mlex.com/mlex/artificial-intelligence/articles/2296777/us-ftc-finalizes-order-over-bogus-robot-lawyer-ai-claims); [FTC](https://www.ftc.gov/node/86371)
- In *Moffatt v. Air Canada* (BC Civil Resolution Tribunal, 14 Feb 2024), the airline was held liable for wrong advice its website chatbot gave. The tribunal rejected the argument that the chatbot was a separate entity and awarded CAD 812.02. It was a tribunal decision, not a court ruling — [CBC](https://www.cbc.ca/news/canada/british-columbia/air-canada-chatbot-lawsuit-1.7116416); [ABA Business Law Today](https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-february/bc-tribunal-confirms-companies-remain-liable-information-provided-ai-chatbot/)

**Medical**
- Egypt has no specific regulations on telemedicine, according to a 2025 Springer study of Cairo physicians. A companion study recommends a national e-health body to license telemedicine practitioners — [Springer, Egyptian Journal of Forensic Sciences 2025](https://link.springer.com/article/10.1186/s41935-025-00437-1)
- An Andersen overview says Law 45/1969 governs medical ethics and professional conduct, though it does not address telemedicine directly. The overview is about 2.5 years old — [Andersen Egypt](https://eg.andersen.com/telemedicine-in-egypt/)
- In **Dec 2025, Egypt's Ministry of Health and Population** cautioned the public against relying on AI for diagnosis. Spokesperson Hossam Abdel-Ghaffar said AI health apps lack clinical expertise and human judgment, warned of "digital hallucinations" leading to unsafe drug recommendations, and described AI as a supporting tool, not a diagnostic authority — [Ahram Online](https://english.ahram.org.eg/News/559631.aspx)
- Egypt's draft AI law is expected to require **mandatory human oversight for high-risk uses including healthcare and justice**. The draft text is not public — [Legal 500 Egypt AI chapter](https://www.legal500.com/guides/chapter/egypt-artificial-intelligence/)
- An Oxford randomised study of about 1,300 participants (Feb 2026) found LLM users did not reliably reach accurate conclusions about symptoms, and the models sometimes failed to recognise when urgent help was needed — [University of Oxford](https://www.ox.ac.uk/news/2026-02-10-new-study-warns-risks-ai-chatbots-giving-medical-advice)
- Fewer than 1% of 2025 model outputs to medical questions included a warning, down from more than 26% in 2022. This is a Stanford-led preprint reported by MIT Technology Review — [MIT Technology Review, Jul 2025](https://www.technologyreview.com/2025/07/21/1120522/ai-companies-have-stopped-warning-you-that-their-chatbots-arent-doctors/)
- **Yara AI**, a free AI therapy app, shut down in Nov 2025 because its founder concluded that AI chatbots can be dangerous for people in crisis — [LegitTool shutdown tracker](https://legittool.com/shutdowns/)

### Inferences
- **Lower-risk legal tools**:
  - explaining what an official document or law says in plain Arabic, with citations to the article
  - explaining procedures (which office, which papers), drawn from government sources
  - drafting checklists
  - "questions to ask your lawyer" helpers
  - routing to the Bar's legal-aid committees or to licensed lawyers
- **Higher-risk legal tools**:
  - tools branded "AI lawyer" or "محامي ذكي"
  - tools that give case-specific opinions on the user's chances
  - tools that draft court filings for submission
  - tools that charge for legal "consultations"
  Calling the product a lawyer is the clearest exposure, both under Article 227 (impersonation) and on the DoNotPay theory of deceptive claims.
- **Lower-risk health tools**:
  - explaining what a lab-report term means in general
  - medication-leaflet translation or simplification, citing the leaflet
  - appointment and question preparation for doctors
  - wellness information
- **Higher-risk health tools**:
  - symptom-to-diagnosis tools
  - dosage recommendations
  - mental-health or crisis chat (see Yara AI)
  - anything that reads prescriptions or medical images and tells the user what to do
  These health inputs are also PDPL sensitive data (see section 1), which doubles the exposure.
- Disclaimers and design patterns that reduce risk:
  - Show a persistent Arabic and English banner: "معلومات عامة وليست استشارة قانونية/طبية" ("general information, not legal/medical advice").
  - Ground answers in retrieved official text and quote it with citations.
  - Refuse or escalate emergencies ("call 123 / go to the ER").
  - Keep logs minimal.
  - Don't use names or avatars that suggest a professional.
  - Add a "find a licensed lawyer/doctor" hand-off.
- Air Canada shows that disclaimers do not fully shield a provider from liability for what its bot says. Accuracy controls, such as retrieval with citations and narrow scope, matter as much as the disclaimer.

### Gaps
- I could not confirm the current text of Article 3 of Law 17/1983. My unverified understanding is that it lists giving legal opinions and consultations among lawyers' work. I also could not confirm the current Article 227 penalties after amendments, including the 2008 changes and any later ones. This is where an Egyptian lawyer is genuinely needed if the tool is legal-themed.
- I could not confirm the Medical Practice Law (Law 415/1954) provisions on unlicensed practice, or any Medical Syndicate statement on AI. The search found only the Ministry of Health warning.
- I found no published disclaimers or terms of service from Egyptian health-tech startups such as Vezeeta, Chefaa or Shezlong showing their exact "information not advice" wording.

## 3. Egypt's AI strategy and regulation in 2025-2026; Cybercrime Law 175/2018 implications for scraping, scam-reporting databases (defamation when listing phone numbers/sellers as scams) and user-generated content

### Takeaway
Egypt has **no binding AI law** yet. The draft law has not been published, and the operative instruments are soft law: the 2023 Responsible AI Charter, the 2025–2030 National AI Strategy, and a March 2026 National AI Governance Framework with generative-AI guidelines. The real legal teeth for a public web tool come from the **Cybercrime Law 175/2018** and the **Penal Code's criminal defamation articles**. Both carry prison terms. Website administrators can be liable for running a site that "facilitates" a crime. Publishing someone's information in a way that harms their reputation is criminalised whether or not the information is true. That makes a public "scam numbers/sellers" database one of the riskiest products a solo developer in Egypt could launch.

### Cited Findings
**AI regulation**
- No binding AI statute is in force. A draft AI law is under development and has been discussed with stakeholders, but it is not publicly accessible. It is expected to add mandatory human oversight for high-risk uses (employment, healthcare, justice) — [Legal 500 Egypt AI](https://www.legal500.com/guides/chapter/egypt-artificial-intelligence/); [regulations.ai summary 2026](https://regulations.ai/regulations/RAI-EG-NA-SUMMARY-2026); [regulations.ai draft AI Governance Law (2024)](https://regulations.ai/regulations/RAI-EG-NA-EDAIXXX-2024)
- The second-edition National AI Strategy covers 2025–2030 and integrates the principles of the 2023 Egyptian Charter for Responsible AI. The Charter has 13 general and 16 executive guidelines and is the main soft-law instrument — [regulations.ai strategy v2](https://regulations.ai/regulations/egypt-2025-01-national-ai-strategy-v2); [MCIT AI page](https://mcit.gov.eg/en/Artificial_Intelligence)
- The National Council for AI published a **Guide to Egypt's National AI Governance Framework (15 Mar 2026)**. It applies to government entities, state-owned enterprises **and private organisations**, and covers traditional, generative and general-purpose AI. The implementing body is the Egyptian Center for Responsible AI (ECRAI). The guide references "Generative AI Guidelines for Government & Individuals", covering fact-checking, copyright respect and data-leakage prevention — [NCAI guide PDF](https://ai.gov.eg/SynchedFiles/ar/Resources/Guide%20to%20Egypt%E2%80%99s%20National%20AI%20Governance%20Framework%2015-3-2026.pdf); [MCIT](https://mcit.gov.eg/en/Artificial_Intelligence)

**Cybercrime Law 175/2018: blocking, administrators, privacy**
- The law was published on 18 Aug 2018 and in force from mid-Aug 2018 — [iPleaders](https://blog.ipleaders.in/critical-analysis-of-egypts-new-cyber-law/); [Library of Congress](https://www.loc.gov/item/global-legal-monitor/2018-10-05/egypt-president-ratifies-anti-cybercrime-law/)
- **Article 7 (blocking):** investigating authorities can order a website blocked for content threatening national security or the economy, with court review within 72 hours. Sources describe the sequence differently. Rights groups criticise the vague triggers, and ARTICLE 19 counted at least 628 blocked sites (blocking generally) — [Mondaq](https://www.mondaq.com/white-collar-crime-anti-corruption-fraud/737244/anti-cyber-and-information-technology-crimes-law-in-egypt); [ARTICLE 19](https://www.article19.org/resources/egypt-human-rights-organisations-call-on-government-to-end-internet-censorship-and-website-blocking/)
- **Article 27 (site administrators):** anyone who runs, creates or uses a website or private account to commit **or facilitate** a punishable crime faces **at least 2 years' imprisonment and an EGP 100,000–300,000 fine** — [iPleaders](https://blog.ipleaders.in/critical-analysis-of-egypts-new-cyber-law/); [Mondaq](https://www.mondaq.com/Article/801742/New-AntiCyber-And-Information-Technology-Crimes-Law)
- **Article 25 (privacy / family values):** publishing images or information that violate a person's privacy without consent carries **at least 6 months' imprisonment and an EGP 50,000–100,000 fine**. The information is covered "whether true or false" — [Lexology](https://www.lexology.com/library/detail.aspx?g=90440972-f53e-46dd-b225-7f7cbdea7d73); [Mada Masr guide](https://www.madamasr.com/en/2018/08/21/feature/politics/how-you-will-be-affected-by-the-new-cybercrime-law-a-guide/)
- **Article 26:** intentionally using IT to process another person's personal data in connection with content contrary to public morals, or in a way that can harm their reputation or honour — [alamlawyer 2026 guide](https://alamlawyer.com/cybercrime-law-in-egypt/); [law text (Andersen PDF)](https://eg.andersen.com/wp-content/uploads/2025/06/Law-No.-175-of-2018-Concerning-Information-Technology-Crimes.pdf)
- Since April 2020, authorities have used Articles 25 and 26 against TikTok users for "violating family values" — [Freedom House, Freedom on the Net 2022](https://freedomhouse.org/country/egypt/freedom-net/2022)

**Penal Code defamation**
- Article 302 defines defamation as falsely attributing something to a person in a way that harms their honour or reputation. Article 303 sets the penalties. Andersen gives **fines of EGP 5,000–30,000 and up to 2 years' imprisonment, rising to up to 3 years where the statement falsely accuses the victim of a crime**. An older ICMEC translation lists EGP 2,500–7,500 and up to 1 year, which probably reflects the pre-amendment text — [Andersen, Defamation in Egypt](https://eg.andersen.com/defamation-in-egypt/); [ICMEC Egypt legislation](https://www.icmec.org/wp-content/uploads/2018/10/ICMEC-Egypt-National-Legislation.pdf)
- Article 308 bis applies the Article 303 penalties to defamation by telephone, which extends them to telecom means — [Masaar](https://masaar.net/en/issues-of-the-crime-of-intentional-disturbance-using-telecommunication-means-in-egypt/)
- A complaint over a social-media post can allege insult, defamation, threats, privacy violation or misuse of personal information — [EgyptToday, defamation on social media](https://www.egypttoday.com/Article/1/121136/Know-more-about-Egypt-s-punishment-to-defamation-on-social)

### Inferences
- **A public scam database that names phone numbers or sellers is high-risk.** It stacks several exposures:
  1. Labelling someone a "scammer" attributes a crime (fraud), which is the aggravated form of defamation under Article 303. Truth is a defence only in limited circumstances, and I did not verify those.
  2. Phone numbers and seller names are personal data, so publishing them without consent risks breaching the PDPL.
  3. Under Article 25, privacy is breached "whether true or false", and Article 26 covers processing personal data in a way that harms reputation.
  4. The site operator can be treated as running a site that facilitates those crimes under Article 27.
  A single false report submitted by a user could create criminal exposure for the operator, not just the user.
- **Safer anti-scam designs:**
  - A "paste a suspicious message/link and get a risk explanation" checker that analyses content patterns (urgency, fake bank or InstaPay requests, lookalike domains) and **publishes nothing about third parties**.
  - Private, non-public reporting that is forwarded to official channels.
  - Aggregate statistics only, with no individual identifiers shown.
  - If a lookup is unavoidable, return neutral wording only ("this number appears in N reports; we cannot verify them"). Add a takedown/right-of-reply process, keep moderation logs, and avoid displaying names. This last option is still not risk-free. Get a lawyer's view before launching it.
- **Political and religious content, and "family values" content**, are blocking and prosecution vectors under Articles 7, 25 and 26. For example, AI image or face tools that can produce sexualised or satirical images of real people are risky. So is any generator that makes content about officials. Restricting generation of real-person imagery is a sensible guardrail.
- The absence of an AI statute lowers *AI-specific* compliance costs today. A healthcare- or justice-adjacent tool may face human-oversight requirements once the draft law passes, and the timing is unknown.

### Gaps
- I found no reported Egyptian case where a scam-reporting website or page operator was prosecuted. The risk analysis above is inferred from the statutory text.
- I did not research Media Regulation Law 180/2018. My unverified recollection is that it can treat personal sites or accounts with 5,000+ followers as media outlets. A viral content site could be affected, so a lawyer should confirm this.
- I could not verify the Penal Code "truth defence" conditions or the current consolidated Article 303 figures.
- I did not confirm whether the NCAI generative-AI guidelines impose obligations on private developers, or are only recommendations.

## 4. Scraping legality and terms of service for common data sources (government portals, e-commerce sites, social platforms)

### Takeaway
In Egypt, Cybercrime Law Article 14 criminalises access "without right" and access that "violates license provisions". Article 15 covers exceeding authorised access. Republishing copied data raises the minimum prison term to 2 years. So scraping that breaches terms of service or gets around access controls on Egyptian government or commercial sites carries a real criminal-law argument, even though no case law on scraping was found. US case law (Meta v. Bright Data, X v. Bright Data) favours scraping of *logged-off public* data, but those are US district-court rulings, they do not bind Egypt, and scraped personal data still triggers the PDPL.

### Cited Findings
- **Article 14:** intentional access to a website, private account or prohibited information system, or continued access without right, carries **at least 1 year's imprisonment and/or an EGP 50,000–100,000 fine**. If the access results in **damaging, removing, changing, copying or republishing data**, the minimum becomes **2 years**. The law's definition of hacking includes access that **violates the provisions of a licence** — [Library of Congress](https://www.loc.gov/item/global-legal-monitor/2018-10-05/egypt-president-ratifies-anti-cybercrime-law/); [cybercrime-fr.org law translation](https://cybercrime-fr.org/wp-content/uploads/2020/04/Egyptian-cybercrime-law-.pdf); [TIMEP brief](https://timep.org/2018/12/19/cybercrime-law-brief/)
- **Article 15** separately covers exceeding authorised access in time or level, which is the provision closest to a terms-of-service breach — [Nilex guide for companies](https://nilexdigitalsystems.com/articles/anti-cyber-crimes-law-175-2018-companies)
- In 2018 a Ministry official said Article 14 targets hacking, not ordinary browsing. This is an interpretation, not a ruling — [Ahram Online Q&A](https://english.ahram.org.eg/News/309944.aspx)
- **Meta v. Bright Data (N.D. Cal., Jan 2024):** Judge Chen held that Meta's terms do not prohibit logged-off scraping of public data, and that the terms apply only to logged-in users. Meta then abandoned the case — [Calcalist](https://www.calcalistech.com/ctechnews/article/h1zshv53p); [Zyte blog](https://www.zyte.com/blog/california-court-meta-ruling)
- **X Corp v. Bright Data (May 2024):** Judge Alsup dismissed X's claims about access to its public site and held that claims about copying public data were preempted by copyright law. X was later allowed to proceed on amended allegations of server harm — [Social Media Today](https://www.socialmediatoday.com/news/x-formerly-twitter-loses-lawsuit-against-data-scrapers/715868/); [MediaPost](https://www.mediapost.com/publications/article/401510/x-corp-can-revive-scraping-battle-with-bright-dat.html)
- Commentators note it remains "not at all clear" that scraping public data is broadly allowed, and these are not appellate precedents — [Techdirt](https://www.techdirt.com/tag/license/)

### Inferences
- **Government portals** carry the highest risk for an Egyptian resident. They often sit behind CAPTCHAs or national-ID logins, so bypassing them looks like access "without right". Republishing the data lifts the minimum penalty to 2 years. And content touching the state is sensitive under the blocking powers. Prefer official downloadable datasets, gazette PDFs and published law texts, used as reference material and cited.
- **E-commerce sites** (price or product data): moderate risk. Respect robots.txt and rate limits, avoid logged-in areas, don't republish whole catalogues, and prefer affiliate or product APIs.
- **Social platforms**: high practical risk. Anti-bot measures, account bans and terms-of-service suits are likely, and posts contain personal data, which brings in PDPL obligations and possible Article 25/26 exposure if the data is republished. Use official APIs only.
- **Safest data model:** the user brings their own content (paste or upload) and the tool processes it on request. That removes scraping exposure, though the PDPL still applies to what they upload.

### Gaps
- I found no Egyptian court decision applying Article 14 or 15 to scraping or terms-of-service breaches.
- I did not review the specific terms of service of Egyptian e-commerce sites (Jumia, Amazon.eg, Noon) or of government portals.

## 5. Payments and monetisation available to an individual in Egypt in 2026; fit for a free viral tool

### Takeaway
Stripe still does not appear to be directly available to Egyptian residents. Workable rails exist, though:
- **Paymob**: local cards, Meeza and wallets. It reportedly has starter or freelancer accounts for individuals.
- **Merchants of record** that reportedly pay out to Egypt: Lemon Squeezy (official docs), Paddle, Gumroad and Creem (third-party reports).
- **Patreon**: payouts by bank transfer in EGP or by PayPal.
- **AdSense**: pays in EGP to a local bank since May 2025.
Buy Me a Coffee is likely unavailable, since it pays out through Stripe only. Startup credit programmes have tightened: big credits now mostly need VC backing, and bootstrapped developers get roughly $2K–$5K. For a free viral tool, the realistic stack is cheap or free-tier models with hard caps, plus optional international supporter payments through a merchant of record, plus local EGP payments through Paymob, plus later B2B or sponsorship deals. Ads rarely cover LLM costs.

### Cited Findings
**Card processing**
- Stripe is not an available gateway in Egypt, and Stripe Atlas reportedly isn't available either, according to undated community posts. I found no official Stripe statement — [Shopify Community](https://community.shopify.com/t/i-m-from-egypt-and-i-cant-add-a-payment-method/169088); [Shopify Community, Atlas](https://community.shopify.com/t/can-i-integrate-stripe-atlas-with-my-store-from-egypt/246887)
- Service vendors market Stripe access by setting up a UK company. They have an interest in selling this, and it raises tax and compliance questions — [Osome](https://osome.com/uk/blog/stripe-verified-business-egypt); [Incorpuk (2022)](https://incorpuk.com/blog/open-stripe-account-in-egypt/)
- **Paymob** operates in Egypt, Oman, Pakistan, KSA and UAE, with about 390,000 merchants and more than 50 payment methods (Visa, Mastercard, Meeza, wallets) — [Forbes Middle East Fintech 50 2025](https://www.forbesmiddleeast.com/ar/lists/the-middle-easts-fintech-50-2025/paymob/); [clinit.app guide](https://clinit.app/blog/paymob-digital-payments-egyptian-clinics)
- A competitor's blog says Paymob settles only in local currency and is a payment facilitator, not a merchant of record — [Dodo Payments blog](https://dodopayments.com/blogs/paymob-alternatives)
- Third-party guides describe a Paymob **"Starter Business" account for individuals or unregistered businesses**, and a newer **"Freelancer" account needing only a national ID plus proof of activity** (social media or website). Older guides list a commercial register and tax card as requirements. None of this is confirmed on Paymob's own site — [Cashbita, Jun 2026](https://www.cashbita.com/2026/06/create-paymob-account-ecommerce-store.html); [wpar.net](https://www.wpar.net/paymob/); [Acadimiat help](https://help.acadimiat.com/ar/article/tryka-alrbt-maa-paymob-4bnqc7/); [Paymob AR](https://paymob.com/ar/online-payment)
- Anecdote: debit cards in Egypt may be disallowed for foreign-currency payments, with only credit cards allowed — [ClientExec forum](https://forum.clientexec.com/threads/paymob-payment-gateway.1283/)

**Merchants of record and creator platforms**
- **Lemon Squeezy**: per a search extract of its official docs, Egypt is on its bank-payout country list, PayPal payouts reach 200+ countries, and EGP is a supported selling currency. A 2026 blog contradicts this, saying neither Lemon Squeezy nor Gumroad pays Egyptian sellers. The official docs should take precedence — [Lemon Squeezy supported countries](https://docs.lemonsqueezy.com/help/getting-started/supported-countries); [Lemon Squeezy currencies](https://docs.lemonsqueezy.com/help/payments/currencies); contra [Shareuhack](https://www.shareuhack.com/en/posts/digital-product-platform-comparison-asia-2026)
- An Oct 2026 comparison marks Egypt as supported for **Paddle** and **Gumroad**, and says **Dodo Payments is not taking new Egyptian sellers** — [agentaos.ai](https://agentaos.ai/answers/which-merchant-of-record-pays-out-to-my-country). Gumroad charges 10% + $0.50 — [Swell](https://www.swell.is/content/gumroad-pricing)
- **Creem** lists Egypt for local bank-account payouts — [Creem docs](https://docs.creem.io/faq/supported-countries)
- **Patreon** lists Egypt for bank transfer in EGP and names Egypt in its PayPal-supported list. PayPal's Arabic page says withdrawals to Egyptian banks take up to 7 business days — [Lilach Bullock, Patreon in Egypt 2026](https://www.lilachbullock.com/patreon-in-egypt/)
- **PayPal** is listed with partial access or withdrawal restrictions in Egypt — [doola 2026](https://www.doola.com/blog/which-countries-can-fully-use-paypal/)
- **Buy Me a Coffee** pays out through Stripe in a limited set of countries and reportedly dropped Payoneer in 2024. That suggests no route for Egypt, though it is unconfirmed — [zverok.space](https://zverok.space/blog/2024-08-08-bmac-snafu.html). An Egyptian developer reports that PayPal and Stripe generally don't handle EGP — [itch.io forum, Jan 2024](https://itch.io/t/3408631/payment-payout-methods-for-restricted-countries)

**Ads**
- From the start of **May 2025**, Egyptian publishers receive AdSense earnings **only in EGP**, to a local bank account able to receive them — [Ahram Online](https://english.ahram.org.eg/News/532880.aspx); [EgyptToday](https://www.egypttoday.com/Article/3/135149/Google-announces-shift-to-pay-content-creators-in-local-currencies)

**Credits and grants**
- **Microsoft for Startups** (from 2 Jul 2025): investor-affiliated startups get up to **$100,000** in Azure credits by invite or referral. Unaffiliated startups get up to **$5,000**. Existing unaffiliated Founders Hub credits run until expiry, then move to pay-as-you-go — [Microsoft Learn, program changes](https://learn.microsoft.com/en-us/startups/changes-microsoft-for-startups); [The Register](https://www.theregister.com/2025/07/01/microsoft_azure_startup/). A third-party blog says Azure credits cover OpenAI models on Azure, not Claude — [klymentiev.com](https://klymentiev.com/blog/microsoft-for-startups)
- **Google for Startups Cloud Program (AI track)** offers up to **$350,000 over 2 years**, but for **VC-backed seed to Series A** AI-first startups using Gemini or Vertex. The company must be founded within the last 10 years and have had no more than $5,000 in prior credits — [Google Cloud AI startups](https://cloud.google.com/startup/ai). Third parties describe a bootstrapped "Start" tier of about **$2,000** — [cloudkompas](https://cloudkompas.com/blog/google-cloud-for-startups-2026-credits-guide); [creditforstartups](https://creditforstartups.com/companies/google)
- **Anthropic startup program**: third-party trackers describe $5K (direct), $25K (VC or accelerator referral) and up to $100K tiers. Another page says Anthropic publishes no dollar tiers. The program is reportedly open with or without VC, needs a company email, lasts about 12 months, and credits work only on the first-party Claude API — [guptadeepak guide](https://guptadeepak.com/anthropic-claude-for-startups-the-complete-guide-to-credits-tiers-and-eligibility-2026/); [guptadeepak program page](https://guptadeepak.com/startup-offers/programs/anthropic-startup-program)
- **OpenAI**: its startup credits are reportedly routed through VC partners, with amounts not published — [fin.ai](https://fin.ai/learn/ai-credits-for-startups); [letsdatascience](https://letsdatascience.com/news/ai-labs-offer-startups-compute-credits-1d91df33)

**Model cost floor**
- Gemini **Pro models left the free tier on 1 Apr 2026**. Flash and Flash-Lite keep free access, and sources disagree on exact limits, ranging from about 1,500 requests per day to 30 RPM. **Gemini 2.5 Flash-Lite costs about $0.10 / $0.40 per million input/output tokens**, and 3.1 Flash-Lite costs $0.25 / $1.50 (generally available since 7 May 2026) — [DEV Community](https://dev.to/hassann/gemini-api-free-tier-in-2026-limits-models-and-when-you-get-billed-4081); [metacto](https://www.metacto.com/blogs/the-true-cost-of-google-gemini-a-guide-to-api-pricing-and-integration); [benchlm Oct 2026](https://benchlm.ai/google/api-pricing); [pecollective](https://pecollective.com/tools/gemini-free-tier-guide/)

### Inferences
- **Best fit for a free viral tool built from Egypt:**
  1. Run the core on the cheapest capable model, such as Flash-Lite-class at about $0.10–0.25 per million input tokens. Set per-user and global daily caps.
  2. Add an optional "supporter" or "pro" tier sold through a merchant of record that pays out to Egypt. Lemon Squeezy is the best-evidenced, and Paddle, Gumroad and Creem are alternatives. The merchant of record also handles foreign VAT and sales tax.
  3. Offer local EGP payments through Paymob, with cards, Meeza and wallets, for Egyptian users who can't pay in USD.
  4. Once usage is proven, pursue B2B licensing or sponsorship: banks, telcos or NGOs sponsoring an anti-scam or document-literacy tool, or a white-label API.
- AdSense works mechanically (EGP payouts), but ad RPMs in Egypt and MENA are unlikely to cover per-request LLM costs. That is an inference, and I found no MENA RPM data. Ads suit high-pageview, low-compute tools better.
- Credits are a runway, not a business model. A bootstrapped solo developer should expect about $2K (Google), $5K (Azure) and possibly $5K (Anthropic). The large tiers mostly need VC.
- The free Gemini tier is cheap but **unsuitable for personal or sensitive user data** because of its product-improvement and human-review terms (section 1). It also shows dependency risk: Pro was removed from the free tier in April 2026.
- Receiving foreign income as an individual likely raises Egyptian tax registration questions. This was not researched, and an accountant is needed.

### Gaps
- I found no official Stripe country list confirming Egypt's status. Check it on stripe.com/global.
- I could not confirm Paymob's freelancer/individual onboarding on Paymob's own site, or its fees.
- I found no data on whether InstaPay can be used for business collection by an individual developer. It is a person-to-person instant payment network, and the rules for commercial use were not found.
- I could not confirm Fawry merchant onboarding requirements for individuals.
- I could not confirm Ko-fi payouts to Egypt, or the current Buy Me a Coffee country list.
- Egyptian tax obligations for individual developers receiving foreign platform payouts were not researched.
- I found no MENA-specific AdSense RPM figures.

## 6. Lessons from viral free tools that collapsed under API costs or legal pressure

### Takeaway
The failure modes that recur are:
- uncapped usage-based infrastructure meeting sudden virality (Cara's roughly $96K one-month bill);
- "free forever" generative services whose per-user costs can't be recovered (Figgs AI shut down at more than 1M users, and Sora reportedly lost about $1M a day);
- liability or ethics walls in sensitive domains (DoNotPay's FTC order, Yara AI's voluntary shutdown, Air Canada held liable for its chatbot).
Hard spending caps, low-compute architecture, a non-sensitive domain and honest marketing claims are the main defences.

### Cited Findings
- **Cara**, an artist social app, grew from about 40K to 650K users in a week in June 2024. It ran up about **$96,280** in Vercel serverless overages in a single month, peaking around 56M function invocations a day. The founder said she had missed Vercel's warning emails — [TechCrunch](https://techcrunch.com/2024/06/06/a-social-app-for-creatives-cara-grew-from-40k-to-650k-users-in-a-week-because-artists-are-fed-up-with-metas-ai-policies/); [Silicon Republic](https://www.siliconrepublic.com/enterprise/instagram-cara-crash-generative-ai-user-surge); [InfoQ](https://www.infoq.com/news/2024/06/vercel-serverless-scale-expenses); [Cara blog](https://blog.cara.app/blog/finances-and-future-of-cara)
- **Figgs AI**, a role-play platform with more than 1M users, shut down after its developers concluded that keeping it free was too expensive to sustain. This was 2023–24 — [TechCrunch AI graveyard, 24 Oct 2026](https://techcrunch.com/2026/10/24/the-ai-graveyard-a-running-list-of-projects-and-startups-that-didnt-make-it/)
- **OpenAI Sora** was reportedly losing about $1M a day against about $2.1M in lifetime in-app revenue, and its API shuts down on 24 Sep 2026. This comes from a lower-reliability secondary site, so verify it — [techjournal.org](https://techjournal.org/what-happened-to-sora-openai-shutdown)
- A Sep 2026 census found paid AI tools shutting down at 6.2% versus 3.6% for freemium, which goes against the idea that free tools are the most fragile. This is a single-source industry census — [ToolDirectory.AI](https://tooldirectory.ai/blog/ai-tool-shutdown-rate-by-pricing-model)
- **DoNotPay** paid the FTC $193K over unsubstantiated "robot lawyer" claims — [ABA Journal](https://www.abajournal.com/news/article/robot-lawyer-website-donotpay-settles-ftc-claims-it-couldnt-deliver-on-promises)
- **Yara AI**, a free therapy app, closed in Nov 2025 over safety concerns for users in crisis, before its planned subscription launched — [LegitTool](https://legittool.com/shutdowns/)
- **Air Canada** was held liable for misinformation from its chatbot — [CBC](https://www.cbc.ca/news/canada/british-columbia/air-canada-chatbot-lawsuit-1.7116416)
- AI tool shutdown trackers for further examples — [Killed by AI](https://killedbyai.net/); [LegitTool](https://legittool.com/shutdowns/)

### Inferences
**Overall risk tiering for the final recommendation** (synthesised from sections 1–6):
- **Generally safe to launch from Egypt:**
  - tools where the user pastes text and the output is explanation, translation, simplification, formatting or drafting, on non-sensitive topics;
  - Arabic writing and productivity aids;
  - explainers for public documents or laws, with citations and an "information, not advice" label;
  - scam-*message* checkers that analyse content and publish nothing about third parties;
  - study aids;
  - CV and letter helpers, with ephemeral processing and consent for the transfer abroad.
- **Proceed only with strong guardrails, and ideally a lawyer consultation:**
  - tools that ingest personal documents, photos or voice notes, because of the cross-border transfer and possible PDPL licensing;
  - legal-procedure assistants;
  - health-literacy tools such as a lab-report glossary, framed as general information without diagnosis.
- **Avoid as a solo developer in Egypt:**
  - public scam or blacklist databases naming people, numbers or sellers (defamation, privacy and Article 27 exposure);
  - "AI lawyer" or "AI doctor" products, symptom-to-diagnosis tools, dosage advice, mental-health or crisis chat;
  - processing of national IDs, children's data or medical records;
  - tools built on scraping government portals or social platforms;
  - generators of real-person or face imagery, or political and religious content.

**Sustainability design checklist** (inferred):
- Set hard provider-side budget caps and alerts, and treat warning emails as critical (the Cara lesson).
- Apply per-IP and per-account daily quotas, and require a login or CAPTCHA once traffic passes a threshold.
- Cache outputs for identical inputs.
- Do as much as possible client-side, such as OCR and redaction in the browser.
- Use the cheapest model that is good enough, and route only hard cases to a better model.
- Host on flat-price infrastructure rather than per-invocation serverless.
- Prepare a degrade mode ("busy, come back tomorrow") rather than paying for unbounded traffic.
- Keep the core free with a capped daily allowance, and sell a supporter or pro tier through a merchant of record.

### Gaps
- I found no well-documented 2025–2026 case of a *viral free LLM wrapper* publicly shutting down specifically over API bills, beyond Figgs AI (2023–24) and Sora (a big-company case).
- I found no case of an Egyptian or Arab AI tool being blocked or prosecuted. The risk assessment for Egypt rests on statutory text, not observed enforcement.
