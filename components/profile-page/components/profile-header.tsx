"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Mail, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ImageCrop, ImageCropContent, ImageCropApply, ImageCropReset } from "@/components/ui/shadcn-io/image-crop"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"

export default function ProfileHeader() {
  const [name, setName] = React.useState<string>("")
  const [email, setEmail] = React.useState<string>("")
  const [avatar, setAvatar] = React.useState<string>("")
  // Removido badge de plano ao lado do nome
  const fileRef = React.useRef<HTMLInputElement | null>(null)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const originalFileRef = React.useRef<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>("")
  const [joined, setJoined] = React.useState<string>("")
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const [cameraOpen, setCameraOpen] = React.useState(false)
  const [cropping, setCropping] = React.useState(false)

  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const me = await apiClient.me()
        if (cancel) return
        setName(me.name || (me as any).nomeCompleto || "")
        setEmail(me.email || "")
        setAvatar((me as any).avatar_url || (me as any).avatarUrl || "")
        // Plano não exibido mais ao lado do nome
        const j = (me as any).joined_at
        if (j) {
          const d = new Date(j)
          const fmt = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          setJoined(fmt)
        }
      } catch {}
    })()
    return () => { cancel = true }
  }, [])

  const ALLOWED_MIME = new Set(["image/jpeg","image/png","image/webp"])
  const MAX_DIM = 1024 // lado maior máximo configurável

  async function compressImage(file: File, zoom = 1): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // square center-crop com zoom
        const s = Math.min(img.width, img.height) / Math.max(1, zoom)
        const sx = Math.max(0, Math.floor(img.width / 2 - s / 2))
        const sy = Math.max(0, Math.floor(img.height / 2 - s / 2))
        const canvas = document.createElement('canvas')
        canvas.width = MAX_DIM; canvas.height = MAX_DIM
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, sx, sy, s, s, 0, 0, MAX_DIM, MAX_DIM)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Falha ao comprimir'))
          resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.82)
      }
      img.onerror = () => reject(new Error('Imagem inválida'))
      img.src = URL.createObjectURL(file)
    })
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_MIME.has(file.type)) {
      toast.error('Formato não suportado. Use JPG, PNG ou WebP.')
      return
    }
    try {
      originalFileRef.current = file
      setCropping(true)
      setPreviewUrl(URL.createObjectURL(file))
    } catch (err:any) {
      toast.error(err?.message || 'Não foi possível processar a imagem')
    }
  }

  const [saving, setSaving] = React.useState(false)
  async function uploadAvatar(file: File) {
    try {
      setSaving(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
      const fd = new FormData()
      fd.append("avatar", file)
      const res = await fetch(`${API_URL}/api/me/avatar`, { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json().catch(()=>({}))
      if (res.ok) {
        // Prefere o caminho relativo retornado pelo upload
        let direct = (data as any).avatar_path || (data as any).avatarUrl
        if (direct && typeof direct === 'string') {
          // Normaliza para sempre apontar para /app/avatars/arquivo (basePath)
          if (!/^https?:\/\//.test(direct)) {
            const fname = direct.replace(/^\/?((ui|app)\/avatars\/)?/, '')
            direct = `/app/avatars/${fname}`
          }
          setAvatar(direct)
        }
        // Ainda assim, recarrega o /me para sincronizar em todos os lugares
        try {
          const me = await apiClient.me()
          setAvatar((me as any).avatar_url || (me as any).avatarUrl || direct || avatar)
        } catch {}
        setPendingFile(null)
        setPreviewUrl("")
        toast.success('Foto atualizada com sucesso')
      } else if (res.status === 413) {
        toast.error('A imagem é muito grande (máx. 5 MB).')
      } else {
        toast.error((data as any)?.erro || 'Falha ao enviar imagem')
      }
    } catch {
      toast.error('Falha ao enviar imagem')
    } finally {
      setSaving(false)
    }
  }

  async function saveAvatar() {
    if (pendingFile) await uploadAvatar(pendingFile)
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const v = videoRef.current
      if (v) {
        ;(v as any).srcObject = stream as any
        v.play()
        setCameraOpen(true)
      }
    } catch {
      toast.error('Não foi possível acessar a câmera')
    }
  }

  function capturePhoto() {
    const v = videoRef.current
    if (!v) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(v,0,0)
    canvas.toBlob(async (blob)=>{
      if (!blob) return
      // comprime novamente para garantir tamanho
      const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' })
      try {
        originalFileRef.current = file
        setCropping(true)
        setPreviewUrl(URL.createObjectURL(file))
      } catch {
        setPendingFile(file)
        const fallbackUrl = URL.createObjectURL(file)
        setPreviewUrl(fallbackUrl)
      }
      const s:any = (v as any).srcObject
      s && s.getTracks && s.getTracks().forEach((t:any)=>t.stop())
      setCameraOpen(false)
    }, 'image/jpeg')
  }

  const initials = React.useMemo(() => {
    const p = (name || email || "").trim().split(/\s+/)
    return (p[0]?.[0] || "?") + (p[1]?.[0] || "")
  }, [name, email])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} alt={name || email || "Usuário"} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickAvatar} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full">
                  <Camera />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => fileRef.current?.click()}>Carregar arquivo</DropdownMenuItem>
                <DropdownMenuItem onClick={openCamera}>Tirar foto</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async ()=>{
                    try {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
                      const res = await fetch(`${API_URL}/api/me/avatar`, { method: 'DELETE', credentials: 'include' })
                      if (res.ok) {
                        const me = await apiClient.me().catch(()=>null)
                        setAvatar((me as any)?.avatar_url || (me as any)?.avatarUrl || "")
                        toast.success('Foto removida')
                      } else {
                        toast.error('Não foi possível remover a foto')
                      }
                    } catch { toast.error('Não foi possível remover a foto') }
                  }}
                >Remover foto</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{name || "Meu perfil"}</h1>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {email}
              </div>
              {joined && (
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  Desde {joined}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Button variant="outline" onClick={saveAvatar} disabled={saving}>{saving ? 'Salvando…' : 'Salvar foto'}</Button>
            )}
          </div>
        </div>
        {cameraOpen && (
          <div className="mt-4 rounded-md border p-3">
            <div className="flex items-center gap-3">
              <video ref={videoRef} className="max-h-48 rounded-md" />
              <div className="flex flex-col gap-2">
                <Button onClick={capturePhoto}>Capturar</Button>
                <Button variant="outline" onClick={()=>{ const v=videoRef.current as any; if(v&&v.srcObject){v.srcObject.getTracks().forEach((t:any)=>t.stop())}; setCameraOpen(false) }}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}
        {previewUrl && originalFileRef.current && cropping && (
          <div className="mt-4 space-y-2">
            <div className="text-sm">Ajustar recorte</div>
            <div className="rounded-md border p-2">
              <ImageCrop
                file={originalFileRef.current}
                maxImageSize={5 * 1024 * 1024}
                aspect={1}
                onCrop={(dataUrl) => {
                  try {
                    fetch(dataUrl)
                      .then(r => r.blob())
                      .then(b => {
                        const f = new File([b], 'avatar.jpg', { type: 'image/jpeg' })
                        setPendingFile(f)
                        setPreviewUrl(URL.createObjectURL(f))
                        // salva imediatamente e atualiza avatar
                        uploadAvatar(f).finally(()=> setCropping(false))
                      })
                  } catch {}
                }}
              >
                <ImageCropContent />
                <div className="flex items-center gap-2 pt-2">
                  <ImageCropApply asChild>
                    <Button variant="outline" size="sm">Aplicar</Button>
                  </ImageCropApply>
                  <ImageCropReset asChild>
                    <Button variant="ghost" size="sm" onClick={()=>{ setCropping(false); setPreviewUrl(""); originalFileRef.current=null; }}>Cancelar</Button>
                  </ImageCropReset>
                </div>
              </ImageCrop>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
