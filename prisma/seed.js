// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Loopwise database seed...");

  // 1. SPECIALIZATIONS (8 Core Domains)
  const specializationsData = [
    {
      name: "Enterprise Workflow Automation",
      slug: "enterprise-workflow-automation",
      description:
        "Mapping legacy ERP, CRM, and internal workflows to autonomous AI multi-agent pipelines.",
      icon: "GitBranch",
    },
    {
      name: "Autonomous Agent Architecture",
      slug: "autonomous-agent-architecture",
      description:
        "Designing resilient stateful agents using LangGraph, CrewAI, AutoGen, and custom runtime harnesses.",
      icon: "Bot",
    },
    {
      name: "AI Governance & Guardrails",
      slug: "ai-governance-guardrails",
      description:
        "Implementing red-teaming, PII masking, deterministic output verification, and SOC2/HIPAA compliance.",
      icon: "ShieldCheck",
    },
    {
      name: "Agentic RPA & Legacy Integration",
      slug: "agentic-rpa-legacy-integration",
      description:
        "Bridging modern LLM agents with SAP, Salesforce, Citrix, and mainframe terminal systems.",
      icon: "Cpu",
    },
    {
      name: "Multi-Agent System Orchestration",
      slug: "multi-agent-orchestration",
      description:
        "Coordinating hierarchical and consensus-based swarms of specialized domain agents.",
      icon: "Layers",
    },
    {
      name: "AI Ops, Telemetry & Observability",
      slug: "ai-ops-telemetry",
      description:
        "Tracing latency, cost, token consumption, drift, and incident alerting via OpenTelemetry & LangSmith.",
      icon: "Activity",
    },
    {
      name: "LLM Fine-tuning & Distillation",
      slug: "llm-finetuning-distillation",
      description:
        "Domain adaptation of open weights models (Llama 3, Mistral, Qwen) for air-gapped enterprise deployment.",
      icon: "Sparkles",
    },
    {
      name: "Domain-Specific Agent Workflows",
      slug: "domain-agent-workflows",
      description:
        "Verticalized automation for clinical trials, fintech AML, legal discovery, and supply chain logistics.",
      icon: "Workflow",
    },
  ];

  const specializations = {};
  for (const s of specializationsData) {
    const record = await prisma.specialization.upsert({
      where: { slug: s.slug },
      update: { name: s.name, description: s.description, icon: s.icon },
      create: s,
    });
    specializations[s.slug] = record;
  }
  console.log(
    `✅ Seeded ${Object.keys(specializations).length} specializations`
  );

  // 2. SKILLS TAXONOMY (60+ Skills across PLATFORM, MODEL, FRAMEWORK, DOMAIN, COMPLIANCE)
  const skillsData = [
    // PLATFORM
    { name: "LangSmith", slug: "langsmith", category: "PLATFORM" },
    { name: "Langfuse", slug: "langfuse", category: "PLATFORM" },
    { name: "Arize Phoenix", slug: "arize-phoenix", category: "PLATFORM" },
    { name: "Weights & Biases", slug: "wandb", category: "PLATFORM" },
    { name: "vLLM", slug: "vllm", category: "PLATFORM" },
    { name: "Ollama", slug: "ollama", category: "PLATFORM" },
    { name: "Together AI", slug: "together-ai", category: "PLATFORM" },
    { name: "Groq Cloud", slug: "groq-cloud", category: "PLATFORM" },
    { name: "AWS Bedrock", slug: "aws-bedrock", category: "PLATFORM" },
    {
      name: "Azure OpenAI Service",
      slug: "azure-openai",
      category: "PLATFORM",
    },
    {
      name: "Google Vertex AI",
      slug: "google-vertex-ai",
      category: "PLATFORM",
    },
    { name: "Pinecone", slug: "pinecone", category: "PLATFORM" },
    { name: "Qdrant", slug: "qdrant", category: "PLATFORM" },
    { name: "Weaviate", slug: "weaviate", category: "PLATFORM" },
    { name: "ChromaDB", slug: "chromadb", category: "PLATFORM" },

    // FRAMEWORK
    { name: "LangGraph", slug: "langgraph", category: "FRAMEWORK" },
    { name: "CrewAI", slug: "crewai", category: "FRAMEWORK" },
    { name: "AutoGen", slug: "autogen", category: "FRAMEWORK" },
    { name: "LlamaIndex", slug: "llamaindex", category: "FRAMEWORK" },
    { name: "DSPy", slug: "dspy", category: "FRAMEWORK" },
    { name: "Semantic Kernel", slug: "semantic-kernel", category: "FRAMEWORK" },
    { name: "Haystack", slug: "haystack", category: "FRAMEWORK" },
    { name: "Instructor", slug: "instructor", category: "FRAMEWORK" },
    { name: "Outlines", slug: "outlines", category: "FRAMEWORK" },
    { name: "n8n AI Workflows", slug: "n8n-ai", category: "FRAMEWORK" },
    { name: "Temporal.io Workflows", slug: "temporal", category: "FRAMEWORK" },
    { name: "BAML", slug: "baml", category: "FRAMEWORK" },

    // MODEL
    { name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet", category: "MODEL" },
    { name: "Claude 3.7 Sonnet", slug: "claude-3-7-sonnet", category: "MODEL" },
    { name: "GPT-4o", slug: "gpt-4o", category: "MODEL" },
    { name: "GPT-4o mini", slug: "gpt-4o-mini", category: "MODEL" },
    { name: "o1 / o3-mini", slug: "openai-o1-o3", category: "MODEL" },
    { name: "Llama 3.3 70B", slug: "llama-3-3-70b", category: "MODEL" },
    { name: "Llama 3.1 405B", slug: "llama-3-1-405b", category: "MODEL" },
    { name: "DeepSeek R1", slug: "deepseek-r1", category: "MODEL" },
    { name: "DeepSeek V3", slug: "deepseek-v3", category: "MODEL" },
    { name: "Mistral Large 2", slug: "mistral-large-2", category: "MODEL" },
    { name: "Qwen 2.5 72B", slug: "qwen-2-5-72b", category: "MODEL" },
    { name: "Gemini 2.0 Flash", slug: "gemini-2-0-flash", category: "MODEL" },
    { name: "Gemini 1.5 Pro", slug: "gemini-1-5-pro", category: "MODEL" },

    // DOMAIN
    {
      name: "Financial Auditing & AML",
      slug: "financial-aml",
      category: "DOMAIN",
    },
    {
      name: "Healthcare & HIPAA EHR",
      slug: "healthcare-hipaa",
      category: "DOMAIN",
    },
    {
      name: "Legal Document Discovery",
      slug: "legal-discovery",
      category: "DOMAIN",
    },
    {
      name: "Supply Chain & Logistics",
      slug: "supply-chain",
      category: "DOMAIN",
    },
    {
      name: "SaaS Customer Operations",
      slug: "saas-support",
      category: "DOMAIN",
    },
    {
      name: "DevOps & SRE Autonomous Healing",
      slug: "devops-healing",
      category: "DOMAIN",
    },
    {
      name: "Cybersecurity Threat Triage",
      slug: "secops-triage",
      category: "DOMAIN",
    },
    {
      name: "Sales Outreach & Enrichment",
      slug: "sales-enrichment",
      category: "DOMAIN",
    },

    // COMPLIANCE
    { name: "Guardrails AI", slug: "guardrails-ai", category: "COMPLIANCE" },
    {
      name: "NeMo Guardrails",
      slug: "nemo-guardrails",
      category: "COMPLIANCE",
    },
    { name: "Llama Guard 3", slug: "llama-guard-3", category: "COMPLIANCE" },
    {
      name: "SOC 2 Type II Compliance",
      slug: "soc2-type2",
      category: "COMPLIANCE",
    },
    { name: "EU AI Act Governance", slug: "eu-ai-act", category: "COMPLIANCE" },
    {
      name: "ISO 42001 AI Standard",
      slug: "iso-42001",
      category: "COMPLIANCE",
    },
    {
      name: "PII Anonymization",
      slug: "pii-anonymization",
      category: "COMPLIANCE",
    },
    {
      name: "Model Red-Teaming",
      slug: "model-red-teaming",
      category: "COMPLIANCE",
    },
  ];

  const skills = {};
  for (const sk of skillsData) {
    const record = await prisma.skill.upsert({
      where: { slug: sk.slug },
      update: { name: sk.name, category: sk.category },
      create: sk,
    });
    skills[sk.slug] = record;
  }
  console.log(`✅ Seeded ${Object.keys(skills).length} skills`);

  // 3. DEMO ADMIN USER
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@loopwise.internal" },
    update: { name: "Loopwise Admin", role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Loopwise Admin",
      email: "admin@loopwise.internal",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  await prisma.notificationPreference.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id },
  });
  console.log(`✅ Seeded Admin: ${adminUser.email}`);

  // 4. CLIENT ORGANIZATIONS & USERS
  const client1User = await prisma.user.upsert({
    where: { email: "alex.carter@enterprise.ai" },
    update: { name: "Alex Carter", role: "CLIENT", status: "ACTIVE" },
    create: {
      name: "Alex Carter",
      email: "alex.carter@enterprise.ai",
      role: "CLIENT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  await prisma.notificationPreference.upsert({
    where: { userId: client1User.id },
    update: {},
    create: { userId: client1User.id },
  });

  const org1 = await prisma.organization.upsert({
    where: { slug: "acme-enterprise" },
    update: { name: "Acme Enterprise", industry: "Fintech", size: "1000-5000" },
    create: {
      name: "Acme Enterprise",
      slug: "acme-enterprise",
      industry: "Fintech",
      size: "1000-5000",
      website: "https://acme-enterprise.ai",
    },
  });

  await prisma.orgMember.upsert({
    where: {
      id: `${org1.id}-${client1User.id}`,
    },
    update: { role: "OWNER" },
    create: {
      id: `${org1.id}-${client1User.id}`,
      organizationId: org1.id,
      userId: client1User.id,
      role: "OWNER",
    },
  });

  const client2User = await prisma.user.upsert({
    where: { email: "sarah.lin@apexhealth.io" },
    update: { name: "Dr. Sarah Lin", role: "CLIENT", status: "ACTIVE" },
    create: {
      name: "Dr. Sarah Lin",
      email: "sarah.lin@apexhealth.io",
      role: "CLIENT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  await prisma.notificationPreference.upsert({
    where: { userId: client2User.id },
    update: {},
    create: { userId: client2User.id },
  });

  const org2 = await prisma.organization.upsert({
    where: { slug: "apex-health-ai" },
    update: {
      name: "Apex Health AI",
      industry: "Healthcare",
      size: "250-1000",
    },
    create: {
      name: "Apex Health AI",
      slug: "apex-health-ai",
      industry: "Healthcare",
      size: "250-1000",
      website: "https://apexhealth.io",
    },
  });

  await prisma.orgMember.upsert({
    where: {
      id: `${org2.id}-${client2User.id}`,
    },
    update: { role: "OWNER" },
    create: {
      id: `${org2.id}-${client2User.id}`,
      organizationId: org2.id,
      userId: client2User.id,
      role: "OWNER",
    },
  });

  console.log(`✅ Seeded 2 Client Organizations (${org1.name}, ${org2.name})`);

  // 5. 12 STRATEGISTS (Vetted Heads of AI)
  const strategistsData = [
    {
      name: "Elena Rostova",
      email: "elena.rostova@autonomous.ai",
      headline:
        "Fractional Head of AI • LangGraph & Enterprise Agentic Workflows",
      bio: "Former Principal Architect at Scale AI. Led enterprise automation for Fortune 100 banks, deploying multi-agent triage swarms reducing manual document processing time by 82%.",
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
      yearsExperience: 11,
      hourlyRateMin: 220,
      hourlyRateMax: 290,
      retainerMin: 12000,
      retainerMax: 24000,
      availabilityHoursPerWeek: 20,
      ratingAvg: 4.96,
      ratingCount: 24,
      specializations: [
        "enterprise-workflow-automation",
        "autonomous-agent-architecture",
      ],
      skills: [
        "langgraph",
        "crewai",
        "claude-3-7-sonnet",
        "guardrails-ai",
        "financial-aml",
      ],
      caseStudy: {
        title: "Automated Commercial Loan Underwriting with LangGraph Swarms",
        clientIndustry: "Regional Banking",
        problem:
          "Loan underwriting packets required 4.5 hours of manual cross-referencing between tax returns, bank statements, and SEC filings.",
        solution:
          "Built a 4-agent LangGraph pipeline with strict guardrails verifying PII, running ratio calculations, and generating draft credit memos.",
        metricsAchieved:
          "84% reduction in underwriting turnaround; zero hallucination incidents across 12,000 processed packets.",
        outcome:
          "Adopted as core banking operating system across 45 regional branches.",
      },
    },
    {
      name: "Marcus Chen",
      email: "marcus.chen@agenticlabs.io",
      headline: "VP AI Engineering • Agent Governance & Red Teaming",
      bio: "Ex-Google DeepMind research engineer. Specializes in building deterministic evaluation harnesses, PII leakage prevention, and model safety.",
      location: "New York, NY",
      timezone: "America/New_York",
      yearsExperience: 9,
      hourlyRateMin: 210,
      hourlyRateMax: 275,
      retainerMin: 11000,
      retainerMax: 20000,
      availabilityHoursPerWeek: 15,
      ratingAvg: 4.92,
      ratingCount: 19,
      specializations: ["ai-governance-guardrails", "ai-ops-telemetry"],
      skills: [
        "nemo-guardrails",
        "soc2-type2",
        "langsmith",
        "gpt-4o",
        "model-red-teaming",
      ],
      caseStudy: {
        title: "SOC 2 Type II AI Governance Implementation",
        clientIndustry: "Enterprise SaaS",
        problem:
          "Customer data could not be fed into LLM prompts without violating enterprise DPA terms.",
        solution:
          "Designed air-gapped anonymization proxies and deterministic output boundary validators.",
        metricsAchieved:
          "Achieved SOC 2 Type II certification in 90 days; unlocked $4.2M in blocked enterprise pipeline.",
        outcome: "Passed external audits with zero non-conformities.",
      },
    },
    {
      name: "Maya Patel",
      email: "maya.patel@flowai.tech",
      headline:
        "Fractional CAIO • Healthcare AI & Clinical Workflow Automation",
      bio: "Clinical AI pioneer. Consulted with leading health systems on deploying HIPAA-compliant clinical summary agents and prior authorization pipelines.",
      location: "Boston, MA",
      timezone: "America/New_York",
      yearsExperience: 13,
      hourlyRateMin: 240,
      hourlyRateMax: 320,
      retainerMin: 14000,
      retainerMax: 28000,
      availabilityHoursPerWeek: 15,
      ratingAvg: 4.98,
      ratingCount: 28,
      specializations: ["domain-agent-workflows", "ai-governance-guardrails"],
      skills: [
        "healthcare-hipaa",
        "claude-3-5-sonnet",
        "llamaindex",
        "qdrant",
        "pii-anonymization",
      ],
      caseStudy: {
        title: "Prior Authorization Automation for Oncology Network",
        clientIndustry: "Healthcare",
        problem:
          "Clinical staff spent 22 hours per week on manual prior authorization forms and payer guidelines.",
        solution:
          "Implemented an autonomous RAG agent extracting EHR criteria against payer policy databases.",
        metricsAchieved:
          "Reduced approval wait time from 11 days to 38 hours; $1.8M annual operational savings.",
        outcome: "Expanded to 8 regional hospitals.",
      },
    },
    {
      name: "David Kim",
      email: "david.kim@neuralops.ai",
      headline: "Staff AI Architect • Autonomous SRE & Self-Healing Cloud",
      bio: "Previously led Cloud AI Infrastructure at Datadog. Specializes in incident auto-triage and multi-modal observability.",
      location: "Seattle, WA",
      timezone: "America/Los_Angeles",
      yearsExperience: 10,
      hourlyRateMin: 195,
      hourlyRateMax: 260,
      retainerMin: 10000,
      retainerMax: 18000,
      availabilityHoursPerWeek: 20,
      ratingAvg: 4.88,
      ratingCount: 16,
      specializations: ["ai-ops-telemetry", "autonomous-agent-architecture"],
      skills: ["devops-healing", "langfuse", "deepseek-r1", "temporal", "vllm"],
      caseStudy: {
        title: "Autonomous Tier-1 Cloud Incident Resolver",
        clientIndustry: "Cloud Infrastructure",
        problem:
          "On-call engineers experienced severe alert fatigue from thousands of recurring microservice alerts.",
        solution:
          "Deployed an agentic incident swarm to ingest telemetry, isolate runbooks, and perform rollback actions.",
        metricsAchieved:
          "MTTR decreased from 42 mins to 3.8 mins for top 5 incident categories.",
        outcome: "On-call escalations dropped by 64%.",
      },
    },
    {
      name: "Sofia Rodriguez",
      email: "sofia.rodriguez@agentgovernance.io",
      headline: "Chief AI Strategist • EU AI Act & High-Risk AI Compliance",
      bio: "International AI policy advisor and systems engineer. Advises European financial firms on compliant algorithmic operations.",
      location: "London, UK",
      timezone: "Europe/London",
      yearsExperience: 12,
      hourlyRateMin: 225,
      hourlyRateMax: 295,
      retainerMin: 12500,
      retainerMax: 25000,
      availabilityHoursPerWeek: 15,
      ratingAvg: 4.95,
      ratingCount: 21,
      specializations: [
        "ai-governance-guardrails",
        "enterprise-workflow-automation",
      ],
      skills: [
        "eu-ai-act",
        "iso-42001",
        "guardrails-ai",
        "financial-aml",
        "gpt-4o",
      ],
      caseStudy: {
        title: "EU AI Act Compliance & Risk Classification Audit",
        clientIndustry: "Fintech",
        problem:
          "Client faced potential regulatory fines under EU AI Act for unmonitored credit scoring models.",
        solution:
          "Established automated logging, bias mitigation loops, and human-in-the-loop oversight gates.",
        metricsAchieved:
          "100% compliant documentation delivered ahead of deadline; zero audit warnings.",
        outcome: "Greenlit for full EU product launch.",
      },
    },
    {
      name: "Julian Thorne",
      email: "julian.thorne@enterprisegpt.co",
      headline:
        "Fractional Head of AI • Agentic RPA & Legacy SAP Modernization",
      bio: "15+ years in enterprise IT. Bridges legacy AS/400 and SAP R/3 systems with autonomous agent orchestrators.",
      location: "Chicago, IL",
      timezone: "America/Chicago",
      yearsExperience: 15,
      hourlyRateMin: 210,
      hourlyRateMax: 280,
      retainerMin: 11500,
      retainerMax: 22000,
      availabilityHoursPerWeek: 25,
      ratingAvg: 4.89,
      ratingCount: 22,
      specializations: [
        "agentic-rpa-legacy-integration",
        "enterprise-workflow-automation",
      ],
      skills: ["n8n-ai", "autogen", "gpt-4o", "supply-chain", "temporal"],
      caseStudy: {
        title: "Autonomous Purchase Order Reconciliation in SAP",
        clientIndustry: "Manufacturing",
        problem:
          "Mismatch between paper vendor bills and electronic SAP orders created a 3-week payment lag.",
        solution:
          "Built visual parser agents and autonomous RPA executors resolving 3-way discrepancies.",
        metricsAchieved:
          "94% autonomous resolution rate; DSO reduced by 14 days.",
        outcome: "$3.4M cash flow acceleration.",
      },
    },
    {
      name: "Amara Okafor",
      email: "amara.okafor@automa.ai",
      headline:
        "Fractional AI Officer • Sales Operations & Automated Pipeline Intelligence",
      bio: "Former VP Growth at high-scale B2B SaaS. Designs agentic inbound qualification and prospect research machines.",
      location: "Austin, TX",
      timezone: "America/Chicago",
      yearsExperience: 8,
      hourlyRateMin: 185,
      hourlyRateMax: 240,
      retainerMin: 9500,
      retainerMax: 18000,
      availabilityHoursPerWeek: 20,
      ratingAvg: 4.91,
      ratingCount: 15,
      specializations: ["domain-agent-workflows", "multi-agent-orchestration"],
      skills: [
        "sales-enrichment",
        "crewai",
        "claude-3-5-sonnet",
        "pinecone",
        "instructor",
      ],
      caseStudy: {
        title: "Autonomous Prospect Dossier & Meeting Prep Swarm",
        clientIndustry: "B2B SaaS",
        problem:
          "AEs spent 45 minutes researching each enterprise account before disco calls.",
        solution:
          "Orchestrated agents scanning 10-K filings, news, and tech stacks into a 2-page brief.",
        metricsAchieved:
          "AE prep time dropped to 3 minutes; disco-to-demo conversion increased 31%.",
        outcome: "Adopted by 80-person global sales team.",
      },
    },
    {
      name: "Liam O'Connor",
      email: "liam.oconnor@langsystems.dev",
      headline:
        "Principal Agent Architect • Stateful Multi-Agent Swarms & DSPy",
      bio: "DSPy core contributor and compiler optimization researcher. Builds deterministic, self-optimizing agent graphs.",
      location: "Dublin, Ireland",
      timezone: "Europe/Dublin",
      yearsExperience: 9,
      hourlyRateMin: 200,
      hourlyRateMax: 270,
      retainerMin: 10500,
      retainerMax: 21000,
      availabilityHoursPerWeek: 20,
      ratingAvg: 4.94,
      ratingCount: 18,
      specializations: [
        "autonomous-agent-architecture",
        "multi-agent-orchestration",
      ],
      skills: ["dspy", "langgraph", "deepseek-r1", "weaviate", "outlines"],
      caseStudy: {
        title: "Self-Optimizing Customer Support Swarm with DSPy",
        clientIndustry: "Fintech",
        problem:
          "Customer support prompts suffered from prompt drift and unpredictable tone shifts.",
        solution:
          "Replaced hand-crafted prompts with DSPy teleprompter compiled against 5,000 benchmark tickets.",
        metricsAchieved:
          "Accuracy increased from 78% to 96.4%; token spend dropped 44%.",
        outcome: "CSAT score reached all-time high of 4.8/5.0.",
      },
    },
    {
      name: "Chloe Dubois",
      email: "chloe.dubois@synthwave.ai",
      headline:
        "AI Distillation & Edge Specialist • Self-Hosted Llama 3 Infrastructure",
      bio: "Hardware-aware machine learning engineer. Deploys low-latency, private LLM agents in regulated environments.",
      location: "Paris, France",
      timezone: "Europe/Paris",
      yearsExperience: 11,
      hourlyRateMin: 215,
      hourlyRateMax: 285,
      retainerMin: 11000,
      retainerMax: 22500,
      availabilityHoursPerWeek: 15,
      ratingAvg: 4.93,
      ratingCount: 14,
      specializations: ["llm-finetuning-distillation", "ai-ops-telemetry"],
      skills: [
        "vllm",
        "llama-3-3-70b",
        "groq-cloud",
        "mistral-large-2",
        "together-ai",
      ],
      caseStudy: {
        title: "On-Premises LLM Deployment for Defense Contractor",
        clientIndustry: "Aerospace & Defense",
        problem:
          "Air-gapped facility needed technical document summarization without internet access.",
        solution:
          "Fine-tuned and quantised Llama 3 70B on 4x H100 servers running vLLM.",
        metricsAchieved:
          "18ms time-to-first-token; 100% data sovereign on-premise execution.",
        outcome: "Passed DoD accreditation for classified usage.",
      },
    },
    {
      name: "Kenji Sato",
      email: "kenji.sato@omniagents.jp",
      headline:
        "Fractional Head of AI • Supply Chain & Logistics Autonomous Dispatch",
      bio: "Former logistics robotics engineer. Deploys predictive routing and inventory reconciliation agents.",
      location: "Tokyo, Japan",
      timezone: "Asia/Tokyo",
      yearsExperience: 14,
      hourlyRateMin: 220,
      hourlyRateMax: 290,
      retainerMin: 12000,
      retainerMax: 23000,
      availabilityHoursPerWeek: 20,
      ratingAvg: 4.97,
      ratingCount: 20,
      specializations: [
        "domain-agent-workflows",
        "enterprise-workflow-automation",
      ],
      skills: [
        "supply-chain",
        "autogen",
        "claude-3-5-sonnet",
        "qdrant",
        "baml",
      ],
      caseStudy: {
        title: "Autonomous Freight Exception Handling",
        clientIndustry: "Logistics",
        problem:
          "Customs and weather exceptions caused 48-hour container port delays.",
        solution:
          "Agentic dispatcher autonomously contacted drayage carriers and rerouted freight.",
        metricsAchieved:
          "Exception turnaround reduced by 72%; demurrage penalties decreased $840k.",
        outcome: "Adopted across 12 maritime ports.",
      },
    },
    {
      name: "Priya Sharma",
      email: "priya.sharma@deepscale.tech",
      headline:
        "AI Strategy Director • Financial Crime, Fraud & AML Agent Architecture",
      bio: "12 years in algorithmic trading and anti-fraud engineering at top Tier-1 investment banks.",
      location: "Singapore",
      timezone: "Asia/Singapore",
      yearsExperience: 12,
      hourlyRateMin: 230,
      hourlyRateMax: 300,
      retainerMin: 13000,
      retainerMax: 26000,
      availabilityHoursPerWeek: 15,
      ratingAvg: 4.96,
      ratingCount: 23,
      specializations: ["domain-agent-workflows", "ai-governance-guardrails"],
      skills: [
        "financial-aml",
        "gpt-4o",
        "langsmith",
        "guardrails-ai",
        "secops-triage",
      ],
      caseStudy: {
        title: "Real-Time Transaction Fraud Investigation Swarm",
        clientIndustry: "Fintech",
        problem:
          "Fraud analysts had a 4-day backlog reviewing suspicious activity reports (SARs).",
        solution:
          "Created parallel investigator agents pulling card telemetry and building SAR drafts.",
        metricsAchieved:
          "Backlog cleared; investigator throughput multiplied 4.2x with higher precision.",
        outcome: "Prevented $6.8M in synthetic identity fraud.",
      },
    },
    {
      name: "Tariq Al-Mansoor",
      email: "tariq.almansoor@cognitivelogic.io",
      headline:
        "Fractional CAIO • Legal Tech, Due Diligence & M&A Discovery Agents",
      bio: "Dual background in corporate law and computer science. Automates large-scale due diligence dataroom audits.",
      location: "Dubai, UAE",
      timezone: "Asia/Dubai",
      yearsExperience: 13,
      hourlyRateMin: 250,
      hourlyRateMax: 340,
      retainerMin: 15000,
      retainerMax: 30000,
      availabilityHoursPerWeek: 15,
      ratingAvg: 4.98,
      ratingCount: 26,
      specializations: [
        "domain-agent-workflows",
        "enterprise-workflow-automation",
      ],
      skills: [
        "legal-discovery",
        "claude-3-7-sonnet",
        "llamaindex",
        "chromadb",
        "pii-anonymization",
      ],
      caseStudy: {
        title: "$2.4B Cross-Border M&A Contract Due Diligence",
        clientIndustry: "Private Equity",
        problem:
          "Legal team needed to audit 48,000 supplier contracts for change-of-control clauses in 10 days.",
        solution:
          "Deployed hierarchical contract discovery agents extracting exact paragraph citations.",
        metricsAchieved:
          "Completed audit in 6 days; identified 14 non-standard indemnity liabilities.",
        outcome: "Saved client $18M in renegotiated transaction pricing.",
      },
    },
  ];

  for (const s of strategistsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, role: "STRATEGIST", status: "ACTIVE" },
      create: {
        name: s.name,
        email: s.email,
        role: "STRATEGIST",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const profile = await prisma.strategistProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: s.headline,
        bio: s.bio,
        location: s.location,
        timezone: s.timezone,
        yearsExperience: s.yearsExperience,
        hourlyRateMin: s.hourlyRateMin,
        hourlyRateMax: s.hourlyRateMax,
        retainerMin: s.retainerMin,
        retainerMax: s.retainerMax,
        availabilityHoursPerWeek: s.availabilityHoursPerWeek,
        status: "APPROVED",
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        verifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        headline: s.headline,
        bio: s.bio,
        location: s.location,
        timezone: s.timezone,
        yearsExperience: s.yearsExperience,
        hourlyRateMin: s.hourlyRateMin,
        hourlyRateMax: s.hourlyRateMax,
        retainerMin: s.retainerMin,
        retainerMax: s.retainerMax,
        availabilityHoursPerWeek: s.availabilityHoursPerWeek,
        status: "APPROVED",
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        verifiedAt: new Date(),
      },
    });

    // Specializations
    for (const specSlug of s.specializations) {
      const spec = specializations[specSlug];
      if (spec) {
        await prisma.strategistSpecialization.upsert({
          where: {
            strategistProfileId_specializationId: {
              strategistProfileId: profile.id,
              specializationId: spec.id,
            },
          },
          update: {},
          create: {
            strategistProfileId: profile.id,
            specializationId: spec.id,
          },
        });
      }
    }

    // Skills
    for (const skillSlug of s.skills) {
      const sk = skills[skillSlug];
      if (sk) {
        await prisma.strategistSkill.upsert({
          where: {
            strategistProfileId_skillId: {
              strategistProfileId: profile.id,
              skillId: sk.id,
            },
          },
          update: { level: 5, verified: true },
          create: {
            strategistProfileId: profile.id,
            skillId: sk.id,
            level: 5,
            yearsOfExp: 4,
            verified: true,
          },
        });
      }
    }

    // Case Study
    if (s.caseStudy) {
      const existingCs = await prisma.caseStudy.findFirst({
        where: { strategistProfileId: profile.id, title: s.caseStudy.title },
      });
      if (!existingCs) {
        await prisma.caseStudy.create({
          data: {
            strategistProfileId: profile.id,
            title: s.caseStudy.title,
            clientIndustry: s.caseStudy.clientIndustry,
            problem: s.caseStudy.problem,
            solution: s.caseStudy.solution,
            metricsAchieved: s.caseStudy.metricsAchieved,
            outcome: s.caseStudy.outcome,
          },
        });
      }
    }

    // Availability Slots (e.g. Tuesday & Thursday 09:00 - 17:00)
    for (const day of [2, 4]) {
      const existingSlot = await prisma.availabilitySlot.findFirst({
        where: {
          strategistProfileId: profile.id,
          dayOfWeek: day,
          startTime: "09:00",
        },
      });
      if (!existingSlot) {
        await prisma.availabilitySlot.create({
          data: {
            strategistProfileId: profile.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
            isRecurring: true,
          },
        });
      }
    }
  }
  console.log(
    `✅ Seeded ${strategistsData.length} Vetted Strategists with profiles, case studies, and availability slots`
  );

  // 6. SAMPLE AGENTS & WORKFLOW INITIATIVES FOR DEMO ORG
  const agent1 = await prisma.agent.upsert({
    where: { id: "demo-agent-invoice-recon" },
    update: {},
    create: {
      id: "demo-agent-invoice-recon",
      organizationId: org1.id,
      ownerId: client1User.id,
      name: "Invoice Reconciliation Agent",
      purpose:
        "Autonomously matches vendor invoice PDFs against SAP ERP purchase orders and bank statements.",
      platform: "LangGraph",
      status: "PRODUCTION",
      guardrails: { maxVarianceAllowed: 5.0, requireHumanIfAbove: 50000 },
    },
  });

  const agent2 = await prisma.agent.upsert({
    where: { id: "demo-agent-contract-parser" },
    update: {},
    create: {
      id: "demo-agent-contract-parser",
      organizationId: org1.id,
      ownerId: client1User.id,
      name: "Contract Clause Extractor",
      purpose:
        "Audits counterparty master service agreements for non-standard liability limits and auto-renewal clauses.",
      platform: "CrewAI",
      status: "PRODUCTION",
      guardrails: { piiMasking: true, legalApprovalGate: true },
    },
  });

  console.log(`✅ Seeded demo autonomous agents for ${org1.name}`);
  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
