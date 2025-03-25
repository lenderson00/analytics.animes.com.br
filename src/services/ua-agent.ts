import { UAParser } from "@ua-parser-js/pro-personal";

export class UAAgenteParser {
  private parser: UAParser;

  constructor(parser: UAParser) {
    this.parser = parser;
  }

  getDeviceType() {
    const result = this.parser.getDevice();

    if (!result) {
      const userAgent = this.parser.getUA();

      const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent)
        ? "Mobile"
        : "Desktop";
      return {
        type: deviceType,
        vendor: "unknown",
        model: "unknown",
      };
    }

    return {
      type: result.type,
      vendor: result.vendor,
      model: result.model,
    };
  }

  getCurrentBrowser() {
    const result = this.parser.getBrowser();
    return {
      name: result.name,
      version: result.version,
      major: result.major,
      type: result.type,
    };
  }

  getCurrentOS() {
    const result = this.parser.getOS();
    return {
      name: result.name,
      version: result.version,
    };
  }

  getCurrentDevice() {
    const result = this.parser.getDevice();
    return {
      type: result.type,
      vendor: result.vendor,
      model: result.model,
    };
  }

  getCurrentEngine() {
    const result = this.parser.getEngine();
    return {
      name: result.name,
      version: result.version,
    };
  }

  getCPUArchitecture() {
    const result = this.parser.getCPU();
    return {
      architecture: result.architecture,
    };
  }

  getAllUserAgentInfo() {
    const result = this.parser.getResult();
    return {
      userAgent: result.ua,
      browser: this.getCurrentBrowser(),
      os: this.getCurrentOS(),
      device: this.getCurrentDevice(),
      engine: this.getCurrentEngine(),
      cpu: this.getCPUArchitecture(),
    };
  }
}
