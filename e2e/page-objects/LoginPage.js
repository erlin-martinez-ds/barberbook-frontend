import { By, until } from "selenium-webdriver";
import BasePage from "./BasePage.js";

export default class LoginPage extends BasePage {
  async signIn(email, password) {
    await this.open("/login");
    const emailField = await this.driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      10000,
    );
    await emailField.sendKeys(email);
    await this.driver.findElement(By.css('input[type="password"]')).sendKeys(password);
    await this.driver.findElement(By.css('button[type="submit"]')).click();
    await this.driver.wait(until.urlContains("/dashboard"), 10000);
  }

  async clearSession() {
    await this.open("/");
    await this.driver.executeScript("window.localStorage.clear();");
    await this.driver.manage().deleteAllCookies();
    await this.driver.navigate().refresh();
  }
}
