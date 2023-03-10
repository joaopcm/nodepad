import { WebContainer } from '@webcontainer/api'
import { Dispatch, SetStateAction } from 'react'
import ANSIToHTML from 'ansi-to-html'

let webContainerInstance: WebContainer
const ANSIConverter = new ANSIToHTML()

export async function getWebContainerInstance() {
  if (!webContainerInstance) {
    webContainerInstance = await WebContainer.boot()
  }

  return webContainerInstance
}

export async function printNodeJSVersion(
  setOutput: Dispatch<SetStateAction<string[]>>,
) {
  const container = await getWebContainerInstance()
  const nodeVersionProcess = await container.spawn('node', ['-v'])

  nodeVersionProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        setOutput((state) => [...state, `âšī¸ Using Node.js ${data}`])
      },
    }),
  )
}

export async function installDependencies(
  setOutput: Dispatch<SetStateAction<string[]>>,
  dependenciesToInstall: string[],
) {
  const container = await getWebContainerInstance()

  setOutput(['đ Looking for dependencies to install...'])
  setOutput((state) => [
    ...state,
    `đĻ Found ${dependenciesToInstall.length} dependencies to install!`,
  ])

  setOutput((state) => [...state, '---------', 'đ§ Installing dependencies...'])

  const installProcess = await container.spawn('pnpm', ['i'])

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        setOutput((state) => [...state, ANSIConverter.toHtml(data)])
      },
    }),
  )

  return installProcess.exit
}

export async function runCode(setOutput: Dispatch<SetStateAction<string[]>>) {
  const container = await getWebContainerInstance()

  setOutput((state) => [...state, '---------', 'đ Running the application!'])

  const startProcess = await container.spawn('pnpm', ['start'])

  startProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        setOutput((state) => [...state, ANSIConverter.toHtml(data)])
      },
    }),
  )

  container.on('server-ready', (port, url) => {
    setOutput((state) => [...state, `đ Server is running on ${url}`])
  })

  return startProcess.exit
}
