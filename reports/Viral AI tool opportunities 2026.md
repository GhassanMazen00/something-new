# Build the Arabic Scam Checker First

The best single opportunity for a beginner developer building with Claude in late 2026 is a free, no-signup, Egyptian-Arabic "**ده نصب؟**" ("Is this a scam?") web tool. You paste or screenshot a suspicious SMS, WhatsApp message or link. You get back a plain-dialect verdict that names the specific scam script, quotes the red flags and gives the exact next step, packaged as a card you can forward to the family group in one tap. It is the only one of eleven candidates that passes all five tests at once:

- **The pain is industrial.** Egyptian InstaPay fraud now runs as "a criminal industry with KPIs", with single victims losing **EGP 50,000–80,000** ([Enterprise](https://enterpriseam.com/egypt/2026/07/06/egypts-instapay-scams-arent-random-theyre-the-product-of-a-criminal-industry-with-kpis-and-a-mission-statement/)). US-reported losses hit a record **$15.9 billion** in 2025 ([AOL/Yahoo](https://www.aol.com/articles/americans-lost-record-15-9-135921819.html)).
- **The gap is real.** None of the big-brand AI scam checkers documents Arabic message analysis ([Norton support](https://support.norton.com/sp/en/us/home/current/solutions/v202507031211511)). The Arabic tools that exist scan links only, or charge per check ([Tabayyun](https://tabayyun.com.sa/tabayyunlinks)).
- **It is cheap to run.** A check costs fractions of a cent on Claude Haiku 5.5, about $100–250 a month at 100,000 users.
- **It spreads on its own.** The warning travels back into the same WhatsApp group the scam arrived through.
- **Its legal exposure is low**, as long as it publishes nothing about third parties.

The runner-up is an old-rent-law calculator with a street-to-zone lookup. It costs almost nothing to run but is seasonal and data-heavy, so it is the right *second* project, timed for the September 2027 rent increase. Avoid university-admission predictors (at least eight exist), misinformation checkers (an independent fact-checker's staff were detained in October 2026), and anything branded as an AI lawyer or AI doctor. The real threats to the top pick are platforms (Google Messages' Arabic-capable scam detection, a WhatsApp scam alert in testing) and ChatGPT's 75% share of AI-chatbot use in Egypt. So the tool must win on dialect, Egypt-specific next steps and the shareable card, not on raw detection. A working MVP fits in two weeks on Cloudflare plus Haiku 5.5.

## Five tests eliminate nine of eleven ideas

The research tested every candidate against five filters a solo beginner cannot skip:

1. Mass pain backed by 2025–2026 evidence.
2. Existing solutions that are missing, bad, paywalled or English-only.
3. Buildable now from public APIs, open repos and LLMs, at a cost per use that survives going viral.
4. An output people naturally post or forward.
5. Legal exposure that one person in Egypt can carry.

Most ideas pass two or three. Few pass all five, because the filters pull against each other. The most shareable outputs (health, money) carry the most liability. The cheapest tools to run (deterministic calculators) tend to be seasonal. And the biggest problems attract state or platform competition.

Two contextual facts shape the whole field.

**Reach is not the bottleneck.** Egypt had **98.2 million internet users** at the end of 2025, about **51.6 million Facebook users** and about **48.8 million TikTok users aged 18+**, so a link shared through Facebook groups and WhatsApp can reach tens of millions ([DataReportal](https://datareportal.com/reports/digital-2026-egypt)).

**The gap that keeps recurring is language and geography, not technology.** Arabic is the content language of only about **0.6% of websites** ([W3Techs](https://w3techs.com/technologies/comparison/cl-ar-)). Almost every free incumbent found, whether a scam checker, a health assistant or a privacy tool, is English-only or US-only.

The Egyptian state is also moving into general Arabic AI. Its free **Karnak Chat** assistant went into pilot on 23 August 2026 ([AIC](https://www.aic.gov.eg/news/43/)). That argues for narrow, task-specific tools that beat a general chatbot, not another "ask me anything" assistant.

| Rank | Idea | Pain at scale | Best alternative today, and its gap | AI cost per use | Share loop | Main risk | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Arabic scam-message checker plus family safety kit | Organised InstaPay fraud; 211,732 consumer complaints in 2025 | Global checkers don't analyse Arabic text; Arabic bots scan links only | ~$0.0003–0.0006 | High: verdict card, quiz score, safe-word invite | False "safe" verdicts; platform features | **Build now** |
| 2 | Old-rent calculator with street-to-zone lookup | 1.64M households, 3.19M units | Youm7 widget applies only the 15% step; no street search | ~$0 (deterministic) | Medium-high, in bursts | Law under constitutional challenge; heavy data entry | Second project |
| 3 | Government-paperwork navigator | Digital Egypt at 13.5M users | Scattered "steps" articles; state chatbots | Low | Low (search traffic, not shares) | Stale content; scraping state portals | Later |
| 4 | Savings comparator (gold vs certificates) | 13.9% inflation; gold-import boom | Many price sites; neutral comparison gap unverified | ~$0 | Medium, spiky | Financial-advice framing | Small side tool |
| 5 | Contract red-flag checker | Off-plan delivery crisis | Business-to-business legal AI is crowded; ChatGPT is the default | ~$0.001 | Low | Lawyer-only practice rules; overclaiming | Not first |
| 6 | Egyptian voice-note transcriber | Dialect speech AI immature | Free state BelMasry speech-to-text | ~$0.0007/min | Low | Voice may count as biometric data | Skip |
| 7 | Lab-report explainer | 32% of US adults use AI for health | ChatGPT Health is US-only | ~$0.0006 | Low | Sensitive-data licence; Health Ministry warning | Avoid |
| 8 | Arabic-to-English CV tailor | Educated young women 38.3% jobless | Crowded global CV tools | ~$0.0005 | Low | Low | Skip |
| 9 | Medicine-alternative finder | Shortages (2024 data) | Official EDA search, Med home, Drug Eye, open database | ~$0 | Low | Stale prices | Skip |
| 10 | Tansik / Baccalaureate predictor | ~921K exam candidates | 8+ predictor sites, including an "AI assistant" | ~$0 | Seasonal | Low | Saturated |
| 11 | Misinformation checker | High | State "Chat EGYPT" | — | — | Fact-checkers detained | Avoid |

The table's per-use costs are derived from published model and API prices (sources are in the sections below). The verdicts are judgments that weigh all five tests together.

## Organised InstaPay fraud meets zero Arabic checkers

### Scams in Egypt now run like a business

The Egyptian evidence is recent and specific. Enterprise reported in July 2026 that InstaPay scams are organised operations: fake "staff" tell victims their accounts need urgent updates, then walk them through "verification" transfers. Two victims lost **EGP 80,000 each** and another EGP 50,000 ([Enterprise](https://enterpriseam.com/egypt/2026/07/06/egypts-instapay-scams-arent-random-theyre-the-product-of-a-criminal-industry-with-kpis-and-a-mission-statement/)). The Central Bank of Egypt (CBE) issued another warning in September 2026 about callers posing as InstaPay employees and sending fake links ([Alborsaa](https://www.alborsaanews.com/2026/09/04/1990407)). InstaPay itself says its staff never call or ask for fees, PINs or data ([Banker News](https://www.banker.news/135552)). Police broke up a ring that used a fake "free encrypted TV" app and flash SMS to capture InstaPay PINs, seizing about **EGP 8 million** ([CairoScene](https://cairoscene.com/Buzz/Criminal-Ring-Arrested-Over-Fraud-Operation-Targeting-InstaPay-Users)). A cybersecurity expert describes AI-built clones of bank sites aimed at the elderly, peaking just before monthly pension payouts with fake "pension increase" offers ([Egypt Independent](https://www.egyptindependent.com/?p=2833329)). Deepfakes have arrived too: in one Egyptian case a man sent a large sum after a fake video and cloned voice of his brother ([Akhbar El Yom](https://akhbarelyom.com/news/newdetails/4654692/1/النصب-بالذكاء-الاصطناعي-استهداف-إلكتروني)). Egypt's Consumer Protection Agency logged **211,732 complaints in 2025**, 14,405 of them about online shopping and misleading ads ([Dostor](https://www.dostor.org/5364204)). Egyptian media keep publishing checklists such as "7 signs of an InstaPay scam" ([Mobtada](https://www.mobtada.com/egypt/1650729/%D8%A7%D8%AD%D8%AA%D9%8A%D8%A7%D9%84-%D8%A5%D9%86%D8%B3%D8%AA%D8%A7%D8%A8%D8%A7%D9%8A-2026-7-%D8%B9%D9%84%D8%A7%D9%85%D8%A7%D8%AA-%D8%AA%D9%83%D8%B4%D9%81-%D8%A7%D9%84%D8%B1%D8%B3%D8%A7%D8%A6%D9%84-%D9%88%D8%A7%D9%84%D9%85%D9%83%D8%A7%D9%84%D9%85%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D8%B2%D9%8A%D9%81%D8%A9-%D9%88%D8%AA%D8%AD%D9%85%D9%8A-%D8%AD%D8%B3%D8%A7%D8%A8%D9%83)). That is a sign of demand for which no tool exists. One honest gap remains: neither the CBE nor the Interior Ministry publishes an aggregate count of e-payment fraud cases or losses, so national scale has to be inferred from these cases.

The regional and global numbers show the same pattern, and they show who gets hurt. In a 2024 UAE survey, **56% of residents** faced a scam attempt at least monthly, WhatsApp was the most misused platform, about 27% lost money (an average of $2,194), and only 9% fully recovered it ([WAM](https://www.wam.ae/en/article/b6f93te-2024-state-scams-uae-survey-reveals-65-scam)). The FBI's 2025 internet-crime report counted more than a million complaints and about **$20.9 billion** in losses, up 26% ([JD Supra](https://www.jdsupra.com/legalnews/fbi-releases-its-2025-internet-crime-7569349/)). Americans aged 60 and over lost **$7.7 billion (+59%)**, including more than $352 million in complaints that referenced AI ([AARP](https://www.aarp.org/money/scams-fraud/fbi-ftc-report-2025-losses.html)). Only about **4.8% of victims report** at all ([Bitdefender citing FTC](https://www.bitdefender.com/en-us/blog/hotforsecurity/ftc-americans-lost-12-5-billion-to-scams-last-year)). The design lesson follows directly. The people who lose the most are the least likely to seek out a tool themselves. So the product has to be something younger relatives forward to them, not something parents must discover.

### Every incumbent misses the Arabic message itself

None of the major AI scam checkers reads Arabic message text:

- **Norton Genie** lists its best-performing languages as English, French, German, Japanese and Spanish. Its app listing says it evaluates scams in English only, though it analyses URLs in any language ([Norton support](https://support.norton.com/sp/en/us/home/current/solutions/v202507031211511)).
- **Trend Micro ScamCheck** is sold as a paid product in the Middle East but lists no Arabic ([Trend Micro UAE](https://www.trendmicro.com/en_ae/forHome/products/trend-micro-scam-check.html)).
- **Bitdefender Scamio** is free, but Egyptian and Saudi users on Bitdefender's own forum are still asking for Arabic ([Bitdefender community](https://community.bitdefender.com/en/discussion/105043/when-will-arabic-be-available-for-your-favorite-bitdefender-products)).

What Arabic coverage exists is a patchwork that misses the message itself:

- **Tabayyun**, a Saudi service, charges **11.50 SAR for 35 checks** ([Tabayyun](https://tabayyun.com.sa/tabayyunlinks)). Its existence is useful evidence that Arabic speakers will pay for this.
- **Free Arabic Telegram bots** built on Dr.Web or VirusTotal scan links and files only ([Know4more](https://www.know4more.com/2025/04/drwebbot.html)).
- **Truecaller** covers numbers and is growing in Egypt through a 2026 partnership with Nile ([Egyptian Streets](https://egyptianstreets.com/2026/02/14/truecaller-partners-with-nile-to-expand-verified-business-calling-in-egypt/)).
- The telecom regulator **NTRA** offers complaint channels (hotline 155, an online form, the My NTRA app), but no way to check whether something is a scam ([NTRA](https://www.tra.gov.eg/en/consumers/telecom-services-complaints/contact-methods/)).
- Two small GitHub projects, **Tamahhal** and **digital-trust-checker**, describe themselves as Arabic message checkers ([Tamahhal](https://github.com/xMillon/Tamahhal); [digital-trust-checker](https://github.com/thestarsirius/digital-trust-checker)). Their traction and quality are unverified.

No free tool reads an Egyptian-dialect message or screenshot and then explains the InstaPay, Vodafone Cash or bank-impersonation pattern with steps to take.

The strongest case against building it deserves a direct answer.

- **ChatGPT holds 75.27% of AI-chatbot use in Egypt** ([StatCounter](https://gs.statcounter.com/ai-chatbot-market-share/all/egypt)), so anyone can already paste a message into it.
- **Google Messages' Scam Detection** reportedly supports Arabic ([tbreak](https://tbreak.com/google-messages-gemini-scam-detection/)). **Circle to Search** can now check on-screen texts ([Android Headlines](https://www.androidheadlines.com/2026/10/google-circle-to-search-scam-texts.html)).
- **WhatsApp is testing an in-chat "Scam alert"** on Android ([Asharq Al-Awsat](https://aawsat.com/node/5172639)).

These are real and will narrow the window. But each has a hole the product fills:

- A general chatbot works only if the at-risk person thinks to ask it, which is exactly what the 4.8% reporting rate says they don't do.
- Google's features live inside Android and Google Messages and don't read a screenshot forwarded from another app.
- None of them gives Egypt-specific next steps or produces something a son can send his mother.

The opening, then, is the forwardable Arabic explanation for non-technical relatives. Detection quality alone, which frontier models are turning into a commodity, is not the opening.

### Off-the-shelf parts make it a two-week build

Every component already exists.

**Reasoning model.** Claude Haiku 5.5 costs **$0.10 per million input tokens and $0.50 per million output tokens**. Cached prompt reads cost $0.01 per million, and the Batch API halves prices ([Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)). A typical 1,500-token-in, 500-token-out request therefore costs about **$0.0003–0.0004**. Cheaper or comparable fallbacks are Groq's gpt-oss-20b at $0.075/$0.30 ([eesel](https://eesel.ai/blog/groq-pricing)) and Gemini 3.1 Flash-Lite at $0.25/$1.50 ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)). One caveat matters: no independent benchmark compares current Claude, GPT or Gemini models on Egyptian dialect. Building your own test set is therefore step one, not a nice-to-have.

**Open Arabic models** are optional extras, not the main engine. MBZUAI's **Nile-Chat** handles Egyptian Arabic and the Latin-script "Franco" that many Egyptians type ([Nile-Chat paper](https://arxiv.org/pdf/2507.04569)). The government's Karnak-40B weights are public ([Hugging Face](https://huggingface.co/Applied-Innovation-Center/Karnak-40B-v1.0)). But the BALSAM benchmark found large closed models beat Arabic-centric open models "by sizable margins" ([BALSAM](https://arxiv.org/pdf/2507.22603)).

**Screenshots** should go straight to a vision-capable LLM. On the KITAB-Bench Arabic OCR benchmark, vision-language models beat traditional OCR engines by about 60% on character error rate, and Gemini-2.0-Flash posted the best CER at 0.13 ([KITAB-Bench](https://arxiv.org/pdf/2502.14949)). A Haiku-class OCR-plus-extraction call works out to about $0.0006.

**Link intelligence** is free, but read the terms:

- **URLhaus** needs only a free Auth-Key ([Cortex XSOAR](https://cortex.marketplace.pan.dev/marketplace/details/FeedURLhaus)).
- **RDAP** returns a domain's registration date for free, and a days-old domain is a strong red flag ([domaindetails](https://domaindetails.com/kb/technical-guides/rdap-explained)).
- **Google Safe Browsing** is free but **non-commercial only** ([Google](https://developers.google.com/safe-browsing/reference/Appropriate.Usage)). Once the tool earns any money it must move to Web Risk, whose lookup API appears free up to about 100,000 calls a month (verify the tiers on the official pricing page) ([Google Cloud](https://cloud.google.com/security/products/web-risk?hl=nl)).
- **VirusTotal's public API** is limited to 500 requests a day and bars commercial products ([VirusTotal](https://docs.virustotal.com/reference/public-vs-premium-api)), so it is unsuitable for production.
- **PhishTank** has been closed to new users since 2020 ([Wikipedia](https://en.wikipedia.org/wiki/PhishTank)).
- **No phone-reputation API covers Egyptian +20 numbers.**

For training and evaluation, the Hugging Face model **Hadhari** is an Arabic spam detector with about 97% self-reported accuracy and a live API ([Hadhari](https://huggingface.co/mabosaimi/hadhari)). It can serve as a free second signal. A Mendeley dataset of **448 Arabic scam-call conversations across 9 dialects** can seed the test set ([ASLC-448](https://data.mendeley.com/datasets/p384bgyzz3)).

At 100,000 users making three requests a month, Haiku 5.5 with a cached system prompt costs about **$93–120 a month** in model fees, against about $2,400 on Sonnet 5.5. Adding photo OCR on 100,000 images adds about $60, and hosting runs $0–50. The realistic total is **$150–400 a month** (computed from the prices above). The one unmeasured variable is that Arabic text usually needs more tokens than English, so budget about double until you measure it with the provider's token counter.

### The warning travels the same path as the scam

The viral cases from 2020–2026 share a recipe this tool can copy:

- **Zero-friction input.**
- **A screenshot-ready output that carries the brand.**
- **A score that invites comparison.**
- **A launch that rides a live news wave.**

Wordle's spoiler-free emoji grid took it from **90 players to more than 300,000** in about two months ([NPR](https://www.npr.org/2022/01/31/1077089945/nyt-wordle)). Instafest's poster and "Basic Score" reached a self-reported **16 million users** in a week ([ABC10](https://www.abc10.com/article/entertainment/instafest-create-festival-lineup-from-your-top-artists-app-generates-posters/521-fea3d823-c191-40e7-a274-2432d7716542)). GPTZero rode the panic over ChatGPT cheating to 30,000 users in its first week ([NPR](https://www.npr.org/2023/01/09/1147549845/gptzero-ai-chatgpt-edward-tian-plagiarism)). Human or Not's "test yourself" format drew more than 1.5 million users in a month ([arXiv](https://arxiv.org/abs/2305.20010v1)). Most relevant for a beginner, **WikiTok** was built in about 90 minutes with Claude and Cursor, had no backend, and reached roughly 500,000 people after topping Hacker News ([Wikipedia](https://en.wikipedia.org/wiki/WikiTok)).

The scam checker maps onto all three share mechanics:

- **The verdict card is the grid**: spoiler-free (with personal details redacted) and branded with the URL.
- **A "spot the scam" quiz is the score.**
- **A family safe-word invite is multi-user by necessity.** The FBI's own advice against voice-clone scams is to agree a secret family word in advance, which only works if relatives open the link ([Bitdefender on the FBI PSA](https://www.bitdefender.com/en-us/blog/hotforsecurity/fbi-alarm-ai-scams)).

One thing is unproven. The research found **no documented case of a safety tool going viral**, and the forwarding behaviour is inferred from WhatsApp being the main scam channel, not measured. The fallback is reassuring, though. Utility tools with private outputs, such as the free insurance-appeal generator Fight Health Insurance, still spread through press coverage pegged to the news ([BGR](https://bgr.com/tech/this-free-site-uses-ai-to-help-you-fight-health-insurance-claim-denials/)). A scam checker has both paths open. Pure-fun formats have the opposite problem: "roast my X" launches now routinely get zero upvotes on Product Hunt ([Hunted.space](https://www.hunted.space/product/roast-my-vibe)).

### Three risks to design around

**False reassurance is the accuracy risk that matters.** A tool that says "safe" about a new scam script hands the scammer credibility. Air Canada was held liable for wrong advice from its website chatbot despite arguing the bot was a separate entity ([CBC](https://www.cbc.ca/news/canada/british-columbia/air-canada-chatbot-lawsuit-1.7116416)), so a disclaimer is no full shield. The product must never say "safe". It should report only "warning signs found" or "no known warning signs", and always end with the verification steps: never share a PIN or one-time code, and call the bank using the number printed on your card.

**Publishing anything about third parties is the legal risk.** Under Egypt's Cybercrime Law 175/2018:

- **Article 25** punishes publishing information that violates someone's privacy "whether true or false" with at least six months in prison ([Lexology](https://www.lexology.com/library/detail.aspx?g=90440972-f53e-46dd-b225-7f7cbdea7d73)).
- **Article 27** exposes anyone who runs a site that "facilitates" a crime to at least two years in prison and an EGP 100,000–300,000 fine ([iPleaders](https://blog.ipleaders.in/critical-analysis-of-egypts-new-cyber-law/)).

On top of that, the **Penal Code's defamation articles** carry up to three years when the statement falsely accuses someone of a crime ([Andersen](https://eg.andersen.com/defamation-in-egypt/)). A public "scam numbers" list stacks all three exposures and could make the operator criminally liable for a single false user report. So no such list should exist.

**Data protection is the compliance risk.** Screenshots contain sender numbers, names and sometimes account details, and every one sent to a US model API is a cross-border transfer. That transfer needs a licence or a narrow exception such as explicit consent, and penalties reach **EGP 500,000–5,000,000 plus possible imprisonment** ([Consortio](https://consortiolawfirm.com/cross-border-data-transfer-egypt-pdpl/)). The one-year grace period under the Personal Data Protection Law's Executive Regulations ends around **1 November 2026** ([Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/egypt-s-personal-data-protection-law-the-compliance-countdown-has-begun/)). However, the regulator (the PDPC) was described in mid-2026 as "not yet operational" ([LawLab Africa](https://research.lawlab.africa/egypt/)), and no enforcement actions had been reported. The MVP plan below handles this through how the data flows, not with paperwork alone.

## The runners-up each fail one test

### Old-rent calculator: zero running cost, but a calendar problem

The 2025 old-rent law (Law 164/2025) is the most time-bound, mass-confusion legal change in Egypt. About **1.64 million households (over 4 million people) and 3.19 million units** fall under it, per the 2017 census ([Al Mal News](https://almalnews.com/2013964/%D8%A7%D9%84%D8%A5%D8%AD%D8%B5%D8%A7%D8%A1-%D8%B9%D8%AF%D8%AF-%D8%A7%D9%84%D9%88%D8%AD%D8%AF%D8%A7%D8%AA-%D8%A7%D9%84%D8%B3%D9%83%D9%86%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%A4%D8%AC%D8%B1%D8%A9-%D8%A8/)).

The rules are deterministic:

- **Zone multipliers set the new rent.** Units in premium zones pay 20 times the old rent (minimum EGP 1,000 a month). Middle and economic zones pay 10 times (minimums of EGP 400 and EGP 250).
- **Phase-out periods** run seven years for residential units and five for non-residential ones ([Egyptian Streets](https://egyptianstreets.com/2025/08/04/president-el-sisi-ratifies-amendments-ending-egypts-old-rent-arrangements/)).
- **The rent rises 15% a year, compounded**, with the first increase taking effect on 1 September 2026 ([Matn News](https://www.matnnews.com/300453)).

**The basic calculator is already taken.** Youm7, Egypt's biggest news site, launched one on 7 September 2026, and at least four other sites republished it within a day ([Youm7](https://www.youm7.com/story/2026/9/7/%D8%A7%D8%B2%D8%A7%D9%89-%D8%AA%D8%AD%D8%B3%D8%A8-%D8%B2%D9%8A%D8%A7%D8%AF%D8%A9-%D8%A7%D9%84%D8%A5%D9%8A%D8%AC%D8%A7%D8%B1-%D8%A7%D9%84%D9%82%D8%AF%D9%8A%D9%85-%D8%A7%D8%B9%D8%B1%D9%81-%D9%87%D8%AA%D8%AF%D9%81%D8%B9-%D9%83%D8%A7%D9%85-%D8%B3%D9%86%D9%88%D9%8A%D8%A7-%D9%84%D9%85%D8%AF%D8%A9/7539066); [Sahafahh](https://sahafahh.net/story/31931549/%D8%A7%D8%B2%D8%A7%D9%89-%D8%AA%D8%AD%D8%B3%D8%A8-%D8%B2%D9%8A%D8%A7%D8%AF%D8%A9-%D8%A7%D9%84%D8%A5%D9%8A%D8%AC%D8%A7%D8%B1-%D8%A7%D9%84%D9%82%D8%AF%D9%8A%D9%85-%D8%A7%D8%B9%D8%B1%D9%81-%D9%87%D8%AA%D8%AF%D9%81)). Its worked example, however, applies only the 15% step and appears to skip the zone multiplier. **No tool lets a tenant type a street and learn its zone.** Cairo's decree 978/2026 colour-codes zones street by street, and people are told to look up gazette decrees or visit their district committee ([Dostor](https://www.dostor.org/5671825)). That street-to-zone lookup is a defensible moat, and its cost per user is close to zero because no LLM is needed for the core math.

**It fails on timing and stability.** Demand peaked around the September 2026 increase and the alternative-housing deadline. That deadline was extended to 12 October 2026, by which time about 180,000 people had opened accounts but only about 108,000 had completed applications ([Almawq3](https://almawq3.com/%D8%A8%D8%B9%D8%AF-%D8%A7%D9%86%D8%AA%D9%87%D8%A7%D8%A1-%D9%85%D9%87%D9%84%D8%A9-%D8%A7%D9%84%D8%B3%D9%83%D9%86-%D8%A7%D9%84%D8%A8%D8%AF%D9%8A%D9%84-180-%D8%A3%D9%84%D9%81-%D8%B7%D9%84%D8%A8-%D8%AA/)). Several constitutional challenges are still pending ([Elwatan](https://www.elwatannews.com/news/details/8318994)), so a ruling could change the formula. And digitising scanned decrees for 27 governorates is weeks of manual work.

**Verdict:** build it as project two. Cover Cairo, Giza and Alexandria first and launch before the September 2027 increase. The scam checker's audience can be the launch channel.

### Paperwork and savings tools have demand but no sharp wedge

**A government-paperwork navigator** ("which papers, which office, online or in person?") addresses a near-universal frustration. Digital Egypt has grown to a reported **13.5 million users** ([FollowICT](https://followict.news/%D9%85%D8%B5%D8%B1-%D8%A7%D9%84%D8%B1%D9%82%D9%85%D9%8A%D8%A9-%D8%AA%D8%B5%D9%84-%D8%A5%D9%84%D9%89-13-5-%D9%85%D9%84%D9%8A%D9%88%D9%86-%D9%85%D8%B3%D8%AA%D8%AE%D8%AF%D9%85-%D9%88%D8%A7/)), but first-time IDs and passports still need in-person visits ([Enterprise](https://enterpriseam.com/egypt/2026/08/02/your-guide-to-navigating-egypts-online-government-services/)). The trouble is the wedge:

- The Digital Egypt app already has a chatbot, and Karnak Chat answers general questions for free.
- Upkeep is relentless, because procedures change.
- Scraping state portals carries real criminal-law exposure. Access "violating license provisions" can bring at least a year in prison, two if data is republished ([Library of Congress](https://www.loc.gov/item/global-legal-monitor/2018-10-05/egypt-president-ratifies-anti-cybercrime-law/)).
- Its output is a private checklist, so it grows through search, not shares.

**A savings comparator** (gold vs bank certificates vs treasury bills, net of inflation) has live demand. Urban inflation was **13.9%** in September 2026 ([Daily News Egypt](https://www.dailynewsegypt.com/2026/10/10/egypts-annual-urban-inflation-eases-to-13-9-in-september/)), 21-karat gold hit a record **EGP 7,475 per gram** in February ([Ahram Online](https://english.ahram.org.eg/News/575886.aspx)), and gold imports jumped to **$4.05 billion** in the first half of 2026 from $250 million a year earlier ([Zawya](https://www.zawya.com/en/business/maturing-bank-certificates-channel-liquidity-into-egypts-gold-market-gold-bullion-409581)). But whether a neutral Arabic comparison tool already exists was not verified. It edges into regulated financial advice, and it spikes only with rate or gold news. It is a good weekend side tool, not the main bet.

### Contracts, lab reports and voice notes trip on liability or a free state tool

**A contract red-flag checker** targets a real crisis. One New Cairo buyer had paid about 80% of a unit's price, construction halted three years after the promised delivery date, and the developer still demanded installments ([Al Manassa](https://almanassa.com/en/news/33412)). But the business-to-business field is crowded: HAQQ ([HAQQ](https://www.haqq.ai/)), XS Lawyer at EGP 149 a month ([XS Lawyer](https://xs-lawyer.com/en)) and others. ChatGPT is the de facto consumer answer, even as Egyptian legal media warn that it fabricates Court of Cassation rulings ([Parlmany](https://www.parlmany.com/News/2/577202/%D8%A7%D9%84%D8%B0%D9%83%D8%A7%D8%A1-%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A-%D9%88%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D9%85%D8%A7%D8%A9-%D8%A8%D9%8A%D9%86-%D8%A7%D9%84%D9%81%D8%B1%D8%B5%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%AE%D8%A7%D8%B7%D8%B1-%D8%AA%D8%AD%D8%B0%D9%8A%D8%B1-%D9%85%D9%86-%D9%81%D8%A8%D8%B1%D9%83%D8%A9-%D8%B4%D8%A7%D8%AA)). Egypt reserves the practice of law to enrolled lawyers ([GAFI](https://www.investinegypt.gov.eg/PublishingImages/Lists/ContentPageDetails/AllItems/Practicing%20Law.pdf)). In the US, DoNotPay paid **$193,000** to the FTC over unsupported "robot lawyer" claims ([ABA Journal](https://www.abajournal.com/news/article/robot-lawyer-website-donotpay-settles-ftc-claims-it-couldnt-deliver-on-promises)). People also rarely share their contracts.

**A lab-report explainer** has the clearest unmet demand. In the US, **32% of adults** used AI chatbots for health information last year ([KFF](https://www.kff.org/health-information-trust/poll-1-in-3-adults-are-turning-to-ai-chatbots-for-health-information-equaling-the-share-who-use-social-media-for-health/)), and ChatGPT's health features are US-only ([Tech-Now](https://tech-now.io/en/blogs/health-in-chatgpt/)). It also carries the heaviest risk:

- Health data is sensitive data that requires a PDPC licence ([Legal 500](https://www.legal500.com/intelligence/egypt/privacy/from-policy-to-practice-egypt-issues-executive-regulations-of-the-personal-data-protection-law)).
- Egypt's Health Ministry publicly warned in December 2025 against relying on AI for diagnosis ([Ahram Online](https://english.ahram.org.eg/News/559631.aspx)).
- An Oxford randomised study of about 1,300 people found LLM users did not reliably reach accurate conclusions about symptoms ([Oxford](https://www.ox.ac.uk/news/2026-02-10-new-study-warns-risks-ai-chatbots-giving-medical-advice)).
- Handwritten prescriptions are worse still: GPT-4o scored a **7.57% F1** on medication names in one benchmark ([MIRAGE](https://arxiv.org/html/2410.09729v1)).

**An Egyptian voice-note transcriber** lost its gap when the government launched **BelMasry** in August 2026, a free speech-to-text service for Egyptian dialects and Modern Standard Arabic ([Ahram Online](https://english.ahram.org.eg/NewsContentP/1/574904/Egypt/Egypt-launches-free-%E2%80%98BelMasry%E2%80%99-AI-platform-support.aspx)). WhatsApp's native transcription is a further unverified threat. BelMasry, Groq's hosted Whisper at **$0.04 per audio hour** ([Groq](https://groq.com/whisper-large-v3-turbo-now-available-on-groq-combining-speed-quality-for-speech-recognition/)) and Cohere's open Transcribe Arabic model, about 11 word-error-rate points better than Whisper v3 Large ([Cohere](https://cohere.com/blog/transcribe-arabic)), are better treated as building blocks. They could power voice input for the scam checker later.

### Four markets are taken or off-limits

- **Tansik (university-admission) predictors are saturated.** About 921,000 students sat Thanaweya Amma in 2026 ([Egypt Telegraph](https://www.egypttelegraph.com/article/254379/لـ921-ألف-طالب-انطلاق-ماراثون-امتحانات-الثانوية)), but at least eight predictor sites already serve them. They include Shabbabek's "AI assistant" ([Shabbabek](https://shbabbek.com/show/209592)), Tansiky at EGP 25 ([Tansiky](https://www.tansiky.com/)) and Aloostaz's five-year cutoff calculator ([Aloostaz](https://aloostaz.com/eg/extensions/tansik-estimates-26)). A Baccalaureate predictor is impossible until a first cohort produces cutoffs.
- **Medicine-alternative lookup is crowded.** The drug authority (EDA) runs an official equivalents search ([Elwatan](https://www.elwatannews.com/news/details/7493706)), and an open GitHub database lists 25,070 Egyptian drugs with prices ([GitHub](https://github.com/karem505/egyptian-drug-database)).
- **CV tailoring is a crowded global category.** Joblessness among educated young women is a striking **38.3%** ([Egypt Today](https://www.egypttoday.com/Article/3/146772/Egypt%E2%80%99s-jobless-rate-eases-to-6-3-in-2025-as)), but there is little Egyptian angle.
- **Misinformation checking is off-limits.** The Interior Ministry said it arrested six people tied to the fact-checker Matsda2sh in October 2026 ([Ahram Online](https://english.ahram.org.eg/News/577934.aspx)), and the Cabinet launched its own AI rumour checker, "Chat EGYPT", the same month ([Masrawy](https://www.masrawy.com/news/news_egypt/details/2026/10/19/3065409)).

Two strong global ideas are also already served for free in their home market. US insurance-denial appeals are covered by Fight Health Insurance and Counterforce ([Axios](https://www.axios.com/local/raleigh/2025/08/20/using-ai-to-fight-back-against-insurance-denials-counteforce)). Data-broker removal is covered by California's DROP, which had 300,000 sign-ups by June 2026 ([CalPrivacy](https://privacy.ca.gov/2026/06/privacy-momentum-builds-300000-californians-sign-up-for-drop-as-registered-data-brokers-hit-a-record-high/)).

## A two-week MVP plan for ده نصب؟

### Four features, one forwardable card

Version 1 does four things.

**1. The checker.** It accepts pasted text, a screenshot or a link, in Arabic script, Franco or English. It returns structured output:

- one of three risk levels: high warning signs, some warning signs, or no known warning signs (never "safe");
- the matched Egyptian scam script by name, such as fake InstaPay staff, "your Vodafone Cash wallet is suspended", a fake delivery or customs fee, a fake pension increase, a prize or job "task" scam, or a Facebook Marketplace deposit scam;
- the exact suspicious phrases quoted and explained in Egyptian dialect;
- link findings (domain age, threat-feed hits, a lookalike of an official bank or wallet domain);
- a "what to do now" panel.

**2. The verdict card.** This is a branded image with the scam pattern, the top red flags and the URL. It shows the original message only if the user opts in, after automatic redaction. Sharing is one tap through the Web Share API or a WhatsApp link.

**3. "Spot the scam" (اكشف النصباية).** A ten-question quiz mixes real Egyptian scam messages with legitimate bank and delivery texts. It ends with a score card ("I spotted 8 of 10, can you beat me?"). It is static, so it costs nothing in model fees.

**4. The family safe-word kit.** An Egyptian-Arabic explainer covers voice-clone scams and invites relatives to agree a code word offline. The tool must never ask for or store the word itself.

Deliberately left out of version 1: accounts, phone-number lookup, voice-note input, a browser extension and any public report feed.

### The stack: Cloudflare, Haiku 5.5 and free threat feeds

| Layer | Choice | Why | Cost |
|---|---|---|---|
| Front end | Vite + React + Tailwind, Arabic right-to-left first, on Cloudflare Pages | Static and flat-priced. Avoid Vercel Hobby, which is non-commercial only ([Vercel](https://examples.vercel.com/docs/plans/hobby)) | $0 |
| API | One Cloudflare Worker | Hides keys, enforces rate limits, runs the checks. Free plan covers 100,000 requests a day ([Cloudflare](https://developers.cloudflare.com/workers/platform/limits/)) | $0, then Workers Paid |
| Main model | `claude-haiku-5-5`, structured JSON output, thinking disabled, pattern library in a cached system prompt | $0.10/$0.50 per million tokens; cache reads $0.01 ([Anthropic](https://platform.claude.com/docs/en/about-claude/pricing)) | ~$0.0003 per text check |
| Fallback model | Gemini 3.1 Flash-Lite, **paid tier only** | Backup for outages or weaker screenshot reading. Free-tier prompts may be read by human reviewers ([Simon Willison](https://simonwillison.net/2024/Oct/17/gemini-terms-of-service/)) | $0.25/$1.50 per million tokens |
| Link checks | RDAP domain age + URLhaus + Safe Browsing (Web Risk once monetised) + a hand-curated list of official domains with a lookalike check | Free, fast, deterministic | $0 |
| Cache and quotas | D1 or Workers KV, storing only hash-to-verdict pairs | D1 free tier allows 5 million reads a day ([Cloudflare D1](https://developers.cloudflare.com/d1/platform/limits/)) | $0 |
| Card | Generated in the browser with canvas, shared via the Web Share API or a WhatsApp link | No server cost | $0 |

Three implementation details keep the cost estimate honest.

- **Turn thinking off.** Haiku 5.5 thinks by default, and thinking tokens are billed as output ([Anthropic](https://platform.claude.com/docs/en/about-claude/pricing)). Disable it for this classification route so output stays near 400 tokens.
- **Make the pattern library cacheable.** Keep it as a frozen system prompt longer than the model's minimum cacheable length (512 tokens for Haiku 5.5 per Anthropic's current docs) so every check reads it from cache.
- **Downscale screenshots** in the browser to about 1280 pixels on the long edge, which caps an image near 1,200 tokens.

Write the prompt and JSON schema with Claude as your coding partner. Then run them against your own test set before trusting them.

### Cost controls that survive a viral spike

Here is the per-check math with a 3,000-token cached pattern library, a 300-token message and a 400-token JSON answer:

| Item | Cost |
|---|---|
| Cached prompt read (3,000 tokens) | $0.00003 |
| New input (300 tokens) | $0.00003 |
| Output (400 tokens) | $0.0002 |
| **Text check total** | **about $0.00026** |
| **Screenshot check total** (adds about 1,200 image tokens) | **about $0.0004** |

These figures are derived from Anthropic's published prices. Doubling them to allow for Arabic tokenization, **300,000 checks a month cost about $80–240 and one million cost about $260–800**.

Three structural controls matter more than model choice.

**Cache answers, not just prompts.** Scam SMS waves blast the same text to thousands of people. Hashing the normalised, redacted message and serving repeat verdicts from D1 turns a viral wave into mostly free lookups.

**Cap everything.** Allow about 5–10 checks per IP per day and set a hard monthly spend limit with alerts at the provider. When the cap is hit, degrade gracefully: the quiz and a static "this week's top scams" page keep working with no model at all.

**Avoid per-invocation billing surprises.** The artist app Cara ran up a **$96,280 serverless bill in one month** after growing from 40,000 to 650,000 users in a week ([TechCrunch](https://techcrunch.com/2024/06/06/a-social-app-for-creatives-cara-grew-from-40k-to-650k-users-in-a-week-because-artists-are-fed-up-with-metas-ai-policies/)). Have I Been Pwned serves massive traffic cheaply through edge caching, yet still took a roughly AUD 5,000 bill from uncached egress ([Troy Hunt](https://www.troyhunt.com/how-i-got-pwned-by-my-cloud-costs/)). Free-forever generative services die when their costs aren't capped. Figgs AI shut down with more than a million users because staying free was unsustainable ([TechCrunch](https://techcrunch.com/2026/10/24/the-ai-graveyard-a-running-list-of-projects-and-startups-that-didnt-make-it/)).

On funding:

- **Startup credits.** Anthropic's startup program reportedly offers about $5,000 in credits without venture backing (per a third-party tracker) ([guptadeepak](https://guptadeepak.com/anthropic-claude-for-startups-the-complete-guide-to-credits-tiers-and-eligibility-2026/)).
- **Payments.** Stripe does not appear to be available to Egyptian residents ([Shopify Community](https://community.shopify.com/t/i-m-from-egypt-and-i-cant-add-a-payment-method/169088)). Use Lemon Squeezy, whose docs list Egypt for payouts, for an international supporter tier ([Lemon Squeezy](https://docs.lemonsqueezy.com/help/getting-started/supported-countries)), and Paymob for payments in Egyptian pounds ([Cashbita](https://www.cashbita.com/2026/06/create-paymob-account-ecommerce-store.html)).
- **Sponsorship.** The natural long-term sponsor is the CBE and banks' own anti-fraud campaign, "معًا نكافح الاحتيال" ("Together we fight fraud") ([Alborsaa](https://www.alborsaanews.com/2026/09/04/1990407)).

### Legal guardrails written into the code

Build the legal rules into the product's behaviour.

**Wording.** Never output "safe" or "آمن". Never brand the tool as official, and use no bank, InstaPay or CBE logos. Show a persistent banner reading "معلومات توعوية وليست ضماناً" ("awareness information, not a guarantee").

**Third parties.** Publish nothing about them. There is no public number list, no user report feed and no named sellers. Reports a user wants to make go to official channels such as NTRA's 155 hotline. Verify every hotline number before launch: the research confirmed NTRA's channels but not each bank's numbers.

**Data flow, aimed at the PDPL:**

- In the browser, redact digit sequences that look like Egyptian mobile numbers, 14-digit national IDs and card numbers before text leaves the device.
- Offer a one-tap blur brush on screenshots, and strip image metadata (EXIF).
- Process every request ephemerally, with no stored uploads and no raw content in logs.
- Before the first upload, show a plain Arabic and English consent notice naming the model providers and saying content is processed in the US.
- Use paid API tiers only.

**Scope.** Stay out of political and religious content and out of misinformation verdicts. Build the scam-pattern library by hand from public CBE, InstaPay and press warnings, with citations, rather than scraping portals.

**Paid counsel.** Before launch, spend one paid hour with an Egyptian data-protection lawyer. Ask whether explicit consent covers this US-API data flow, whether a sole proprietor must register with the PDPC, and whether a fee exemption for operators handling 1–100,000 records applies ([Raqmix](https://raqmix.net/insights/pdpl-executive-regulations-egypt)). The research could not verify that exemption.

### Launch where Egyptians already forward warnings

**Seed real data first.** Collect 50–100 real scam messages from friends' and relatives' phones, with consent and redaction. These build both the pattern library and the test set.

**Launch in Arabic, not English.** The English market is already served by free checkers, so it is not the wedge. Use three channels:

- **Facebook groups**: family, neighbourhood, compound and expatriate-Egyptian groups.
- **WhatsApp**, through personal networks.
- **Short TikTok and Reels videos** of the "I checked five scam messages my mother got" kind.

**Keep a news-peg calendar.** Each CBE or InstaPay warning recurs every few months and is a same-day posting moment ("check it here"). So are the days before monthly pension payouts, when fake "pension increase" lures peak, and holiday shopping seasons.

**Pitch news sites an embed.** Egyptian outlets constantly publish scam-sign listicles, and Youm7's old-rent calculator showed that a useful widget gets republished across sites within a day. Offering Masrawy, Elwatan, Mobtada and others a free embeddable checker or quiz is the cheapest press strategy available.

**Run a second-wave English launch.** A "Show HN: an Egyptian-Arabic scam checker I built in two weeks with Claude" post follows the WikiTok template, and it reaches the Arabic-speaking diaspora and Gulf users. The UAE survey and Tabayyun's paid model make the Gulf the obvious first expansion.

### Day-by-day: the first fourteen days

| Days | Build | Done when |
|---|---|---|
| 1–2 | Collect 100 scam and 100 legitimate Egyptian messages; draft a library of 25–40 named scam scripts with "what to do" steps; pull extra cases from the ASLC-448 dataset | Test set labelled; library written in Egyptian dialect |
| 3–4 | Cloudflare Worker plus a Haiku 5.5 call with JSON schema, cached system prompt and thinking off; run the test set | Fewer than 5% of real scams marked "no known warning signs"; cost per check measured |
| 5–6 | Right-to-left front end: paste box, screenshot upload with downscaling, blur brush, metadata strip and digit redaction; verdict screen | A parent can use it on a phone without help |
| 7 | Link checks: RDAP, URLhaus, Safe Browsing, lookalike list of official domains | A known-bad test URL and a two-day-old domain are both flagged |
| 8 | Verdict card in canvas, Web Share and WhatsApp link, Open Graph preview image | Card shares cleanly to WhatsApp on Android and iPhone |
| 9 | "Spot the scam" quiz and score card; family safe-word page | Static pages, zero model calls |
| 10 | Response cache, per-IP quotas, provider spend cap and alerts, degrade mode, consent notice, privacy page | A simulated traffic spike stays under the cap |
| 11–12 | Closed beta with 20–30 people, at least ten of them over 55; fix wording and false negatives; add English and Franco handling | Beta testers forward at least one card unprompted |
| 13 | Launch assets: three short videos, Facebook group posts, an embed pitch to five news sites | Content queued |
| 14 | Public launch tied to the freshest scam warning; watch costs and logs | Live, capped and monitored |

### Metrics that decide whether to keep going

Track five numbers from day one:

- **cards shared per check** (the viral engine);
- **quiz completions per visitor**;
- **the false-negative rate on the test set** (the trust engine);
- **cost per check**;
- **cache hit rate**.

Reasonable four-week targets are these, though they are judgments, not benchmarks:

- at least 10% of checks producing a share;
- fewer than 5% missed scams on a growing test set;
- under $0.001 per check all-in.

If sharing stays under about 5% and traffic doesn't grow without paid pushes, keep the tool live as a utility. Then redirect effort to the old-rent lookup or to a sponsored version for a bank or NGO.

## Conclusion

The research shifts where a solo builder's advantage lies. Frontier models now make detection, extraction and explanation cheap commodities. Haiku-class models deliver them for fractions of a cent, and Google, Meta and OpenAI keep folding them into their platforms. What stays scarce in Arabic markets is local curation: a cited library of Egyptian scam scripts, a street-by-street rent-zone table, the exact next step and hotline. Distribution that fits how people already behave is just as scarce. The winning products pair a hand-built local dataset with an output that does its own marketing. That is also why the two best candidates here, the scam checker and the old-rent lookup, share a skeleton, and why building one makes the other faster.

The legal filter is, in effect, a product-design rule that suits the Egyptian environment. The user brings their own content. The tool processes it ephemerally and publishes nothing about anyone else. Wherever possible the math is deterministic, not generative. That rule removes most of the dangerous ideas on its own: the scam blacklist, the AI lawyer, the diagnosis bot, the rumour checker. It also points to where the money eventually comes from. Banks, telecoms and NGOs already spend on anti-fraud awareness, so a free tool with proven reach in their customers' own dialect is something they can sponsor. That gives a free viral tool a path to sustainability that ads in Egypt are unlikely to provide.
