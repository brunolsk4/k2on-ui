"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/apiClient"
import { Alert } from "@/components/ui/alert"

type KommoConta = { id:number; subdominio:string; associada?:boolean }
type MetaConta = { id:string; nome:string }

export default function WizardStepAccounts(){
  const [projetoId, setProjetoId] = React.useState<number | null>(null)
  const [templateId, setTemplateId] = React.useState<number | null>(null)
  const [projetoNome, setProjetoNome] = React.useState<string>("Associar Contas")
  const [kommo, setKommo] = React.useState<KommoConta[]>([])
  const [kommoSelecionada, setKommoSelecionada] = React.useState<number | null>(null)
  const [metaContas, setMetaContas] = React.useState<MetaConta[]>([])
  const [metaSelecionada, setMetaSelecionada] = React.useState<MetaConta | null>(null)
  const [required, setRequired] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)
  const [processoStatus, setProcessoStatus] = React.useState<string>("pendente")
  // Demais integrações
  const [pipedrive, setPipedrive] = React.useState<any[]>([])
  const [pipedriveSel, setPipedriveSel] = React.useState<number | null>(null)
  const [bitrix, setBitrix] = React.useState<any[]>([])
  const [bitrixSel, setBitrixSel] = React.useState<number | null>(null)
  const [activecampaign, setActivecampaign] = React.useState<any[]>([])
  const [activeSel, setActiveSel] = React.useState<number | null>(null)
  const [hotmart, setHotmart] = React.useState<any[]>([])
  const [hotmartSel, setHotmartSel] = React.useState<number | null>(null)
  const [kiwify, setKiwify] = React.useState<any[]>([])
  const [kiwifySel, setKiwifySel] = React.useState<number | null>(null)
  const [api4com, setApi4com] = React.useState<any[]>([])
  const [api4comSel, setApi4comSel] = React.useState<number | null>(null)
  const [googleConns, setGoogleConns] = React.useState<any[]>([])
  const [googleConnSel, setGoogleConnSel] = React.useState<number | null>(null)
  const [googleAccounts, setGoogleAccounts] = React.useState<any[]>([])
  const [googleAccountSel, setGoogleAccountSel] = React.useState<any | null>(null)

  React.useEffect(()=>{ try{ const sp = new URLSearchParams(window.location.search); const pid=Number(sp.get('projetoId')||0)||null; const tid=Number(sp.get('templateId')||0)||null; setProjetoId(pid); setTemplateId(tid) }catch{} },[])

  React.useEffect(()=>{ (async()=>{
    if (!projetoId) return
    try{ const p = await apiClient.request<any>(`/api/projects/${projetoId}`, { withAuth: true }); setProjetoNome(p?.nome ? `Projeto: ${p.nome}` : 'Associar Contas') } catch{}
  })() },[projetoId])

  React.useEffect(()=>{ (async()=>{
    if (!projetoId) return
    try{ const data = await apiClient.request<KommoConta[]>(`/api/projeto/${projetoId}/kommo-contas`, { withAuth: true }) as any; setKommo(Array.isArray(data)?data:[]); const assoc = (data||[]).find((c:any)=> c.associada); if (assoc) setKommoSelecionada(assoc.id) } catch{}
  })() },[projetoId])

  React.useEffect(()=>{ (async()=>{
    if (!projetoId) return
    try { const p:any = await apiClient.request(`/api/processos?projetoId=${projetoId}`, { withAuth: true }); if (p?.status) setProcessoStatus(String(p.status)) } catch {}
  })() }, [projetoId])

  // Carrega integrações obrigatórias do template e lista contas Meta disponíveis, se necessário
  React.useEffect(()=>{ (async()=>{
    if (!templateId) return
    try {
      const ints:any[] = await apiClient.request(`/api/templates/${templateId}/integracoes`, { withAuth: true }) as any
      const nomes = (Array.isArray(ints)?ints:[]).map((i:any)=> String(i?.nome||'').toLowerCase())
      setRequired(nomes)
      if (nomes.some(n=> n.includes('meta') || n.includes('facebook'))) {
        try { const lista:any = await apiClient.request('/api/meta/accounts', { withAuth: true }); setMetaContas(Array.isArray(lista)?lista:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('pipedrive'))) {
        try { const d:any = await apiClient.request('/api/pipedrive/conexoes', { withAuth: true }); setPipedrive(Array.isArray(d?.conexoes)?d.conexoes:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('bitrix'))) {
        try { const d:any = await apiClient.request('/api/bitrix/conexoes', { withAuth: true }); setBitrix(Array.isArray(d?.conexoes)?d.conexoes:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('activecampaign'))) {
        try { const d:any = await apiClient.request('/api/activecampaign/conexoes', { withAuth: true }); setActivecampaign(Array.isArray(d?.conexoes)?d.conexoes:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('hotmart'))) {
        try { const d:any = await apiClient.request('/api/hotmart/conexoes', { withAuth: true }); setHotmart(Array.isArray(d?.conexoes)?d.conexoes:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('kiwify'))) {
        try { const d:any = await apiClient.request('/api/kiwify/conexoes', { withAuth: true }); setKiwify(Array.isArray(d?.conexoes)?d.conexoes:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('api4com'))) {
        try { const d:any = await apiClient.request('/api/api4com/conexoes', { withAuth: true }); setApi4com(Array.isArray(d?.conexoes)?d.conexoes:[]) } catch {}
      }
      if (nomes.some(n=> n.includes('google') && n.includes('ads'))) {
        try { const d:any = await apiClient.request('/api/googleads/conexoes', { withAuth: true }); const arr = Array.isArray(d?.conexoes)?d.conexoes: (Array.isArray(d)?d:[]); setGoogleConns(arr); const first = arr?.[0]; if (first && projetoId) {
            setGoogleConnSel(Number(first.id));
            try { const r:any = await apiClient.request(`/api/googleads/listar-contas/${projetoId}/${first.id}`, { withAuth: true }); setGoogleAccounts(Array.isArray(r?.contas)?r.contas:[]) } catch {}
          } } catch {}
      }
    } catch {}
  })() },[templateId])

  async function salvarAssociacoes() {
    if (!projetoId) return
    setSaving(true)
    try {
      if (kommoSelecionada) {
        await apiClient.request(`/api/projeto/${projetoId}/kommo-contas`, { method: 'POST', body: { kommo_id: kommoSelecionada }, withAuth: true })
      }
      if (metaSelecionada) {
        await apiClient.request(`/api/projeto/conectar-contas`, { method: 'POST', body: { projeto_id: projetoId, contas: [{ id: metaSelecionada.id, nome: metaSelecionada.nome }] }, withAuth: true })
      }
      if (pipedriveSel) {
        await apiClient.request(`/api/projeto/${projetoId}/pipedrive-contas`, { method: 'POST', body: { pipedrive_id: pipedriveSel }, withAuth: true })
      }
      if (bitrixSel) {
        await apiClient.request(`/api/projeto/${projetoId}/bitrix`, { method: 'POST', body: { bitrix_id: bitrixSel }, withAuth: true })
      }
      if (activeSel) {
        await apiClient.request(`/api/projeto/${projetoId}/activecampaign-contas`, { method: 'POST', body: { activecampaign_id: activeSel }, withAuth: true })
      }
      if (hotmartSel) {
        await apiClient.request(`/api/projeto/${projetoId}/hotmart-contas`, { method: 'POST', body: { hotmart_id: hotmartSel }, withAuth: true })
      }
      if (kiwifySel) {
        await apiClient.request(`/api/projeto/${projetoId}/kiwify-contas`, { method: 'POST', body: { kiwify_id: kiwifySel }, withAuth: true })
      }
      if (api4comSel) {
        await apiClient.request(`/api/projeto/${projetoId}/api4com-contas`, { method: 'POST', body: { api4com_id: api4comSel }, withAuth: true })
      }
      if (googleConnSel && googleAccountSel) {
        await apiClient.request(`/api/googleads/projeto/${projetoId}`, { method: 'POST', withAuth: true, body: {
          googleads_id: googleConnSel,
          account_id: googleAccountSel.id,
          nome: googleAccountSel.nome || null,
          moeda: googleAccountSel.moeda || null,
          fuso_horario: googleAccountSel.fusoHorario || null,
          usa_mcc: false,
          mcc_id: null,
        }})
      }
      const q = new URLSearchParams({ ...(projetoId?{projetoId:String(projetoId)}:{} ), ...(templateId?{templateId:String(templateId)}:{}) }).toString()
      window.location.href = `/ui/wizard/step-status?${q}`
    } finally { setSaving(false) }
  }

  function logoFor(slug: string){
    const s = slug.toLowerCase()
    if (s.includes('kommo')) return '/ui/logos/kommo.png'
    if (s.includes('pipedrive')) return '/ui/logos/pipedrive.png'
    if (s.includes('bitrix')) return '/ui/logos/bitrix24.png'
    if (s.includes('active')) return '/ui/logos/activecampaign.png'
    if (s.includes('hotmart')) return '/ui/logos/hotmart.png'
    if (s.includes('kiwify')) return '/ui/logos/kiwify.png'
    if (s.includes('google')) return '/ui/logos/googleads.png'
    if (s.includes('meta')||s.includes('facebook')) return '/ui/logos/meta.png'
    if (s.includes('api4com')) return '/ui/logos/api4com.png'
    return '/ui/logos/placeholder.svg'
  }

  const kommoLogo = logoFor('kommo')

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={projetoNome} />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mt-2 mb-4 text-center">Associar Contas</h2>
          {(() => {
            const vis = {
              kommo: required.some(n=> n.includes('kommo')),
              meta: required.some(n=> (n.includes('meta') || n.includes('facebook'))),
              google: required.some(n=> (n.includes('google') && n.includes('ads'))),
              pipedrive: required.some(n=> n.includes('pipedrive')),
              bitrix: required.some(n=> n.includes('bitrix')),
              active: required.some(n=> n.includes('activecampaign')),
              hotmart: required.some(n=> n.includes('hotmart')),
              kiwify: required.some(n=> n.includes('kiwify')),
              api4com: required.some(n=> n.includes('api4com')),
            } as const
            const cardsCount = Object.values(vis).filter(Boolean).length
            const single = cardsCount === 1
            const gridClass = single
              ? 'grid grid-cols-1 justify-items-center gap-4'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-stretch'
            const cardClass = single ? 'w-full max-w-xl' : 'w-full h-full'
            return (
          <div className={gridClass}>

          {vis.kommo ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src={kommoLogo} alt="Kommo" className="h-7 w-7 rounded-sm" />
                <div>
                  <CardTitle className="text-base">Kommo</CardTitle>
                  <CardDescription>Selecione a conta Kommo a ser usada neste projeto.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {kommo.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta encontrada. Conecte a integração na etapa anterior.</div>
              ) : (
                <div className="space-y-2">
                  {kommo.map(c => (
                    <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${kommoSelecionada===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                      <div className="text-sm truncate pr-3">{c.subdominio}.kommo.com</div>
                      <input type="radio" name="kommo" checked={kommoSelecionada===c.id} onChange={()=> setKommoSelecionada(c.id)} disabled={processoStatus!=='pendente'} />
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.meta ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/meta.png" alt="Meta" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">Meta Ads</CardTitle>
                  <CardDescription>Escolha a conta de anúncios para este projeto.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {metaContas.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta listada. Conecte sua conta Meta na etapa anterior.</div>
              ) : (
                <div className="space-y-2">
                  {metaContas.map(c => (
                    <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${metaSelecionada?.id===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                      <div className="text-sm truncate pr-3">{c.nome} ({c.id})</div>
                      <input type="radio" name="meta" checked={metaSelecionada?.id===c.id} onChange={()=> setMetaSelecionada(c)} disabled={processoStatus!=='pendente'} />
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.google ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/googleads.png" alt="Google Ads" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">Google Ads</CardTitle>
                  <CardDescription>Selecione a conexão e a conta de anúncios.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {googleConns.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conexão Google Ads. <a className="text-primary underline" href={`/app/googleads-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Conexão</div>
                    {googleConns.map((c:any)=> (
                      <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${googleConnSel===Number(c.id)? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                        <div className="text-sm truncate pr-3">{c.nome || c.user_email || `Conexão ${c.id}`}</div>
                        <input type="radio" name="gconn" checked={googleConnSel===Number(c.id)} onChange={async ()=>{
                          setGoogleConnSel(Number(c.id));
                          if (projetoId) { try { const r:any = await apiClient.request(`/api/googleads/listar-contas/${projetoId}/${c.id}`, { withAuth: true }); setGoogleAccounts(Array.isArray(r?.contas)?r.contas:[]); setGoogleAccountSel(null) } catch {} }
                        }} disabled={processoStatus!=='pendente'} />
                      </label>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Conta</div>
                    {googleAccounts.length===0 ? (
                      <div className="text-sm text-muted-foreground">Nenhuma conta elegível encontrada para a conexão selecionada.</div>
                    ) : (
                      googleAccounts.map((a:any)=> (
                        <label key={a.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${googleAccountSel?.id===a.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                          <div className="text-sm truncate pr-3">{a.nome} ({a.id})</div>
                          <input type="radio" name="gacc" checked={googleAccountSel?.id===a.id} onChange={()=> setGoogleAccountSel(a)} disabled={processoStatus!=='pendente'} />
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.pipedrive ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/pipedrive.png" alt="Pipedrive" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">Pipedrive</CardTitle>
                  <CardDescription>Escolha a conta Pipedrive.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pipedrive.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta conectada. <a className="text-primary underline" href={`/app/pipedrive-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                pipedrive.map((c:any)=> (
                  <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${pipedriveSel===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                    <div className="text-sm truncate pr-3">{c.company_name || c.company_domain || `Conta ${c.id}`}</div>
                    <input type="radio" name="pipedrive" checked={pipedriveSel===c.id} onChange={()=> setPipedriveSel(c.id)} disabled={processoStatus!=='pendente'} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.bitrix ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/bitrix24.png" alt="Bitrix24" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">Bitrix24</CardTitle>
                  <CardDescription>Escolha a conta Bitrix.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {bitrix.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta conectada. <a className="text-primary underline" href={`/app/bitrix-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                bitrix.map((c:any)=> (
                  <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${bitrixSel===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                    <div className="text-sm truncate pr-3">{c.nome || `Conta ${c.id}`}</div>
                    <input type="radio" name="bitrix" checked={bitrixSel===c.id} onChange={()=> setBitrixSel(c.id)} disabled={processoStatus!=='pendente'} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.active ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/activecampaign.png" alt="ActiveCampaign" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">ActiveCampaign</CardTitle>
                  <CardDescription>Escolha a conta ActiveCampaign.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {activecampaign.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta conectada. <a className="text-primary underline" href={`/app/activecampaign-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                activecampaign.map((c:any)=> (
                  <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${activeSel===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                    <div className="text-sm truncate pr-3">{c.nome || c.account_name || `Conta ${c.id}`}</div>
                    <input type="radio" name="activecampaign" checked={activeSel===c.id} onChange={()=> setActiveSel(c.id)} disabled={processoStatus!=='pendente'} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.hotmart ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/hotmart.png" alt="Hotmart" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">Hotmart</CardTitle>
                  <CardDescription>Escolha a conta Hotmart.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {hotmart.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta conectada. <a className="text-primary underline" href={`/app/hotmart-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                hotmart.map((c:any)=> (
                  <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${hotmartSel===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                    <div className="text-sm truncate pr-3">{c.nome || `Conta ${c.id}`}</div>
                    <input type="radio" name="hotmart" checked={hotmartSel===c.id} onChange={()=> setHotmartSel(c.id)} disabled={processoStatus!=='pendente'} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.kiwify ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/kiwify.png" alt="Kiwify" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">Kiwify</CardTitle>
                  <CardDescription>Escolha a conta Kiwify.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {kiwify.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta conectada. <a className="text-primary underline" href={`/app/kiwify-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                kiwify.map((c:any)=> (
                  <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${kiwifySel===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                    <div className="text-sm truncate pr-3">{c.nome || `Conta ${c.id}`}</div>
                    <input type="radio" name="kiwify" checked={kiwifySel===c.id} onChange={()=> setKiwifySel(c.id)} disabled={processoStatus!=='pendente'} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>
          ) : null}

          {vis.api4com ? (
          <Card className={cardClass}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src="/ui/logos/api4com.png" alt="API4COM" className="h-7 w-7 rounded-sm" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/ui/logos/placeholder.svg'; (e.currentTarget as HTMLImageElement).onerror=null}} />
                <div>
                  <CardTitle className="text-base">API4COM</CardTitle>
                  <CardDescription>Selecione o token configurado.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {api4com.length===0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma conta conectada. <a className="text-primary underline" href={`/app/api4com-conectar?redirect=${encodeURIComponent(window.location.href)}`}>Conectar</a></div>
              ) : (
                api4com.map((c:any)=> (
                  <label key={c.id} className={`flex items-center justify-between rounded-md border px-3 py-2 min-h-12 ${api4comSel===c.id? 'border-primary' : 'border-border'} ${processoStatus!=='pendente'?'opacity-60 pointer-events-none':''}`}>
                    <div className="text-sm truncate pr-3">{c.nome || `Token ${c.id}`}</div>
                    <input type="radio" name="api4com" checked={api4comSel===c.id} onChange={()=> setApi4comSel(c.id)} disabled={processoStatus!=='pendente'} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>
          ) : null}
          </div>
            )
          })()}

          </div>

          {processoStatus==='executando' || processoStatus==='concluido' ? (
            <Alert variant="warning">
              Este projeto já possui uma instalação ativa. Para trocar a conta, entre em contato com o suporte.
            </Alert>
          ) : null}

          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="outline" onClick={()=>{
              const q = new URLSearchParams({ ...(projetoId?{projetoId:String(projetoId)}:{} ), ...(templateId?{templateId:String(templateId)}:{}) }).toString()
              window.location.href = `/app/wizard/step-integrations?${q}`
            }}>← Voltar</Button>
            <Button onClick={salvarAssociacoes} disabled={
              saving || (processoStatus!=='pendente')
              || (required.some(n=> n.includes('kommo')) && kommo.length>0 && !kommoSelecionada)
              || (required.some(n=> (n.includes('meta')||n.includes('facebook'))) && metaContas.length>0 && !metaSelecionada)
              || (required.some(n=> (n.includes('google')&&n.includes('ads'))) && googleConns.length>0 && (!googleConnSel || !googleAccountSel))
              || (required.some(n=> n.includes('pipedrive')) && pipedrive.length>0 && !pipedriveSel)
              || (required.some(n=> n.includes('bitrix')) && bitrix.length>0 && !bitrixSel)
              || (required.some(n=> n.includes('activecampaign')) && activecampaign.length>0 && !activeSel)
              || (required.some(n=> n.includes('hotmart')) && hotmart.length>0 && !hotmartSel)
              || (required.some(n=> n.includes('kiwify')) && kiwify.length>0 && !kiwifySel)
              || (required.some(n=> n.includes('api4com')) && api4com.length>0 && !api4comSel)
            }>
              Finalizar Configuração →
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
