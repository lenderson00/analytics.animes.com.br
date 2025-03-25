export class LocationParser {
  private cf: {
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
  };

  constructor(cf: {
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
  }) {
    if (!cf) {
      throw new Error("Cloudflare object is required");
    }

    this.cf = cf;
  }

  getLocation() {
    const location: Record<string, string> = {};

    if (this.cf.city) {
      location.city = this.cf.city;
    }

    if (this.cf.country) {
      location.country = this.cf.country;
    }

    if (this.cf.region) {
      location.region = this.cf.region;
    }

    if (this.cf.timezone) {
      location.timezone = this.cf.timezone;
    }

    return location;
  }
}
