import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  constructor() {}

  public getConfigURL(): string {
    return "./assets/config/terminus-allergies-config.json?V" + Math.random();
  }
}
