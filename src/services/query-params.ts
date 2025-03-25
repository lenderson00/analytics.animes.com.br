export class QueryParams {
  private queryParams: Record<string, string> = {};
  private utmParams: Record<string, string> = {};

  constructor(url: string) {
    this.parseUrl(url);
  }

  parseUrl(url: string) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.forEach((value, key) => {
        if (key.startsWith("utm_")) {
          this.utmParams[key] = value;
        } else {
          this.queryParams[key] = value;
        }
      });
    } catch (e) {
      // Caso a URL seja inválida, mantém queryParams e utms vazios
    }
  }

  getQueryParams() {
    return this.queryParams;
  }

  getUtmParams() {
    return this.utmParams;
  }
}
