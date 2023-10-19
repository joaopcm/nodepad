import React, { createContext, useContext } from 'react'
import { useEditor as useEditorHook, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'

import { EditorBlock } from '@/components/EditorBlock'
import { TrailingNode } from '@/components/TrailingNode'

interface EditorContextValue {
  editor: Editor | null
  codeSnippet: string
  setCodeSnippet: React.Dispatch<React.SetStateAction<string>>
}

const EditorContext = createContext<EditorContextValue>(
  {} as EditorContextValue,
)

export const initialCode = [
  `fetch("https://api.github.com/users/joaopcm")`,
  `  .then((response) => response.json())`,
  `  .then((data) => {`,
  `    console.log(data);`,
  `  });`,
].join('\n')

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [codeSnippet, setCodeSnippet] = React.useState<string>(initialCode)

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
      Link.configure({
        HTMLAttributes: {
          class: 'text-emerald-500 hover:text-emerald-600 hover:cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Untitled'
          }

          if (node.type.name === 'editorBlock') {
            return ''
          }

          return 'Start typing or press ⌘ + K to open the command palette...'
        },
      }),
      EditorBlock,
      TrailingNode,
    ],
    content: ``,
  })

  return (
    <EditorContext.Provider value={{ editor, codeSnippet, setCodeSnippet }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const { editor, codeSnippet, setCodeSnippet } = useContext(EditorContext)

  return { editor, codeSnippet, setCodeSnippet }
}
