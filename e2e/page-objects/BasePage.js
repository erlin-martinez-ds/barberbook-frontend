import { By, until } from "selenium-webdriver";

export const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const WAIT_MS = 10000;

export default class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async open(path) {
    await this.driver.get(`${BASE_URL}${path}`);
  }

  async waitForHeading(text) {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(By.css("h1")),
        WAIT_MS,
      );
      await this.driver.wait(until.elementIsVisible(heading), WAIT_MS);
      await this.driver.wait(until.elementTextContains(heading, text), WAIT_MS);
      return heading;
    } catch (error) {
      const body = await this.driver.findElement(By.css("body")).getText();
      throw new Error(`No apareció el encabezado "${text}" en ${await this.driver.getCurrentUrl()}. Contenido: ${body}`, { cause: error });
    }
  }

  async clickLink(text) {
    const link = await this.driver.wait(
      until.elementLocated(By.linkText(text)),
      WAIT_MS,
    );
    await this.driver.wait(until.elementIsVisible(link), WAIT_MS);
    await link.click();
  }

  async waitForText(text) {
    await this.driver.wait(async () => {
      const body = await this.driver.findElement(By.css("body")).getText();
      return body.includes(text);
    }, WAIT_MS);
  }
}
