export type GeoLocation = {
  city?: string;
  country?: string;
  region?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export class LocationParser {
  private cf: GeoLocation;

  constructor(cf: GeoLocation) {
    if (!cf) {
      throw new Error("Cloudflare object is required");
    }

    this.cf = cf;
  }

  getLocation() {
    const location: GeoLocation = {};

    const keys = Object.keys(this.cf) as (keyof GeoLocation)[];

    for (const key of keys) {
      const value = this.cf[key];
      if (value !== undefined && value !== null) {
        // @ts-ignore
        location[key] = value;
      }
    }

    return location;
  }
}
