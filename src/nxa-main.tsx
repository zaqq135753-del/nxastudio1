import React from 'react';
import { createRoot } from 'react-dom/client';
import './nxa.css';

const metrics = [
  ['WhatsApp', 'Preparado'],
  ['Assistentes ativos', '0'],
  ['Conversas hoje', '0'],
  ['Leads', '0'],
  ['Agendamentos', '0'],
  ['Receita registrada', 'R$ 0'],
];

const modules = ['Conversas','Agentes','Fluxos','CRM','Agenda','Cobranças','Automações','Resultados','Integrações','Configurações'];

function App(){
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brandMark">N</span><div><strong>NXA</strong><small>Automation OS</small></div></div>
      <nav><button className="active">Visão Geral</button>{modules.map((m)=><button key={m}>{m}</button>)}</nav>
      <div className="env"><span/>DEV · sa-east-1</div>
    </aside>
    <section className="content">
      <header><div><p className="eyebrow">OPERAÇÃO</p><h1>Visão Geral</h1><p className="muted">Sua infraestrutura comercial, agentes e automações em um único lugar.</p></div><button className="primary">+ Nova automação</button></header>
      <div className="status"><div><span className="pulse"/><strong>Supabase DEV saudável</strong><p>Multi-tenant, planos e RLS já provisionados.</p></div><span className="badge">FASES 01–02</span></div>
      <div className="grid">{metrics.map(([label,value])=><article key={label}><p>{label}</p><strong>{value}</strong><span>Base pronta para dados reais</span></article>)}</div>
      <section className="panel"><div><p className="eyebrow">ROADMAP</p><h2>Próxima etapa: WhatsApp Core</h2><p>WPPConnect via Docker, multisession, QR Code e abstração WhatsAppProvider sem acoplamento ao provedor.</p></div><div className="steps"><span className="done">01</span><span className="done">02</span><span className="current">03</span><span>04</span><span>05</span><span>06</span></div></section>
    </section>
  </main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
