import { useEffect } from 'react'
import { NextSeo } from 'next-seo'
import { GetServerSideProps } from 'next'

import { Editor } from '@/components/Editor'
import { useEditor } from '@/contexts/EditorContext'
// import { Loading } from '@/components/Loading'
import { connectToCacheDatabase } from '@/services/upstash'
import { useCounter } from '@/contexts/CounterContext'
import { get } from '@/services/api'

interface NoteProps {
  count: number
  note: {
    html: string
    codeSnippet: string
  }
}

export default function Note({ count, note }: NoteProps) {
  const { editor, setCodeSnippet } = useEditor()
  const { setCounter } = useCounter()

  useEffect(() => {
    setCounter(count)
  }, [setCounter, count])

  useEffect(() => {
    if (!editor) return

    editor.commands.setContent(note.html)
    setCodeSnippet(note.codeSnippet)
  }, [editor, setCodeSnippet, note])

  return (
    <>
      <NextSeo noindex />

      <Editor />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query

  if (!id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const redis = await connectToCacheDatabase()
  const count = await redis.incr(`counter:${id}`)
  const note = await get(id as string)

  return {
    props: {
      count,
      note,
    },
  }
}
