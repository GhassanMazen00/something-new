# Technical Building Blocks for an Arabic/Egyptian-First AI Web Tool (as of 2026-10-26)

Method note for the report writer: WebFetch could not resolve several official domains in this session (openai.com, platform.openai.com, ai.google.dev, blog.google, huggingface.co, developers.cloudflare.com failed with DNS errors). Anthropic's pricing page was fetched in full. Most other figures come from search-engine extracts of official pages or from third-party aggregators, and each one is labelled that way below. Prices change quickly in this market, so re-check every number marked "verify" before publishing.

---

## 1. LLM APIs with strong Arabic, open Arabic models, hosting options, free tiers and cost per request

### Takeaway
The cheapest capable hosted options in late 2026 are Claude Haiku 5.5 ($0.10 in / $0.50 out per MTok), GPT-5 nano ($0.05 / $0.40, which OpenAI may be phasing out), Gemini 3.1 Flash-Lite ($0.25 / $1.50) and Groq's gpt-oss-20b ($0.075 / $0.30). At these prices a typical text request costs about $0.0003–$0.002. Open models focused on Arabic and Egyptian Arabic (Jais 2, ALLaM, Fanar 2, Nile-Chat, Qwen) are real options, but independent benchmarks find the large closed models still clearly ahead. For a beginner, an open model makes most sense as a fallback or for specific Egyptian-dialect tasks, not as the main brain.

### Cited Findings

**Anthropic Claude (official pricing page, fetched 2026-10-26)**
- Claude Haiku 5.5: $0.10/MTok input, $0.50/MTok output for prompts up to 100,000 tokens. Cache hits cost $0.01/MTok, 5-minute cache writes $0.125/MTok. Prompts over 100K tokens pay $0.50 / $2.50, and the whole request is billed at the higher rate. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Claude Sonnet 5.5: $2 in / $10 out. Cache hits cost $0.10/MTok (0.05x of base input). — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Claude Sonnet 5: also $2 / $10. The launch "introductory" price is now permanent, and the planned 1 Sept 2026 increase to $3/$15 "will not occur". — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Claude Opus 5.5: $4 in / $20 out, cache hits $0.20/MTok. Opus 5: $5 / $25. Fable 5.1 (top tier): $10 / $50. Haiku 4.5 (older): $1 / $5. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- The Batch API gives 50% off input and output, e.g. Haiku 5.5 batch costs $0.05 / $0.25 and Sonnet 5.5 batch $1 / $5. Batch discounts stack with cache discounts. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Cache reads generally cost 0.1x base input, but 0.05x on Opus 5.5 and Sonnet 5.5. A 5-minute cache write costs 1.25x, so caching pays off after one read. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Server-side web search costs $10 per 1,000 searches plus tokens. US-only inference (`inference_geo`) adds a 1.1x multiplier. Global routing is the default and uses standard prices. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- On Claude 4.6+ models other than Haiku 5.5, the full 1M-token context is billed at standard rates. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Opus 5.5 and Sonnet 5.5 cannot disable thinking with `{type:"disabled"}` (Opus 5.5 controls it only through `effort`, default `medium`), and thinking tokens are billed as output. Set effort to `low` for cheap chat routes. — Anthropic Claude API reference (bundled skill docs, cached 2026-10-06; see also [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing))

**OpenAI (official model pages via search extracts; openai.com could not be fetched)**
- GPT-5.5 flagship: $5/MTok input, $0.50 cached input, $30 output. Prompts over 272K input tokens cost 2x input and 1.5x output. — [OpenAI GPT-5.5 model page](https://developers.openai.com/api/docs/models/gpt-5.5)
- GPT-5 mini: $0.25 in / $0.025 cached / $2.00 out. The page marks it **deprecated** and recommends "GPT-5.6 Terra" for new high-volume work; I could not verify Terra's pricing. — [OpenAI GPT-5 mini page](https://developers.openai.com/api/docs/models/gpt-5-mini)
- GPT-5 nano: $0.05 in / $0.005 cached / $0.40 out. — [OpenAI GPT-5 nano page](https://developers.openai.com/api/docs/models/gpt-5-nano)
- A June 2026 third-party article says GPT-5, GPT-5-mini and GPT-4o are no longer on OpenAI's pricing page. It names GPT-5.4 nano ($0.20 in / $1.25 out) as the cheapest current model. — [Morph: OpenAI API pricing](https://morphllm.com/openai-api-pricing); partly contradicted by [Puter OpenAI pricing table](https://developer.puter.com/tutorials/openai-api-pricing/), which still lists GPT-5 nano.

**Google Gemini (search extracts of ai.google.dev; direct fetch blocked)**
- Gemini 3.5 Flash-Lite: $0.30/MTok input, $2.50 output. The pricing page shows a free tier. — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing); [Google blog: Gemini 3.6 Flash, 3.5 Flash-Lite](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/)
- Gemini 3.1 Flash-Lite: $0.25 input (text/image/video), $0.50 audio input, $1.50 output. Free tier available; batch is about half price. — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Gemini 3.6 Flash (released 2026-07-21, 1M context, 65.5K max output): $0.75 in / $3.75 out according to aggregators that cite Google's page. — [anotherwrapper Gemini 3.6 Flash](https://anotherwrapper.com/llm-pricing/gemini-3.6-flash) (third-party; verify)
- Gemini 2.5 Flash-Lite: $0.10 in / $0.40 out at its GA. — [Google Developers Blog](https://developers.googleblog.com/en/gemini-25-flash-lite-is-now-stable-and-generally-available/) (older model; check that it is still served)
- The free tier is shrinking and unreliable. Users reported free Flash quota cut from 250 to 20 requests/day around Dec 2025. Google staff said limits would "continue to go down" and called the free tier "best effort". Quotas apply per project and per model and reset at midnight Pacific. — [Google AI Developers Forum thread](https://discuss.ai.google.dev/t/gemini-rate-limit-20-rpd/111274); [Forum: 92% free tier quota](https://discuss.ai.google.dev/t/do-they-really-think-we-wouldnt-notice-a-92-free-tier-quota/111262)
- Free-tier prompts may be used to improve Google's products; paid-tier prompts are not. — [Gemini API pricing](https://ai.google.dev/pricing) (via search extract)

**Open Arabic and Egyptian models**
- Jais 2 (paper arXiv 2608.13580): Jais 2 8B is competitive with ALLaM-7B-Instruct-preview and Fanar-1-9B-Instruct on Arabic dialect tasks. — [Jais 2 paper](https://arxiv.org/pdf/2608.13580)
- QIMMA benchmark (cultural, STEM, legal, medical, safety, coding): Jais-2-70B-Chat averages 65.81, about level with Qwen2.5-72B-Instruct at 65.75. Jais-2-8B-Chat averages 57.89. — [QIMMA paper](https://arxiv.org/pdf/2604.03395)
- BALSAM benchmark: "large closed models such as GPT-4o, Gemini 2.0, and DeepSeek V3 outperform all smaller Arabic-centric models such as Jais and Fanar by sizable margins." — [BALSAM paper](https://arxiv.org/pdf/2507.22603)
- Fanar-1-9B: Gemma-2-9B continually pretrained on 1T Arabic+English tokens. Apache 2.0. Supports MSA plus Gulf, Levantine and **Egyptian** dialects. QCRI also offers API access through a request form. — [Fanar-1-9B model card](https://huggingface.co/QCRI/Fanar-1-9B)
- Fanar-2-27B-Instruct: built on Gemma-3-27B, 32,768-token context, Apache 2.0, API access by request form. I found no pricing or free-tier terms. — [Fanar-2-27B-Instruct card](https://huggingface.co/QCRI/Fanar-2-27B-Instruct/blob/main/README.md)
- ALLaM-7B-Instruct-preview is published on Hugging Face under humain-ai, with the licence in a separate LICENSE file. — [ALLaM-7B-Instruct-preview](https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview)
- Nile-Chat (MBZUAI-Paris, ArabicNLP 2025): an Egyptian-Arabic family in 4B and 12B dense versions plus a 3x4B-A6B MoE. It handles both Arabic script and Latin-script "Arabizi/Franco". The authors report it beats LLaMA, Jais and ALLaM on their Egyptian benchmarks, with the 12B showing +14.4% over Qwen2.5-14B-Instruct on Latin-script benchmarks. Models, data and eval code are public. — [Nile-Chat paper](https://arxiv.org/pdf/2507.04569); [Middle East AI News](https://www.middleeastainews.com/p/mbzuai-nile-chat-egyptian-arabic)
- AraDiCE (COLING 2025) is a dialect and cultural benchmark focused on Egyptian and Levantine. Arabic-specific models beat multilingual ones on dialect tasks, but dialect generation and translation stay hard. Datasets are on HF under QCRI/AraDiCE. — [AraDiCE paper](https://arxiv.org/html/2409.11404v3)
- Open Arabic LLM Leaderboard v2 (AlGhafa, ArabicMMLU, EXAMS, MadinahQA, AraTrust, ALRAGE, ArbMMLU-HT): a mirror shows Qwen-derived models in many top slots and Fanar-1 entries around 70% and 63%. — [benchmarklist mirror](https://benchmarklist.com/benchmarks/open_arabic_llm_leaderboard/) (mirror, partly garbled)

**Hosting options for open models**
- Hugging Face Inference Providers give monthly credits: Free $0.10, PRO $2.00 (PRO costs about $9/month and can continue pay-as-you-go), Team/Enterprise $2 per seat. HF passes provider rates through with no markup. — [HF Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing); [eesel HF pricing](https://www.eesel.ai/en/blog/hugging-face-pricing)
- Groq has a free tier with no card. gpt-oss-20b at $0.075 in / $0.30 out is reported as the cheapest self-serve model. Qwen3 32B is about $0.29 / $0.59. Llama 3.1 8B and 3.3 70B reportedly moved to Enterprise "contact sales". Free-plan limits listed earlier, e.g. Qwen3 32B at 60 RPM / 6K TPM / 1,000 RPD, may be out of date. — [eesel Groq pricing 2026](https://eesel.ai/blog/groq-pricing); [usagepricing Groq Aug 2026](https://usagepricing.com/blueprint/activity/groq-2026-08-26-packaging) (third-party; verify at groq.com/pricing)
- Cloudflare Workers AI gives 10,000 free Neurons/day per account, then $0.011 per 1,000 Neurons on Workers Paid. Free accounts cannot exceed the daily allowance. — [Cloudflare Workers AI pricing (search extract)](https://developers.cloudflare.com:8443/workers-ai/platform/pricing)
- One developer measured about 124 Neurons per Llama 3.3 70B answer, roughly 80 answers/day free (single anecdote). Catalog examples: gpt-oss-120b, Qwen3 30B, Llama 4 Scout, Llama 3.3 70B, Gemma 3 12B, Mistral Small 3.1 24B. Llama 3.1 8B was reportedly shut down in May 2026. — [flaviocopes: Workers AI](https://flaviocopes.com/cloudflare-workers-ai)
- OpenRouter `:free` models allow 20 RPM and 50 requests/day, or 1,000/day after a lifetime $10 credit purchase. — [OpenRouter blog: free LLM APIs compared](https://openrouter.ai/blog/tutorials/free-llm-apis-compared/); [TrueFoundry](https://www.truefoundry.com/es/blog/openrouter-rate-limits-your-free-tier-depends-on-what-youve-already-paid)

### Inferences
- Cost per typical text request, assuming 1,500 input tokens (about 1,000 of them a fixed system prompt) and 500 output tokens, computed from the prices above:
  - Claude Haiku 5.5: about $0.0004, or about $0.0003 with the system prompt cached
  - GPT-5 nano: about $0.00028
  - Groq gpt-oss-20b: about $0.00026
  - Gemini 2.5 Flash-Lite: about $0.00035
  - GPT-5.4 nano: about $0.0009
  - Gemini 3.1 Flash-Lite: about $0.0011
  - GPT-5 mini: about $0.0014
  - Gemini 3.5 Flash-Lite: about $0.0017
  - Gemini 3.6 Flash: about $0.003
  - Claude Sonnet 5.5: about $0.008
  - Claude Opus 5.5: about $0.016, before any thinking tokens
  - GPT-5.5: about $0.0225
- Arabic text usually tokenizes into more tokens than English, so real Arabic requests may cost more than this English-token estimate. I did not find a sourced Arabic-vs-English tokenizer ratio for current models; measure it with each provider's token counter.
- The Haiku 5.5 price ($0.10/$0.50, cheaper than Haiku 4.5's $1/$5) makes Claude very competitive for high-volume free tools, as long as prompts stay under 100K tokens.
- Nile-Chat is the most Egypt-specific open LLM found, especially for Franco/Arabizi input, which Egyptians use a lot. A beginner can still treat it as optional, because hosting a 12B model needs a GPU provider.
- Free tiers (Gemini, Groq, OpenRouter, Workers AI) are good for prototyping but too small or unstable to serve 100K users. Budget for a paid tier from launch.

### Gaps
- No independent benchmark found that compares current Claude 5.x, GPT-5.x and Gemini 3.x on **Egyptian dialect** specifically. AraDiCE tested Jais, AceGPT, Llama 3 and Mistral, not the frontier APIs.
- Jais 2 licence and hosted availability (e.g. via the Inception/G42 API) could not be confirmed.
- I could not verify OpenAI's current cheapest-model lineup ("GPT-5.6 Terra" pricing) or the Gemini free-tier RPD table on official pages.
- Together AI pricing was not researched.
- Whether the Anthropic API has any free tier was not checked.

---

## 2. Arabic OCR for photos of printed documents, contracts, lab reports, handwritten prescriptions

### Takeaway
Multimodal LLMs, Gemini in particular, are clearly better than traditional OCR (Tesseract, EasyOCR, PaddleOCR) on Arabic. A dedicated small open model, Qari-OCR (2B), reports very low error rates on printed Arabic. **Handwritten prescriptions are not reliably solved by any general model**: published studies show off-the-shelf GPT-4o and Gemini get single-digit F1 on handwritten medication names. A tool must match any extracted drug names against a drug database and keep a human check.

### Cited Findings
- KITAB-Bench (ACL Findings 2025) has 8,809 samples across 9 domains and 36 subdomains, including handwritten text, tables and 21 chart types. Vision-language models (GPT-4o, Gemini, Qwen) beat EasyOCR, PaddleOCR and Surya by about 60% in CER. — [KITAB-Bench (ACL)](https://preview.aclanthology.org/watermark/2025.findings-acl.1135)
- KITAB-Bench text-recognition table:

  | Model | CER | WER |
  |---|---|---|
  | Gemini-2.0-Flash | 0.13 | 0.32 |
  | GPT-4o | 0.31 | 0.55 |
  | GPT-4o-mini | 0.43 | 0.71 |
  | Qwen2VL-7B | 1.48 | 1.55 |

  The best PDF-to-Markdown result was Gemini-2.0-Flash at only 65% accuracy. On PDF-to-Markdown CHrF, Tesseract scored 59.91 and EasyOCR 57.46. — [KITAB-Bench arXiv PDF](https://arxiv.org/pdf/2502.14949)
- KITAB-Bench lists remaining weak spots: complex fonts, numeral recognition errors, word elongation (kashida) and table structure. — [KITAB-Bench (ACL)](https://preview.aclanthology.org/watermark/2025.findings-acl.1135)
- QARI-OCR v0.2, a Qwen2-VL-2B-Instruct fine-tune: WER 0.160, CER 0.061, BLEU 0.737 on 200 diacritic-rich scanned pages. — [QARI-OCR paper](https://arxiv.org/abs/2506.02295v1)
- The QARI-OCR v0.2.2.1 model card lists CER 0.059 / WER 0.221 against AIN-8B (CER 0.309), easyOCR (0.648) and pytesseract (0.911). The numbers come from the authors and are inconsistent across cards; the v0.1 card claims CER 0.019 on a different test set. — [Qari-OCR-0.2.2.1 model card](https://huggingface.co/NAMAA-Space/Qari-OCR-0.2.2.1-VL-2B-Instruct); [Qari-OCR-0.1 card](https://huggingface.co/NAMAA-Space/Qari-OCR-0.1-VL-2B-Instruct)
- PaddleOCR PP-OCRv5 Arabic mobile recognizer: 81.27% accuracy on PaddleOCR's own dataset, +22.83% over the previous generation. Arabic uses a separate language-specific model. — [PaddleOCR PP-OCRv5 multilingual docs](https://www.paddleocr.ai/v3.3.2/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html)
- PaddleOCR returns Arabic words in left-to-right order, reversing words and sentences, so it needs post-processing. The official PP-OCRv6 does not include Arabic, though a community `arabic_PP-OCRv6_small_rec` exists. — [PaddleOCR GitHub discussion #14971](https://github.com/PaddlePaddle/PaddleOCR/discussions/14971); [arabic_PP-OCRv6_small_rec](https://huggingface.co/medyas/arabic_PP-OCRv6_small_rec)
- Google Cloud Vision Text/Document Text Detection: first 1,000 units/month free, then $1.50 per 1,000 units up to 5M, and $0.60 per 1,000 above that. One unit is one feature on one image. — [Cloud Vision pricing](https://cloud.google.com/vision/pricing?hl=hu)
- Mistral OCR (`mistral-ocr-latest`) launched at about 1,000 pages per $1, or about 2,000 pages per $1 with batch (March 2025 figures). No Arabic accuracy number is published. — [Mistral OCR announcement](https://mistral.ai/news/mistral-ocr)
- Handwritten prescriptions:
  - MIRAGE (2024) reported untuned F1 on medication name and dosage of 7.57% for GPT-4o, 5.53% for Gemini 1.5 Pro and 2.00% for LLaVA 1.6. Fine-tuned VLMs reached about 82%, but on simulated records. — [MIRAGE paper](https://arxiv.org/html/2410.09729v1)
  - A NAACL 2025 industry paper says general LLMs "fail to achieve the desired accuracy… often due to hallucination" on handwritten documents with regional medical vocabulary. — [NAACL 2025 industry paper](https://preview.aclanthology.org/moar-dois/2025.naacl-industry.63.pdf)
  - On about 9,600 real handwritten prescriptions, the best Jaccard index over medication names was about 0.27 (2023, pre-LLM). — [OCR LMs with Custom Vocabularies](https://arxiv.org/pdf/2308.09671)
  - A 2024 Pakistan study matches OCR output against a medication database to fix drug-name errors. — [Multi-head attention prescription extraction](https://arxiv.org/html/2412.18199v1)
- PDF parsers: Docling bundles Tesseract, EasyOCR and RapidOCR. Marker uses Surya OCR. MinerU is built on PaddleOCR and is strongest on CJK. No source benchmarks any of them on Arabic RTL. AI21 states that common parsing strategies "break down" on RTL languages like Arabic. — [Menon Lab: Marker vs Docling vs MinerU 2026](https://themenonlab.blog/blog/best-open-source-pdf-to-markdown-tools-2026); [AI21 RTL parsing](https://www.ai21.com/?p=28650); [OmniDocBench](https://arxiv.org/pdf/2412.07626)

### Inferences
- The practical beginner path for photos of contracts and lab reports is to send the image straight to a multimodal LLM API (Gemini Flash-class or Claude Haiku 5.5) and ask for structured JSON. Qari-OCR is a self-hostable fallback for printed text.
- Image cost is an estimate, not verified this session: Anthropic's vision docs (not re-fetched) put a roughly 1-megapixel image at about 1,500 tokens. A Haiku 5.5 OCR-plus-extraction call (about 1,900 input and 800 output tokens) would then cost about $0.0006, cheaper than Google Vision's $0.0015 per image after the free tier.
- For prescriptions, the safe product framing is to suggest candidate drug names matched against the Egyptian drug list (Section 4), show confidence, and ask the user to confirm. It should not claim to "read your prescription".
- Raw Tesseract or PaddleOCR is probably the wrong choice for beginners: lower accuracy, plus the extra RTL-ordering work.

### Gaps
- No 2026 benchmark found for current models (Gemini 3.x, Claude 5.x, GPT-5.x, Mistral OCR 2/3) on Arabic OCR or Arabic handwriting.
- No Egyptian-specific dataset found for lab reports or prescriptions.
- KITAB-Bench's Tesseract and EasyOCR CER/WER rows were not visible in the extracts.

---

## 3. Arabic speech: ASR for Egyptian voice notes, Egyptian TTS, voice-clone/deepfake detection

### Takeaway
- **ASR:** Cohere Transcribe Arabic (July 2026, 2B, Apache-2.0) is the strongest open option, about 11 WER points better than Whisper large-v3 on the Arabic ASR leaderboard. Groq's hosted Whisper large-v3-turbo is the cheapest hosted option at $0.04 per audio hour.
- **Egyptian TTS:** ElevenLabs (Egyptian-accent voices, about $0.05–$0.10 per 1K characters) or open Egyptian models (VoiceTut-TTS, NileTTS, EGTTS).
- **Deepfake detection:** research datasets for Arabic exist (ArFake, ArEnAV, ArA-DF 2026). Commercial APIs range from cheap (Modulate $0.25/hr) to very expensive (Resemble $0.04/sec). Generalization to real-world audio remains the core weakness.

### Cited Findings

**ASR**
- Cohere Transcribe Arabic (released 2026-07-07): open source under Apache 2.0, weights on Hugging Face, also on Cohere's API. Average WER 25.87 on the Open Universal Arabic ASR Leaderboard, about 2.45 points better than OmniASR-LLM-7B and about 11 points better than Whisper v3 Large. About 2B parameters. — [Cohere blog](https://cohere.com/blog/transcribe-arabic); [HF blog](https://huggingface.co/blog/CohereLabs/cohere-transcribe-arabic-07-2026-release); [Mixpeek](https://mixpeek.com/model/CohereLabs/cohere-transcribe-arabic-07-2026)
- Human reviewers preferred Cohere's transcripts over Whisper's in about 96% of comparisons (vendor-reported). — [Middle East AI News](https://www.middleeastainews.com/p/cohere-launches-transcribe-arabic)
- The Open Universal Arabic ASR Leaderboard reports WER/CER on SADA, Common Voice, MASC, MGB-2 and Casablanca (MSA, Egyptian, Gulf, Levantine, Maghrebi). Its changelog shows models added through April 2026. A newer mirror snapshot lists Qwen3 with a top average WER of about 19.9 (garbled). — [Leaderboard GitHub](https://github.com/Natural-Language-Processing-Elm/open_universal_arabic_asr_leaderboard); [Leaderboard paper](https://arxiv.org/abs/2412.13788v1); [benchmarklist snapshot](https://benchmarklist.com/benchmarks/open_universal_arabic_asr/)
- Egyptian fine-tunes of Whisper on Hugging Face (self-reported, test sets not comparable):

  | Model | Egyptian test result |
  |---|---|
  | oddadmix/whisper-large-v3-arabic-dialectal-v2 | WER 0.271 / CER 0.134 (n=200) |
  | oddadmix/whisper-medium-arabic-dialectal | WER 0.717 zero-shot → 0.358 fine-tuned (932 clips) |
  | tawreck-hasaballah/whisper-small-eg | WER about 47.5 |
  | rahafvii/STT-EGY | WER about 46.3 |
  | dev-ahmedhany LoRA large-v3-turbo | 65.0% → 62.7% on Casablanca Egyptian |

  Sources: [whisper-large-v3-arabic-dialectal-v2](https://huggingface.co/oddadmix/whisper-large-v3-arabic-dialectal-v2); [whisper-medium-arabic-dialectal](https://huggingface.co/oddadmix/whisper-medium-arabic-dialectal); [whisper-small-eg](https://huggingface.co/tawreck-hasaballah/whisper-small-eg/blob/main/README.md); [STT-EGY](https://huggingface.co/rahafvii/STT-EGY); [turbo LoRA](https://huggingface.co/dev-ahmedhany/whisper-large-v3-turbo-arabic-ft-lora)
- An academic paper on multi-dialect Whisper fine-tuning releases its models and data on HF. — [arXiv 2506.02627](https://arxiv.org/pdf/2506.02627)
- Groq hosted Whisper: large-v3-turbo at $0.04 per audio hour, large-v3 at $0.111 per hour. Billing has a 10-second minimum per request. The free plan allows 2,000 transcription requests/day. — [Groq Whisper turbo announcement](https://groq.com/whisper-large-v3-turbo-now-available-on-groq-combining-speed-quality-for-speech-recognition/); [Morph Groq pricing Oct 2026](https://www.morphllm.com/groq-pricing)
- OpenAI Whisper API: $0.006/min ($0.36/hr) per a third-party comparison. — [Morph Groq pricing](https://www.morphllm.com/groq-pricing) (verify on OpenAI)
- ElevenLabs Scribe v1/v2: $0.22 per audio hour; Scribe v2 Realtime $0.39/hr. No Arabic or Egyptian accuracy data was found. — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- In-browser ASR: Transformers.js runs Whisper (e.g. `onnx-community/whisper-base`, q4) on WebGPU with automatic WASM fallback. — [LogRocket voice agent in browser](https://blog.logrocket.com/voice-ai-agent-browser/); [Transformers.js v3 blog](https://www.huggingface.co/blog/transformersjs-v3)

**TTS for Egyptian Arabic**
- VoiceTut-TTS: OmniVoice fine-tuned on about 380 hours of Egyptian podcast speech, with zero-shot voice cloning and streaming. — [VoiceTut-TTS](https://huggingface.co/oaattia/VoiceTut-TTS)
- NileTTS (2026 ACL workshop): the first public Egyptian Arabic TTS dataset, built with a synthetic LLM-to-speech pipeline, plus an open fine-tuned XTTS v2 model. — [NileTTS arXiv 2602.15675](https://arxiv.org/html/2602.15675v1); [ACL Anthology](https://aclanthology.org/2026.abjadnlp-1.6)
- EGTTS V0.1: XTTS v2-based Egyptian TTS with an HF Space demo. — [GitHub joejoe03/Egyptian-Text-To-Speech](https://github.com/joejoe03/Egyptian-Text-To-Speech)
- ElevenLabs offers an "accent Egypt" voice library, with about 8 voices tagged Egyptian, mostly male. — [ElevenLabs Egyptian accent TTS](https://elevenlabs.io/blog/egyptian-accent-text-to-speech); [Famulor ElevenLabs Egyptian voices](https://www.famulor.io/voices/elevenlabs/languages/ar/accents/egyptian)
- ElevenLabs TTS prices are about $0.05 per 1K characters for Flash/Turbo and $0.10 per 1K for Multilingual v2/v3 (third-party). — [Puter ElevenLabs pricing Jun 2026](https://developer.puter.com/tutorials/elevenlabs-api-pricing/)
- Azure appears to have a small ar-EG catalogue (an aggregator counts about 2 Egypt-accent voices across ElevenLabs and Azure). Neural TTS in the China region is ¥95.4 per 1M characters with 0.5M free/month; this is not the global USD price. — [json2video Egypt voices](https://json2video.com/ai-voices/languages/arabic/egypt/); [Azure China pricing](https://www.azure.cn/en-us/pricing/details/cognitive-services/)

**Voice-clone / deepfake audio detection**
- The In-the-Wild dataset (37.9 h, on HF as mueller91/In-The-Wild) showed that models trained on ASVspoof 2019 "performed poorly" on real-world audio. — [In-The-Wild dataset](https://huggingface.co/datasets/mueller91/In-The-Wild); [Does Audio Deepfake Detection Generalize?](https://deepfake-demo.aisec.fraunhofer.de/related_work/2203.16263)
- A lightweight resolution-aware detector reports 95.70% accuracy, AUC 0.98 and EER 0.0481 on In-the-Wild. Public weights were not confirmed. — [arXiv 2601.06560](https://arxiv.org/pdf/2601.06560)
- Open HF detector example: hyperion-grl-deepfake-detector (wav2vec2-xls-r-300m plus a classifier head). No In-the-Wild score is reported. — [HF model](https://huggingface.co/RuiRuihigh/hyperion-grl-deepfake-detector)
- Arabic datasets:
  - ArFake: multi-dialect Arabic spoofed speech; FishSpeech samples were the hardest. — [ArFake](https://arxiv.org/html/2509.22808v1)
  - ArEnAV: 387K videos and over 765 h of Arabic-English code-switched deepfakes, public, ICLR 2026. — [Tell me Habibi](https://arxiv.org/abs/2505.22581)
  - AFAD-MSA: AASIST vs wav2vec2 and Whisper baselines. — [awesomepapers AFAD-MSA](https://awesomepapers.io/speech-audio/papers/s2_a80b608a4df5)
  - ArA-DF 2026 shared task: binary spoof detection scored by EER, covering MSA and dialects, live on Codabench. — [ArA-DF 2026](https://arabicspeech-ara-df-2026.static.hf.space/)
  - MLAAD includes Arabic but lacks dialect diversity. — [ArFake](https://arxiv.org/html/2509.22808v1)
- Commercial detection APIs:
  - Resemble: about $0.04 per second of audio ($144/hr; about $28/hr at volume). Its free web tool is non-commercial and limited to 2-minute clips. — [fast.io deepfake detectors 2026](https://www.fast.io/resources/best-deepfake-detectors-2026.md); [Resemble free detector](https://www.resemble.ai/free-deepfake-detector/)
  - Reality Defender: reportedly a free tier of 50 scans/month plus a free developer API. — [Petronella comparison](https://petronellatech.com/blog/deepfake-detection-tools-compared-8-services-for-enterprise-and-personal-use)
  - Modulate: voice deepfake detection at $0.25/hr batch or streaming, with a 3-second minimum (vendor). — [Modulate pricing](https://platform.modulate.ai/pricing)
  - The Hugging Face Deepfake Arena's 98.9% top score is a commercial model across 14 benchmarks combined. — [HackerNoon](https://hackernoon.com/catching-989-out-of-100-deepfakes-what-it-takes-to-lead-hugging-faces-leaderboard)

### Inferences
- Recommended beginner ASR stack: Groq Whisper large-v3-turbo for the cheapest hosted transcription, then move to Cohere Transcribe Arabic (via Cohere API or self-hosted) if Egyptian accuracy matters. Keep a small set of Egyptian voice notes to test each model yourself.
- Voice notes under 10 seconds still pay the 10-second minimum on Groq, so batching or concatenating short clips saves money.
- A "is this voice note AI-cloned?" feature would rest on detectors with documented poor out-of-domain generalization. It should be framed as a probability with caveats. Modulate's price makes it affordable, but its Arabic and Egyptian accuracy is unknown.
- The licence of every XTTS-v2-based Egyptian TTS (EGTTS, NileTTS) should be checked before commercial use. XTTS v2's original Coqui model licence was non-commercial according to my prior knowledge; I did not verify this in this session.

### Gaps
- No Egyptian-only WER for Cohere Transcribe Arabic or for the cloud APIs (ElevenLabs, Google Chirp, Azure ar-EG) was found.
- No published Arabic or Egyptian accuracy for any commercial deepfake-detection API.
- Licences for VoiceTut-TTS, EGTTS and NileTTS were not verified.
- Global USD pricing for Azure ar-EG voices and Google Cloud TTS Arabic was not found.

---

## 4. Open data relevant to Egypt: laws, government procedures, drugs and prices, FX/gold, curricula

### Takeaway
Egypt has **few clean, machine-readable official datasets**.
- **Laws:** Manshurat (AUC) and the Public Laws Portal, which needs OCR/scraping.
- **Drugs:** the EDA search tool has no API; an unofficial GitHub dataset lists 25,070 drugs with EGP prices.
- **Government procedures:** no structured catalogue was found.
- **Curricula:** no Thanaweya dataset was found.
- **Exchange rates:** free APIs such as Frankfurter work; gold needs a paid or freemium metals API.

Building a curated, cited dataset is part of the work for any Egypt-specific tool.

### Cited Findings
- Manshurat Qanuneya (manshurat.org), run by the AUC Law and Society Research Unit, is "the first open-access database of its kind" for Egyptian primary legal materials in Arabic. It lists about 13,100 laws and about 33,000 presidential and ministerial decrees; the counts may be dated. — [AUC Law & Society Research Unit](https://gapp.aucegypt.edu/centers/law-and-society-research-unit)
- Older Open Knowledge reviews (2013–2015): the government portal had "a handful of laws available for download… no apparent way for accessing all the laws". — [OKFN Egypt legislation](https://2015.index.okfn.org/place/egypt/legislation)
- An Egyptian Law MCP server draws on Egypt's official Public Laws Portal and OCRs PDF and image documents. — [playbooks: egyptian-law-mcp](https://playbooks.com/mcp/ansvar-systems/egyptian-law-mcp); [mcpmarket Egyptian Law](https://mcpmarket.com/server/egyptian-law)
- Dike claims Egyptian legal citation-graph datasets on HF under CC-BY-4.0, with 1,504,616 extracted mentions and 261,770 resolved edges. This is the vendor's own description and the Hub listing was not verified. — [Dike research](https://dike.it.com/research)
- Other legal data:
  - A Mendeley CSV of about 200 Egyptian drug-crime cases, for academic use only. — [Mendeley dataset](https://data.mendeley.com/datasets/ffzx5fcwdn/2)
  - The ArabicLAWLLM HF Space uses only a "mock legal corpus". — [ArabicLAWLLM README](https://huggingface.co/spaces/ghostai1/ArabicLAWLLM/blob/main/README.md)
- Drugs:
  - The EDA's Egyptian Drug Database (EDDB) is a search tool on edaegypt.gov.eg; no public API or bulk download was found. — [EDA EDDB mechanism PDF](https://www.edaegypt.gov.eg/media/ajqiccqc/np-ppma-18-mechanism-of-egyptian-drug-database-eddb-searching-tool.pdf)
  - EDA periodic lists cover clinical trials, OTC and emergency medicines, not prices. — [EDA periodic lists](https://edaegypt.gov.eg/en/publications-reports-and-eda-in-numbers/eda-publications/periodic-lists/)
  - An unofficial GitHub "egyptian-drug-database" has 25,070 medicines with Arabic and English trade names, composition, manufacturer, class, route and current EGP price, last updated June 2026. Its provenance is unverified. — [karem505/egyptian-drug-database](https://github.com/karem505/egyptian-drug-database)
- Government services:
  - Digital Egypt registration uses the 14-digit national ID plus the linked mobile number. One account covers civil status, traffic, real estate, courts and commercial registry; some services need the Digital Identity app. First-time national IDs, passports and first-time criminal records still need in-person visits. — [Enterprise guide Aug 2026](https://enterpriseam.com/egypt/2026/08/02/your-guide-to-navigating-egypts-online-government-services/)
  - The platform had more than 125 services in a 2023-era report. — [CairoScene](https://cairoscene.com/Buzz/Digital-Egypt-Platform-Offers-125-Government-Services-Online)
  - A second criminal-record certificate for Egyptians abroad was added in June 2026. — [Ahram Online](https://english.ahram.org.eg/News/571910.aspx)
- Exchange rates and gold:
  - Frankfurter is a free, open-source exchange-rate API covering EGP (api.frankfurter.dev). — [Frankfurter EGP](https://frankfurter.dev/currencies/egp/)
  - Metals-API covers gold (XAU) and EGP, with update frequency depending on plan and history back to 2019; the free tier is unconfirmed. — [Metals-API EGP](https://metals-api.com/blog/retrieve-egyptian-pound-egp-prices-through-this-api)
- Education and dialect corpora:
  - No Thanaweya Amma dataset was found. Edraky-AI is a Qwen2-based, Apache-2.0 model tagged "egyptian-curriculum" with unknown training data. — [Edraky-AI](https://huggingface.co/Edraky/Edraky-AI/blob/main/tokenizer.json)
  - FineWeb2-Egyptian-Arabic: web text, 10M–100M rows, odc-by licence. — [FineWeb2-Egyptian-Arabic](https://huggingface.co/datasets/Omartificial-Intelligence-Space/FineWeb2-Egyptian-Arabic/discussions)
  - AraDiCE-ArabicMMLU-egy: an Egyptian-dialect version of school and professional exam questions. — [QCRI/AraDiCE-ArabicMMLU-egy](https://huggingface.co/datasets/QCRI/AraDiCE-ArabicMMLU-egy/tree/9fa67a248727c4748a92cc0fd549482bbed5f62c/prof_humanities_law)

### Inferences
- An Egyptian legal Q&A tool would probably need to scrape or OCR Manshurat and the Public Laws Portal, then embed the text for RAG (Section 5). Licensing and terms of use for those sites must be checked, and outputs should carry citations to the article or law number.
- A drug-price or "is this the right price?" tool could start from the GitHub dataset but must show its date and source and invite corrections. Prices in Egypt change after official repricing rounds, so stale data is a real risk.
- A government-procedures assistant would need a hand-curated procedure dataset, which could itself be a competitive advantage.

### Gaps
- I could not confirm that manshurat.org is online today, or its terms of use.
- No official Central Bank of Egypt exchange-rate API was found.
- No free gold-price API (e.g. for Egyptian 21-karat local prices) was confirmed.
- No structured Digital Egypt service catalogue (dataset or API) was found.
- No open supermarket or consumer price data for Egypt was found.

---

## 5. Open-source repos and fast web stacks (RAG, document Q&A, scraping, PDF parsing, browser-side ML, hosting free tiers)

### Takeaway
A beginner-friendly free stack:
- **Hosting and backend:** Cloudflare Pages/Workers (100K requests/day free, commercial use not restricted in the sources found) plus Supabase (500 MB DB, 50K MAU free) or Cloudflare D1.
- **Retrieval:** pgvector or Vectorize, with BGE-M3 or multilingual-e5-large embeddings for Arabic RAG.
- **Ingestion:** Crawl4AI for scraping and Docling or Marker for PDFs.
- **Browser-side ML:** Transformers.js or WebLLM to offload work to the browser.

Vercel Hobby is **non-commercial only**.

### Cited Findings
- Cloudflare Workers Free: 100,000 requests/day, reset at midnight UTC (Error 1027 when exceeded), and 50 subrequests per invocation. — [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- Cloudflare D1 Free: 5M rows read/day, 100K rows written/day, 5 GB total. From 2026-09-01, queries fail once the daily limits are exceeded. — [D1 limits](https://developers.cloudflare.com/d1/platform/limits/); [D1 changelog 2026-09-01](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/)
- Cloudflare R2 Free: 10 GB-month storage, 1M Class A and 10M Class B operations per month, free egress. — [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- Cloudflare Vectorize: sources conflict. One says Workers Paid only; another lists a free allowance of 30M queried and 5M stored dimensions per month. — [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/); [Workers plans](https://workers.cloudflare.com/plans)
- Supabase Free: 500 MB Postgres per project, 50,000 auth MAU, 2 projects, projects **paused after 1 week of inactivity**. Storage and egress figures conflict (1 GB/5 GB vs 1 GB/2 GB). Pro is $25/mo with 8 GB DB and 100K MAU. — [JetAdmin Supabase pricing 2026](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/); [automationatlas](https://automationatlas.io/answers/supabase-free-tier-limits-2026/) (third-party; verify on supabase.com/pricing)
- Vercel Hobby "restricts users to non-commercial, personal use only" and you "cannot purchase additional usage". Its function-invocation allowance figures changed between doc versions (100K vs 1M). — [Vercel Hobby plan docs](https://examples.vercel.com/docs/plans/hobby)
- Arabic RAG study: bge-m3 and multilingual-e5-large score highest on retrieval and generation. Sentence-aware chunking wins, and the bge-reranker-v2-m3 reranker "significantly boosts faithfulness". — [Exploring RAG in Arabic (arXiv 2506.06339)](https://arxiv.org/html/2506.06339v1)
- A community Arabic RAG Leaderboard exists as an HF Space. — [The Arabic RAG Leaderboard](https://navid-ai-the-arabic-rag-leaderboard.hf.space)
- BGE-M3 provides dense, sparse and multi-vector retrieval under Apache 2.0. — [Openlayer embedding guide Sept 2026](https://www.openlayer.com/blog/embedding-models-rag-retrieval)
- Crawl4AI: Apache-2.0 self-hosted Python crawler for LLMs with no key or quota; its cloud API is in closed beta. Firecrawl: AGPL-3.0, self-hostable without the proprietary anti-bot layer. The hosted Firecrawl free tier is reported as 500–1,000 credits (sources conflict), paid plans start at about $16/mo, and free/Hobby allow 2–5 concurrent requests. — [toolfreebie Crawl4AI](https://toolfreebie.com/?p=350); [Firecrawl vs Crawl4AI](https://www.firecrawl.dev/alternatives/firecrawl-vs-crawl4ai); [toolhalla comparison 2026](https://toolhalla.ai/blog/firecrawl-vs-crawl4ai-vs-jina-reader-2026)
- PDF parsing:
  - Docling: Tesseract, EasyOCR and RapidOCR backends, good reading order.
  - Marker: Surya OCR, multilingual.
  - MinerU: PaddleOCR-based, CJK-focused; it merges columns incorrectly on complex layouts.

  No Arabic benchmark covers any of them. — [Menon Lab 2026 comparison](https://themenonlab.blog/blog/best-open-source-pdf-to-markdown-tools-2026); [OmniDocBench](https://arxiv.org/pdf/2412.07626)
- Browser-side ML:
  - Transformers.js v3 added WebGPU. A 2026 tutorial uses Transformers.js v4 (WebGPU with WASM fallback) for in-browser Whisper ASR. — [HF Transformers.js v3](https://www.huggingface.co/blog/transformersjs-v3); [LogRocket](https://blog.logrocket.com/voice-ai-agent-browser/)
  - WebLLM 0.2.85 is WebGPU-only, has an OpenAI-style `chat.completions.create()` API, and ships 163 prebuilt models from SmolLM2-360M to Llama-2-13B (e.g. Llama-3.1-8B-Instruct-q4f16_1-MLC). — [noqta WebGPU 2026](https://noqta.tn/en/blog/webgpu-ia-navigateur-inference-locale-sans-serveur-2026)

### Inferences
- Simplest stack for a beginner with an AI coding assistant: Vite or Next.js front end on Cloudflare Pages, a Cloudflare Worker as the API proxy that hides LLM keys and enforces rate limits, Supabase for auth and Postgres with pgvector. Cloudflare-only (Workers + D1 + R2 + Vectorize) is also possible.
- Supabase's free-tier pausing is fine for a prototype but not for a live viral tool. Budget about $25/mo for Supabase Pro once launched.
- Browser-side small models (Whisper-base, embeddings) can cut server costs for privacy-sensitive tasks like voice notes. Quality for Egyptian Arabic with small Whisper models is poor, though (Section 3 WERs of about 46–48 for whisper-small fine-tunes), so they suit pre-processing better than final transcription.

### Gaps
- No Arabic-specific evaluation of Docling, Marker or MinerU.
- The current official Supabase and Vercel free-tier numbers and the Cloudflare Workers Paid base price could not be fetched directly.
- Transformers.js v4.3.0 release details are unverified.

---

## 6. Scam/phishing check APIs: Google Safe Browsing, VirusTotal, URLhaus/PhishTank, phone reputation, WHOIS/domain age

### Takeaway
Most free threat-intel APIs **ban commercial use** (Google Safe Browsing, VirusTotal Public). A free consumer tool with no revenue may qualify as non-commercial, but any ads or monetization would require Google Web Risk (free up to about 100K lookups/month, verify) or paid VirusTotal. URLhaus is free with an Auth-Key. PhishTank is closed to new users. Domain age is free via RDAP. No usable phone-number reputation API for Egypt was found.

### Cited Findings
- Google Safe Browsing APIs are free but "for non-commercial use only (meaning 'not for sale or revenue generating purposes')"; commercial users should use Web Risk. — [Safe Browsing Permitted Use](https://developers.google.com/safe-browsing/reference/Appropriate.Usage)
- Google Web Risk Lookup API `uris.search` appears free up to 100,000 calls/month, then about $0.50 per 1,000 calls up to 10M. `hashes.search` is about $50 per 1,000 calls in the lower tiers. `threatLists.computeDiff` is free. The pricing table in the extract was garbled. — [Web Risk product page](https://cloud.google.com/security/products/web-risk?hl=nl) (verify)
- VirusTotal Public API: 500 requests/day and 4 requests/minute; it "must not be used in commercial products or services". — [VirusTotal Public vs Premium API](https://docs.virustotal.com/reference/public-vs-premium-api)
- VirusTotal also bars use in business workflows that don't contribute files, and bars registering multiple accounts to get around the limits. — [Wazuh VirusTotal docs](https://documentation.wazuh.com/current/user-manual/capabilities/virustotal-scan/about.html)
- URLhaus (abuse.ch) has required an `Auth-Key` header since 2025-06-30; keys are free from auth.abuse.ch. — [Cortex XSOAR URLhaus feed](https://cortex.marketplace.pan.dev/marketplace/details/FeedURLhaus); [XSOAR docs](https://xsoar.pan.dev/docs/reference/integrations/feed-ur-lhaus)
- PhishTank closed new-user registration in 2020, and it was still closed as of June 2026. — [Wikipedia: PhishTank](https://en.wikipedia.org/wiki/PhishTank)
- OpenPhish has a free public feed plus a paid premium tier. Phishunt (a competitor) claims no-key, no-rate-limit reads. — [phishunt vs OpenPhish](https://phishunt.io/vs/openphish/) (vendor marketing)
- Domain age: RDAP is free. Query `https://rdap.org/domain/{domain}` (a bootstrap proxy to the authoritative registry) and read the `events[].eventAction == "registration"` date. Some data is redacted, and coverage varies by TLD. — [domaindetails RDAP explained](https://domaindetails.com/kb/technical-guides/rdap-explained); [Apify RDAP scraper](https://apify.com/arman-bd/whois-rdap-scraper); [InventiveHQ RDAP vs WHOIS](https://inventivehq.com/blog/what-is-rdap-and-how-does-it-differ-from-whois)
- Phone reputation:
  - Telnyx Number Reputation is US-only, needs an approved Letter of Authorization, and bills fresh queries. — [Telnyx number reputation](https://developers.telnyx.com/docs/number-reputation/overview)
  - Hiya needs a service agreement before issuing an API key. — [Hiya get started](https://developer.hiya.com/docs/guides/voice-protection/number-reputation/get-started)
  - Call Control has no published pricing. — [Call Control API](https://jentic.com/apis/callcontrol)

### Inferences
- For an Egyptian "is this link or message a scam?" checker, the free building blocks are:
  1. URLhaus lookup with a free Auth-Key.
  2. RDAP domain-age check, where newly registered domains are a strong red flag.
  3. An LLM (e.g. Haiku 5.5) classifying the message text for common Egyptian scam patterns such as fake InstaPay/Vodafone Cash or prize SMS.
  4. Safe Browsing only while the tool earns no revenue; otherwise Web Risk.
- Phone-number reputation for Egyptian (+20) numbers looks like a gap with no API option. A crowdsourced, user-reported number database could be the tool's own moat, but it carries defamation and privacy risk.

### Gaps
- Exact Web Risk tiers need confirming on the official pricing page.
- I could not verify OpenPhish free-feed terms or URLhaus rate limits.
- No API for Truecaller or any Egypt-specific phone spam database was found.
- I did not research Egyptian law on publishing user-reported phone numbers.

---

## 7. Rough monthly cost for a free tool with 100K users and a few AI requests each, and ways to keep it cheap

### Takeaway
With 100K monthly users making about 3 AI requests each (300K requests/month), a small-model text stack (Claude Haiku 5.5, GPT-5 nano or Groq gpt-oss-20b) costs about **$80–$150/month in LLM fees**. Gemini 3.1 Flash-Lite or GPT-5 mini would cost about $300–$420. Mid-tier models (Sonnet 5.5 at about $2,400, Opus 5.5 at about $4,800+) are 20–50x more expensive. Image OCR adds about $180 (Haiku-class), voice-note ASR about $200 (Groq turbo) to $1,100 (ElevenLabs Scribe), and hosting $0–$50. TTS and commercial deepfake detection are the costs that can explode.

### Cited Findings (price inputs; the arithmetic is in Inferences)
- Claude Haiku 5.5: $0.10 / $0.50 per MTok, cache read $0.01, batch $0.05 / $0.25. Sonnet 5.5: $2 / $10. Opus 5.5: $4 / $20. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- GPT-5 nano: $0.05 / $0.40. GPT-5 mini: $0.25 / $2.00 (deprecated). — [OpenAI GPT-5 nano](https://developers.openai.com/api/docs/models/gpt-5-nano); [OpenAI GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Gemini 3.1 Flash-Lite: $0.25 / $1.50. Gemini 3.5 Flash-Lite: $0.30 / $2.50. — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Groq gpt-oss-20b: $0.075 / $0.30. Groq Whisper large-v3-turbo: $0.04/audio-hour with a 10-second minimum and 2,000 free transcription requests/day. — [eesel Groq pricing](https://eesel.ai/blog/groq-pricing); [Groq Whisper turbo](https://groq.com/whisper-large-v3-turbo-now-available-on-groq-combining-speed-quality-for-speech-recognition/)
- ElevenLabs Scribe: $0.22/hr. ElevenLabs Flash TTS: about $0.05 per 1K characters. — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api); [Puter ElevenLabs pricing](https://developer.puter.com/tutorials/elevenlabs-api-pricing/)
- Google Vision OCR: $1.50 per 1,000 images after 1,000 free. Mistral OCR: about $1 per 1,000 pages. — [Cloud Vision pricing](https://cloud.google.com/vision/pricing?hl=hu); [Mistral OCR](https://mistral.ai/news/mistral-ocr)
- Deepfake detection: Modulate $0.25/hr; Resemble $0.04/sec. — [Modulate pricing](https://platform.modulate.ai/pricing); [fast.io comparison](https://www.fast.io/resources/best-deepfake-detectors-2026.md)
- Cost levers documented by Anthropic: cache hits cost 0.1x input (0.05x on Sonnet/Opus 5.5) and pay off after one read; the Batch API halves prices for non-interactive work; discounts stack. — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Infrastructure free tiers: Cloudflare Workers 100K requests/day (about 3M/month); D1 5M reads/day; R2 free egress. Supabase free covers 50K MAU and Pro ($25) covers 100K MAU. — [Workers limits](https://developers.cloudflare.com/workers/platform/limits/); [D1 limits](https://developers.cloudflare.com/d1/platform/limits/); [JetAdmin Supabase 2026](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/)
- The Arabic RAG study found adding a reranker improves faithfulness, which lets a small generator model work from better context. — [arXiv 2506.06339](https://arxiv.org/html/2506.06339v1)

### Inferences
**Worked example.** Assumptions: 100K users × 3 requests = 300K requests/month; each request has 1,500 input tokens (1,000 of them a fixed system prompt) and 500 output tokens.

| Model | LLM cost per month |
|---|---|
| Groq gpt-oss-20b | ~$79 |
| GPT-5 nano | ~$83 |
| Claude Haiku 5.5 with system prompt cached | ~$93 ($0.00001 + $0.00005 + $0.00025 per request) |
| Claude Haiku 5.5 uncached | ~$120 |
| GPT-5.4 nano | ~$280 |
| Gemini 3.1 Flash-Lite | ~$340 |
| GPT-5 mini | ~$410 |
| Gemini 3.5 Flash-Lite | ~$510 |
| Gemini 3.6 Flash | ~$900 |
| Claude Sonnet 5.5 | ~$2,400 |
| Claude Opus 5.5 | ~$4,800, plus thinking tokens |

**Add-ons**, if each user also sends one item a month (100K items):

| Add-on | Monthly cost |
|---|---|
| Photo OCR via Haiku 5.5 (~1,900 in / 800 out tokens) | ~$60 at 100K images; ~$180 if all 300K requests are images |
| Photo OCR via Google Vision | ~$150 at 100K images |
| 1-minute voice note per request (300K min = 5,000 h), Groq turbo | ~$200 |
| Same, Groq large-v3 | ~$555 |
| Same, ElevenLabs Scribe | ~$1,100 |
| Same, OpenAI Whisper | ~$1,800 |
| Voice-clone check on 100K × 1-min clips (~1,667 h), Modulate | ~$420 |
| Same, Resemble at $0.04/sec | ~$240,000 |
| TTS replies of 500 characters × 300K, ElevenLabs Flash | ~$7,500; avoid or make opt-in |
| Hosting (Cloudflare Workers/Pages free or paid base, plus Supabase Pro) | ~$0–$50 |

**Realistic total** for a text + OCR tool built on Haiku-class models: about **$150–$400/month**. Adding Groq voice notes brings it to about $350–$800.

**Ways to keep it cheap**, ranked by likely impact:
1. Default to a small model (Haiku 5.5, nano or gpt-oss-20b) and route only hard cases to Sonnet-class.
2. Cache the system prompt (provider prompt caching) and cache full answers for repeated questions, e.g. drug prices or "is this link safe?" for the same URL, in Workers KV, D1 or Supabase.
3. Cap output tokens and ask for concise JSON.
4. Enforce per-IP and per-user daily quotas in the Worker (e.g. 5 free requests/day), and require login for heavier features (Supabase free auth up to 50K MAU).
5. Resize images before vision calls (fewer image tokens).
6. Use the Batch API (50% off) for non-interactive jobs such as nightly re-indexing or bulk summarizing laws.
7. Run tiny models in the browser (Transformers.js embeddings or Whisper-base pre-filtering) to drop junk requests.
8. Use free-tier quotas (Groq's 2,000 transcriptions/day, Gemini free tier) as overflow only, never as the core path, because they are unstable.

**Risk:** viral spikes are lumpy. A hard monthly spend cap with provider budget alerts, plus a "come back tomorrow" response once the cap is hit, protects a solo developer from a surprise bill.

### Gaps
- No measured token counts for Arabic prompts on these specific tokenizers, so real costs could be noticeably higher than the English-token estimates above.
- Image-token sizing per provider was not re-verified this session.
- The Cloudflare Workers Paid base fee and per-request overage were not captured from official pages.
- No published real-world cost case study was found for an Arabic consumer AI tool at 100K MAU.
