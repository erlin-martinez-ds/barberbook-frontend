import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import AdminPage from "./page-objects/AdminPage.js";
import BarberReservationsPage from "./page-objects/BarberReservationsPage.js";
import BookingPage from "./page-objects/BookingPage.js";
import { BASE_URL } from "./page-objects/BasePage.js";
import LoginPage from "./page-objects/LoginPage.js";

let driver;
let loginPage;
let adminPage;
let bookingPage;
let barberReservationsPage;

before(async () => {
  const options = new chrome.Options();
  options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
  options.addArguments("--window-size=1365,900");
  if (process.env.E2E_CHROME_BINARY) {
    options.setChromeBinaryPath(process.env.E2E_CHROME_BINARY);
  }

  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 20000, script: 10000 });

  loginPage = new LoginPage(driver);
  adminPage = new AdminPage(driver);
  bookingPage = new BookingPage(driver);
  barberReservationsPage = new BarberReservationsPage(driver);
});

after(async () => {
  if (driver) await driver.quit();
});

test("administrador actualiza disponibilidad y crea un servicio", async () => {
  await loginPage.signIn("admin@barberbook.test", "e2e-password");
  await adminPage.openFromNavigation();
  await adminPage.setMondayAvailability("09:00", "18:00");
  await adminPage.createService({
    name: "E2E Afeitado",
    description: "Servicio para pruebas automatizadas",
    price: 18000,
    duration: 20,
  });

  assert.equal(await driver.getCurrentUrl(), `${BASE_URL}/admin`);
});

test("cliente crea una reserva y no puede acceder al panel administrativo", async () => {
  await loginPage.clearSession();
  await loginPage.signIn("cliente@barberbook.test", "e2e-password");

  await driver.get(`${BASE_URL}/admin`);
  await driver.wait(async () => (await driver.getCurrentUrl()).endsWith("/no-autorizado"), 10000);
  assert.match(await driver.getCurrentUrl(), /\/no-autorizado$/);

  await bookingPage.createBooking({
    barberName: "Ana Torres",
    serviceName: "E2E Afeitado",
    dateTime: "2030-01-02T10:30",
  });
  assert.match(await driver.getCurrentUrl(), /\/reservas\/booking-\d+$/);
});

test("barbero confirma la solicitud de reserva del cliente", async () => {
  await loginPage.clearSession();
  await loginPage.signIn("barbero@barberbook.test", "e2e-password");
  await barberReservationsPage.confirmFirstPendingBooking();

  assert.match(await driver.findElement(By.css(".estado-reserva")).getText(), /Confirmada/);
});
