import { MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";

export function AdminWhatsAppTab() {
  const webhookUrl = "https://nxastudio.lovable.app/api/public/whatsapp-webhook";

  return (
    <div className="mt-6 space-y-6">
      <div className="surface p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-green-500/10 text-green-600">
            <MessageCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Configuração WhatsApp Cloud API</h2>
            <p className="text-sm text-muted-foreground">Conecte a NXA ao WhatsApp para comandos de voz e texto.</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL do Webhook</label>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={webhookUrl}
                className="input-field flex-1 font-mono text-xs bg-muted/50"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  alert("Copiado!");
                }}
                className="btn-ghost text-xs"
              >
                Copiar
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Use esta URL no painel do Meta for Developers.</p>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={14} className="text-green-600" />
              Segurança
            </div>
            <p className="text-xs text-muted-foreground">
              Para validar o webhook, defina a variável de ambiente <code>WHATSAPP_VERIFY_TOKEN</code> no painel Lovable com um token de sua escolha e use o mesmo no Meta.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Próximos passos</h3>
            <ul className="space-y-3">
              {[
                "Crie um app 'Empresa' no Meta for Developers",
                "Adicione o produto WhatsApp",
                "Configure o Webhook usando a URL acima",
                "Adicione um número de telefone para testes",
                "Defina o WHATSAPP_ACCESS_TOKEN nas configurações da plataforma"
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <a 
            href="https://developers.facebook.com/apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            Ir para Meta Developers <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="surface p-6 border-dashed border-2">
        <h3 className="text-sm font-semibold mb-2">Omnichannel: Siri, Alexa & Agentes Externos</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Para integrar Siri/Alexa ou sistemas externos, a NXA expõe um Agente de Orquestração Inteligente. 
          As requisições POST para <code>/api/public/voice-command</code> processam linguagem natural e 
          executam ações através de todos os apps da suíte usando a memória do usuário.
        </p>
        <div className="mt-4 grid gap-3 text-[10px] font-mono opacity-70">
          <div className="rounded bg-muted p-2">POST /api/public/voice-command</div>
          <div className="rounded bg-muted p-2">POST /api/public/whatsapp-webhook</div>
        </div>
      </div>
    </div>
  );
}
