import { By } from "selenium-webdriver";
import BasePage from "./BasePage.js";

export default class BarberReservationsPage extends BasePage {
  async confirmFirstPendingBooking() {
    await this.open("/reservas");
    await this.waitForHeading("Reservas recibidas");
    await this.driver.findElement(By.xpath(
      "//button[normalize-space()='Confirmar']",
    )).click();
    await this.waitForText("Confirmada");
  }
}
