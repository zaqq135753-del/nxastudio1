import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL } from "./ai-shared";

export type EssayCorrection = {
  totalScore: number;
  competencies: {
    c1: { score: number; feedback: string };
    c2: { score: number; feedback: string };
    c3: { score: number; feedback: string };
    c4: { score: number; feedback: string };
    c5: { score: number; feedback: string };
  };
  generalFeedback: string;
  strengths: string[];
  improvements: string[];
};

export type EssaySkeleton = {
  theme: string;
  introduction: string;
  development1: string;
  development2: string;
  conclusion: string;
  repertoires: string[];
};

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const correctEssay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { theme: string; essayText: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é um corretor oficial e especialista na Banca do ENEM.
Analise o texto de redação enviado pelo aluno com base no Tema: "${data.theme}".
Avalie rigorosamente com base nas 5 competências do ENEM (0 a 200 pontos cada):
- Competência 1: Domínio da norma culta da língua escrita.
- Competência 2: Compreender a proposta e aplicar conceitos das várias áreas do conhecimento.
- Competência 3: Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista.
- Competência 4: Demonstração de conhecimento dos mecanismos linguísticos (coesão).
- Competência 5: Elaboração de proposta de intervenção para o problema abordado.

Responda ESTRITAMENTE em JSON com a seguinte estrutura:
{
  "totalScore": 840,
  "competencies": {
    "c1": { "score": 160, "feedback": "..." },
    "c2": { "score": 200, "feedback": "..." },
    "c3": { "score": 160, "feedback": "..." },
    "c4": { "score": 160, "feedback": "..." },
    "c5": { "score": 160, "feedback": "..." }
  },
  "generalFeedback": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Tema: ${data.theme}\n\nTexto:\n${data.essayText}` },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    return parseJson<EssayCorrection>(raw);
  });

export const generateSkeleton = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { theme: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é um mentor especialista em Redação Nota 1000 no ENEM.
Gere uma estrutura coringa e pronta para o tema informado pelo aluno.
Crie introdução, desenvolvimento 1 (com causa e repertório), desenvolvimento 2 (com consequência e exemplo) e conclusão (com proposta de intervenção completa com os 5 elementos).

Responda ESTRITAMENTE em JSON:
{
  "theme": "${data.theme}",
  "introduction": "...",
  "development1": "...",
  "development2": "...",
  "conclusion": "...",
  "repertoires": ["Filósofo / Conceito 1", "Lei / Fato Histórico 2"]
}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Gere um esqueleto coringa para o tema: ${data.theme}` },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    });

    return parseJson<EssaySkeleton>(raw);
  });

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { question: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é um Tutor Inteligente e Didático do ENEM.
Sua missão é tirar dúvidas de matérias (Matemática, Física, Química, Biologia, História, Geografia, Linguagens) ou explicar o passo a passo de resolução de questões difíceis.
Responda em linguagem clara, jovem, motivadora e estruturada em tópicos curtos com markdown.`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: data.question },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return { answer: raw };
  });

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subject: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é um elaborador de questões no formato oficial do ENEM.
Gere 3 questões inéditas sobre a matéria de "${data.subject}" com 4 alternativas cada, indicando o índice da resposta correta e uma explicação detalhada.

Responda ESTRITAMENTE em JSON:
[
  {
    "id": 1,
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctIndex": 1,
    "explanation": "..."
  }
]`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Gere um simulado express de 3 questões de ${data.subject}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return parseJson<QuizQuestion[]>(raw);
  });

export type AudioAnalysis = {
  score: number;
  accuratePoints: string[];
  missingConcepts: string[];
  aiAdvice: string;
};

export const transcribeEssayOcr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { imageBase64: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é um especialista em OCR e transcrição de caligrafia humana em folhas de redação do ENEM.
Sua única tarefa é transcrever FIELMENTE e INTEGRALMENTE cada palavra escrita à mão na folha de redação enviada.
Mantenha a divisão dos parágrafos exatamente como está no papel.
Não corrija os erros ortográficos do aluno na transcrição (mantenha os erros originais para que a IA de correção avalie depois).
Retorne ESTRITAMENTE um JSON com o campo "transcription".
Exemplo:
{
  "transcription": "Conforme estudos demográficos realizados pelo Instituto Brasileiro de Geografia e Estatística..."
}`;

    const raw = await callGateway({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: "Transcreva fielmente o texto desta folha manuscrita de redação do ENEM:" },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 2500,
    });

    return parseJson<{ transcription: string }>(raw);
  });

export const analyzeAudioExplanation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; transcript: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é um professor e especialista pedagógico aplicando a Técnica de Feynman para o ENEM.
O aluno gravou uma explicação em voz alta com as próprias palavras sobre o tema: "${data.topic}".
Analise o texto transcrito da fala dele.

Responda ESTRITAMENTE em JSON:
{
  "score": 8,
  "accuratePoints": ["Ponto correto 1", "Ponto correto 2"],
  "missingConcepts": ["Conceito esquecido 1", "Conceito esquecido 2"],
  "aiAdvice": "Conselho pedagógico para aprimorar a memorização do aluno."
}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Tema: ${data.topic}\nTranscrição da fala do aluno: "${data.transcript}"` },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return parseJson<AudioAnalysis>(raw);
  });
