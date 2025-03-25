import { getUrlWithPath } from "../utils/UrlHelper";
import { gatherFlags } from "../utils/FlagUtils";

export interface AnalyticsOptions {
  withReferrer?: boolean;
  useBeacon?: boolean;
  flags?: any;
}

export class Analytics {
  private endpoint: string;
  private currentUrl: string;
  private pageLoadTime: number;
  private isFirstPageView: boolean = true;
  private customRoute: string | null = null;
  private customPath: string | null = null;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.currentUrl = getUrlWithPath();
    this.pageLoadTime = Date.now();
  }

  public async sendAnalytics(
    type: "pageview" | "event",
    data?: any,
    options?: AnalyticsOptions
  ): Promise<void> {
    let targetUrl = getUrlWithPath(this.customPath || undefined);
    const referrer = document.referrer;

    const payload: any = {
      o: targetUrl,
      current_url: window.location.href,
      sv: "0.1.3",
      ts: Date.now(),
      ...(this.customRoute && { dp: this.customRoute }),
      ...(options?.withReferrer && !referrer.includes(location.host)
        ? { r: referrer }
        : {}),
      ...(type === "event" && data ? { en: data.name, ed: data.data } : {}),
      f: await gatherFlags(options?.flags).catch(() => {}),
    };

    const path = type === "pageview" ? "view" : "event";
    const url = `${this.endpoint}/${path}`;

    if (options?.useBeacon && navigator.sendBeacon) {
      try {
        const payloadString = JSON.stringify(payload);
        navigator.sendBeacon(url, payloadString);
        return;
      } catch (error) {
        // Fallback para fetch
      }
    }
    try {
      await fetch(url, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      // Erro tratado de forma silenciosa.
    }
  }

  public async trackPageView(
    options: { withReferrer?: boolean } = {}
  ): Promise<void> {
    return this.sendAnalytics("pageview", undefined, {
      withReferrer: options.withReferrer,
    });
  }

  public async trackEvent(
    eventName: string,
    eventData: any,
    options?: AnalyticsOptions
  ): Promise<void> {
    return this.sendAnalytics(
      "event",
      { name: eventName, data: eventData },
      {
        withReferrer: true,
        flags: options?.flags,
        useBeacon: options?.useBeacon,
      }
    );
  }

  public enableSessionTracking(): void {
    fetch(`${this.endpoint}/session`, { method: "GET", keepalive: true }).catch(
      () => {}
    );
  }

  public handleUrlChange(newUrl?: string | URL): void {
    let urlObj: URL | null = null;
    if (newUrl) {
      urlObj =
        typeof newUrl === "string"
          ? new URL(newUrl, window.location.origin)
          : new URL(newUrl.href);
    }
    if (
      urlObj &&
      (urlObj.pathname !== new URL(this.currentUrl).pathname ||
        (urlObj.hash && urlObj.pathname === new URL(this.currentUrl).pathname))
    ) {
      this.trackPageView();
    }
  }

  public updateCurrentUrl(newPath?: string): void {
    this.currentUrl = getUrlWithPath(newPath);
  }
}
