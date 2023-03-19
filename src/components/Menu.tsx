import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { RocketLaunch, Plus } from 'phosphor-react'

import nodepadLogo from '@/images/logo.webp'
import { useEditor } from '@/contexts/EditorContext'
import { save } from '@/services/api'
import { CopyLinkModal } from './CopyLinkModal'

export function Menu() {
  const [createdNoteLink, setCreatedNoteLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { editor, codeSnippet, resetCodeSnippet } = useEditor()
  const router = useRouter()

  const isEditing = router.pathname === '/[id]'

  const newNote = () => {
    editor?.commands.setContent('')
    resetCodeSnippet()
    router.push({ pathname: '/' })
  }

  const saveNote = async () => {
    const html = editor?.getHTML()

    if (!html) return

    setIsLoading(true)

    const response = await save({
      html,
      codeSnippet,
    })

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    setCreatedNoteLink(
      `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}/${response.id}`,
    )

    setIsLoading(false)
  }

  const closeCopyLinkModal = () => {
    if (!createdNoteLink) return

    router.push({
      pathname: createdNoteLink,
    })

    setCreatedNoteLink(null)
  }

  const Button = () => {
    if (isEditing) {
      return (
        <button
          type="button"
          onClick={() => newNote()}
          contentEditable={false}
          className="text-xs bg-emerald-500 rounded px-3 py-2 flex items-center gap-1 text-white font-semibold hover:bg-emerald-600"
        >
          <Plus weight="bold" color="#FFF" size={14} />
          Create a new note
        </button>
      )
    }

    return (
      <button
        type="button"
        onClick={() => saveNote()}
        contentEditable={false}
        disabled={isLoading}
        className="text-xs bg-emerald-500 rounded px-3 py-2 flex items-center gap-1 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:hover:cursor-wait"
      >
        <RocketLaunch weight="bold" color="#FFF" size={14} />
        Save this note
      </button>
    )
  }

  return (
    <>
      <nav className="bg-omni-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Image
                  priority
                  className="h-16 w-auto"
                  src={nodepadLogo}
                  alt="Nodepad"
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Button />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CopyLinkModal link={createdNoteLink} onClose={closeCopyLinkModal} />
    </>
  )
}
