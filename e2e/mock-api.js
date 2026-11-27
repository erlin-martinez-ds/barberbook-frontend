import { createServer } from "node:http";

const initialBarbers = [
  {
    _id: "barber-1",
    user: { name: "Ana Torres", email: "ana@example.com" },
    specialties: ["Corte clásico"],
    yearsExperience: 5,
    availability: [],
  },
];

const initialServices = [
  {
    _id: "service-1",
    name: "Corte clásico",
    description: "Corte tradicional",
    price: 25000,
    duration: 30,
  },
];

function send(response, status, data) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Content-Type": "application/json",
  });
  response.end(data === null ? "" : JSON.stringify(data));
}

async function readBody(request) {
  let content = "";
  for await (const chunk of request) content += chunk;
  return content ? JSON.parse(content) : {};
}

export function createMockApiServer() {
  const barbers = structuredClone(initialBarbers);
  const services = structuredClone(initialServices);
  const bookings = [];
  const usersByToken = new Map();
  let nextId = 2;

  const server = createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
      send(response, 204, null);
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const path = url.pathname.replace(/^\/api/, "");
    const body = ["POST", "PUT", "PATCH"].includes(request.method)
      ? await readBody(request)
      : {};

    if (request.method === "GET" && path === "/health") {
      send(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && path === "/auth/login") {
      const email = body.email ?? "cliente@barberbook.test";
      const role = email.startsWith("admin@")
        ? "ADMIN"
        : email.startsWith("barbero@")
          ? "BARBER"
          : "USER";
      const user = {
        name: role === "ADMIN" ? "Admin E2E" : role === "BARBER" ? "Barbero E2E" : "Cliente E2E",
        email,
        role,
      };
      const token = `e2e-${role.toLowerCase()}-token`;
      usersByToken.set(token, user);
      send(response, 200, { token, user });
      return;
    }

    if (request.method === "GET" && path === "/users/me") {
      const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
      const user = usersByToken.get(token);
      send(response, user ? 200 : 401, user ? { user } : { message: "No autorizado" });
      return;
    }

    if (request.method === "GET" && path === "/barbers") {
      send(response, 200, { barbers });
      return;
    }
    if (request.method === "POST" && path === "/barbers") {
      const barber = {
        ...body,
        _id: `barber-${nextId++}`,
        user: { name: body.name, email: body.email },
      };
      barbers.push(barber);
      send(response, 201, { barber });
      return;
    }

    const barberMatch = path.match(/^\/barbers\/([^/]+)(?:\/(availability))?$/);
    if (barberMatch) {
      const [, id, action] = barberMatch;
      const index = barbers.findIndex((barber) => barber._id === id);
      if (index < 0) {
        send(response, 404, { message: "Barbero no encontrado" });
        return;
      }
      if (action === "availability" && request.method === "PATCH") {
        barbers[index] = { ...barbers[index], availability: body.availability };
        send(response, 200, { barber: barbers[index] });
        return;
      }
      if (request.method === "PUT") {
        barbers[index] = {
          ...barbers[index],
          ...body,
          user: {
            ...barbers[index].user,
            name: body.name ?? barbers[index].user.name,
            email: body.email ?? barbers[index].user.email,
          },
        };
        send(response, 200, { barber: barbers[index] });
        return;
      }
      if (request.method === "DELETE") {
        barbers.splice(index, 1);
        send(response, 204, null);
        return;
      }
    }

    if (request.method === "GET" && path === "/services") {
      send(response, 200, { services });
      return;
    }
    if (request.method === "POST" && path === "/services") {
      const service = { ...body, _id: `service-${nextId++}` };
      services.push(service);
      send(response, 201, { service });
      return;
    }

    const serviceMatch = path.match(/^\/services\/([^/]+)$/);
    if (serviceMatch) {
      const index = services.findIndex((service) => service._id === serviceMatch[1]);
      if (index < 0) {
        send(response, 404, { message: "Servicio no encontrado" });
        return;
      }
      if (request.method === "PUT") {
        services[index] = { ...services[index], ...body };
        send(response, 200, { service: services[index] });
        return;
      }
      if (request.method === "DELETE") {
        services.splice(index, 1);
        send(response, 204, null);
        return;
      }
    }

    if (request.method === "GET" && path === "/bookings") {
      send(response, 200, { bookings });
      return;
    }
    if (request.method === "POST" && path === "/bookings") {
      const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
      const customer = usersByToken.get(token);
      const service = services.find((item) => item._id === body.serviceId);
      const barber = barbers.find((item) => item._id === body.barberId);
      const booking = {
        ...body,
        _id: `booking-${nextId++}`,
        status: "PENDING",
        customer,
        service,
        barber,
      };
      bookings.push(booking);
      send(response, 201, { booking });
      return;
    }

    const bookingMatch = path.match(/^\/bookings\/([^/]+)(?:\/(confirm|reject|cancel))?$/);
    if (bookingMatch) {
      const [, id, action] = bookingMatch;
      const index = bookings.findIndex((booking) => booking._id === id);
      if (index < 0) {
        send(response, 404, { message: "Reserva no encontrada" });
        return;
      }
      if (request.method === "GET" && !action) {
        send(response, 200, { booking: bookings[index] });
        return;
      }
      if (request.method === "PATCH" && action) {
        const status = {
          confirm: "CONFIRMED",
          reject: "REJECTED",
          cancel: "CANCELLED",
        }[action];
        bookings[index] = { ...bookings[index], status };
        send(response, 200, { booking: bookings[index] });
        return;
      }
    }

    send(response, 404, { message: `Ruta E2E no configurada: ${request.method} ${path}` });
  });

  return server;
}
