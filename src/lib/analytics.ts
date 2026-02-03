// Track page view
export async function trackPageView(page?: string): Promise<void> {
  // Only track in production
  if (import.meta.env.DEV) {
    console.log('[Analytics] Page view tracked (dev mode):', page || window.location.pathname);
    return;
  }

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: page || window.location.pathname,
        referrer: document.referrer,
      }),
    });
  } catch (error) {
    console.error('[Analytics] Failed to track page view:', error);
  }
}

// Track event (for future use)
export async function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Event tracked (dev mode):', eventName, properties);
    return;
  }

  // Can be expanded to send events to analytics backend
  console.log('[Analytics] Event:', eventName, properties);
}
