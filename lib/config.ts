import Claude from "@/components/icons/claude"
import DeepSeek from "@/components/icons/deepseek"
import Gemini from "@/components/icons/gemini"
import Grok from "@/components/icons/grok"
import Mistral from "@/components/icons/mistral"
import OpenAI from "@/components/icons/openai"
import OpenRouter from "@/components/icons/openrouter"
import Xai from "@/components/icons/xai"
import {
  BookOpenText,
  Brain,
  Calendar,
  Clipboard,
  Clock,
  Code,
  Lightbulb,
  Notepad,
  PaintBrush,
  QuestionMark,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr"
import { openproviders, OpenProvidersOptions } from "./openproviders"
import { SupportedModel } from "./openproviders/types"

export const NON_AUTH_DAILY_MESSAGE_LIMIT = 5
export const AUTH_DAILY_MESSAGE_LIMIT = 1000
export const REMAINING_QUERY_ALERT_THRESHOLD = 2
export const DAILY_FILE_UPLOAD_LIMIT = 5
export const DAILY_SPECIAL_AGENT_LIMIT = 2
export const DAILY_LIMIT_PRO_MODELS = 5

export type Model = {
  id: string
  name: string
  provider: string
  api_sdk: OpenProvidersOptions<SupportedModel>
  features?: {
    id: string
    enabled: boolean
  }[]
  description?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const MODELS_FREE = [
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "openrouter",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
      {
        id: "reasoning",
        enabled: true,
      },
      {
        id: "tool-use",
        enabled: false,
      },
    ],
    creator: "deepseek",
    api_sdk: "deepseek/deepseek-r1:free", // this is a special case for openrouter
    description:
      "A reasoning-first model trained with reinforcement learning, built for math, code, and complex problem solving",
    icon: DeepSeek,
  },
  {
    id: "pixtral-large-latest",
    name: "Pixtral Large",
    provider: "mistral",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "mistral",
    api_sdk: openproviders("pixtral-large-latest"),
    description:
      "Mistral's flagship model. Great for reasoning, writing, and advanced tasks.",
    icon: Mistral,
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
    features: [
      {
        id: "file-upload",
        enabled: false,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "mistral",
    api_sdk: openproviders("mistral-large-latest"),
    description:
      "Fine-tuned for chat. A lighter, faster option for everyday use.",
    icon: Mistral,
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "openai",
    api_sdk: openproviders("gpt-4.1-nano"),
    description:
      "Ultra fast and cheap. Ideal for simple tasks, summaries, or classification.",
    icon: OpenAI,
  },
]

export const MODELS_PRO = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "openai",
    api_sdk: openproviders("gpt-4.1"),
    description:
      "OpenAI's most powerful model. Excellent at coding, writing, and complex tasks.",
    icon: OpenAI,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "openai",
    api_sdk: openproviders("gpt-4.1-mini"),
    description:
      "Fast and smart — a great balance for most tasks. Outperforms GPT‑4o mini.",
    icon: OpenAI,
  },
  {
    id: "gemini-2.5-pro-preview-03-25",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "google",
    api_sdk: openproviders("gemini-2.5-pro-exp-03-25"),
    description: "Advanced reasoning, coding, and multimodal understanding.",
    icon: Gemini,
  },
  {
    id: "gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "google",
    api_sdk: openproviders("gemini-2.0-flash-001"),
    description: "Fast and cost-efficient with streaming and real-time output.",
    icon: Gemini,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "google",
    api_sdk: openproviders("gemini-1.5-pro"),
    description: "Smart general-purpose model for complex reasoning tasks.",
    icon: Gemini,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "google",
    api_sdk: openproviders("gemini-1.5-flash"),
    description: "Balanced speed and quality, great for a variety of tasks.",
    icon: Gemini,
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "anthropic",
    api_sdk: openproviders("claude-3-7-sonnet-20250219"),
    description:
      "Anthropic's most intelligent model. Excels at step-by-step reasoning and complex tasks.",
    icon: Claude,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "anthropic",
    api_sdk: openproviders("claude-3-5-haiku-20241022"),
    description:
      "Fastest and most cost-effective Claude model. Ideal for quick, everyday tasks.",
    icon: Claude,
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    features: [
      {
        id: "file-upload",
        enabled: true,
      },
    ],
    creator: "anthropic",
    api_sdk: openproviders("claude-3-opus-20240229"),
    description:
      "Anthropic's most powerful model for highly complex reasoning and generation tasks.",
    icon: Claude,
  },
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xai",
    features: [
      {
        id: "file-upload",
        enabled: false,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "xai",
    api_sdk: openproviders("grok-3"),
    description:
      "Flagship model excelling at enterprise use cases with deep domain knowledge in finance, healthcare, law, and science.",
    icon: Grok,
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    provider: "xai",
    features: [
      {
        id: "file-upload",
        enabled: false,
      },
      {
        id: "tool-use",
        enabled: true,
      },
      {
        id: "reasoning",
        enabled: true,
      },
    ],
    creator: "xai",
    api_sdk: openproviders("grok-3-mini"),
    description:
      "Lightweight model that thinks before responding, fast and smart for logic-based tasks without requiring deep domain knowledge",
    icon: Grok,
  },
  {
    id: "grok-3-fast",
    name: "Grok 3 Fast",
    provider: "xai",
    features: [
      {
        id: "file-upload",
        enabled: false,
      },
      {
        id: "tool-use",
        enabled: true,
      },
    ],
    creator: "xai",
    api_sdk: openproviders("grok-3-fast"),
    description: "Increased speed at a higher cost per output token.",
    icon: Grok,
  },
]

export const MODELS_OPTIONS = [...MODELS_FREE, ...MODELS_PRO] as Model[]

export type Provider = {
  id: string
  name: string
  available: boolean
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const PROVIDERS = [
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: OpenRouter,
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: OpenAI,
  },
  {
    id: "mistral",
    name: "Mistral",
    icon: Mistral,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: DeepSeek,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: Gemini,
  },
  {
    id: "claude",
    name: "Claude",
    icon: Claude,
  },
  {
    id: "grok",
    name: "Grok",
    icon: Grok,
  },
  {
    id: "xai",
    name: "XAI",
    icon: Xai,
  },
] as Provider[]

export const MODEL_DEFAULT = "gpt-4.1-nano"

export const APP_NAME = "Limitless"
export const APP_DOMAIN = "https://zola.chat"
export const APP_DESCRIPTION =
  "Zola is a free, open-source AI chat app with multi-model support."

export const SUGGESTIONS = [
  {
    label: "Prep",
    highlight: "Prep me",
    prompt: `Prep me`,
    items: [
      "Prep me for my date tonight",
      "Prep me to give feedback to my teammate tomorrow",
      "Prep me for my product demo next week",
      "Prep me to negotiate my rent with my landlord",
    ],
    icon: Calendar,
  },
  {
    label: "Summary",
    highlight: "Summarize",
    prompt: `Summarize`,
    items: [
      "Summarize my last 3 meetings into bullet points",
      "Summarize today's conversations into a journal entry",
      "Summarize the podcast I listened to this morning",
      "Summarize Dan's key points from lunch",
    ],
    icon: Notepad,
  },
  {
    label: "Memory",
    highlight: "What did",
    prompt: `What did`,
    items: [
      "What did Sam promise about the deadline?",
      "What did I agree to bring to book club?",
      "What did we decide about the new logo?",
      "What did the doctor say about my next appointment?",
    ],
    icon: Clock,
  },
  {
    label: "Improve myself",
    highlight: "How can I",
    prompt: `How can I`,
    items: [
      "How can I be a better listener in meetings",
      "How can I handle disagreements more calmly",
      "How can I make my teammates feel appreciated",
      "How can I improve my storytelling skills",
    ],
    icon: Sparkle,
  },
  {
    label: "Tasks",
    highlight: "Make me",
    prompt: `Make me`,
    items: [
      "Make me a to-do list from today's meetings",
      "Make me a study plan for my math exam",
      "Make me a grocery list based on this week's meals",
      "Make me a follow-up email to the recruiter",
    ],
    icon: Clipboard,
  },
]

export const SYSTEM_PROMPT_DEFAULT = `You are Zola, a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don't try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.`

export const MESSAGE_MAX_LENGTH = 4000

export const CURATED_AGENTS_SLUGS = [
  "github/ibelick/prompt-kit",
  "github/ibelick/zola",
  "github/shadcn/ui",
  "research",
  "tweet-vibe-checker",
  "blog-draft",
]
