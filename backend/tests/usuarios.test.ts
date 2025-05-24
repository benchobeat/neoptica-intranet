import prisma from "@/utils/prisma";
import request from "supertest";
import app from "@/app";

// Helper para emails únicos
const uniqueEmail = (prefix = "jesttest") => `${prefix}_${Date.now()}@neoptica.com`;

describe("Usuarios API", () => {
  let token: string;
  let usuarioId: string;
  let usuarioNuevoId: string;

  // ----- AUTENTICACIÓN Y LOGIN -----
  describe("Autenticación", () => {
    it("Debe hacer login correctamente y devolver un token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@neoptica.com",
        password: "Admin1234!",
      });
      expect(res.body.ok).toBe(true);
      expect(res.body.data.token).toBeDefined();
      token = res.body.data.token;
    });

    it("Debe rechazar login con credenciales incorrectas", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@neoptica.com",
        password: "contraseña_incorrecta",
      });
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/credenciales/i);
    });
  });

  // ----- CREAR USUARIO -----
  describe("Crear usuario", () => {
    it("Admin puede crear un nuevo usuario", async () => {
      const email = uniqueEmail("testuser_create");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Test Usuario",
          email,
          password: "Test1234!",
          telefono: "0999999000",
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.email).toBe(email);
      usuarioNuevoId = res.body.data.id;
    });

    it("No permite crear usuario con email duplicado", async () => {
      // Usa el mismo email que antes
      const email = uniqueEmail("testuser_dup");
      // Crea primero
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Test Usuario",
          email,
          password: "Test1234!",
          telefono: "0999999000",
        });
      // Intenta crear de nuevo
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Test Usuario 2",
          email, // duplicado
          password: "OtraClave123!",
          telefono: "0999999001",
        });

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/registrado/i);
    });

    it("Debe rechazar login de usuario inactivo", async () => {
      const email = uniqueEmail("inactivo");
      // 1. Crea el usuario como activo
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Inactivo Prueba",
          email,
          password: "Prueba1234!",
          telefono: "0998888777",
          rol: "cliente",
        });

      // 2. Desactiva el usuario
      const getRes = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${token}`);
      const usuario = getRes.body.data.find((u: any) => u.email === email);
      expect(usuario).toBeDefined();

      await request(app)
        .delete(`/api/usuarios/${usuario.id}`)
        .set("Authorization", `Bearer ${token}`);

      // 3. Intentar login con ese usuario (ahora inactivo)
      const res = await request(app).post("/api/auth/login").send({
        email,
        password: "Prueba1234!",
      });
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/inactivo/i);
    });
  });

  // ----- LECTURA Y LISTADOS -----
  describe("Listar y buscar usuarios", () => {
    it("Debe listar usuarios si se provee un JWT válido", async () => {
      const res = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${token}`);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("Debe rechazar listar usuarios si NO se provee un JWT", async () => {
      const res = await request(app).get("/api/usuarios");
      expect(res.body.ok).toBe(false);
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });

    it("Debe devolver un usuario por ID si existe", async () => {
      const resLista = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${token}`);
      expect(resLista.body.ok).toBe(true);
      usuarioId = resLista.body.data[0].id;
      const res = await request(app)
        .get(`/api/usuarios/${usuarioId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(usuarioId);
    });

    it("Debe devolver error si el usuario no existe", async () => {
      const res = await request(app)
        .get("/api/usuarios/961da7e1-74e6-48c8-a3f6-9f18aa80931f")
        .set("Authorization", `Bearer ${token}`);
      expect(res.body.ok).toBe(false);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/no encontrado/i);
    });

    it("Debe rechazar si no se envía JWT", async () => {
      const res = await request(app).get(`/api/usuarios/${usuarioId}`);
      expect(res.body.ok).toBe(false);
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });
  });

  // ----- VALIDACIONES -----
  describe("Validaciones de creación", () => {
    it("Debe rechazar crear usuario si faltan campos obligatorios", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "",
          email: "",
          password: "",
          telefono: "0999999002",
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/faltan/i);
    });

    it("Debe rechazar crear usuario si el token NO es admin", async () => {
      // Crea un usuario cliente para obtener su token
      const email = uniqueEmail("clienteprueba");
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Cliente Prueba",
          email,
          password: "Cliente1234!",
          telefono: "0999999111",
          rol: "cliente",
        });
      // Login como cliente
      const loginRes = await request(app).post("/api/auth/login").send({
        email,
        password: "Cliente1234!",
      });
      const clienteToken = loginRes.body.data.token;

      // Intentar crear otro usuario con ese token
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${clienteToken}`)
        .send({
          nombre_completo: "No Debe Crear",
          email: uniqueEmail("nodebecrear"),
          password: "NoCrear123!",
          telefono: "0999999222",
        });
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/admin|rol adecuado/i);
    });

    it("Debe rechazar crear usuario con email inválido", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Email Inválido",
          email: "no_es_un_email",
          password: "Clave123!",
          telefono: "0999999112",
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/email/i);
    });

    it("Debe rechazar crear usuario con password débil", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Password Débil",
          email: uniqueEmail("pwdeb"),
          password: "123", // débil
          telefono: "0999999113",
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/password/i);
    });
  });

  // ----- EDICIÓN -----
  describe("Editar usuario", () => {
    // ...tus tests de edición aquí (puedes dejar como ya tienes) ...
  });

  // ----- EDICIÓN PROPIA -----
  it("El propio usuario puede editarse a sí mismo", async () => {
    // ...como tienes ahora...
  });

  // ----- ELIMINACIÓN -----
  describe("Eliminar usuario", () => {
    // ...tus tests de eliminación aquí...
  });

  // ----- ACCESO SIN JWT (SEGURIDAD) -----
  describe("Seguridad en endpoints", () => {
    it("Todos los endpoints rechazan acceso sin JWT", async () => {
      const endpoints = [
        { method: "get", path: "/api/usuarios" },
        { method: "post", path: "/api/usuarios" },
        { method: "put", path: `/api/usuarios/${usuarioId || "random"}` },
        { method: "delete", path: `/api/usuarios/${usuarioId || "random"}` },
      ];
      for (const ep of endpoints) {
        const res = await request(app)[ep.method](ep.path);
        expect(res.status).toBe(401);
        expect(res.body.ok).toBe(false);
      }
    });
  });

  // ----- RESPUESTA UNIFORME -----
  describe("Formato uniforme de respuesta", () => {
    it("Siempre responde { ok, data, error }", async () => {
      // Error forzado: buscar usuario inexistente
      const res = await request(app)
        .get("/api/usuarios/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`);
      expect(res.body).toHaveProperty("ok");
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("error");
    });
  });

  // ----- LIMPIEZA -----
  afterAll(async () => {
    // 1. Elimina asociaciones de roles de los usuarios de test
    await prisma.usuario_rol.deleteMany({
      where: {
        usuario: {
          email: {
            not: "admin@neoptica.com",
          },
        },
      },
    });
    // 2. Luego elimina los usuarios de test
    const result = await prisma.usuario.deleteMany({
      where: {
        email: {
          not: "admin@neoptica.com",
        },
      },
    });
    console.log("Usuarios de test eliminados:", result.count);
    await prisma.$disconnect();
  });
});
