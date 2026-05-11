'use client'
import { useState } from 'react'

const ADSETS = [
  { id:'120241792501090290', nome:'Maes Pos-parto', cor:'#7C9E87', interesse:'Pos-parto amamentacao emagrecimento', budget:30, utm:'maes-pos-parto', ads:[{nome:'Copy A - Dor',status:'em_processamento'},{nome:'Copy B - Objetivo',status:'em_processamento'}] },
  { id:'120241792500790290', nome:'Reeducacao Alimentar', cor:'#B8956A', interesse:'Reeducacao alimentar nutricao dieta', budget:30, utm:'interesse-reeducacao', ads:[{nome:'Copy A - Dor',status:'em_analise'},{nome:'Copy C - Social proof',status:'programado'}] },
  { id:'120241792499860290', nome:'Interesse Emagrecimento', cor:'#8B9DBF', interesse:'Emagrecimento perda de peso fitness', budget:30, utm:'interesse-emagrecimento', ads:[{nome:'Copy A - Dor',status:'programado'},{nome:'Copy B - Objetivo',status:'programado'}] },
]

const STATUS_MAP: Record<string,{label:string;bg:string;color:string}> = {
  em_processamento:{label:'Em processamento',bg:'#FBF0E0',color:'#7A5C2E'},
  em_analise:{label:'Em analise',bg:'#EEF1F8',color:'#4A5B8A'},
  programado:{label:'Programado',bg:'#E8F5EE',color:'#3A6B4F'},
}

export function MapaCampanhas() {
  const [aba, setAba] = useState<'mapa'|'funil'>('mapa')
  const [aberto, setAberto] = useState<string|null>(ADSETS[0].id)

  return (
    <div style={{fontFamily:'inherit',color:'var(--text-primary)'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>Mapa da Campanha</div>
          <div style={{fontSize:12,color:'var(--text-secondary)'}}>LONG-AQ-01 &middot; 3 publicos &middot; 6 anuncios &middot; R$90/dia &middot; Abr 2026</div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>setAba('mapa')} style={{padding:'6px 14px',borderRadius:6,border:'0.5px solid var(--border-default)',background:aba==='mapa'?'var(--accent)':'var(--bg-secondary)',color:aba==='mapa'?'#fff':'var(--text-secondary)',fontSize:13,fontWeight:aba==='mapa'?600:400,cursor:'pointer'}}>Mapa</button>
          <button onClick={()=>setAba('funil')} style={{padding:'6px 14px',borderRadius:6,border:'0.5px solid var(--border-default)',background:aba==='funil'?'var(--accent)':'var(--bg-secondary)',color:aba==='funil'?'#fff':'var(--text-secondary)',fontSize:13,fontWeight:aba==='funil'?600:400,cursor:'pointer'}}>Funil</button>
          <a href='https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=837047967961012&selected_campaign_ids=120241789342370290' target='_blank' rel='noreferrer' style={{padding:'6px 14px',borderRadius:6,border:'0.5px solid var(--accent)',color:'var(--accent)',fontSize:13,textDecoration:'none'}}>Ads Manager ↗</a>
        </div>
      </div>

      {/* Resumo */}
      <div style={{background:'var(--bg-secondary)',border:'0.5px solid var(--border-default)',borderRadius:10,padding:'12px 16px',marginBottom:14,display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{flex:1,minWidth:160}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>Campanha</div>
          <div style={{fontSize:13,fontWeight:600}}>LONG-AQ-01-Conversao-Pioneer-Mar2026</div>
          <div style={{fontSize:11,color:'var(--text-secondary)',marginTop:1}}>Objetivo: Conversao — Compra no site</div>
        </div>
        {[['Budget/dia','R$90'],['Ad sets','3'],['Anuncios','6'],['Periodo','Abr 2026']].map(([l,v])=>(
          <div key={l} style={{background:'var(--bg-card)',border:'0.5px solid var(--border-default)',borderRadius:8,padding:'8px 14px',textAlign:'center',minWidth:70}}>
            <div style={{fontSize:10,color:'var(--text-secondary)',textTransform:'uppercase'}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>

      {aba === 'mapa' && (
        <>
          {ADSETS.map(adset=>(
            <div key={adset.id} style={{border:'0.5px solid var(--border-default)',borderRadius:10,overflow:'hidden',background:'var(--bg-card)',marginBottom:10}}>
              <button onClick={()=>setAberto(aberto===adset.id?null:adset.id)} style={{width:'100%',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:12,padding:'12px 16px',textAlign:'left'}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:adset.cor,flexShrink:0}} />
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{adset.nome}</div>
                  <div style={{fontSize:11,color:'var(--text-secondary)',marginTop:1}}>Mulheres 30-50 &middot; Brasil &middot; R${adset.budget}/dia &middot; {adset.ads.length} anuncios</div>
                </div>
                <span style={{color:'var(--text-secondary)',fontSize:12}}>{aberto===adset.id?'▲':'▼'}</span>
              </button>
              {aberto===adset.id&&(
                <div style={{borderTop:'0.5px solid var(--border-default)',padding:'12px 16px'}}>
                  <div style={{background:'var(--bg-secondary)',borderRadius:8,padding:'10px 14px',marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',marginBottom:6}}>Publico</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {['Mulheres 30-50 anos','Brasil',adset.interesse].map(t=>(
                        <span key={t} style={{background:'var(--bg-card)',border:'0.5px solid var(--border-default)',borderRadius:4,padding:'3px 8px',fontSize:12}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',marginBottom:8}}>Anuncios</div>
                  {adset.ads.map(ad=>{ const st=STATUS_MAP[ad.status]; const url='longetividade.com.br/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01&utm_content='+adset.utm; return (
                    <div key={ad.nome} style={{border:'0.5px solid var(--border-subtle)',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:6}}>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{ad.nome}</div><div style={{fontSize:11,color:'var(--text-secondary)'}}>Feed 1080x1080</div></div>
                        {st&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:4,background:st.bg,color:st.color,fontWeight:600}}>{st.label}</span>}
                        <a href={'https://'+url} target='_blank' rel='noreferrer' style={{fontSize:11,color:'var(--accent)',textDecoration:'none',padding:'2px 8px',borderRadius:4,border:'0.5px solid var(--accent)'}}>Ver landing ↗</a>
                      </div>
                      <div style={{background:'var(--bg-secondary)',borderRadius:6,padding:'6px 10px',fontSize:11,fontFamily:'monospace',color:'var(--text-secondary)',wordBreak:'break-all'}}>{url}</div>
                    </div>
                  );})}
                </div>
              )}
            </div>
          ))}

          {/* Destino */}
          <div style={{border:'0.5px solid #D5E8D4',borderRadius:10,padding:'14px 18px',background:'rgba(90,160,100,0.06)',marginTop:4,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,color:'#3A6B4F',textTransform:'uppercase',marginBottom:8}}>Destino — todos os anuncios levam para:</div>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>Emgreca Sem Dieta — Metodo S.E.M</div><div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>CTA: Quero Meu Ebook — Apenas R$67</div></div>
              <div style={{background:'var(--bg-secondary)',border:'0.5px solid #D5E8D4',borderRadius:8,padding:'8px 14px',fontSize:12,fontFamily:'monospace',color:'#3A6B4F'}}>longetividade.com.br/c/instagram</div>
            </div>
          </div>

          {/* Regras */}
          <div style={{border:'0.5px solid #E8E0D0',borderRadius:10,padding:'12px 18px',background:'rgba(180,130,60,0.05)'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#7A5C2E',textTransform:'uppercase',marginBottom:10}}>Regras de decisao (nao mexer antes do Day 4)</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
              {[['Cortar','CPA > R$55 ou CTR < 0,8%','#A03030'],['Escalar','Melhor ROAS — dobrar budget','#3A6B4F'],['Timeline','Learning D1-3 · Review D4 · Go/no-go D7','#2C2C2A']].map(([t,d,c])=>(
                <div key={t} style={{background:'var(--bg-card)',border:'0.5px solid var(--border-default)',borderRadius:8,padding:'8px 12px'}}>
                  <div style={{fontSize:11,color:'var(--text-secondary)',marginBottom:2}}>{t}</div>
                  <div style={{fontSize:12,fontWeight:600,color:c as string}}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {aba === 'funil' && (
        <div>
          <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20}}>Jornada completa do clique no anuncio ate o email de boas-vindas</div>
          {[
            {icon:'📱',etapa:'Anuncio Meta Ads',desc:'3 publicos x 2 criativos = 6 anuncios'},
            {icon:'🌐',etapa:'Landing /c/instagram',desc:'longetividade.com.br — CTA Quero Meu Ebook R$67'},
            {icon:'💳',etapa:'Checkout Hotmart',desc:'Pix, boleto, cartao de credito'},
            {icon:'✅',etapa:'Pagina /obrigado',desc:'Confirmacao + upsell Completo/VIP'},
            {icon:'📧',etapa:'Sequencia Brevo',desc:'5 emails nurture automaticos'},
          ].map((f,i,arr)=>(
            <div key={f.etapa} style={{display:'flex',gap:0}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:40,flexShrink:0}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:'var(--accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{f.icon}</div>
                {i<arr.length-1&&<div style={{width:2,flex:1,background:'var(--border-default)',minHeight:20}} />}
              </div>
              <div style={{flex:1,paddingLeft:14,paddingBottom:i<arr.length-1?20:0,paddingTop:4}}>
                <div style={{fontSize:14,fontWeight:600}}>{f.etapa}</div>
                <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{f.desc}</div>
              </div>
            </div>
          ))}
          <div style={{border:'0.5px solid var(--border-default)',borderRadius:10,overflow:'hidden',marginTop:24}}>
            <div style={{background:'var(--bg-secondary)',padding:'10px 16px',fontSize:12,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase'}}>Produtos no checkout</div>
            {[['Basico','R$67','Ebook Emgreca Sem Dieta'],['Completo','R$147','Ebook + Bonus'],['VIP','R$297','Ebook + Bonus + App PWA vitalicio']].map(([p,v,d],i)=>(
              <div key={p} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderTop:i>0?'0.5px solid var(--border-default)':'none'}}>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p}</div><div style={{fontSize:11,color:'var(--text-secondary)'}}>{d}</div></div>
                <div style={{fontSize:20,fontWeight:700,color:'var(--accent)'}}>{v}</div>
                <div style={{fontSize:11,color:'var(--text-secondary)',background:'var(--bg-secondary)',padding:'2px 8px',borderRadius:4}}>Hotmart</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
