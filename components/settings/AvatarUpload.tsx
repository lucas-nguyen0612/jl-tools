'use client'

import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUploadAvatarMutation, useRemoveAvatarMutation } from '@/hooks/useSettings'
import { MAX_SIZE_BYTES, ALLOWED_MIME } from '@/features/settings/profile-schemas'
import { getAvatarSrc, resizeAvatarFile } from '@/lib/avatar'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
}

export function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const t = useTranslations('settings.profile')
  const tCommon = useTranslations('common')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [clientError, setClientError] = useState<string | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [, startTransition] = useTransition()

  const uploadMutation = useUploadAvatarMutation(userId)
  const removeMutation = useRemoveAvatarMutation(userId)

  const displaySrc = getAvatarSrc(previewUrl)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setClientError(null)

    if (file.size > MAX_SIZE_BYTES) {
      setClientError(t('sizeLimitError'))
      e.target.value = ''
      return
    }

    if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
      setClientError(t('typeError'))
      e.target.value = ''
      return
    }

    e.target.value = ''

    let resized: File
    try {
      resized = await resizeAvatarFile(file)
    } catch {
      setClientError('Could not read this image — try another file')
      return
    }

    const objectUrl = URL.createObjectURL(resized)
    setPreviewUrl(objectUrl)

    const formData = new FormData()
    formData.append('file', resized)

    startTransition(() => {
      uploadMutation.mutate(formData, {
        onSuccess: (result) => {
          if (result.error) {
            setPreviewUrl(currentAvatarUrl)
            setClientError(result.error.message)
          } else if (result.data) {
            setPreviewUrl(result.data.avatar_url)
          }
          URL.revokeObjectURL(objectUrl)
        },
        onError: () => {
          setPreviewUrl(currentAvatarUrl)
          setClientError('Upload failed — please try again')
          URL.revokeObjectURL(objectUrl)
        },
      })
    })
  }

  function handleRemoveConfirm() {
    setRemoveDialogOpen(false)
    removeMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.error) {
          setClientError(result.error.message)
        } else {
          setPreviewUrl(null)
        }
      },
      onError: () => {
        setClientError('Remove failed — please try again')
      },
    })
  }

  const isLoading = uploadMutation.isPending || removeMutation.isPending

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid var(--jl-line)',
          flexShrink: 0,
          background: 'var(--jl-bg-sunken)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displaySrc}
          alt={t('avatarLabel')}
          width={80}
          height={80}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-label={t('uploadCta')}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? t('saving') : t('uploadCta')}
          </Button>

          {(previewUrl ?? currentAvatarUrl) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => setRemoveDialogOpen(true)}
              style={{ color: 'var(--jl-destructive, #ef4444)' }}
            >
              {t('removeCta')}
            </Button>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--jl-text-faint)', margin: 0 }}>
          {t('uploadHint')}
        </p>

        {clientError && (
          <p
            role="alert"
            style={{ fontSize: 12, color: 'var(--jl-destructive, #ef4444)', margin: 0 }}
          >
            {clientError}
          </p>
        )}
      </div>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('removeCta')}</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 14, color: 'var(--jl-text-soft)' }}>
            Your profile picture will be reset to the default. This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRemoveDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveConfirm}
            >
              {t('removeCta')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
