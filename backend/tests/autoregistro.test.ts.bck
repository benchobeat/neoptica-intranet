import request from "supertest";
import app from "@/app";
import prisma from "@/utils/prisma";

describe("Autoregistro de cliente", () => {
  jest.setTimeout(20000); // 20 segundos para todos los tests de este archivo

afterAll(async () => {
    // Obtener usuarios de prueba
    const usuariosTest = await prisma.usuario.findMany({
      where: {
        OR: [
          { email: { contains: "autotest" } },
          { oauth_id: { contains: "oauth_test_id" } }
        ]
      }
    });
    
    // Obtener IDs de usuarios de prueba
    const usuarioIds = usuariosTest.map(u => u.id);
    
    // Primero eliminar relaciones en usuario_rol
    if (usuarioIds.length > 0) {
      await prisma.usuario_rol.deleteMany({
        where: {
          usuario_id: { in: usuarioIds }
        }
      });
      
      // Luego eliminar registros de log_auditoria relacionados
      await prisma.log_auditoria.deleteMany({
        where: {
          entidad_id: { in: usuarioIds }
        }
      });
      
      // Finalmente eliminar usuarios
      await prisma.usuario.deleteMany({
        where: {
          id: { in: usuarioIds }
        }
      });
      
      // console.log(`Usuarios de prueba eliminados: ${usuarioIds.length}`);
    }
    // await prisma.$disconnect(); // Comentado para evitar cierre anticipado
  });

  // --- BÁSICAS ---

  it("Debe registrar cliente por formulario tradicional", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        nombre_completo: "Auto Test",
        email: "autotest_form@neoptica.com",
        password: "Test1234!",
        telefono: "0999999999"
      });
    // console.log("RESPUESTA TEST:", res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data.roles)).toBe(true);
    expect(res.body.data.roles).toEqual(["cliente"]);
  }, 20000); // Timeout específico para este test


  it("Debe registrar cliente con Google OAuth", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        email: "autotest_google@neoptica.com",
        proveedor_oauth: "google",
        oauth_id: "oauth_test_id_google"
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data.roles)).toBe(true);
    expect(res.body.data.roles).toEqual(["cliente"]);
    expect(res.body.data.proveedor_oauth).toBe("google");
  });

  // --- MEDIAS ---

  it("Debe rechazar registro si falta email (formulario)", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        nombre_completo: "Sin Email",
        password: "Test1234!"
      });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("Debe rechazar registro social si falta oauth_id", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        email: "autotest_faltaid@neoptica.com",
        proveedor_oauth: "facebook"
      });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("Debe rechazar registro duplicado por email", async () => {
    // Primer registro
    await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        nombre_completo: "Duplicado",
        email: "autotest_dup@neoptica.com",
        password: "Test1234!"
      });
    // Segundo intento
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        nombre_completo: "Duplicado",
        email: "autotest_dup@neoptica.com",
        password: "Test1234!"
      });
    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
  });

  // --- AVANZADAS ---

  it("Debe registrar cliente con Facebook OAuth y guardar proveedor correctamente", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        email: "autotest_facebook@neoptica.com",
        proveedor_oauth: "facebook",
        oauth_id: "oauth_test_id_facebook"
      });
    expect(res.status).toBe(201);
    expect(res.body.data.proveedor_oauth).toBe("facebook");
    expect(Array.isArray(res.body.data.roles)).toBe(true);
    expect(res.body.data.roles).toEqual(["cliente"]);
  });

  it("Debe registrar cliente con Instagram OAuth y guardar proveedor correctamente", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        email: "autotest_instagram@neoptica.com",
        proveedor_oauth: "instagram",
        oauth_id: "oauth_test_id_instagram"
      });
    expect(res.status).toBe(201);
    expect(res.body.data.proveedor_oauth).toBe("instagram");
    expect(Array.isArray(res.body.data.roles)).toBe(true);
    expect(res.body.data.roles).toEqual(["cliente"]);
  });

  it("No debe permitir crear usuario con rol diferente a cliente", async () => {
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        nombre_completo: "Intento Admin",
        email: "autotest_admin@neoptica.com",
        password: "Test1234!",
        roles: ["admin"]
      });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data.roles)).toBe(true);
    expect(res.body.data.roles).toEqual(["cliente"]);
  });

  it("Debe guardar correctamente los datos recibidos de Google (nombre, email, etc)", async () => {
    // Simula que Google envía nombre y email
    const res = await request(app)
      .post("/api/usuarios/autoregistro")
      .send({
        nombre_completo: "Google User",
        email: "autotest_googleinfo@neoptica.com",
        proveedor_oauth: "google",
        oauth_id: "oauth_test_id_googleinfo"
      });
    expect(res.status).toBe(201);
    expect(res.body.data.nombre_completo).toBe("Google User");
    expect(res.body.data.email).toBe("autotest_googleinfo@neoptica.com");
  });
});
