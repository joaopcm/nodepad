import { useEffect, useState } from 'react'
import { NextSeo } from 'next-seo'
import { GetServerSideProps } from 'next'

import { Editor } from '@/components/Editor'
import { useEditor } from '@/contexts/EditorContext'
import { Loading } from '@/components/Loading'
// import { connectToCacheDatabase } from '@/services/upstash'
import { useCounter } from '@/contexts/CounterContext'
import { get } from '@/services/api'

interface NoteProps {
  id: string
  count: number
}

export default function Note({ id, count }: NoteProps) {
  const { editor, setCodeSnippet } = useEditor()
  const { setCounter } = useCounter()
  const [isLoading, setIsLoading] = useState(true)

  setCounter(count)

  useEffect(() => {
    if (editor && id) {
      get(id)
        .then((data) => {
          editor.commands.setContent(data.html)
          setCodeSnippet(data.codeSnippet)
        })
        .finally(() => setIsLoading(false))
    }
  }, [editor, id, setCodeSnippet])

  return (
    <>
      <Loading isLoading={isLoading} />
      <NextSeo noindex />

      <Editor />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query
  // const redis = await connectToCacheDatabase()

  // const count = await redis.incr(`counter:${id}`)

  return {
    props: {
      count: 0,
      id,
    },
  }
}
