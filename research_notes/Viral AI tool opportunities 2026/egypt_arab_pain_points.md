# High-Pain Everyday Problems in Egypt & the Arab World That a Free Arabic-First AI Web Tool Could Solve (as of 2026-10-26)

Method note for the report writer: ~38 web searches/fetches (English + Arabic queries). Several outlets (enterpriseam.com, english.ahram.org.eg, egyptianstreets.com) failed DNS resolution on direct fetch, so findings from those outlets rest on search-result excerpts rather than full-page reads; they are flagged where it matters. Anything dated before 2024 is labelled "BACKGROUND (pre-2024)".

---

## Cross-cutting context: Can Egyptians even reach a web tool, and is Arabic AI actually underserved?

### Takeaway
Reach is not the bottleneck: ~98M Egyptians are online and Facebook/YouTube/TikTok each have ~49-52M adult users. The gap is Arabic (especially Egyptian-dialect) quality and Arabic-first consumer products. Expect competition from the state, which launched its own free Arabic LLM chatbot (Karnak Chat) in Sept 2026.

### Cited Findings
- 98.2M internet users in Egypt at end-2025 (82.7% penetration); 121M cellular connections (102% of population, some voice/SMS-only) — [DataReportal Digital 2026: Egypt](https://datareportal.com/reports/digital-2026-egypt)
- 51.6M social media user identities (Oct 2025). Facebook ~51.6M, YouTube 49.3M, TikTok ~48.8M users aged 18+ — [DataReportal Digital 2026: Egypt](https://datareportal.com/reports/digital-2026-egypt)
- Mobile internet users hit 92.6M in Dec 2025 (IDSC) — [Zawya](https://www.zawya.com/en/business/technology-and-telecom/egypts-mobile-internet-users-hit-926mln-in-december-2025-idsc-hwrcfjnz)
- Egypt's MCIT did a pilot launch of **Karnak Chat**, a free Arabic assistant on the national "Karnak" LLM (open-source models further trained on Egyptian/Arab data, focused on MSA + Egyptian colloquial). It runs on the web plus Android/iOS apps, and a free version is on Hugging Face for developers. Official launch coverage dates to Sept 2026. Karnak was first unveiled Feb 2026 at the Ai Everything MEA summit in Cairo — [ITIDA press release](https://itida.gov.eg/English/PressReleases/Pages/egypt-national-ai-karnak-llm-launch-Ai-Everything-MEA-2026.aspx); [Ahram Online](https://english.ahram.org.eg/News/576301.aspx); [MENA Startup Digest](https://menastartupdigest.com/?p=49188)
- Karnak reportedly also powers other government apps, e.g. the "Sia" tutor and a legal assistant — [Ecofin Agency](https://www.ecofinagency.com/news-digital/1402-52900-egypt-unveils-sovereign-ai-model-karnak-as-cairo-hosts-global-ai-summit)
- Arabic LLM gap: most LLMs are trained mostly on English data, which limits performance in MSA, dialects and local context. TII launched Falcon-H1 Arabic in Jan 2026. Google.org gave USD 1M (Feb 2026) to an MBZUAI-led Arabic language-data initiative. NOTE: commercial market-report source — [MarkNtel Advisors](https://www.marknteladvisors.com/query/report-enquiry/uae-sovereign-arabic-large-language-model-market-report.html)
- Tarjama's CTO says dialect coverage is "the real challenge": they handle ~20 dialects, which is not enough — [Aletihad](https://en.aletihad.ae/news/ai/4606160/)
- Academic reviews (2024-25) still describe a scarcity of Arabic datasets and tools, with diglossia (MSA vs dialect) as a major hurdle — [Strathclyde review](https://strathprints.strath.ac.uk/92752); [arXiv survey](https://arxiv.org/abs/2505.08004)

### Inferences
- A web tool shared as a link via WhatsApp/Facebook can plausibly reach tens of millions. Facebook groups are the main distribution channel.
- The open Karnak weights on Hugging Face are a possible building block (Egyptian dialect), and Karnak Chat is also a direct free competitor for any general "ask about anything" assistant. Narrow, task-specific tools that beat a general chatbot are safer bets.
- Government AI pilots (Karnak Chat, Sia, Chat EGYPT) have unverified quality. No independent benchmarks were found.

### Gaps
- No WhatsApp user count for Egypt was found (Statista figures paywalled).
- No independent benchmark of Karnak vs GPT/Claude/Gemini/Jais/Falcon on Egyptian dialect.

---

## 1. Government bureaucracy: How painful are procedures, what does Digital Egypt cover, and is there an AI helper?

### Takeaway
Digital Egypt is growing fast (10.4M users, 23.8M transactions in 2025; ~245 services in 2026), but it reaches only about 1 in 10 internet users. Real estate registration remains a huge failure: estimates put 85-95% of properties unregistered. The state is now piloting its own AI helpers (Sia as a guide to government services, Karnak Chat). Hard evidence on middlemen ("مخلّص") is old or undated.

### Cited Findings
- Digital Egypt platform: 10.4M users in 2025 (vs 8.1M in 2024, +28%), 23.8M transactions, 200+ services (Dec 2025 cabinet statement) — [MEA Tech Watch](https://meatechwatch.com/2025/12/04/digital-egypt-platform-sees-major-expansion-in-services-and-users-in-2025/); [Arab Finance](https://arabfinance.com/en/news/newdetails/digital-egypt-platform-expands-services-and-user-base-in-2025)
- ICT minister (2026): ~245 services currently available, target 400+ by 2030 — [Ahram Online](https://english.ahram.org.eg/News/576301.aspx) (snippet only; fetch failed)
- Digital Egypt officially launched mid-2022 after a two-year pilot. A later count gave 168+ services — [Youm7](https://www.youm7.com/6327040)
- Some services offer appointment booking or home delivery of documents — [App Store listing "مصر الرقمية"](https://apps.apple.com/ie/app/%D9%85%D8%B5%D8%B1-%D8%A7%D9%84%D8%B1%D9%82%D9%85%D9%8A%D8%A9/id1512178806)
- Digital push vs illiteracy: many citizens go to computer/internet shops instead of registering themselves — [Asharq Al-Awsat](https://aawsat.com/node/5208470)
- Example of digital-service failure: the Electricity Ministry received many complaints over the unstable new e-services platform (prepaid "coded" meter requests stalled) — [Banker News](https://banker.news/154950)
- The Sia AI (Karnak-based), launched early 2026, is "also being rolled out as a guide to government services" — [Enterprise, 4 May 2026](https://enterpriseam.com/egypt/2026/05/04/egypt-debuts-sovereign-ai-but-educators-are-split/) (snippet)
- Real estate registration (الشهر العقاري): a legal expert says registered property is no more than 5% — [Al Bawaba News](https://www.albawabhnews.com/4368166). The former head of the registration authority said ~93% is unregistered (statement appears to date from 2021). Another report says ~85% — [Asharq](https://asharq.com/reports/3956/مع-اقتراب-تطبيقها-تعديلات-توثيق/). A circulating "95% unregistered" figure traces to Jan 2022 content — [Parlmany](https://www.parlmany.com/News/2/471911/95-من-العقارات-غير-مسجلة-خطة-النواب-تؤجل-مناقشة-تعديلات). The justice minister says registration is the only legal route to transfer ownership, and the PM formed a committee to ease procedures.
- Bribery/red tape, BACKGROUND (undated, likely pre-2024): a Baseera poll found 69% satisfied with basic services, 37% said they bribe public employees, 58% said they get services without bribes — [Egypt Independent](https://www.egyptindependent.com/baseera-69-egyptians-satisfied-public-services/). GAN Integrity: businesses rely on connections and middlemen (wasta) — [GAN Integrity](https://www.ganintegrity.com/country-profiles/egypt/)
- BACKGROUND (2012): Reuters described Egyptians dreading official paperwork that takes "hours, days or even weeks" in offices — cited via [Ahram Online guide](https://english.ahram.org.eg/News/49614.aspx)

### Inferences
- Pain point: people don't know which papers, fees, office, or online-vs-in-person route apply to their case (e.g., "I want to renew my car license with an old violation"). Official info is scattered across ministry sites, Digital Egypt service pages and news "خطوات" articles, which are huge SEO traffic magnets on Youm7, Masrawy and Elwatan.
- A checklist generator ("ورقك إيه؟") grounded in scraped official service pages plus crowdsourced updates is buildable. The free state assistant (Sia/Karnak Chat) is direct competition, but state tools tend to cover only official, sometimes outdated, information and not real-world tips (queues, unofficial extra papers).
- Liability is low-risk (informational), but content goes stale fast, so a crowdsourced "last verified" mechanism would be needed.

### Gaps
- No 2024-2026 survey quantifying time lost, middleman ("مخلّص") usage or fees. Media coverage of Facebook help groups was not found in this pass.
- No reviews or quality assessments of Sia/Karnak Chat for government-service questions.
- Specific procedures (passports, military service papers, ration cards/تموين, pensions) were not individually researched for 2026 pain evidence.

---

## 2. Legal: The 2025 old rent law (Law 164/2025): scale, what changed, how confused are people?

### Takeaway
This is the single most time-bound, mass-confusion legal change. About 1.64M households (>4M people) and ~3.19M old-rent units (2017 census) face 7-year (residential) / 5-year (non-residential) phase-outs. Rent multipliers depend on a three-tier zone classification set by governorate committees that were repeatedly extended. There is a 250 EGP temporary payment, a closed alternative-housing application window, and pending constitutional challenges. No consumer calculator or explainer tool was found.

### Cited Findings
- Law 164 of 2025: passed by parliament 2 July 2025, published in the Official Gazette 4 Aug 2025 — [Egyptian Streets](https://egyptianstreets.com/2025/08/04/president-el-sisi-ratifies-amendments-ending-egypts-old-rent-arrangements/); [Egyptian Streets, 2 Jul 2025](https://egyptianstreets.com/2025/07/02/egypts-parliament-passes-controversial-old-rent-law-amendments/)
- Transition: 7 years for residential units (the government raised it from the proposed 5), 5 years for non-residential units rented by individuals. After that, leases fall under the Civil Code — [Egyptian Streets](https://egyptianstreets.com/2025/08/04/president-el-sisi-ratifies-amendments-ending-egypts-old-rent-arrangements/); [Ministry of Housing blog](https://blogs.realestate.gov.eg/news/amendments-to-the-old-rent-law-2025-gradual-rent-increase-and-contract-termination-within-five-years/)
- Rent jumps by zone: prime ("متميزة") ×20 with min EGP 1,000/month; middle ("متوسطة") ×10 with min EGP 400; economic ("اقتصادية") ×10 with min EGP 250. Non-residential ×5. Then +15% per year — [Egyptian Streets](https://egyptianstreets.com/2025/08/04/president-el-sisi-ratifies-amendments-ending-egypts-old-rent-arrangements/); [Banker News](https://banker.news/144848)
- Eviction grounds during transition include: unit closed >1 year without justification, tenant owns another property for the same use, or the state offers alternative housing — [Egyptian Streets](https://egyptianstreets.com/2025/08/04/president-el-sisi-ratifies-amendments-ending-egypts-old-rent-arrangements/)
- Scale (CAPMAS, 2017 census, the latest available): ~1.642M households (~7% of households) with more than 4M individuals; ~3.19M old-rent units, of which ~1.87M are residential and 500K+ are for business. The old-rent share of housing fell from 22% (1990) to 15% (2006) to 7% (2017) — [Al Mal News](https://almalnews.com/2013964/%D8%A7%D9%84%D8%A5%D8%AD%D8%B5%D8%A7%D8%A1-%D8%B9%D8%AF%D8%AF-%D8%A7%D9%84%D9%88%D8%AD%D8%AF%D8%A7%D8%AA-%D8%A7%D9%84%D8%B3%D9%83%D9%86%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%A4%D8%AC%D8%B1%D8%A9-%D8%A8/); [Al-Ahram Gate](https://gate.ahram.org.eg/News/5240877.aspx)
- CAPMAS head: 36% of old-rent households pay less than EGP 50/month — [Al-Ahram Gate](https://gate.ahram.org.eg/News/5166041.aspx) (headline)
- Zone-classification committees (لجان الحصر) are formed per governorate by the governor's decision. Criteria: location, build quality, utilities, transport, local rents. They run 3 months, extendable by the PM. Cairo's extension ran to 4 Feb 2026, and Cairo Governor decision 978/2026 set the zones. Tenants pay a temporary EGP 250/month until classification, with later reconciliation of differences — [Youm7, 2 Jan 2026](https://www.youm7.com/story/2026/1/2/هل-يجوز-مد-عمل-لجان-حصر-وحدات-الإيجار-القديم-بعد/7253181); [Parlmany, Aug/Oct 2026](https://www.parlmany.com/News/2/589225/بعد-مدّ-عمل-لجان-حصر-الإيجار-القديم-3-أشهر-تعرف); [Banker News](https://banker.news/144991)
- Committee decisions are administrative and can be challenged at the Administrative Court. Separate lawsuits seek suspension pending a Supreme Constitutional Court ruling. No final constitutional ruling was found as of these sources — [Banker News](https://banker.news/141057); [Dostor](https://www.dostor.org/5505931)
- Alternative-housing application (Article 8): via the Digital Egypt platform or post offices, with a detailed form (personal, job, unit, family data) and hotline 15999. Eligibility: original tenant or legal extension beneficiary, actually residing, neither spouse owning another suitable unit; one unit per beneficiary, same governorate — [Housing Ministry blog](https://blogs.realestate.gov.eg/news/housing-ministry-publishes-application-method-for-old-rent-tenants-seeking-alternative-units/); [Amwal Al Ghad digital guide](https://en.amwalalghad.com/?p=223055)
- Application deadline was extended to 12 July 2026, now closed, with a one-month appeals window for rejections — [Housing Ministry blog](https://blogs.realestate.gov.eg/news/deadline-for-applying-for-2026-alternative-housing-units-for-old-rent-law-tenants-july-12-marks-end-of-registration-via-egypt-digital-platform/); [Housing Ministry blog](https://blogs.realestate.gov.eg/?p=105324)
- The 2024 Supreme Constitutional Court ruling deemed fixed rents unconstitutional, which triggered the law. Tenants reacted with outrage — [Egyptian Streets, Apr 2025](https://egyptianstreets.com/2025/04/27/tenants-and-landlords-brace-for-egypts-rent-reform/)

### Inferences
- Concrete, viral tool: "احسب إيجارك الجديد" — enter old rent, governorate/district, unit type and law start date to get the new rent by year for 7 years, the arrears owed after the EGP 250 temporary period, the end date, and eviction risk triggers. Both tenants (~1.6M households) and landlords (comparable count) would share it. The math is deterministic (no LLM needed for the core), and an LLM can answer follow-up questions grounded in the law text.
- Hard part: mapping street/district to zone tier requires scraping each governorate's published decisions (27 governorates, published as PDFs/news). That is laborious but beginner-feasible, and itself a moat.
- Confusion is structurally high: repeated extensions, per-governorate decisions, a temporary payment with later reconciliation, and parallel lawsuits. News sites publish daily explainers ("تعرف على...") but no interactive tool was found.
- Risk: the law could change with a constitutional ruling, so the tool must show a "last updated" date and a disclaimer.

### Gaps
- No count of alternative-housing applications received.
- No 2026 count of disputes/evictions/lawsuits filed.
- No list of all 27 governorates' zone decisions found in one place (itself an opportunity).
- No existing calculator tool found. Possibly some exist as simple news-site widgets, but none surfaced.

---

## 3. Legal: Contracts (rental, employment, off-plan real estate): disputes, scams, and Arabic contract-review tools

### Takeaway
Off-plan developer delays are an active 2026 crisis: the government is drafting a developer law, a law firm launched a class action, and buyers keep paying installments on stalled projects. Consumer complaints run ~211K/year. Every Arabic legal-AI product found is B2B, paid and Saudi-law-focused; no free consumer Egyptian-law contract checker was found.

### Cited Findings
- Al Manassa (13 Aug 2026): a New Cairo buyer paid ~80% of the unit price; 3 years after the delivery date, construction has halted while the developer still demands monthly installments. Described as "far from unique" — [Al Manassa](https://almanassa.com/en/news/33412)
- The government is preparing a bill to regulate developers after delayed projects and buyer complaints. The PM said difficulties at "four or five" developments are not a sector-wide crisis — [International Investment](https://internationalinvestment.biz/en/egypt/8768-egypt-prepares-new-law-for-property-developers.html) (publication date unclear)
- Cause: developers fund construction from sales proceeds while offering low down payments and long payment plans, a cash-flow mismatch; buyers bear the delay costs — [Daily News Egypt](https://www.dailynewsegypt.com/?p=852448)
- Andersen Egypt launched a class-action initiative for late-delivery victims (allegations unproven). Their guidance: vague delivery clauses ("within a reasonable period") make breach hard to prove, while fixed dates and delay penalties protect buyers — [Andersen Egypt](https://eg.andersen.com/class-action-real-estate-misconduct/); [Andersen: ending contracts over delays](https://eg.andersen.com/ar/ending-real-estate-contracts-over-delays/)
- Egypt's Consumer Protection Agency received 211,732 complaints in 2025 (107,555 Greater Cairo; 104,177 regional). Top categories: durable goods/electrical appliances 32,384; telecom/mobile 18,726; online shopping and misleading ads 14,405. It claims a 96% resolution rate — [Dostor](https://www.dostor.org/5364204)
- July 2026: the CPA received 21K+ complaints and 33.5K hotline calls in one month — [Akhbar El Yom](https://m.akhbarelyom.com/news/NewDetails/4848937/1/حماية-المستهلك-تلقينا-أكثر-من-21-ألف-شكو)
- Main real estate complaint causes: poor specifications, missed delivery dates, unclear sales contracts — [Al Bawaba News](https://www.albawabhnews.com/5270998) (search excerpt; the sector attribution was ambiguous)
- BACKGROUND: "صحة توقيع" (signature validation) court rulings are described as a "gateway for fraud" in property sales, because ~85-95% of property is unregistered (see Q1) — [Elwatan](https://www.elwatannews.com/news/details/2975490)
- Arabic legal-AI landscape (all B2B or professional):
  - Clauze.AI (Saudi): enterprise bilingual contract review with KSA data residency, backed by White & Case — [Zawya](https://www.zawya.com/en/press-release/companies-news/clauze.ai-launches-as-the-first-enterprise-legal-ai-platform-built-for-saudi-arabia-and-the-region-483577)
  - Laika (Riyadh): Saudi-law Q&A with article citations, contract review, for firms — [Stanford CodeX TechIndex](https://techindex.law.stanford.edu/companies/laika)
  - Shwra (Riyadh, 2020): AI legal search, drafting and review, plus remote lawyers — [CodeX TechIndex](https://techindex.law.stanford.edu/companies/shwra)
  - QaanoonAI: Saudi legal research assistant, $2M pre-seed (June 2025) — [Caplight](https://www.caplight.com/company/qaanoon)
  - instaSpace (Oman, 2024): Arabic-English legal research, drafting and contract review, customers in 17 countries (Sept 2026) — [Oman Observer](https://www.omanobserver.om/ampArticle/1195767)
  - Egypt: only "Muhakem" (an NTI graduation project for Egyptian-law contract review) and freelance portfolio demos — [LinkedIn](https://eg.linkedin.com/in/marwashraf); [Mostaql portfolio](https://mostaql.com/portfolio/3641781-ai-powered-arabic-legal-contract-analysis-platform). A government Karnak-based "legal assistant" was mentioned but not detailed — [Ecofin](https://www.ecofinagency.com/news-digital/1402-52900-egypt-unveils-sovereign-ai-model-karnak-as-cairo-hosts-global-ai-summit)

### Inferences
- Gap: a free consumer tool where you photograph or upload an Arabic contract (new-rent "إيجار جديد" lease, employment offer, developer reservation/sales contract) and get plain Egyptian-Arabic red flags: missing delivery date, no delay penalty, one-sided cancellation, installment-continuation clauses, missing registration clause, and similar. It is feasible with an LLM plus vision OCR and a curated checklist per contract type. Must be framed as "questions to ask a lawyer", not legal advice.
- Off-plan buyers are high-value and highly active on Facebook compound groups, which makes them natural viral channels.
- The B2B players being Saudi and enterprise-priced leaves the free Egyptian consumer niche open, but a professional-practice rule could become an issue if the tool is positioned as legal advice.

### Gaps
- No count of off-plan buyers affected or total delayed units.
- No 2026 figures on rental-contract or employment-contract disputes in Egypt.
- No data on how many people use ChatGPT for contracts in Arabic.

---

## 4. Health: Understanding lab results/prescriptions in Arabic; medicine shortages and alternatives

### Takeaway
Medicine-alternative lookup is already served by the EDA's official service, several Arabic apps and an open GitHub database, so that gap is narrow. Plain-Egyptian-Arabic lab/medical report explanation has no visible Egyptian product, but carries clinical-safety and regulatory risk. 2026 shortage data was not found; the most recent hard numbers are 2024.

### Cited Findings
- The Egyptian Drug Authority (EDA) runs an online medicine-availability inquiry (24/7, with officers suggesting alternatives) plus hotline 15301 — [CairoScene](https://cairoscene.com/Buzz/You-Can-Now-Check-the-Availability-of-Drugs-in-Egypt-Online)
- The EDA also launched an official search for drug equivalents/alternatives on its website — [Elwatan](https://www.elwatannews.com/news/details/7493706)
- 2024 shortage scale (BACKGROUND-ish, 2024): the health ministry reported ~200 missing medicines with local equivalents and ~45 with none. An industry figure (July 2024) put ~800 drugs unavailable. A patient-rights group cited a critical shortfall of ≥210 life-saving drugs, some sold on the black market. The cause cited was foreign currency shortage — [Egypt Independent](https://www.egyptindependent.com/drug-shortages-hit-egypt-patients-resort-black-market/)
- Pharmacists report patients are reluctant to switch to substitutes even with the same active ingredient — [Egypt Independent](https://www.egyptindependent.com/drug-shortages-hit-egypt-patients-resort-black-market/)
- Price hikes: the UPA refused further increases after prices rose >50% on hundreds of products; the analysis argues hikes helped companies more than patients — [Majalla](https://en.majalla.com/node/328622/business-economy/egypt%E2%80%99s-drug-price-increases-help-companies-not-patients). BACKGROUND (~2023 or older): 1,730 drugs missing per a chamber head — [Fierce Pharma](https://www.fiercepharma.com/pharma-asia/egypt-hikes-drug-prices-by-a-fifth-as-shortages-grow)
- Existing alternative/price apps:
  - Med home (دليل دواء مصر): daily prices, Arabic/English search, alternatives by active ingredient — [mwm.ai listing](https://mwm.ai/apps/med-home/6747606536)
  - Drug Eye Index (عين الدواء): iPhone only, built with the Egyptian pharmacists' syndicate network, Arabic/English — [App Store](https://apps.apple.com/us/app/id1536569602)
  - Open "egyptian-drug-database" on GitHub (warns that prices and availability change) — [GitHub](https://github.com/karem505/egyptian-drug-database)
  - Chefaa (e-pharmacy) publishes Arabic content on alternatives — [Chefaa blog](https://chefaa.com/blog/%d9%85%d8%a7-%d8%a7%d9%84%d9%85%d9%82%d8%b5%d9%88%d8%af-%d8%a8%d8%a7%d9%84%d8%a8%d8%af%d8%a7%d8%a6%d9%84-%d9%88-%d9%87%d9%84-%d8%aa%d9%86%d8%a7%d9%88%d9%84%d9%87%d8%a7-%d9%8a%d8%b6%d8%b1-%d8%a8%d8%a7/)
- Wider Arab world: the Saudi FDA launched an e-service to identify drug alternatives — [SFDA](https://www.sfda.gov.sa/ar/news/773)
- Lab-report explainers: no Egyptian or Arabic product found. Biolab (App Store) offers AI lab-result explanations in English only. Yashfii (Egyptian EHR) lists AI decision support only as a roadmap item. Altibbi (Jordan) is an Arabic health-content and telehealth platform, not a report interpreter — [App Store Biolab](https://apps.apple.com/us/app/id577055245); [MEA Tech Watch](https://meatechwatch.com/2025/07/31/ai-powered-healthcare-solutions-aligning-with-egypts-digital-egypt-2030-vision/); [Altibbi](https://en.wikipedia.org/wiki/Altibbi)
- Regulatory tightening: Egypt's AI health tools face rising explainability, safety and cybersecurity standards — [MEA Tech Watch](https://meatechwatch.com/2025/07/31/ai-powered-healthcare-solutions-aligning-with-egypts-digital-egypt-2030-vision/). The JAMA Internal Medicine (2023) authors stress AI should complement clinical judgment — [Middle East Observer](https://meobserver.news/life-style/health-medicine/2026/08/07/artificial-intelligence-is-reshaping-healthcare-across-egypt-and-the-middle-east/)

### Inferences
- "Photo of my lab report → Egyptian-Arabic explanation + questions to ask your doctor" is technically easy (vision LLM), and likely high-demand given cheap labs and short doctor visits. However: (a) hallucination risk is serious; (b) Egyptian regulation is tightening; (c) ChatGPT/Gemini already do this for anyone who thinks to ask. Differentiation would need dialect, reference-range normalization, and strict "not a diagnosis" UX.
- Medicine alternatives: a beginner could add value only via (a) a prescription-photo/handwriting reader that maps to Egyptian trade names and then to alternatives and prices, or (b) crowdsourced "found it at pharmacy X" shortage reports. Otherwise the niche is crowded.

### Gaps
- No 2025-2026 official count of missing medicines.
- No app download or usage numbers for Med home or Drug Eye.
- No survey on Egyptians' difficulty understanding lab reports.

---

## 5. Education: Tutoring spend, Thanaweya Amma → Egyptian Baccalaureate transition, university admission (تنسيق)

### Takeaway
Huge, recurring, seasonal pain. Families spend billions on private lessons (≈$2.77bn/yr by one CAPMAS-attributed figure). ~921K students sat Thanaweya Amma in 2026, with 205K failing round one. ~832K students (99%) opted into the new Baccalaureate for 2026-27, whose four tracks lock in university options, amid documented confusion. The official tansik site only registers choices; no personalised "what can my score get me + which Bac track" tool was found. AI tutoring is getting crowded (Ministry platform, Sia, Faheem AI).

### Cited Findings
- Private tutoring spend: >$2.77bn/yr citing a CAPMAS report (undated Majalla piece). A former minister estimated ~EGP 47bn/yr — [Majalla](https://en.majalla.com/node/322334/business-economy/quality-education-falls-out-reach-many-egyptians). An "official figure" of ~EGP 25bn/yr — [Gulf News](https://gulfnews.com/amp/story/world%2Fmena%2Fcrackdown-on-private-tuition-triggers-outcry-in-egypt-1.60294923). BACKGROUND (2012): tutoring was 42% of household education spending (CAPMAS) — [Ahram Online](https://english.ahram.org.eg/News/51328.aspx)
- 2026: multi-child households can easily spend several thousand EGP/month on private lessons — [Egyptian Streets, 9 Apr 2026](https://egyptianstreets.com/2026/04/09/why-private-tutoring-rules-egypts-education/) (snippet; fetch failed)
- Thanaweya Amma 2026: ~921K students sat the exams — [Egypt Telegraph](https://www.egypttelegraph.com/article/254379/لـ921-ألف-طالب-انطلاق-ماراثون-امتحانات-الثانوية). Results: 205,553 failed round one; pass rates 75.1% (new system) and 72.1% (old system) — [Al Khaleej, 29 Jul 2026](https://www.alkhaleej.ae/2026-07-29/منوعات/محطات/نتيجة-الثانوية-العامة-2026-في-مصر-رسوب-أكثر-من-205-آلاف-طالب-الأرقام-الكاملة). ~58K absent — [Dostor](https://www.dostor.org/5650695)
- Tansik 2026 phase-one minimums: Science 91.25%, Math 86.09%, Literary 71.56%; registration 5-9 Aug 2026 on tansik.digital.gov.eg with geographic distribution rules — [Al-Ahram Gate](https://gate.ahram.org.eg/News/5881581.aspx); [Elwatan](https://www.elwatannews.com/news/details/8333688)
- The official site lets students order preferences by sector or university and shows allowed faculties grouped geographically. News sites publish "مؤشرات التنسيق" (past cut-offs) and guides — [Dostor](https://www.dostor.org/5654490)
- Egyptian Baccalaureate: 99% opt-in for 2026-27, ~832K students — [Enterprise](https://enterpriseam.com/egypt/blackboards/99-of-students-opted-into-egypts-new-baccalaureate-system/). Four tracks (Medicine & Life Sciences; Engineering & CS; Business; Arts & Humanities) determine which faculties remain available, like A-level choices — [Enterprise Guide, 20 Sep 2026](https://enterpriseam.com/egypt/2026/09/20/how-to-choose-the-right-education-track-for-your-child/)
- Reform "sparks confusion" — [Mada Masr](https://www.madamasr.com/en/?p=371757). Implementation "glitches" needed new mechanisms (announced 17 Aug) — [Ahram Online](https://english.ahram.org.eg/News/575757.aspx). Multiple exam attempts, paid retakes (EGP 500 in a Jan 2025 article, may be outdated); first cohort finals in 2027 — [Egyptian Streets, Jan 2025](https://egyptianstreets.com/2025/01/09/egypt-introduces-baccalaureate-certificate-system-as-alternative-to-thanaweya-amma/)
- AI tutoring supply: Sia (MCIT, early 2026), an Arabic and history tutor for high schoolers — [Enterprise, May 2026](https://enterpriseam.com/egypt/2026/05/04/egypt-debuts-sovereign-ai-but-educators-are-split/). A Ministry AI platform for personalised learning aims to reduce tutoring reliance (date unclear, possibly Jan 2025) — [CairoScene](https://cairoscene.com/buzz/ministry-of-education-to-launch-ai-powered-educational-platform). "Faheem AI" on the App Store lists the Ministry of Education as publisher, for Thanaweya/STEM — [App Store](https://apps.apple.com/mx/app/faheem-ai/id6743378136). Educators are split; some revert to paper exams — [Enterprise](https://enterpriseam.com/egypt/2026/05/04/egypt-debuts-sovereign-ai-but-educators-are-split/)

### Inferences
- Strongest education candidate for a solo dev: a "tansik + Bac track" advisor. Input: score, track/stream, governorate, interests. Output: faculties likely reachable based on past years' cut-offs (scraped from public "مؤشرات التنسيق" tables), geographic-distribution rules, and for Grade 10 Bac families, which track keeps which faculties open. Deterministic data plus LLM explanation in Egyptian Arabic.
- Virality: extremely seasonal (results late July → tansik phases Aug-Sep; Bac track choice around Grade 10). ~900K students per year plus parents are a natural shared-link audience (WhatsApp class groups, Facebook parent groups).
- A general AI tutor faces state-backed free competitors plus ChatGPT, so it is weaker for a beginner.

### Gaps
- No 2024-2026 CAPMAS figure on tutoring spend.
- No consolidated dataset of historical faculty cut-offs located (likely on news sites year by year).
- Not checked whether third-party tansik predictor sites/apps already exist (likely some exist; quality unknown). This needs a quick product-scan before building.

---

## 6. Money: Inflation, price tracking, savings decisions (gold vs certificates), fake gold

### Takeaway
Inflation is still double-digit (urban 13.9% in Sept 2026), gold hit a record EGP 7,475/g (21K) in Feb 2026, and gold imports exploded (~$4.05bn in H1 2026 vs $250M in H1 2025) as bank certificates matured. Savers are actively choosing between gold, certificates and T-bills, and fake gold is rising. Gold-price sites are plentiful; neutral Arabic "compare my options" tools were not found in this pass, but this edges into regulated financial advice.

### Cited Findings
- Sept 2026 annual urban inflation 13.9% (from 14.5% in Aug); monthly 1.3% driven by vegetables +15.1%; national headline 12.8%; core 14.1% — [Daily News Egypt](https://www.dailynewsegypt.com/2026/10/10/egypts-annual-urban-inflation-eases-to-13-9-in-september/); [Zawya (core)](https://www.zawya.com/en/economy/egypts-annual-core-inflation-eases-to-14.1-in-september-cbe-1589028). Transport inflation 24.3%, food 7.2% — [Trading Economics](https://tradingeconomics.com/egypt/inflation-cpi/news/590967). The CBE targets 7% ±2 by H2 2027.
- 21K gold record average EGP 7,475/gram on 28 Feb 2026 (after the US-Iran war began), ~EGP 6,100 in June, ~6,325 by end-Aug. Experts note T-bills and certificates compete for savings — [Ahram Online](https://english.ahram.org.eg/News/575886.aspx)
- Maturing high-yield certificates pushed liquidity into gold; gold imports $4.05bn in H1 2026 vs $249.6M in H1 2025; the pound weakened from July amid war-driven outflows — [Zawya / Gold Bullion](https://www.zawya.com/en/business/maturing-bank-certificates-channel-liquidity-into-egypts-gold-market-gold-bullion-409581)
- "Egypt's gold boom makes fakes harder to spot" (4 May 2026) — [Egyptian Streets](https://egyptianstreets.com/2026/05/04/egypts-gold-boom-makes-fakes-harder-to-spot/) (headline only; fetch failed)
- Background: savers cycling between gold and 2024 high-yield certificates; NBE/Banque Misr stopped issuing high-interest certificates — [Mada Masr](https://www.madamasr.com/en/?p=391125)

### Inferences
- A "where do I put my 100K EGP?" comparison calculator (certificate rates by bank vs gold incl. making charges (المصنعية) and buy/sell spread vs T-bill yields, net of inflation) is plausible and shareable. Data comes from public bank rate pages and gold price APIs. It must be framed as education, not advice, because of FRA/CBE rules.
- Gold-price tracking is commoditised (many sites/apps). The angle would be total cost including المصنعية, plus fake-gold checklists, not raw prices.

### Gaps
- Did not inventory existing Egyptian gold/certificate comparison sites or apps (e.g., price aggregators), so the size of this gap is unverified.
- No consumer-price-tracking app data (supermarket price comparison) found.

---

## 7. Money: Fraud, InstaPay scams, phishing, and Arabic deepfake/voice-clone scams

### Takeaway
Scams are an organised industry in 2026 Egypt. Fake InstaPay "staff" calls cost victims EGP 50-80K each, a fake-TV-app ring drained accounts (EGP 8M seized), and AI-built phishing sites target the elderly around pension dates. There are repeated CBE and InstaPay warnings, but no Arabic consumer "is this a scam?" checker; the advice given points to English tools (VirusTotal, Google Safe Browsing).

### Cited Findings
- Enterprise (6 Jul 2026): InstaPay scams are "a criminal industry with KPIs and a mission statement". Victims were told their account data needed urgent updates and walked through "verification" transfers; two lost EGP 80K each and one EGP 50K. InstaPay posted a warning on 14 June — [Enterprise](https://enterpriseam.com/egypt/2026/07/06/egypts-instapay-scams-arent-random-theyre-the-product-of-a-criminal-industry-with-kpis-and-a-mission-statement/) (snippet; fetch failed)
- The CBE warned of callers posing as InstaPay employees and sending fake links — [Amwal Al Ghad](https://en.amwalalghad.com/?p=230681)
- The Interior Ministry arrested a ring using a fake "free encrypted TV" app plus flash SMS to capture InstaPay PINs and move funds to e-wallets; seizures ~EGP 8M — [CairoScene](https://cairoscene.com/Buzz/Criminal-Ring-Arrested-Over-Fraud-Operation-Targeting-InstaPay-Users)
- InstaPay warning (3 May 2026, Arabic): staff never call or ask for fees, PINs or data — [Banker News](https://www.banker.news/135552); [BankyGate](https://www.bankygate.com/66030)
- Cybersecurity expert Mostafa Rahim: AI builds near-identical bank site clones spread via messaging apps; targets the elderly and low-digital-literacy users, peaking before monthly pension payouts with fake "pension increase" offers. He advises checking URLs with Google Safe Browsing/VirusTotal — [Egypt Independent](https://www.egyptindependent.com/?p=2833329) (date not shown)
- Official warning in Egypt against impersonation of bank employees — [Al Khaleej, May 2026](https://www.alkhaleej.ae/2026-05-09/%D9%85%D9%86%D9%88%D8%B9%D8%A7%D8%AA/%D9%85%D8%AD%D8%B7%D8%A7%D8%AA/%D8%AA%D8%AD%D8%B0%D9%8A%D8%B1-%D8%B1%D8%B3%D9%85%D9%8A-%D9%81%D9%8A-%D9%85%D8%B5%D8%B1-%D9%85%D9%86-%D8%A7%D8%B3%D8%AA%D9%87%D8%AF%D8%A7%D9%81-%D8%B9%D9%85%D9%84%D8%A7%D8%A1-%D8%A7%D9%84%D8%A8%D9%86%D9%88%D9%83%D9%83%D9%8A%D9%81-%D8%AA%D8%AA%D9%85-%D8%B3%D8%B1%D9%82%D8%A9-%D8%AD%D8%B3%D8%A7%D8%A8%D9%83)
- BACKGROUND (2022): Kaspersky found 57% of users in Egypt encountered phishing during e-payments — [Cyware](https://social.cyware.com/news/over-50-of-users-in-egypt-encountered-phishing-attempts-during-electronic-payments-report-bcc4fbd2)
- Deepfakes in Egypt (Jul 2025): scammers use deepfake audio/video to impersonate celebrities and relatives. In one case a man sent a large sum after a fake video and cloned voice of his brother — [Akhbar El Yom](https://akhbarelyom.com/news/newdetails/4654692/1/النصب-بالذكاء-الاصطناعي-استهداف-إلكتروني)
- Regional: Sharjah Police warn of rising deepfake video calls and voice notes — [Gulf News](https://gulfnews.com/uae/crime/sharjah-police-warn-residents-deepfake-scams-on-the-rise-1.500374583). Al Jazeera (May 2026) cites FBI data: US AI-enabled fraud losses >$893M in 2025, with deepfakes ~4 in 5 AI-fraud cases — [Al Jazeera Arabic](https://www.aljazeera.net/tech/2026/5/3/الجانب-المظلم-للذكاء-الاصطناعي). BACKGROUND (2020): UAE bank voice-clone theft ($35M) — [Onda Vasca](https://www.ondavasca.com/roban-a-un-banco-de-emiratos-arabes-35-millones-de-dolares-a-traves-de-una-llamada-de-telefono-con-una-voz-clonada/amp/)
- Consumer complaints in "online shopping and misleading ads" reached 14,405 in 2025 — [Dostor](https://www.dostor.org/5364204)

### Inferences
- Strong candidate: "اتنصب عليّا؟ / ده نصب؟" — paste or forward a suspicious SMS, WhatsApp message, link, phone number or screenshot and get an Egyptian-Arabic verdict, the matched known scam script (InstaPay "update your data", fake pension increase, fake prize, fake job, Facebook marketplace deposit), and what to do (bank's official hotline / report via official channels; specific hotline numbers not verified in this research). Building blocks: an LLM classifier with few-shot Egyptian scam scripts, Google Safe Browsing API (free), the VirusTotal public API, and a crowdsourced scam-number list.
- Highly shareable to parents and grandparents. Audience is every Egyptian with a phone. Low legal risk (informational). It does not compete with banks; it complements their warnings.
- Deepfake-voice detection itself is hard and unreliable for a beginner. Better to offer "verification rituals" (family code word, call back) than a detector.

### Gaps
- No 2025-2026 aggregate count or EGP total of e-payment fraud cases in Egypt (the Interior Ministry/CBE do not publish one, as far as found).
- No data on whether InstaPay/banks plan an in-app scam checker.
- Hotline numbers for reporting were not verified in this pass.

---

## 8. Jobs & freelancing: Youth unemployment, bilingual CVs, remote-work payments

### Takeaway
Headline unemployment is low (5.8% in Q2 2026), but educated youth (16.8%) and especially educated young women (38.3%) face high joblessness, and ~80% of the unemployed hold intermediate-or-higher qualifications. Wuzzuf/Forasna dominate listings, but Arabic-first CV/ATS help is thin. Evidence on freelancer payment problems was weak and mostly vendor or old.

### Cited Findings
- 2025 youth (15-29) unemployment 13.2% (from 14.9% in 2024); males 8.1%, females 33.8%. Educated youth 16.8% (males 10.1%, females 38.3%). Ages 20-24: 16.9% — [Egypt Today](https://www.egypttoday.com/Article/3/146772/Egypt%E2%80%99s-jobless-rate-eases-to-6-3-in-2025-as); [ME Observer](https://meobserver.news/economy/2026/04/30/egypt-jobs-unemployment-falls-to-6-3-in-2025-as-labour-force-expands/)
- Q2 2026 overall unemployment 5.8% (males 3.4%, females 14.4%) — [Arab Finance](https://arabfinance.com/en/news/newdetails/egypt-unemployment-rate-in-q2-2026). Q1 2026: 6.0%; holders of intermediate+ qualifications were 79.6% of the unemployed — [Zawya](https://www.zawya.com/en/economy/north-africa/egypts-unemployment-rate-down-to-6-in-q1-2026-capmas-saq03z6k)
- ILO-modelled 15-24 youth unemployment ~18.3% (2025), a different series — [FRED](https://fred.stlouisfed.org/series/SLUEM1524ZSEGY)
- Wuzzuf has a built-in ATS screening for keywords and skills. Forasna (Arabic-first) targets entry-level and blue-collar workers; informal workers are >60% of the workforce (vendor guide, secondary claims) — [Qureos](https://www.qureos.com/hiring-guide/top-recruitment-platforms-in-egypt); [StylingCV](https://stylingcv.com/ar/دليل-اجتياز-ats-مصر-وضف-فرصنا-2026/)
- Freelance payments: a 2024 mirror-hosted article says receiving money via PayPal in Egypt is limited — [weak source](https://node2.medicloud.intersales.de/news/paypal-in-egypt-is-it). A Payoneer success story cites earlier high fees and long waits for Egyptian freelancers (vendor content) — [Payoneer](https://www.payoneer.com/th/success-story/mohamed-eldeeb/)

### Inferences
- "Arabic CV → polished English/ATS CV + tailored to a Wuzzuf job post" is a plausible tool, but generic AI CV builders are crowded globally (English). The Egyptian angle is weak unless targeted at Arabic-only users (Forasna-type jobs, Gulf job applications) or at the women-returners segment.
- Freelance payment pain cannot be solved by a web tool (it is regulatory/banking), so low fit.

### Gaps
- No 2026 data on Wuzzuf/Forasna user counts or AI features (claims unverified).
- No reliable 2025-2026 source on PayPal/Payoneer limits or fees for Egypt.
- No data on Egyptian freelancer counts (e.g., Upwork/Fiverr) for 2026.

---

## 9. Accessibility & information: Arabic voice notes, visually impaired users, WhatsApp/Facebook misinformation

### Takeaway
Egyptian-dialect speech AI exists only as rough open-source models (Whisper fine-tunes, 37-55% WER for smaller models), so polished dialect transcription and summarisation of voice notes is an open gap. Visually impaired Egyptians number 1.5M-9M depending on definition, with only scattered Arabic assistive apps. Misinformation fact-checking is politically dangerous in Egypt (Matsda2sh staff detained in Sept-Oct 2026) and should be avoided by a solo dev.

### Cited Findings
- Visual impairment prevalence (2022 National Survey of Persons with Disabilities): 1.41% (~1.5M) to 8.38% (>9M) depending on definition — [Egypt Independent](https://www.egyptindependent.com/?p=2478150). WHO-cited ~1M blind and 3M visually impaired — [Egyptian Streets](https://egyptianstreets.com/?p=44522). Vodafone cites 4M+ — [Egypt Independent](https://www.egyptindependent.com/vodafone-egypt-launches-new-app-blind-and-visually-impaired-customers/)
- Existing Arabic assistive tools: Vodafone "E3rafli" (colours, currency, scratch cards); Damej (Arabic/English website screen reader); ScribeMe (AI audio description built by a blind Egyptian developer; Arabic support unconfirmed) — [Egypt Independent](https://www.egyptindependent.com/vodafone-egypt-launches-new-app-blind-and-visually-impaired-customers/); [Egypt Independent](https://egyptindependent.com/egypt-unveils-damej-an-application-providing-website-access-for-people-with-special-needs/); [Siasat](https://www.siasat.com/blind-egyptian-coders-ai-app-helps-others-see-the-world-3526904/amp/). Visually impaired Arabs are turning to AI tools — [The New Arab](https://www.newarab.com/features/visually-impaired-arabs-turn-ai-empowerment-and-equality)
- Egyptian Arabic ASR open models: whisper-medium-egy (~72h of Egyptian speech) — [Hugging Face](https://huggingface.co/MAdel121/whisper-medium-egy); whisper-large-v3 Egyptian LoRA (MGB-3) — [HF](https://huggingface.co/AbdelrahmanHassan/whisper-large-v3-egyptian-arabic); Metro-ASR Small (61M, Arabic-English code-switching, ~47% WER overall / ~37% Arabic) — [HF](https://huggingface.co/mohammedaly22/Metro-ASR-Small); wav2vec2 XLSR Egyptian (~55% WER) — [HF](https://huggingface.co/othrif/wav2vec2-large-xlsr-egyptian); Klaam toolkit — [GitHub ARBML/klaam](https://github.com/ARBML/klaam); MasriSpeech dataset (~100h) — [HF](https://huggingface.co/datasets/NightPrince/MasriSpeech-ASR-Finetuning); Egyptian TTS — [GitHub](https://github.com/joejoe03/Egyptian-Text-To-Speech)
- Misinformation: the Interior Ministry (1 Oct 2026) said it arrested 6 people tied to fact-checker Matsda2sh, accusing it of being a Brotherhood media committee; the platform denies this. PEN expressed solidarity — [Ahram Online](https://english.ahram.org.eg/News/577934.aspx); [PEN](https://pen.org/pen_category/egypt)
- The cabinet Media Centre launched "Chat EGYPT", an AI rumour tracker that verifies against official sources only — [Middle East AI News](https://www.middleeastainews.com/p/egypt-launches-chat-egypt-ai-platform); [The National, Dec 2025](https://www.thenationalnews.com/news/mena/2025/12/08/egypt-ai-fake-news/)
- An Egyptian Fact-Checking Day is held (March 2026) with workshops — [Al-Fanar Media](https://al-fanarmedia.org/2026/03/egyptian-fact-checking-day-al-fanar-media-sponsors-specialised-sessions-and-workshops/)

### Inferences
- "Voice note → text + summary in Egyptian Arabic" (for long family/work voice notes, elderly users, and deaf/hard-of-hearing users) is buildable with a hosted Whisper-large-v3 or Gemini/GPT audio API. Open Egyptian models are not production-quality, so use a commercial API and possibly a fine-tune later. Note: WhatsApp and Telegram have added native voice transcription in some languages; whether WhatsApp supports Egyptian Arabic in 2026 is unverified, and this is a major competitive risk.
- A "read this paper/screen/medicine box to me in Egyptian Arabic" tool for visually impaired users overlaps with Be My Eyes/Seeing AI (not checked for Egyptian dialect).
- Misinformation checking: avoid. It is legally and politically risky in Egypt (arrests, "fake news" penalties), and the state tool occupies the official-source niche.

### Gaps
- WhatsApp's native voice-message transcription language support (Arabic/Egyptian) in 2026 was not verified. This is critical before choosing the voice-note idea.
- No quality data on Be My Eyes / Seeing AI / Google Lookout in Egyptian Arabic.
- No data on WhatsApp misinformation volume in Egypt.

---

## 10. Synthesis: Candidate shortlist for ONE free, viral, beginner-buildable Arabic-first AI web tool

### Takeaway
The best-evidenced fits (high pain, mass scale, clear gap, low liability, buildable with LLM + public data) are: (1) an old-rent-law calculator and explainer, (2) an Arabic "is this a scam?" checker, (3) a tansik + Baccalaureate track advisor, and (4) a consumer Arabic contract red-flag checker. Medical-report explanation and savings advice have high demand but higher liability. Misinformation checking is unsafe in Egypt.

### Cited Findings (re-stated scale anchors per candidate)
- **A. Old rent law calculator/explainer** — ~1.64M households / >4M people / ~3.19M units — [Al Mal News](https://almalnews.com/2013964/%D8%A7%D9%84%D8%A5%D8%AD%D8%B5%D8%A7%D8%A1-%D8%B9%D8%AF%D8%AF-%D8%A7%D9%84%D9%88%D8%AD%D8%AF%D8%A7%D8%AA-%D8%A7%D9%84%D8%B3%D9%83%D9%86%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%A4%D8%AC%D8%B1%D8%A9-%D8%A8/). Per-governorate zone decisions, a temporary EGP 250, pending lawsuits — [Youm7](https://www.youm7.com/story/2026/1/2/هل-يجوز-مد-عمل-لجان-حصر-وحدات-الإيجار-القديم-بعد/7253181)
- **B. Arabic scam checker** — organised InstaPay fraud, EGP 50-80K losses per victim — [Enterprise](https://enterpriseam.com/egypt/2026/07/06/egypts-instapay-scams-arent-random-theyre-the-product-of-a-criminal-industry-with-kpis-and-a-mission-statement/); elderly and pension targeting — [Egypt Independent](https://www.egyptindependent.com/?p=2833329)
- **C. Tansik + Bac track advisor** — ~921K Thanaweya candidates in 2026 — [Egypt Telegraph](https://www.egypttelegraph.com/article/254379/لـ921-ألف-طالب-انطلاق-ماراثون-امتحانات-الثانوية); ~832K Bac opt-ins — [Enterprise](https://enterpriseam.com/egypt/blackboards/99-of-students-opted-into-egypts-new-baccalaureate-system/)
- **D. Contract red-flag checker (rent/job/off-plan)** — off-plan delays crisis — [Al Manassa](https://almanassa.com/en/news/33412); only B2B Saudi legal AI exists — [Zawya/Clauze](https://www.zawya.com/en/press-release/companies-news/clauze.ai-launches-as-the-first-enterprise-legal-ai-platform-built-for-saudi-arabia-and-the-region-483577)
- **E. Government paperwork navigator** — 245 services, 10.4M users — [MEA Tech Watch](https://meatechwatch.com/2025/12/04/digital-egypt-platform-sees-major-expansion-in-services-and-users-in-2025/); competitor Sia/Karnak Chat — [Ahram Online](https://english.ahram.org.eg/News/576301.aspx)
- **F. Lab/medical report explainer (Egyptian Arabic)** — no Arabic product found; regulatory tightening — [MEA Tech Watch](https://meatechwatch.com/2025/07/31/ai-powered-healthcare-solutions-aligning-with-egypts-digital-egypt-2030-vision/)
- **G. Prescription photo → alternatives + price** — crowded (EDA, Med home, Drug Eye, GitHub DB) — [Elwatan](https://www.elwatannews.com/news/details/7493706); [GitHub](https://github.com/karem505/egyptian-drug-database)
- **H. Savings comparator (gold vs certificates vs T-bills, inflation-adjusted)** — 13.9% urban inflation; gold record EGP 7,475/g — [Daily News Egypt](https://www.dailynewsegypt.com/2026/10/10/egypts-annual-urban-inflation-eases-to-13-9-in-september/); [Ahram Online](https://english.ahram.org.eg/News/575886.aspx)
- **I. Egyptian-Arabic voice-note transcriber/summariser** — open models immature — [HF Metro-ASR](https://huggingface.co/mohammedaly22/Metro-ASR-Small)
- **J. Arabic→English ATS CV tailor** — educated-youth unemployment 16.8%, young women 38.3% — [Egypt Today](https://www.egypttoday.com/Article/3/146772/Egypt%E2%80%99s-jobless-rate-eases-to-6-3-in-2025-as)
- **K. Misinformation checker** — AVOID: fact-checkers detained in Oct 2026 — [Ahram Online](https://english.ahram.org.eg/News/577934.aspx)

### Inferences (researcher's scoring; judgment, not sourced fact)
| # | Candidate | Pain/scale | Gap (no good free Arabic tool) | Beginner feasibility | Liability/political risk | Virality pattern |
|---|---|---|---|---|---|---|
| A | Old rent calculator | High (4M+ people + landlords) | Very high (none found) | High (deterministic math + scraping zone decisions) | Low-med (law in flux) | Burst + evergreen through 2032 |
| B | Scam checker | Very high (all phone users) | High (advice points to English tools) | High (LLM + Safe Browsing/VirusTotal APIs) | Low | Shareable to families; spikes on news |
| C | Tansik + Bac advisor | High (~900K/yr + parents) | Med-high (official site registers only; third-party predictors unverified) | High (data scraping + rules) | Low | Very seasonal (Jul-Sep) |
| D | Contract red-flag checker | Med-high | High for consumers | Med (OCR + checklists) | Med (legal-advice line) | Facebook compound/tenant groups |
| E | Gov paperwork navigator | Very high | Medium (state Sia/Karnak Chat entering) | Med (content upkeep) | Low | Evergreen SEO |
| F | Lab report explainer | High | High in Egyptian Arabic | High technically | High (health) | Shareable |
| G | Medicine alternatives | Med (shortage data stale) | Low (crowded) | High | Med | Low novelty |
| H | Savings comparator | High (inflation) | Unverified | High | Med (financial advice) | Spikes with rate/gold news |
| I | Voice-note transcriber | Med-high | Unverified (WhatsApp native risk) | Med (API cost per minute) | Low | Utility |
| J | Arabic→English CV | Med | Low-med (crowded globally) | High | Low | Moderate |
| K | Misinformation checker | High | Med | Med | Very high (arrests) | — |

- Cost note: A, C and much of E are mostly deterministic and data-driven, so near-zero LLM cost per user. That matters for a free tool going viral. B, D, F and I need an LLM/vision/audio call per use, so costs scale with virality and need rate-limits or a cheap model (e.g., open Karnak weights or a small hosted model).

### Gaps
- Not verified: whether third-party tansik predictor sites, old-rent calculators (news-site widgets) or Arabic scam-checker bots already exist with traction. A 30-minute app-store/Google/Facebook scan is recommended before committing.
- Other Arabic-speaking countries were only lightly covered (Saudi legal AI, the Saudi SFDA alternatives service, UAE deepfake warnings). No dedicated research on Morocco, Iraq, Jordan, Syria or the Gulf bureaucracy.
