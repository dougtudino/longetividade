"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SugestaoDoDia from "@/components/admin/sugestao-do-dia";
import { MapaCampanhas } from "./MapaCampanhas";
import type { AggregatedInsights } from "@/lib/meta-ads";
import { PageHeader, Button, Card, Badge, Alert } from "@/components/admin/ui";

interface Campaign {
  id: string; name: string; platform: "meta"|"google"|"organic"|"email";
  objective: "conversao"|"trafego"|"awareness"; status: "active"|"paused"|"finished";
  budget: number; startDate: string; endDate?: string|null; notes?: string;
  createdAt: string; totalSpend: number; totalConversions: number; totalRevenue: number;
  totalImpressions: number; totalClicks: number; roas: number; cpv: number;
}
interface CampaignForm { name:string; platform:string; objective:string; budget:string; startDate:string; endDate:string; notes:string; }
const emptyForm: CampaignForm = { name:"", platform:"meta", objective:"conversao", budget:"", startDate:"", endDate:"", notes:"" };

const PLATFORM_COLORS: Record<string,string> = { meta:"#4A90D9", google:"#C4787A", organic:"#6B9E6B", email:"#9B72CF" };
const PLATFORM_LABELS: Record<string,string> = { meta:"Meta", google:"Google", organic:"Organico", email:"Email" };
const STATUS_COLORS: Record<string,string> = { active:"#6B9E6B", paused:"#D4A94B", finished:"#888" };
const STATUS_LABELS: Record<string,string> = { active:"Ativo", paused:"Pausado", finished:"Finalizado" };

function fmtNum(n:number):string { if(n>=1_000_000)return(n/1_000_000).toFixed(1)+"M"; if(n>=1_000)return(n/1_000).toFixed(1)+"K"; return n.toLocaleString("pt-BR"); }
function fmtMoney(n:number):string { return "R$"+n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function daysSince(d:string):number { return Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/86_400_000)); }

const cardStyle:React.CSSProperties={background:"var(--bg-card)",border:"0.5px solid var(--border-default)",borderRadius:12,padding:20,transition:"background 0.15s"};
const labelStyle:React.CSSProperties={fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--text-secondary)"};
const btnPrimary:React.CSSProperties={background:"var(--accent)",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer"};
const inputStyle:React.CSSProperties={width:"100%",padding:"10px 12px",borderRadius:8,border:"0.5px solid var(--border-default)",background:"var(--bg-secondary)",color:"var(--text-primary)",fontSize:14,outline:"none"};

type MetaInsightsResponse={ok:boolean;preset:string;account?:AggregatedInsights;error?:string};
type Preset="today"|"yesterday"|"last_7d"|"last_30d";
const PRESET_LABEL:Record<Preset,string>={today:"Hoje",yesterday:"Ontem",last_7d:"7 dias",last_30d:"30 dias"};
type PageTab = "campanhas"|"mapa";

type BlueprintSummary = {
  id: string;
  launchId: string;
  name: string;
  status: string;
  budgetTotalBrl: number;
  metaCampaignId: string | null;
  launchedAt: string | null;
  createdAt: string;
  _count?: { audiences: number; adSets: number };
};

const BLUEPRINT_STATUS_COLOR: Record<string, string> = {
  draft: "#888",
  ready: "#4A90D9",
  launched: "#6B9E6B",
  paused: "#D4A94B",
  archived: "#888",
};

export default function CampanhasPage() {
  const [pageTab, setPageTab] = useState<PageTab>("campanhas");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [preset, setPreset] = useState<Preset>("last_7d");
  const [insights, setInsights] = useState<AggregatedInsights|null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string|null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string|null>(null);
  const [blueprints, setBlueprints] = useState<BlueprintSummary[]>([]);

  const fetchBlueprints = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/campaigns/blueprint/list");
      if (r.ok) {
        const d = await r.json();
        setBlueprints(d.blueprints ?? []);
      }
    } catch {}
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try { const r=await fetch("/api/admin/campaigns?scope=blueprint"); if(r.ok){const d=await r.json();setCampaigns(d);} } catch{} finally{setLoading(false);}
  },[]);

  const fetchInsights = useCallback(async (p:Preset) => {
    setInsightsLoading(true); setInsightsError(null);
    try {
      const r=await fetch(`/api/admin/meta-insights?preset=${p}&scope=blueprint`,{cache:"no-store"});
      const d=(await r.json()) as MetaInsightsResponse;
      if(d.ok&&d.account){setInsights(d.account);}else{setInsights(null);setInsightsError(d.error??"Falha ao carregar metricas");}
    } catch(e){setInsightsError((e as Error).message);}
    finally{setInsightsLoading(false);}
  },[]);

  async function syncNow() {
    setSyncing(true);
    try {
      const r=await fetch("/api/admin/sync-meta-ads",{method:"POST"});
      const d=await r.json();
      if(d.ok){setLastSync(new Date().toLocaleTimeString("pt-BR"));await fetchInsights(preset);await fetchCampaigns();}
      else{setInsightsError(d.error??"Falha na sincronizacao");}
    } catch(e){setInsightsError((e as Error).message);}
    finally{setSyncing(false);}
  }

  useEffect(()=>{fetchCampaigns();fetchBlueprints();},[fetchCampaigns,fetchBlueprints]);
  useEffect(()=>{fetchInsights(preset);},[preset,fetchInsights]);

  // openNew removido (Sprint 8): botao "+ Nova campanha" foi substituido
  // por link "+ Novo Launch" → /admin/campanhas/launch-blueprint. Toda
  // campanha nova agora nasce de um LaunchBlueprint.
  function openEdit(c:Campaign){setEditingId(c.id);setForm({name:c.name,platform:c.platform,objective:c.objective,budget:String(c.budget),startDate:c.startDate?.slice(0,10)??"",endDate:c.endDate?.slice(0,10)??"",notes:c.notes??""});setModalOpen(true);}

  async function handleSave() {
    setSaving(true);
    try {
      const body={name:form.name,platform:form.platform,objective:form.objective,budget:parseFloat(form.budget)||0,startDate:form.startDate,endDate:form.endDate||null,notes:form.notes};
      if(editingId){await fetch("/api/admin/campaigns",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editingId,...body})});}
      else{await fetch("/api/admin/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});}
      setModalOpen(false);setEditingId(null);setForm(emptyForm);await fetchCampaigns();
    } catch{} finally{setSaving(false);}
  }

  async function toggleStatus(c:Campaign) {
    try{await fetch("/api/admin/campaigns",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:c.id,status:c.status==="active"?"paused":"active"})});await fetchCampaigns();}catch{}
  }

  const tabStyle=(active:boolean):React.CSSProperties=>({
    padding:"10px 16px",fontSize:14,fontWeight:active?600:500,
    color:active?"var(--accent)":"var(--text-secondary)",
    borderBottom:active?"2px solid var(--accent)":"2px solid transparent",
    background:"none",border:"none",cursor:"pointer",
  });

  return (
    <div style={{maxWidth:1100,margin:"0 auto"}}>

      <PageHeader
        title="Campanhas · Meta Ads"
        subtitle="Passo 1 do fluxo Meta Ads. Defina budget, objetivo e datas. Depois crie a coleção de Criativos (passo 2) e a Gaia monitora (passo 3)."
        icon="📣"
        actions={
          pageTab === "campanhas" ? (
            <Link
              href="/admin/campanhas/launch-blueprint"
              style={{
                padding: "8px 16px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
              title="Toda campanha nasce de um Launch (LaunchBlueprint). Editor de blueprint pra criar/duplicar."
            >
              + Novo Launch
            </Link>
          ) : undefined
        }
      />

      {/* Tab nav */}
      <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:"0.5px solid var(--border-default)",flexWrap:"wrap"}}>
        <button style={tabStyle(pageTab==="campanhas")} onClick={()=>setPageTab("campanhas")}>Campanhas</button>
        <button style={tabStyle(pageTab==="mapa")} onClick={()=>setPageTab("mapa")}>Mapa 🗺</button>
        <Link href="/admin/campanhas/launch-blueprint" style={{...tabStyle(false),textDecoration:"none",display:"flex",alignItems:"center"}}>Blueprint 📋</Link>
        <Link href="/admin/campanhas/setup-bm" style={{...tabStyle(false),textDecoration:"none",display:"flex",alignItems:"center"}}>Setup BM</Link>
      </div>

      {/* ABA: MAPA */}
      {pageTab === "mapa" && <MapaCampanhas />}

      {/* ABA: CAMPANHAS */}
      {pageTab === "campanhas" && (
        <>

          {/* Blueprints ativos — fonte de verdade do plano de launch */}
          <div style={{...cardStyle,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em"}}>🗺 Blueprints de Launch</div>
                <div style={{fontSize:13,color:"var(--text-secondary)",marginTop:2}}>Documento mestre editável de cada LAUNCH. Fonte de verdade do plano.</div>
              </div>
              <Link href="/admin/campanhas/launch-blueprint" style={{padding:"7px 14px",borderRadius:8,background:"var(--accent)",color:"#fff",fontSize:12,fontWeight:700,textDecoration:"none"}}>
                Abrir editor →
              </Link>
            </div>
            {blueprints.length === 0 ? (
              <div style={{padding:16,textAlign:"center",color:"var(--text-muted)",fontSize:13,background:"var(--bg-secondary)",borderRadius:8}}>
                Nenhum blueprint ainda. Abre o editor e clica &quot;+ Seed LAUNCH-001&quot;.
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                {blueprints.map(bp => (
                  <Link key={bp.launchId} href="/admin/campanhas/launch-blueprint" style={{padding:12,background:"var(--bg-secondary)",border:"0.5px solid var(--border-subtle)",borderRadius:8,textDecoration:"none",display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>{bp.name}</span>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:999,background:`${BLUEPRINT_STATUS_COLOR[bp.status] ?? "#888"}22`,color:BLUEPRINT_STATUS_COLOR[bp.status] ?? "#888",fontWeight:700,textTransform:"uppercase"}}>{bp.status}</span>
                    </div>
                    <div style={{fontSize:11,color:"var(--text-muted)"}}>
                      R${bp.budgetTotalBrl}/d · {bp._count?.adSets ?? 0} ad sets · {bp._count?.audiences ?? 0} audiences
                    </div>
                    {bp.metaCampaignId && (
                      <div style={{fontSize:10,color:"var(--text-muted)",fontFamily:"monospace"}}>
                        Meta ID: {bp.metaCampaignId.slice(0,18)}...
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Passo a passo — guia completo pra lancar uma LAUNCH */}
          <div style={{...cardStyle,marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--text-primary)",marginBottom:4}}>🚀 Como lançar uma nova campanha</div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:14}}>Fluxo completo em 6 passos — do blueprint ao Meta Ads rodando</div>
            <ol style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
              {[
                {n:"1",title:"Criar o blueprint",desc:"Abre /admin/campanhas/launch-blueprint e clica + Seed LAUNCH-001. Ou duplica um existente pra criar LAUNCH-002 (Sono, Jejum, etc)",href:"/admin/campanhas/launch-blueprint"},
                {n:"2",title:"Editar o plano",desc:"Define budget, idade, interesses (autocomplete Meta), activateOn (day_1/day_5), numAds. Tudo salva automático."},
                {n:"3",title:"Garantir criativos em /admin/criativos",desc:"Collection com 6 PNGs (feed/story/banner). Clica 📤 Upload pra Meta pra popular o Meta hash de cada um.",href:"/admin/criativos"},
                {n:"4",title:"🔧 Preparar pra lançamento",desc:"Na página do blueprint, clica Preparar. Checa + seeda automaticamente copies, hashes, page ID. Mostra o que falta."},
                {n:"5",title:"🚀 Lançar no Meta (tudo PAUSED)",desc:"1 clique cria no Meta: 5 CAs + 1 lookalike + campanha + 5 ad sets + 16 ads. Idempotente."},
                {n:"6",title:"Ativar no Ads Manager + Day 4 review",desc:"No Meta Ads Manager, ativa os cold Day 1. Aguarda 72h learning phase. Day 4 roda *review da Gaia.",href:"/admin/agents/gaia"},
              ].map(step => (
                <li key={step.n} style={{display:"flex",gap:12,padding:"10px 12px",background:"var(--bg-secondary)",borderRadius:8,alignItems:"flex-start"}}>
                  <div style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:"var(--accent)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{step.n}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:2}}>{step.title}</div>
                    <div style={{fontSize:12,color:"var(--text-secondary)",lineHeight:1.5}}>{step.desc}</div>
                  </div>
                  {step.href && (
                    <Link href={step.href} style={{padding:"4px 10px",background:"var(--accent)",color:"#fff",borderRadius:6,fontSize:11,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>Abrir →</Link>
                  )}
                </li>
              ))}
            </ol>
            <div style={{marginTop:14,padding:"10px 12px",background:"rgba(74,144,217,0.08)",border:"0.5px solid rgba(74,144,217,0.3)",borderRadius:8,fontSize:12,color:"var(--text-secondary)"}}>
              💡 <strong>Template virgem pra novas LAUNCHes:</strong> <code style={{fontSize:11,padding:"2px 6px",background:"var(--bg-secondary)",borderRadius:4}}>docs/blueprints/launch-template.md</code> — estrutura padrão com 8 seções (produto, persona, arquitetura, budget, criativos, audiences, kill triggers, cronograma). Copia e preenche pra cada produto novo.
            </div>
          </div>

          {/* Meta Ads insights */}
          <div style={{...cardStyle,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em"}}>Meta Ads · CA01- BM Barbara</div>
                <div style={{fontSize:13,color:"var(--text-secondary)",marginTop:2}}>{lastSync?`Sincronizado as ${lastSync}`:"Dados ao vivo (cache 60s)"}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(["today","yesterday","last_7d","last_30d"] as Preset[]).map(p=>(
                  <button key={p} onClick={()=>setPreset(p)} style={{padding:"6px 12px",borderRadius:8,border:"0.5px solid var(--border-default)",background:preset===p?"var(--accent)":"var(--bg-secondary)",color:preset===p?"#fff":"var(--text-secondary)",fontSize:12,fontWeight:600,cursor:"pointer"}}>{PRESET_LABEL[p]}</button>
                ))}
                <button onClick={syncNow} disabled={syncing} style={{padding:"6px 12px",borderRadius:8,border:"0.5px solid var(--border-default)",background:"var(--bg-secondary)",color:"var(--text-primary)",fontSize:12,fontWeight:600,cursor:syncing?"wait":"pointer",opacity:syncing?0.6:1}}>{syncing?"Sincronizando...":"↻ Sincronizar"}</button>
              </div>
            </div>
            {insightsLoading&&!insights&&<div style={{fontSize:13,color:"var(--text-muted)"}}>Carregando metricas...</div>}
            {insightsError&&<div style={{padding:12,borderRadius:8,background:"rgba(196,120,122,0.1)",border:"0.5px solid rgba(196,120,122,0.3)",color:"#C4787A",fontSize:13}}><strong>Erro:</strong> {insightsError}{insightsError.includes("nao configuradas")&&<> <Link href="/admin/configuracoes#meta" style={{color:"var(--accent)"}}>Configurar agora</Link></>}</div>}
            {insights&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
                {[{label:"Gasto",value:fmtMoney(insights.spend)},{label:"Impressoes",value:fmtNum(insights.impressions)},{label:"Cliques",value:fmtNum(insights.clicks)},{label:"CTR",value:`${insights.ctr.toFixed(2)}%`},{label:"CPM",value:fmtMoney(insights.cpm)},{label:"Compras",value:insights.purchases.toFixed(0)},{label:"Receita",value:fmtMoney(insights.purchaseValue)},{label:"ROAS",value:`${insights.roas.toFixed(2)}x`,color:insights.roas>=1?"#6B9E6B":insights.spend>0?"#C4787A":"var(--text-primary)"},].map(m=>(
                  <div key={m.label} style={{padding:12,background:"var(--bg-secondary)",borderRadius:8,border:"0.5px solid var(--border-subtle)"}}>
                    <div style={{fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{m.label}</div>
                    <div style={{fontSize:18,fontWeight:700,color:m.color??"var(--text-primary)",marginTop:4}}>{m.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{marginBottom:24}}><SugestaoDoDia account={insights} loading={insightsLoading&&!insights} error={insightsError} /></div>

          {/* Campaign cards */}
          {loading?(<p style={{color:"var(--text-muted)"}}>Carregando...</p>):campaigns.length===0?(
            <div style={{...cardStyle,textAlign:"center",color:"var(--text-muted)",padding:40}}>Nenhuma campanha cadastrada. Crie a primeira!</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {campaigns.map(c=>{
                const ctr=c.totalImpressions>0?((c.totalClicks/c.totalImpressions)*100).toFixed(1):"0.0";
                const days=daysSince(c.startDate);
                return(
                  <div key={c.id} style={cardStyle}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",padding:"3px 8px",borderRadius:6,color:"#fff",background:PLATFORM_COLORS[c.platform]??"#888"}}>{PLATFORM_LABELS[c.platform]??c.platform}</span>
                      <Link href={`/admin/campanhas/${c.id}`} style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",textDecoration:"none",flex:1}}>{c.name}</Link>
                      <span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:6,color:STATUS_COLORS[c.status]??"#888",border:`1px solid ${STATUS_COLORS[c.status]??"#888"}`}}>{STATUS_LABELS[c.status]??c.status}</span>
                    </div>
                    <div style={{...labelStyle,marginBottom:10}}>Budget: {fmtMoney(c.budget)}/dia &nbsp;|&nbsp; {days} dias rodando</div>
                    <div style={{display:"flex",gap:24,marginBottom:10,fontSize:13,color:"var(--text-secondary)",flexWrap:"wrap"}}>
                      <span>Impressoes: <strong style={{color:"var(--text-primary)"}}>{fmtNum(c.totalImpressions)}</strong></span>
                      <span>Cliques: <strong style={{color:"var(--text-primary)"}}>{fmtNum(c.totalClicks)}</strong></span>
                      <span>CTR: <strong style={{color:"var(--text-primary)"}}>{ctr}%</strong></span>
                    </div>
                    <div style={{display:"flex",gap:24,marginBottom:14,fontSize:13,color:"var(--text-secondary)",flexWrap:"wrap"}}>
                      <span>Gasto: <strong style={{color:"var(--text-primary)"}}>{fmtMoney(c.totalSpend)}</strong></span>
                      <span>Conversoes: <strong style={{color:"var(--text-primary)"}}>{c.totalConversions}</strong></span>
                      <span>ROAS: <strong style={{color:c.roas>=1?"#6B9E6B":"#C4787A"}}>{c.roas.toFixed(2)}x</strong></span>
                      <span>CPV: <strong style={{color:"var(--text-primary)"}}>{fmtMoney(c.cpv)}</strong></span>
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={()=>openEdit(c)} style={{padding:"6px 14px",borderRadius:8,border:"0.5px solid var(--border-default)",background:"var(--bg-secondary)",color:"var(--text-secondary)",fontSize:13,cursor:"pointer"}}>Editar</button>
                      {c.status!=="finished"&&<button onClick={()=>toggleStatus(c)} style={{padding:"6px 14px",borderRadius:8,border:"0.5px solid var(--border-default)",background:"var(--bg-secondary)",color:c.status==="active"?"#D4A94B":"#6B9E6B",fontSize:13,cursor:"pointer"}}>{c.status==="active"?"Pausar":"Retomar"}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Links rapidos */}
          <div style={{marginTop:40}}>
            <h2 style={{fontSize:16,fontWeight:600,color:"var(--text-primary)",marginBottom:14}}>Links Rapidos</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
              {[{label:"Meta Ads Manager",href:"https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=837047967961012&selected_campaign_ids=120241789342370290"},{label:"Google Ads",href:"https://ads.google.com"},{label:"Hotmart Dashboard",href:"https://app.hotmart.com/products/manage/7474328"},{label:"Kiwify Dashboard",href:"https://dashboard.kiwify.com/products"}].map(link=>(
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{...cardStyle,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",fontSize:13,fontWeight:600,color:"var(--accent)",textDecoration:"none",padding:14}}>{link.label} &#8599;</a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal nova/editar campanha */}
      {modalOpen&&(
        <>
          <div onClick={()=>setModalOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100}} />
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(480px,92vw)",maxHeight:"90vh",overflowY:"auto",zIndex:101,...cardStyle,padding:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:700,color:"var(--text-primary)",margin:0}}>Editar Campanha</h2>
              <button onClick={()=>setModalOpen(false)} style={{background:"none",border:"none",color:"var(--text-muted)",fontSize:22,cursor:"pointer",lineHeight:1}}>&times;</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Nome</label><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome da campanha" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Plataforma</label><select style={inputStyle} value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option value="meta">Meta</option><option value="google">Google</option><option value="organic">Organico</option><option value="email">Email</option></select></div>
                <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Objetivo</label><select style={inputStyle} value={form.objective} onChange={e=>setForm({...form,objective:e.target.value})}><option value="conversao">Conversao</option><option value="trafego">Trafego</option><option value="awareness">Awareness</option></select></div>
              </div>
              <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Budget Diario (R$)</label><input style={inputStyle} type="number" min="0" step="0.01" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="0.00" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Data Inicio</label><input style={inputStyle} type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} /></div>
                <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Data Fim (opcional)</label><input style={inputStyle} type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} /></div>
              </div>
              <div><label style={{...labelStyle,display:"block",marginBottom:6}}>Notas</label><textarea style={{...inputStyle,minHeight:80,resize:"vertical"}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Observacoes sobre a campanha..." /></div>
              <button style={{...btnPrimary,width:"100%",opacity:saving?0.6:1}} onClick={handleSave} disabled={saving}>{saving?"Salvando...":"Salvar"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
