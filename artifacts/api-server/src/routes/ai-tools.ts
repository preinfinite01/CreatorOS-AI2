import { Router } from "express";
import { groq as openai, GROQ_MODEL } from "../lib/groq.js";
import {
  GenerateTitlesBody,
  GenerateHooksBody,
  GenerateScriptBody,
  GenerateIdeasBody,
  GenerateWorkflowBody,
} from "@workspace/api-zod";
import { aiGenerationLimiter } from "../middleware/rateLimit";

const router = Router();

// ── Titles ────────────────────────────────────────────────────
router.post("/ai/generate-titles", aiGenerationLimiter, async (req, res) => {
  const parsed = GenerateTitlesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, count = 5 } = parsed.data;

  const platformContext: Record<string, string> = {
    youtube: "YouTube (SEO-heavy, 60-70 chars ideal, curiosity-driven, high-search-volume keywords)",
    tiktok: "TikTok (pattern-interrupt first word, trend-aware, conversational, urgency-driven)",
    instagram: "Instagram Reels (emotionally resonant, aspirational, identity-driven, share-worthy)",
    linkedin: "LinkedIn (authority-positioning, insight-driven, professional value, career-relevant)",
    youtube_shorts: "YouTube Shorts (ultra-punchy, first 3 words carry all weight, mobile-first)",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are an elite viral content strategist who has studied every high-performing video across the internet. You understand the exact psychological mechanisms — curiosity gaps, identity triggers, loss aversion, social proof, controversy, and specificity — that make titles irresistible to click. You write titles that feel HUMAN, not AI-generated. Every title you produce could legitimately hit 1M+ views. You never use generic phrases like "game-changing" or "revolutionary". Platform context: ${platformContext[platform] ?? platform}.`
        },
        {
          role: "user",
          content: `Generate ${count} high-performing video titles for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nPlatform: ${platform}\nTone/Style: ${tone || "engaging and direct"}\n\nRules:\n- Each title MUST use a different psychological formula (curiosity gap, specific number, contrarian take, story hook, transformation promise, social proof angle, urgency, identity statement)\n- Zero generic words: no "game-changing", "ultimate", "amazing", "incredible"\n- Be specific — specificity creates credibility and click-worthiness\n- Write like a top creator in this niche would, not like a content marketing template\n- Each title stands completely alone — no series or part numbers\n\nReturn ONLY valid JSON: {"titles": ["title1", "title2", ...]}`
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let titles: string[] = [];
    try { titles = JSON.parse(content).titles ?? []; } catch { titles = content.split("\n").filter((l) => l.trim()).slice(0, count); }
    res.json({ titles, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating titles");
    res.status(500).json({ error: "Failed to generate titles. Please try again." });
  }
});

// ── Hooks ─────────────────────────────────────────────────────
router.post("/ai/generate-hooks", aiGenerationLimiter, async (req, res) => {
  const parsed = GenerateHooksBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, count = 5 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are the world's foremost expert on the first 3 seconds of short-form video. You have reverse-engineered why millions of videos go viral and what makes 90%+ of viewers stay past the first 3 seconds. You know that the hook is not an introduction — it is a psychological trap. You write hooks that exploit curiosity gaps, trigger identity, create discomfort, make bold claims, or promise immediate value. Each hook you write feels like it came from a top creator with 10M+ followers, not a content template. Platform: ${platform}.`
        },
        {
          role: "user",
          content: `Write ${count} elite-level video hooks for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nTone: ${tone || "bold and direct"}\n\nEach hook must:\n- Be 1-2 sentences maximum — every word earns its place\n- Trigger an immediate psychological response (curiosity, shock, identity, desire, fear of missing out, controversy)\n- Feel completely different from the others in structure and mechanism\n- Start with a strong action word OR a disruptive question OR a bold claim — never "Are you..." or "Have you ever..."\n- Sound like a real human talking, not corporate content\n\nHook types to vary across: Pattern Interrupt, Bold Claim, Contrarian Statement, Specific Story Opener, Shocking Statistic, Identity Trigger, Problem Agitation, Secret Reveal\n\nReturn ONLY valid JSON: {"hooks": ["hook1", "hook2", ...]}`
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let hooks: string[] = [];
    try { hooks = JSON.parse(content).hooks ?? []; } catch { hooks = content.split("\n").filter((l) => l.trim()).slice(0, count); }
    res.json({ hooks, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating hooks");
    res.status(500).json({ error: "Failed to generate hooks. Please try again." });
  }
});

// ── Script ────────────────────────────────────────────────────
router.post("/ai/generate-script", aiGenerationLimiter, async (req, res) => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, duration, hook, title } = parsed.data;

  const durationMap: Record<string, string> = {
    short: "15-30 seconds (100-200 words)",
    medium: "60-90 seconds (300-500 words)",
    long: "5-10 minutes (900-1800 words)",
  };

  const platformVoice: Record<string, string> = {
    tiktok: "Conversational, fast-paced, Gen-Z aware, trend-literate, intimate — like you're talking to one person. No intros. Cut to the point immediately. Use pattern interrupts every 8-10 seconds.",
    youtube: "Cinematic storytelling, strong narrative arc, emotional payoffs, strategic retention loops, direct address. Can breathe more. Build curiosity layers. Payoff feels earned.",
    instagram: "Emotionally resonant, identity-driven, aspirational but relatable. Stories feel personal. Visual-first — describe what viewers will see. Shareable insights.",
    linkedin: "Authoritative, insight-dense, story-backed, professional value. Contrarian but respectful. Data points strengthen points. Ends with a thought-provoking question.",
    youtube_shorts: "Ultra-distilled. Every sentence is its own beat. High-energy. Designed to loop. Hook must work as both opener and closer.",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a Hollywood-trained scriptwriter who crossed over into digital content. You've written scripts for creators with combined audiences of 500M+. You understand that retention is an emotion — not a technique. You build scripts with cinematic pacing, unexpected turns, emotional momentum, and pattern interrupts woven naturally into the narrative. Every line serves a purpose: either advancing the story, delivering value, building suspense, or landing an emotional beat. Platform voice guide: ${platformVoice[platform] ?? platform}. Your scripts never sound like AI — they sound like the creator's best version of themselves.`
        },
        {
          role: "user",
          content: `Write a complete ${durationMap[duration]} script for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nPlatform: ${platform}\nTone: ${tone || "authentic and engaging"}\n${hook ? `Use this opening hook: "${hook}"` : ""}\n${title ? `Video title: "${title}"` : ""}\n\nScript architecture:\n1. HOOK (first 3 seconds — no intro, zero throat-clearing)\n2. SETUP (establish the tension, question, or promise)\n3. CONTENT DELIVERY (value in escalating layers — each beat better than the last)\n4. PATTERN INTERRUPT (unexpected angle, story pivot, or perspective shift mid-script)\n5. CLIMAX (the most valuable or surprising insight)\n6. CTA (feels earned, not bolted-on — one clear action)\n\nFormatting rules:\n- Use [VISUAL CUE: description] sparingly for key visual moments\n- Use [PAUSE] for deliberate beat moments\n- Write in spoken language — contractions, short sentences, rhetorical questions\n- No bullet-point lists in the delivered speech\n\nReturn ONLY valid JSON: {"script": "full formatted script text", "hook": "the opening hook line", "cta": "the closing call to action", "estimatedDuration": "realistic spoken time estimate"}`
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result = { script: "", hook: hook ?? "", cta: "", estimatedDuration: durationMap[duration] ?? "" };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.script = content; }
    res.json({ ...result, creditsUsed: 20 });
  } catch (err) {
    req.log.error({ err }, "Error generating script");
    res.status(500).json({ error: "Failed to generate script. Please try again." });
  }
});

// ── Ideas ─────────────────────────────────────────────────────
router.post("/ai/generate-ideas", aiGenerationLimiter, async (req, res) => {
  const parsed = GenerateIdeasBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { niche, platform, tone, count = 8 } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are a viral content intelligence system trained on the DNA of every breakout creator in the past 5 years. You understand that great content ideas sit at the intersection of: (1) what audiences desperately want but nobody is saying, (2) what's trending but not yet oversaturated, and (3) what uniquely positions the creator's perspective. You think in terms of shareability, identity resonance, emotional charge, and narrative potential. You never suggest generic "how-to" or "top 10" ideas. Every idea you generate has a specific, fresh angle that makes it stand out in a saturated niche.`
        },
        {
          role: "user",
          content: `Generate ${count} standout content ideas for a ${platform} creator in the ${niche} niche.\nTone: ${tone || "authentic and engaging"}\n\nFor each idea, provide:\n- title: A specific, compelling title (not a template — a real, publishable title)\n- description: 2 punchy sentences describing the angle and why it works\n- viralPotential: "high", "medium", or "low" with honest reasoning built into the description\n- tags: 3-5 specific, relevant tags (not generic ones like "content" or "tips")\n\nIdea variety: Mix different formats (personal story, data-driven, contrarian take, deep-dive, challenge, case study, reaction, prediction). Never repeat the same format twice.\n\nReturn ONLY valid JSON: {"ideas": [{"title":"","description":"","viralPotential":"high|medium|low","tags":["tag1"]}]}`
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let ideas: unknown[] = [];
    try { ideas = JSON.parse(content).ideas ?? []; } catch { ideas = []; }
    res.json({ ideas, creditsUsed: 10 });
  } catch (err) {
    req.log.error({ err }, "Error generating ideas");
    res.status(500).json({ error: "Failed to generate ideas. Please try again." });
  }
});

// ── Workflow ──────────────────────────────────────────────────
router.post("/ai/generate-workflow", aiGenerationLimiter, async (req, res) => {
  const parsed = GenerateWorkflowBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { topic, niche, platform, tone, duration = "medium" } = parsed.data;

  const durationMap: Record<string, string> = { short: "15-30 seconds", medium: "60-90 seconds", long: "5-10 minutes" };

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a complete AI content production system — combining the strategic mind of a top content agency, the hook-writing instincts of a viral creator, the narrative craft of a screenwriter, and the distribution intelligence of a platform algorithm expert. You produce fully integrated, publish-ready content packages where every element is coherent, intentional, and strategically connected. The idea informs the hook. The hook informs the title. The title informs the script. The script informs the caption. Everything works as one unified piece of content, not loosely connected outputs. Platform: ${platform}.`
        },
        {
          role: "user",
          content: `Generate a complete, publish-ready content package for:\nTopic: ${topic}\nNiche: ${niche || "general"}\nPlatform: ${platform}\nTone: ${tone || "authentic and engaging"}\nTarget duration: ${durationMap[duration]}\n\nDeliver each element at elite quality:\n- idea: The refined, specific angle (not the raw topic — the exact content angle that makes this piece unique)\n- hook: First 1-2 sentences — immediate psychological grip, no intro\n- title: Platform-optimized, curiosity-driving, specific\n- script: Full spoken script with pacing markers, pattern interrupts, and emotional beats — sounds human, not AI\n- cta: One clear, compelling call to action that feels earned by the content\n- caption: Platform-native caption with storytelling hook, value delivery, and CTA — formatted correctly for ${platform}\n- hashtags: Array of 12-15 strategically mixed hashtags (broad reach + niche authority + trending)\n\nAll elements must be internally consistent — the same specific angle, the same tone, the same story.\n\nReturn ONLY valid JSON: {"idea":"","hook":"","title":"","script":"","cta":"","caption":"","hashtags":["#tag1"]}`
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result = { idea: "", hook: "", title: "", script: "", cta: "", caption: "", hashtags: [] as string[] };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.script = content; }
    res.json({ ...result, creditsUsed: 40 });
  } catch (err) {
    req.log.error({ err }, "Error generating workflow");
    res.status(500).json({ error: "Failed to generate workflow. Please try again." });
  }
});

// ── Captions ──────────────────────────────────────────────────
router.post("/ai/generate-captions", aiGenerationLimiter, async (req, res) => {
  const { topic, platform = "instagram", tone = "engaging", niche, count = 4 } = req.body as {
    topic: string; platform?: string; tone?: string; niche?: string; count?: number;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: `You are an elite social media copywriter who has driven millions in engagement across ${platform}. You write captions that stop the scroll with the first line, hold attention through authentic storytelling or sharp insight, and close with a CTA that feels like a natural invitation — not a demand. You understand that the best captions on ${platform} feel like they came from a real person having a real conversation, not a content marketer filling a template. You never open with an emoji. You never use hollow phrases like "So excited to share" or "Check this out". Every caption you write has a distinct voice and angle.` },
        { role: "user", content: `Write ${count} high-performing ${platform} captions for content about:\nTopic: ${topic}\nNiche: ${niche || "general"}\nTone: ${tone}\n\nEach caption must:\n- Open with a line that earns the "more" tap — a story fragment, a bold claim, a relatable frustration, or a surprising insight\n- Deliver genuine value or emotional resonance in the body\n- Close with a CTA that matches the platform's culture (conversational question for engagement, soft directive for saves, direct ask for shares)\n- Be formatted correctly for ${platform} (line breaks, length, structure)\n- Have a completely different approach and opening style from the others\n\nReturn ONLY valid JSON: {"captions": ["caption1", "caption2", ...]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let captions: string[] = [];
    try { captions = JSON.parse(content).captions ?? []; } catch { captions = [content]; }
    res.json({ captions, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating captions");
    res.status(500).json({ error: "Failed to generate captions" });
  }
});

// ── Hashtags ──────────────────────────────────────────────────
router.post("/ai/generate-hashtags", aiGenerationLimiter, async (req, res) => {
  const { topic, platform = "instagram", niche, count = 30 } = req.body as {
    topic: string; platform?: string; niche?: string; count?: number;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: `You are a social media growth expert specializing in hashtag strategy for ${platform}. You understand algorithm optimization, discoverability, and the balance between broad and niche hashtags.` },
        { role: "user", content: `Generate an optimized hashtag strategy for ${platform} content about:\nTopic: ${topic}\nNiche: ${niche || "general"}\n\nProvide ${count} hashtags organized by tier:\n- 10 mega hashtags (10M+ posts) for broad reach\n- 10 mid-tier hashtags (100K-5M posts) for targeted reach\n- 10 niche hashtags (<100K posts) for highly engaged audiences\n\nReturn ONLY JSON: {"hashtags": {"mega": ["#tag"], "midTier": ["#tag"], "niche": ["#tag"]}, "topPicks": ["#tag1","#tag2","#tag3","#tag4","#tag5"]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: { hashtags: Record<string, string[]>; topPicks: string[] } = { hashtags: { mega: [], midTier: [], niche: [] }, topPicks: [] };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.topPicks = []; }
    res.json({ ...result, creditsUsed: 3 });
  } catch (err) {
    req.log.error({ err }, "Error generating hashtags");
    res.status(500).json({ error: "Failed to generate hashtags" });
  }
});

// ── Thumbnail Prompt ──────────────────────────────────────────
router.post("/ai/generate-thumbnail", aiGenerationLimiter, async (req, res) => {
  const { topic, platform = "youtube", style = "bold", niche } = req.body as {
    topic: string; platform?: string; style?: string; niche?: string;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: `You are a thumbnail design expert who understands visual psychology, color theory, and what makes thumbnails get clicked on ${platform}. You write detailed visual prompts.` },
        { role: "user", content: `Generate 3 thumbnail concepts for a ${platform} video about:\nTopic: ${topic}\nNiche: ${niche || "general"}\nStyle: ${style}\n\nFor each concept provide:\n- Concept title\n- Visual description (what's in the thumbnail)\n- Color palette (3-4 specific colors with hex codes)\n- Text overlay suggestions\n- Psychological hook (why it gets clicked)\n- A detailed AI image generation prompt for Midjourney/DALL-E\n\nReturn ONLY JSON: {"concepts": [{"title":"","visual":"","colors":["#hex"],"textOverlay":"","psychologicalHook":"","imagePrompt":""}]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let concepts: unknown[] = [];
    try { concepts = JSON.parse(content).concepts ?? []; } catch { concepts = []; }
    res.json({ concepts, creditsUsed: 8 });
  } catch (err) {
    req.log.error({ err }, "Error generating thumbnail");
    res.status(500).json({ error: "Failed to generate thumbnail concepts" });
  }
});

// ── Content Repurposer ────────────────────────────────────────
router.post("/ai/repurpose-content", aiGenerationLimiter, async (req, res) => {
  const { content: inputContent, sourceFormat = "youtube", targetPlatforms = ["twitter", "instagram", "linkedin"], topic } = req.body as {
    content: string; sourceFormat?: string; targetPlatforms?: string[]; topic?: string;
  };
  if (!inputContent) { res.status(400).json({ error: "content required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: `You are a content repurposing expert who transforms long-form content into perfectly formatted, platform-native pieces for each social media platform. You maintain the core message while adapting tone, format, and structure.` },
        { role: "user", content: `Repurpose this ${sourceFormat} content for: ${targetPlatforms.join(", ")}.\n\nOriginal content:\n${inputContent.slice(0, 3000)}\n${topic ? `Topic: ${topic}` : ""}\n\nFor each target platform, create a perfectly formatted, platform-native piece of content. Consider character limits, formatting conventions, and platform culture.\n\nReturn ONLY JSON: {"repurposed": [{"platform": "twitter", "content": "...", "notes": "key adaptations made"}, ...]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let repurposed: unknown[] = [];
    try { repurposed = JSON.parse(content).repurposed ?? []; } catch { repurposed = []; }
    res.json({ repurposed, creditsUsed: 15 });
  } catch (err) {
    req.log.error({ err }, "Error repurposing content");
    res.status(500).json({ error: "Failed to repurpose content" });
  }
});

// ── YouTube Description ───────────────────────────────────────
router.post("/ai/generate-description", aiGenerationLimiter, async (req, res) => {
  const { title, topic, niche, keywords, tone = "professional" } = req.body as {
    title: string; topic?: string; niche?: string; keywords?: string; tone?: string;
  };
  if (!title) { res.status(400).json({ error: "title required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: `You are a YouTube SEO specialist who writes descriptions that rank in search, drive subscriptions, and convert viewers. You understand YouTube's algorithm, keyword optimization, and viewer psychology.` },
        { role: "user", content: `Write a complete YouTube description for:\nTitle: ${title}\nTopic: ${topic || title}\nNiche: ${niche || "general"}\nKeywords: ${keywords || "auto-generate relevant keywords"}\nTone: ${tone}\n\nDescription structure:\n1. Hook paragraph (first 2-3 lines shown before "Show More")\n2. Video summary (2-3 paragraphs)\n3. Key timestamps placeholder\n4. Resources/links section\n5. Subscribe CTA\n6. Relevant keywords section (for algorithm)\n\nReturn ONLY JSON: {"description": "full description text", "keywords": ["keyword1", "keyword2", ...], "firstLine": "the hook line used"}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: { description: string; keywords: string[]; firstLine: string } = { description: "", keywords: [], firstLine: "" };
    try { result = { ...result, ...JSON.parse(content) }; } catch { result.description = content; }
    res.json({ ...result, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating description");
    res.status(500).json({ error: "Failed to generate description" });
  }
});

// ── Ad Copy ───────────────────────────────────────────────────
router.post("/ai/generate-adcopy", aiGenerationLimiter, async (req, res) => {
  const { product, audience, platform = "facebook", goal = "conversions", tone = "persuasive", count = 3 } = req.body as {
    product: string; audience?: string; platform?: string; goal?: string; tone?: string; count?: number;
  };
  if (!product) { res.status(400).json({ error: "product required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: `You are a world-class direct response copywriter specializing in ${platform} ads. You write copy that stops the scroll, creates desire, and drives action using proven psychological frameworks.` },
        { role: "user", content: `Write ${count} high-converting ${platform} ad copies for:\nProduct/Content: ${product}\nTarget Audience: ${audience || "creators and entrepreneurs"}\nGoal: ${goal}\nTone: ${tone}\n\nFor each ad copy provide:\n- Primary text (the main ad body)\n- Headline (short, punchy)\n- CTA text\n- Framework used (AIDA, PAS, etc.)\n\nReturn ONLY JSON: {"ads": [{"primaryText":"","headline":"","cta":"","framework":""}]}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let ads: unknown[] = [];
    try { ads = JSON.parse(content).ads ?? []; } catch { ads = []; }
    res.json({ ads, creditsUsed: 8 });
  } catch (err) {
    req.log.error({ err }, "Error generating ad copy");
    res.status(500).json({ error: "Failed to generate ad copy" });
  }
});

// ── Brand Voice ───────────────────────────────────────────────
router.post("/ai/generate-brand-voice", aiGenerationLimiter, async (req, res) => {
  const { description, examples, niche, audience } = req.body as {
    description: string; examples?: string; niche?: string; audience?: string;
  };
  if (!description) { res.status(400).json({ error: "description required" }); return; }

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: `You are a brand strategist who helps creators define and systematize their unique voice so AI can consistently replicate their style across all content.` },
        { role: "user", content: `Analyze this creator's brand description and create a comprehensive brand voice guide:\n\nCreator Description: ${description}\nContent Examples: ${examples || "not provided"}\nNiche: ${niche || "general"}\nTarget Audience: ${audience || "general"}\n\nCreate:\n1. Core voice characteristics (5-7 adjectives with explanations)\n2. Tone modifiers by context (casual vs professional content)\n3. Vocabulary style (words to use and avoid)\n4. Structural patterns (how they structure content)\n5. A sample paragraph demonstrating the voice\n6. A "voice prompt" for AI generation\n\nReturn ONLY JSON: {"characteristics":["adj: explanation"],"toneModifiers":{"casual":"","professional":""},"vocabulary":{"use":["word"],"avoid":["word"]},"patterns":"","sample":"","voicePrompt":""}` },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let result: Record<string, unknown> = {};
    try { result = JSON.parse(content); } catch { result = { voicePrompt: content }; }
    res.json({ ...result, creditsUsed: 10 });
  } catch (err) {
    req.log.error({ err }, "Error generating brand voice");
    res.status(500).json({ error: "Failed to generate brand voice" });
  }
});

// ── Captions ─────────────────────────────────────────────────
router.post("/ai/generate-captions", aiGenerationLimiter, async (req, res) => {
  const { topic, niche, platform = "instagram", tone = "engaging", count = 4 } = req.body as {
    topic: string; niche?: string; platform?: string; tone?: string; count?: number;
  };
  if (!topic) { res.status(400).json({ error: "topic required" }); return; }

  const platformGuide: Record<string, string> = {
    instagram: "Instagram (conversational, emoji-friendly, ends with CTA, 3-5 hashtags inline, 150-220 words ideal)",
    tiktok: "TikTok (ultra short, punchy, drives comments and duets, max 150 chars for hook, trend-aware)",
    youtube: "YouTube Community post (informative but casual, drives likes and comments, can include links)",
    linkedin: "LinkedIn (professional insight, thought leadership, no hashtag spam, ends with a question or CTA)",
    twitter: "Twitter/X (under 280 chars, punchy, shareable, either a hot take or clear value statement)",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `You are an elite social media caption writer who has studied every viral caption on ${platform}. You write captions that drive engagement, shares, saves, and comments — not just impressions. Platform guide: ${platformGuide[platform] ?? platform}. Your captions feel human, not AI-generated. They match the creator's authentic voice.`,
        },
        {
          role: "user",
          content: `Write ${count} high-performing ${platform} captions for content about:\nTopic: ${topic}\nNiche: ${niche || "general"}\nTone: ${tone}\n\nEach caption must:\n- Start with a hook that stops the scroll (not a question opener)\n- Deliver value or emotion in the body\n- End with a clear CTA that feels natural\n- Feel completely different from the others in structure and emotion\n- Match the platform's culture exactly\n\nReturn ONLY valid JSON: {"captions": ["caption1", "caption2", ...]}`,
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    let captions: string[] = [];
    try { captions = JSON.parse(content).captions ?? []; } catch { captions = content.split("\n\n").filter((l) => l.trim()).slice(0, count); }
    res.json({ captions, creditsUsed: 5 });
  } catch (err) {
    req.log.error({ err }, "Error generating captions");
    res.status(500).json({ error: "Failed to generate captions. Please try again." });
  }
});

export default router;
