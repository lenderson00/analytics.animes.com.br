export type GeoLocation = {
  city?: string;
  country?: string;
  region?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  asOrganization?: string;
};

export class LocationParser {
  private cf: GeoLocation;

  constructor(cf?: GeoLocation) {
    this.cf = cf || {};
  }

  getLocation(): GeoLocation {
    if (!this.cf || Object.keys(this.cf).length === 0) {
      return {};
    }

    const location: GeoLocation = {};
    const keys = [
      "city",
      "country",
      "region",
      "continent",
      "latitude",
      "longitude",
      "timezone",
      "asOrganization",
    ] as const;

    for (const key of keys) {
      const value = this.cf[key];
      if (value !== undefined && value !== null) {
        // @ts-ignore
        location[key] = value;
      }
    }

    const {
      city,
      country,
      region,
      continent,
      latitude,
      longitude,
      timezone,
      asOrganization,
    } = location;

    return {
      city,
      country,
      region,
      continent,
      latitude,
      longitude,
      timezone,
      asOrganization,
    };
  }
}
