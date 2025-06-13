import prisma from "@/utils/prisma";
import request from "supertest";
import app from "@/app";

jest.setTimeout(20000); // Aumenta el timeout global de los tests a 20 segundos

// Helper para emails únicos
const uniqueEmail = (prefix = "jesttest") =>
  `${prefix}_${Date.now()}@neoptica.com`;

describe("Usuarios API", () => {
  let token: string;
  let usuarioId: string;
  let usuarioNuevoId: string;

  // Helper para obtener un token de usuario común (no admin)
  async function getTokenUsuarioComun(): Promise<string> {
    const email = uniqueEmail("comun");
    const password = "Test1234!";
    // Crea usuario común
    // Buscar el rol 'cliente' y su ID
    const clienteRole = await prisma.rol.findFirst({ where: { nombre: 'cliente' } });
    if (!clienteRole) throw new Error('No existe el rol cliente en la base de datos');
    
    await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${token}`) // Usa el token de admin para crearlo
      .send({
        nombreCompleto: "Usuario Comun",
        email,
        password,
        telefono: "0999999000",
        roles: [clienteRole.nombre] // Usar el nombre del rol como array, el controller buscará sus IDs
      });
    // Login y devuelve token
    const res = await request(app).post("/api/auth/login").send({
      email,
      password
    });
    return res.body.data.token;
  }

  // ----- AUTENTICACIÓN Y LOGIN -----
  describe("AutenticaciÃ³n", () => {
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
    
    it("Debe rechazar login de usuario inactivo", async () => {
      const email = uniqueEmail("inactivo");
      // 1. Crea el usuario como activo
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Inactivo Prueba",
          email,
          password: "Prueba1234!",
          telefono: "0998888777",
          roles: ["cliente"],
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

  // ----- CREAR USUARIO -----
  describe("Crear usuario", () => {
    it("Admin puede crear un nuevo usuario", async () => {
      const email = uniqueEmail("testuser_create");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Test Usuario",
          email,
          password: "Test1234!",
          telefono: "0999999000",
          roles: ["cliente"],
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.email).toBe(email);
      usuarioNuevoId = res.body.data.id;
    });

    it("Admin puede crear un nuevo usuario SIN teléfono", async () => {
      const email = uniqueEmail("sin_tel");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Usuario Sin Teléfono",
          email,
          password: "Clave1234!",
          // No se envía teléfono
          roles: ["cliente"],
        });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.telefono).toBeFalsy(); // Debe ser undefined o null
      expect(res.body.data.roles).toEqual(["cliente"]); // Rol por defecto
    });

    it("Admin puede crear un usuario y asignar roles explícitos", async () => {
      const email = uniqueEmail("con_rol");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Usuario Rol Vendedor",
          email,
          password: "Clave1234!",
          roles: ["vendedor"],
        });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.roles).toEqual(["vendedor"]);
    });

    it("No permite crear usuario con email duplicado", async () => {
      // Usa el mismo email que antes
      const email = uniqueEmail("testuser_dup");
      // Crea primero
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Test Usuario",
          email,
          password: "Test1234!",
          telefono: "0999999000",
          roles: ["cliente"],
        });
      // Intenta crear de nuevo
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Test Usuario 2",
          email, // duplicado
          password: "OtraClave123!",
          telefono: "0999999001",
          roles: ["cliente"],
        });

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/registrado/i);
    });
    
    it("Debe rechazar crear usuario con email inválido", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Email Inválido",
          email: "correo-no-valido",
          password: "Test1234!",
          telefono: "0999999006",
          roles: ["cliente"],
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/email/i);
    });
    
    it("Debe rechazar crear usuario con password débil", async () => {
      const email = uniqueEmail("pwdeb");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Pass Débil",
          email,
          password: "1234",
          telefono: "0999999007",
          roles: ["cliente"],
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/password|contraseña/i);
    });
    
    it("Debe rechazar crear usuario con teléfono inválido", async () => {
      const email = uniqueEmail("telinv");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Tel Inválido",
          email,
          password: "Test1234!",
          telefono: "12345",
          roles: ["cliente"],
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/teléfono/i);
    });
    
    it("Debe rechazar crear usuario con email duplicado", async () => {
      const email = uniqueEmail("dup");
      // Crear usuario primero
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Dup1",
          email,
          password: "Test1234!",
          telefono: "0999999008",
          roles: ["cliente"],
        });
      // Intentar crear de nuevo con el mismo email
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombreCompleto: "Dup2",
          email,
          password: "Test1234!",
          telefono: "0999999009",
          roles: ["cliente"],
        });
      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/email|duplicado/i);
    });
    
    it("Debe rechazar crear usuario si faltan campos obligatorios", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          // Falta nombreCompleto y password
          email: uniqueEmail("faltan"),
          telefono: "0999999010",
          roles: ["cliente"],
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/obligatorio|faltan/i);
    });
    
    it("Debe rechazar creación de usuario si no es admin", async () => {
      const userToken = await getTokenUsuarioComun(); // Simula login de usuario común
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          nombreCompleto: "NoAdmin",
          email: uniqueEmail("noadmin"),
          password: "Test1234!",
          telefono: "0999999011",
          roles: ["cliente"],
        });
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/Acceso denegado|se requiere rol adecuado/i);
    });
  });

  // Resto del archivo de pruebas...
  
  // Función para simular el comportamiento del middleware de roles
  // Esta función verifica si un usuario con los roles dados tendría acceso según los roles requeridos
  async function simulateRoleMiddleware(requiredRoles: string[], userRoles: string[]): Promise<boolean> {
    // Implementación del middleware...
    return true;
  }
});
