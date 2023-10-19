import type { NextApiRequest, NextApiResponse } from 'next'

import { connectToDatabase } from '@/services/mongodb'
import { CACHE_DURATION, connectToCacheDatabase } from '@/services/upstash'
import { askAI } from '@/services/openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end()
    }

    if (!req.body.codeSnippet) {
      return res.status(400).json({
        message: 'Missing code snippet',
      })
    }

    if (!req.body.id) {
      return res.status(400).json({
        message: 'Missing ID',
      })
    }

    const cache = await connectToCacheDatabase()
    const note = await cache.get(`note-${req.body.id}`)

    if (!note) {
      const db = await connectToDatabase()

      const noteFromDB = await db.collection('notes').findOne({
        _id: req.body.id,
      })

      if (!noteFromDB) {
        return res.status(404).json({
          message: 'Note not found',
        })
      }
    }

    const cachedAnswer = await cache.get(`ai-explanation:${req.body.id}`)

    if (cachedAnswer) {
      return res.status(200).json({
        answer: cachedAnswer,
      })
    }

    const aiExplanation = await askAI(req.body.codeSnippet)

    await cache.set(
      `ai-explanation:${req.body.id}`,
      aiExplanation.data.choices[0].text,
      {
        ex: CACHE_DURATION,
      },
    )

    return res.status(200).json({
      answer: aiExplanation.data.choices[0].text,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Something went wrong',
    })
  }
}
