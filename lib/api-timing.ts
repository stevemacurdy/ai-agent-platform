// lib/api-timing.ts
// Wraps API route handlers to log response times.
// Usage: export const POST = withTiming(async (req) => { ... })

import { NextRequest, NextResponse } from 'next/server'

const SLOW_THRESHOLD_MS = 3000

type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse | Response>

export function withTiming(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    const start = Date.now()
    const pathname = req.nextUrl.pathname

    try {
      const response = await handler(req, context)
      const duration = Date.now() - start

      // Add timing header to every response
      const headers = new Headers(response.headers)
      headers.set('Server-Timing', `total;dur=${duration}`)

      if (duration > SLOW_THRESHOLD_MS) {
        console.warn(`[SLOW] ${req.method} ${pathname} took ${duration}ms`)
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[ERROR] ${req.method} ${pathname} failed after ${duration}ms`, error)
      throw error
    }
  }
}
