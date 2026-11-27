import { By } from "selenium-webdriver";
import BasePage from "./BasePage.js";

export default class AdminPage extends BasePage {
  async openFromNavigation() {
    await this.clickLink("Administración");
    await this.waitForHeading("Gestionar barbería");
  }

  async setMondayAvailability(startTime, endTime) {
    await this.driver.findElement(By.xpath(
      "//article[contains(@class,'admin__tarjeta')]//button[normalize-space()='Disponibilidad']",
    )).click();

    const monday = await this.driver.findElement(
      By.xpath("//label[contains(., 'Lunes')]//input[@type='checkbox']"),
    );
    if (!(await monday.isSelected())) await monday.click();

    const start = await this.driver.findElement(By.css('input[aria-label="Inicio MONDAY"]'));
    const end = await this.driver.findElement(By.css('input[aria-label="Fin MONDAY"]'));
    await start.clear();
    await start.sendKeys(startTime);
    await end.clear();
    await end.sendKeys(endTime);
    await this.driver.findElement(By.xpath(
      "//button[normalize-space()='Guardar horario']",
    )).click();
    await this.waitForText("Disponibilidad guardada correctamente.");
  }

  async createService({ name, description, price, duration }) {
    await this.driver.findElement(By.xpath("//button[@role='tab' and normalize-space()='Servicios']")).click();
    await this.driver.findElement(By.css('input[name="name"]')).sendKeys(name);
    await this.driver.findElement(By.css('textarea[name="description"]')).sendKeys(description);
    await this.driver.findElement(By.css('input[name="price"]')).sendKeys(String(price));
    await this.driver.findElement(By.css('input[name="duration"]')).sendKeys(String(duration));
    await this.driver.findElement(By.xpath(
      "//button[normalize-space()='Guardar servicio']",
    )).click();
    await this.waitForText("Servicio guardado correctamente.");
    await this.waitForText(name);
  }
}
