import React, { createContext, useContext } from 'react'
import { useEditor as useEditorHook, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Placeholder from '@tiptap/extension-placeholder'

import { EditorBlock } from '@/components/EditorBlock'
import { TrailingNode } from '@/components/TrailingNode'
import { DEFAULT_DESCRIPTION } from '@/config/seo.config'

interface EditorContextValue {
  editor: Editor | null
  codeSnippet: string
  setCodeSnippet: React.Dispatch<React.SetStateAction<string>>
  resetCodeSnippet: () => void
}

const EditorContext = createContext<EditorContextValue>(
  {} as EditorContextValue,
)

const initialCode = [
  `import 'isomorphic-fetch';`,
  ``,
  `fetch("https://api.github.com/users/joaopcm")`,
  `  .then((response) => response.json())`,
  `  .then((data) => {`,
  `    console.log(data);`,
  `  });`,
].join('\n')

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [codeSnippet, setCodeSnippet] = React.useState<string>(initialCode)

  const resetCodeSnippet = () => {
    setCodeSnippet(initialCode)
  }

  const editor = useEditorHook({
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none',
      },
    },
    extensions: [
      Document.extend({
        content: 'heading block*',
      }),
      StarterKit.configure({
        codeBlock: false,
        document: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Untitled'
          }

          if (node.type.name === 'editorBlock') {
            return ''
          }

          return DEFAULT_DESCRIPTION
        },
      }),
      EditorBlock,
      TrailingNode,
    ],
    content: ``,
  })

  return (
    <EditorContext.Provider
      value={{ editor, codeSnippet, setCodeSnippet, resetCodeSnippet }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const { editor, codeSnippet, setCodeSnippet, resetCodeSnippet } =
    useContext(EditorContext)

  return { editor, codeSnippet, setCodeSnippet, resetCodeSnippet }
}