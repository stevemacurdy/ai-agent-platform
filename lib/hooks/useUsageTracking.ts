'use client';
import { useEffect, useCallback } from 'react';

/**
 * Track a console view. Call once per page mount.
 * Fire-and-forget — never blocks UI.
 */
export function useTrackConsoleView(agentSlug: string) {
  useEffect(() => {
    if (!agentSlug) return;
    fetch('/api/usage/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentSlug, actionType: 'console_view' }),
    }).catch(() => {});
  }, [agentSlug]);
}

/**
 * Track a demo view. Call once per demo page mount.
 */
export function useTrackDemoView(agentSlug: string) {
  useEffect(() => {
    if (!agentSlug) return;
    fetch('/api/usage/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentSlug, actionType: 'demo_view' }),
    }).catch(() => {});
  }, [agentSlug]);
}

/**
 * Track an AI generation action. Call when an AI button is clicked.
 */
export function trackAiAction(agentSlug: string, actionDetail: string, tokensUsed?: number) {
  fetch('/api/usage/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentSlug,
      actionType: 'ai_generation',
      actionDetail,
      tokensUsed,
    }),
  }).catch(() => {});
}

/**
 * Track an API call (GET or POST). Use in API routes.
 */
export function trackApiCall(agentSlug: string, method: 'get' | 'post', detail?: string) {
  fetch('/api/usage/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentSlug,
      actionType: method === 'get' ? 'api_get' : 'api_post',
      actionDetail: detail,
    }),
  }).catch(() => {});
}

/**
 * Hook that returns a stable track function for use in handlers.
 */
export function useTracker(agentSlug: string) {
  const track = useCallback((actionType: string, actionDetail?: string, tokensUsed?: number) => {
    fetch('/api/usage/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentSlug, actionType, actionDetail, tokensUsed }),
    }).catch(() => {});
  }, [agentSlug]);

  return track;
}
