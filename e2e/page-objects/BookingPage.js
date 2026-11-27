import { By, until } from "selenium-webdriver";
import BasePage from "./BasePage.js";

export default class BookingPage extends BasePage {
  async createBooking({ barberName, serviceName, dateTime }) {
    await this.open("/reservas/nueva");
    await this.driver.wait(
      until.elementLocated(By.css('select[name="barberId"]')),
      10000,
    );
    await this.driver.findElement(By.css('select[name="barberId"]')).sendKeys(barberName);
    await this.driver.findElement(By.css('select[name="serviceId"]')).sendKeys(serviceName);
    const dateInput = await this.driver.findElement(By.css('input[name="date"]'));
    await dateInput.sendKeys(dateTime);
    if (await dateInput.getAttribute("value") !== dateTime) {
      await this.driver.executeScript((input, value) => {
        const setValue = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        ).set;
        setValue.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, dateInput, dateTime);
    }
    if (await dateInput.getAttribute("value") !== dateTime) {
      throw new Error("No se pudo completar la fecha de la reserva.");
    }
    await this.driver.findElement(By.xpath(
      "//button[normalize-space()='Crear reserva']",
    )).click();
    await this.waitForHeading("Detalle de reserva");
    await this.waitForText(serviceName);
  }
}
