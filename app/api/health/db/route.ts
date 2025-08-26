import { NextResponse } from 'next/server'
import getMongoClient from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const client = await getMongoClient()
    // Use the admin DB to issue a ping command
    const adminDb = client.db('admin')
    await adminDb.command({ ping: 1 })

    return NextResponse.json(
      { status: 'ok' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    // Log sanitized error to avoid leaking sensitive details
    const message =
      error && typeof error === 'object' && 'message' in (error as any)
        ? (error as any).message
        : String(error)
    console.error('Health check failed:', message)
    return NextResponse.json(
      { status: 'error' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
