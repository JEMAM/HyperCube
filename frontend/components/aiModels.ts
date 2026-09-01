export interface AIModelOption {
  id: string;
  name: string;
  badge?: string;
  description?: string;
}

export interface AIProviderOption {
  id: string;
  name: string;
  brand: string;
  iconType: "anthropic" | "openai" | "ollama" | "groq" | "google";
  models: AIModelOption[];
  defaultModel: string;
  defaultEndpoint?: string;
}

export const AI_PROVIDERS_CONFIG: Record<string, AIProviderOption> = {
  groq: {
    id: "groq",
    name: "Groq (Infraestrutura LPU Ultrarrápida)",
    brand: "Groq LPU",
    iconType: "groq",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "openai/gpt-oss-120b", name: "openai/gpt-oss-120b", badge: "Open-Weights 120B", description: "Modelo open-source de alta densidade acelerado em hardware LPU Groq" },
      { id: "openai/gpt-oss-20b", name: "openai/gpt-oss-20b", badge: "Open-Weights 20B", description: "Compacto e ultrarrápido para triagem e processamento analítico" },
      { id: "llama-3.1-8b-instant", name: "llama-3.1-8b-instant", badge: "Ultra Baixa Latência", description: "Respostas instantâneas em milissegundos para triagem e gráficos" },
      { id: "llama-3.3-70b-versatile", name: "llama-3.3-70b-versatile", badge: "Meta Flagship", description: "Raciocínio corporativo avançado e alta velocidade (800+ tokens/s)" },
    ],
  },
  gemini: {
    id: "gemini",
    name: "Gemini (Google DeepMind)",
    brand: "Google DeepMind",
    iconType: "google",
    defaultModel: "Gemini 3.7 Flash",
    models: [
      { id: "Gemini 3.7 Flash", name: "Gemini 3.7 Flash", badge: "Hybrid Reasoning", description: "Modelo multimodal de última geração com raciocínio híbrido e baixa latência" },
      { id: "Gemini 3.6 Flash", name: "Gemini 3.6 Flash", badge: "Alta Velocidade", description: "Otimizado para throughput veloz e streaming de dados financeiros" },
      { id: "Gemini 3.5 Flash", name: "Gemini 3.5 Flash", badge: "Equilibrado", description: "Excelente relação custo-benefício para diagnósticos contábeis" },
      { id: "Gemini 3.5 Flash-Lite", name: "Gemini 3.5 Flash-Lite", badge: "Ultra Econômico", description: "Máxima eficiência para processamento de rotina e recálculos DAG" },
    ],
  },
  anthropic: {
    id: "anthropic",
    name: "Claude (Anthropic)",
    brand: "Anthropic",
    iconType: "anthropic",
    defaultModel: "Claude Sonnet 5",
    models: [
      { id: "Claude Opus 4.8", name: "Claude Opus 4.8", badge: "Análise Profunda", description: "Capacidade analítica máxima para pareceres macroeconômicos e valuation" },
      { id: "Claude Sonnet 5", name: "Claude Sonnet 5", badge: "Referência FP&A", description: "Padrão de excelência para diagnósticos e modelagens corporativas" },
      { id: "Claude Haiku 4.5", name: "Claude Haiku 4.5", badge: "Ultra Rápido", description: "Respostas em milissegundos para streaming e recálculo" },
      { id: "Claude Fable 5", name: "Claude Fable 5", badge: "Raciocínio Criativo", description: "Síntese avançada de cenários e formulação de hipóteses estratégicas" },
    ],
  },
  openai: {
    id: "openai",
    name: "ChatGPT (OpenAI)",
    brand: "OpenAI",
    iconType: "openai",
    defaultModel: "GPT-5.6 Sol",
    models: [
      { id: "GPT-5.6 Sol", name: "GPT-5.6 Sol", badge: "Flagship Frontier", description: "Modelo topo de linha com raciocínio analítico autônomo e síntese máxima" },
      { id: "GPT-5.6 Terra", name: "GPT-5.6 Terra", badge: "Precisão & Cálculo", description: "Otimizado para cálculos contábeis de alta densidade e precisão matemática" },
      { id: "GPT-5.6 Luna", name: "GPT-5.6 Luna", badge: "Rápido & Multimodal", description: "Baixa latência para interação em tempo real e visualização de dados" },
      { id: "GPT-5.5 Instant", name: "GPT-5.5 Instant", badge: "Ultra Baixa Latência", description: "Respostas instantâneas para processamento de rotina e streaming" },
      { id: "GPT-5.5 Thinking", name: "GPT-5.5 Thinking", badge: "Deep Reasoning", description: "Cadeia de pensamento profunda para modelagens financeiras complexas" },
      { id: "GPT-5.4 Thinking", name: "GPT-5.4 Thinking", badge: "Advanced Reasoning", description: "Raciocínio analítico avançado para auditoria contábil e DAG" },
    ],
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Execução Local On-Premise)",
    brand: "Local / On-Premise",
    iconType: "ollama",
    defaultEndpoint: "http://localhost:11434",
    defaultModel: "gemma4:12b",
    models: [
      { id: "gemma4:12b", name: "Gemma 4 (12B)", badge: "Instalado Local", description: "Google Gemma 4 12B local (gemma4:12b)" },
      { id: "llama3:8b", name: "Llama 3 (8B)", badge: "Instalado Local", description: "Meta Llama 3 8B local (llama3:8b)" },
      { id: "llama3.2:latest", name: "Llama 3.2", badge: "Instalado Local", description: "Meta Llama 3.2 Compact local (llama3.2:latest)" },
      { id: "medgemma:27b", name: "MedGemma (27B)", badge: "Instalado Local", description: "MedGemma 27B local (medgemma:27b)" },
    ],
  },
};
