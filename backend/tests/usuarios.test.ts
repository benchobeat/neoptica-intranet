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
        nombre_completo: "Usuario Comun",
        email,
        password,
        telefono: "0999999000",
        rol: clienteRole.nombre // Usar el nombre del rol, el controller buscará su ID
      });
    // Login y devuelve token
    const res = await request(app).post("/api/auth/login").send({
      email,
      password
    });
    return res.body.data.token;
  }

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

    it("Admin puede crear un nuevo usuario SIN teléfono", async () => {
      const email = uniqueEmail("sin_tel");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Usuario Sin Teléfono",
          email,
          password: "Clave1234!",
          // No se envía teléfono
        });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.telefono).toBeFalsy(); // Debe ser undefined o null
      expect(res.body.data.rol).toBe("cliente"); // Rol por defecto
    });

    it("Admin puede crear un usuario y asignar rol explícito", async () => {
      const email = uniqueEmail("con_rol");
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Usuario Rol Vendedor",
          email,
          password: "Clave1234!",
          rol: "vendedor",
        });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.rol).toBe("vendedor");
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
    it("Debe rechazar crear usuario con email inválido", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Email Inválido",
          email: "correo-no-valido",
          password: "Test1234!",
          telefono: "0999999006"
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
          nombre_completo: "Pass Débil",
          email,
          password: "1234",
          telefono: "0999999007"
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
          nombre_completo: "Tel Inválido",
          email,
          password: "Test1234!",
          telefono: "12345"
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
          nombre_completo: "Dup1",
          email,
          password: "Test1234!",
          telefono: "0999999008"
        });
      // Intentar crear de nuevo con el mismo email
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Dup2",
          email,
          password: "Test1234!",
          telefono: "0999999009"
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
          // Falta nombre_completo y password
          email: uniqueEmail("faltan"),
          telefono: "0999999010"
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
          nombre_completo: "NoAdmin",
          email: uniqueEmail("noadmin"),
          password: "Test1234!",
          telefono: "0999999011"
        });
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/Acceso denegado|se requiere rol adecuado/i);
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

    it("Debe rechazar crear usuario con teléfono inválido", async () => {
      const email = `jesttest_tel_${Date.now()}@neoptica.com`;

      // Teléfono con menos de 10 dígitos
      let res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Tel Inválido",
          email,
          password: "Clave1234!",
          telefono: "09999999", // solo 8 dígitos
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/tel[eé]fono/i);

      // Teléfono con letras
      res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Tel Inválido 2",
          email: `jesttest_tel2_${Date.now()}@neoptica.com`,
          password: "Clave1234!",
          telefono: "09999abcde", // contiene letras
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/tel[eé]fono/i);

      // Teléfono con más de 10 dígitos
      res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Tel Inválido 3",
          email: `jesttest_tel3_${Date.now()}@neoptica.com`,
          password: "Clave1234!",
          telefono: "09999999999111", // más de 10 dígitos
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/tel[eé]fono/i);
    });

    // ----- EDICIÓN DE USUARIOS -----
    describe("Editar usuario", () => {
      let usuarioEditId: string;
      const nuevoNombre = "Usuario Editado";
      const nuevoTelefono = "0991234567";
      const nuevoEmail = `jesttest_edit_${Date.now()}@neoptica.com`;

      beforeAll(async () => {
        // Crea un usuario de prueba para editar
        const res = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Usuario a Editar",
            email: nuevoEmail,
            password: "Edita1234!",
            telefono: "0988776655",
            rol: "cliente",
          });
        usuarioEditId = res.body.data.id;
      });

      it("Admin puede editar usuario", async () => {
        const res = await request(app)
          .put(`/api/usuarios/${usuarioEditId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: nuevoNombre,
            email: nuevoEmail,
            telefono: nuevoTelefono,
          });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.nombre_completo).toBe(nuevoNombre);
        expect(res.body.data.email).toBe(nuevoEmail);
        expect(res.body.data.telefono).toBe(nuevoTelefono);
      });

      it("Debe rechazar si otro usuario (no admin, no self) intenta editar", async () => {
        // Crea un usuario cliente y loguea para obtener su token
        const emailCliente = `jesttest_edit_100@neoptica.com`;
        await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Cliente Otro",
            email: emailCliente,
            password: "ClienteOther123!",
            telefono: "0998888555",
            rol: "cliente",
          });
        const loginRes = await request(app).post("/api/auth/login").send({
          email: emailCliente,
          password: "ClienteOther123!",
        });
        const clienteToken = loginRes.body.data.token;

        // El usuario cliente intenta editar a otro usuario
        const res = await request(app)
          .put(`/api/usuarios/${usuarioEditId}`)
          .set("Authorization", `Bearer ${clienteToken}`)
          .send({
            nombre_completo: "Hackeando",
            email: `hack@neoptica.com`,
            telefono: "000000000",
          });
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(
          /admin|propio|Acceso denegado: se requiere rol adecuado/i
        );
      });

      it("Debe rechazar si el usuario no existe", async () => {
        const res = await request(app)
          .put("/api/usuarios/00000000-0000-0000-0000-000000000000")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "No existe",
            email: "noexiste@neoptica.com",
            telefono: "000000000",
          });
        expect(res.status).toBe(404);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/no encontrado/i);
      });

      it("Debe rechazar si el nuevo email ya está en uso", async () => {
        // Crea otro usuario para obtener un email duplicado
        const emailDuplicado = `jesttest_dup_${Date.now()}@neoptica.com`;
        await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Duplicado",
            email: emailDuplicado,
            password: "Dup1234!",
            telefono: "0997777666",
            rol: "cliente",
          });
        // Intenta editar usuario anterior para ponerle ese email
        const res = await request(app)
          .put(`/api/usuarios/${usuarioEditId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: nuevoNombre,
            email: emailDuplicado,
            telefono: nuevoTelefono,
          });
        expect(res.status).toBe(409);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/registrado/i);
      });
      it("Debe rechazar actualizar usuario con rol inexistente", async () => {
        const email = uniqueEmail("rolbad");
        // Crea usuario válido
        const crearRes = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "RolBad",
            email,
            password: "Test1234!",
            telefono: "0999999012"
          });
        const usuarioId = crearRes.body.data.id;
        // Intenta actualizar con rol inválido
        const res = await request(app)
          .put(`/api/usuarios/${usuarioId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ rol: "no_existe" });
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/rol/i);
      });
      it("Debe rechazar actualizar email a uno ya registrado", async () => {
        const email1 = uniqueEmail("dup1");
        const email2 = uniqueEmail("dup2");
        // Crea dos usuarios
        const res1 = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Dup1",
            email: email1,
            password: "Test1234!",
            telefono: "0999999013"
          });
        await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Dup2",
            email: email2,
            password: "Test1234!",
            telefono: "0999999014"
          });
        // Intenta actualizar el email de usuario 2 al email de usuario 1
        const res = await request(app)
          .put(`/api/usuarios/${res1.body.data.id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ email: email2 });
        expect(res.status).toBe(409);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/email/i);
      });
    });

    // ----- EDICIÓN DE DATOS PROPIOS -----
    describe("Edición de datos propios", () => {
      it("El propio usuario puede editarse a sí mismo", async () => {
        const emailSelf = `jesttest_self_${Date.now()}@neoptica.com`;
        const passwordSelf = "SelfEdit123!";
        // Crea el usuario
        const crearRes = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Self User",
            email: emailSelf,
            password: passwordSelf,
            telefono: "0991111222",
            rol: "cliente",
          });
        const selfId = crearRes.body.data.id;

        // Haz login como ese usuario
        const loginRes = await request(app).post("/api/auth/login").send({
          email: emailSelf,
          password: passwordSelf,
        });
        const selfToken = loginRes.body.data.token;

        // El usuario se edita a sí mismo
        const nuevoNombre = "Self Editado";
        const nuevoTelefono = "0990000999";
        const res = await request(app)
          .put(`/api/usuarios/${selfId}`)
          .set("Authorization", `Bearer ${selfToken}`)
          .send({
            nombre_completo: nuevoNombre,
            email: emailSelf,
            telefono: nuevoTelefono,
          });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.nombre_completo).toBe(nuevoNombre);
        expect(res.body.data.telefono).toBe(nuevoTelefono);
      });
    });

    // ----- CAMBIO DE CONTRASEÑA -----
    describe("Cambio de contraseña", () => {
      let selfId: string;
      const email = `jesttest_pw_${Date.now()}@neoptica.com`;
      const oldPass = "PasswordTest123!";
      const newPass = "NuevaClave2024!";

      beforeAll(async () => {
        // Crear usuario de prueba
        const crearRes = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Test CambioPW",
            email,
            password: oldPass,
            telefono: "0991111234",
            rol: "cliente",
          });
        selfId = crearRes.body.data.id;
      });

      it("El usuario puede cambiar su propia contraseña", async () => {
        // Login para obtener token
        const loginRes = await request(app).post("/api/auth/login").send({
          email,
          password: oldPass,
        });
        expect(loginRes.body.ok).toBe(true);
        const userToken = loginRes.body.data.token;

        // Cambia la contraseña
        const res = await request(app)
          .put(`/api/usuarios/${selfId}/password`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            password_actual: oldPass,
            password_nuevo: newPass,
          });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data).toMatch(/contraseña/i);

        // Intenta login con la contraseña antigua (debe fallar)
        const loginFail = await request(app).post("/api/auth/login").send({
          email,
          password: oldPass,
        });
        expect(loginFail.body.ok).toBe(false);

        // Intenta login con la nueva contraseña (debe funcionar)
        const loginOk = await request(app).post("/api/auth/login").send({
          email,
          password: newPass,
        });
        expect(loginOk.body.ok).toBe(true);
      });

      it("Debe rechazar cambio si el password actual es incorrecto", async () => {
        const loginRes = await request(app).post("/api/auth/login").send({
          email,
          password: newPass,
        });
        const userToken = loginRes.body.data.token;

        const res = await request(app)
          .put(`/api/usuarios/${selfId}/password`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            password_actual: "incorrecto123!",
            password_nuevo: "OtroPass2024!",
          });
        expect(res.status).toBe(401);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/actual/i);
      });

      it("Debe rechazar si el password nuevo es débil", async () => {
        const loginRes = await request(app).post("/api/auth/login").send({
          email,
          password: newPass,
        });
        const userToken = loginRes.body.data.token;

        const res = await request(app)
          .put(`/api/usuarios/${selfId}/password`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            password_actual: newPass,
            password_nuevo: "123",
          });
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/password/i);
      });

      it("Debe rechazar si otro usuario intenta cambiar la contraseña", async () => {
        // Crea un segundo usuario y loguea
        const email2 = `jesttest_pw2_${Date.now()}@neoptica.com`;
        const pass2 = "OtroUser123!";
        const crearRes = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "User2",
            email: email2,
            password: pass2,
            telefono: "0992222333",
            rol: "cliente",
          });
        const otherId = crearRes.body.data.id;

        const loginOther = await request(app).post("/api/auth/login").send({
          email: email2,
          password: pass2,
        });
        const otherToken = loginOther.body.data.token;

        // Intenta cambiar la contraseña de otro usuario
        const res = await request(app)
          .put(`/api/usuarios/${selfId}/password`)
          .set("Authorization", `Bearer ${otherToken}`)
          .send({
            password_actual: newPass,
            password_nuevo: "NoDebeCambiar123!",
          });
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/propia/i);
      });
    });

    // ----- ELIMINACIÓN DE USUARIO -----
    describe("Eliminar usuario", () => {
      let usuarioEliminarId: string;

      beforeAll(async () => {
        // Crea un usuario de prueba para eliminar
        const res = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Usuario a Eliminar",
            email: `jesttest_delete_${Date.now()}@neoptica.com`,
            password: "Eliminar1234!",
            telefono: "0988888999",
            rol: "cliente",
          });
        usuarioEliminarId = res.body.data.id;
      });

      it("Admin puede eliminar (desactivar) usuario", async () => {
        const res = await request(app)
          .delete(`/api/usuarios/${usuarioEliminarId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data).toMatch(/inactivo|eliminado/i);

        // Confirma que el usuario está inactivo
        const consulta = await request(app)
          .get(`/api/usuarios/${usuarioEliminarId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(consulta.body.ok).toBe(true);
        expect(consulta.body.data.activo).toBe(false);
      });

      it("Devuelve 404 si el usuario no existe", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000"; // UUID inválido o no existente
        const res = await request(app)
          .delete(`/api/usuarios/${fakeId}`)
          .set("Authorization", `Bearer ${token}`); // token de admin
        expect(res.status).toBe(404);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/no encontrado|not found/i);
      });

      it("Debe rechazar si no es admin", async () => {
        // Crea usuario cliente y loguea para token
        const emailCliente = `jesttest_delete2_${Date.now()}@neoptica.com`;
        await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Cliente Eliminar",
            email: emailCliente,
            password: "ClienteElim123!",
            telefono: "0990000888",
            rol: "cliente",
          });
        const loginRes = await request(app).post("/api/auth/login").send({
          email: emailCliente,
          password: "ClienteElim123!",
        });
        const clienteToken = loginRes.body.data.token;

        
        // Cliente intenta borrar otro usuario
        const res = await request(app)
          .delete(`/api/usuarios/${usuarioEliminarId}`)
          .set("Authorization", `Bearer ${clienteToken}`);
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(
          /Acceso denegado: se requiere rol adecuado/i
        );
      });
      it("El usuario eliminado queda inactivo y con campos de anulación", async () => {
        // 1. Crear un usuario de prueba para eliminar
        const email = uniqueEmail("eliminable");
        const resCrear = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Usuario Eliminable",
            email,
            password: "Test1234!",
            telefono: "0999999002",
            rol: "cliente"
          });
        const userId = resCrear.body.data.id;

        // 2. Eliminar el usuario (borrado lógico)
        const resEliminar = await request(app)
          .delete(`/api/usuarios/${userId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(resEliminar.status).toBe(200);

        // 3. Consultar en la base de datos el usuario eliminado
        const usuario = await prisma.usuario.findUnique({ where: { id: userId } });

        // 4. Verificar campos de control
        expect(usuario).toBeDefined();
        expect(usuario?.activo).toBe(false);
        expect(usuario?.anulado_en).not.toBeNull();
        expect(usuario?.anulado_por).not.toBeNull();
      });
      it("No se puede eliminar un usuario ya inactivo", async () => {
        // 1. Crear un usuario de prueba
        const email = uniqueEmail("inactivo");
        const resCrear = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Usuario Inactivo",
            email,
            password: "Test1234!",
            telefono: "0999999003",
            rol: "cliente"
          });
        const userId = resCrear.body.data.id;
      
        // 2. Eliminar el usuario (borrado lógico)
        const resEliminar1 = await request(app)
          .delete(`/api/usuarios/${userId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(resEliminar1.status).toBe(200);
      
        // 3. Intentar eliminar de nuevo (debe fallar)
        const resEliminar2 = await request(app)
          .delete(`/api/usuarios/${userId}`)
          .set("Authorization", `Bearer ${token}`);
        // Esperamos 400 (Bad Request) o 409 (Conflict), según tu implementación
        expect([400, 409]).toContain(resEliminar2.status);
        expect(resEliminar2.body.ok).toBe(false);
        expect(resEliminar2.body.error).toMatch(/inactivo|ya eliminado|no se puede/i);
      });
      it("Debe rechazar eliminación si no se envía JWT", async () => {
        // Usar un ID válido aleatorio (puedes usar un UUID fijo)
        const fakeId = "00000000-0000-0000-0000-000000000001";
        const res = await request(app)
          .delete(`/api/usuarios/${fakeId}`);
        expect(res.status).toBe(401); // Unauthorized
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/jwt|token|autorización/i);
      });
      it("Un usuario no admin NO puede eliminarse a sí mismo", async () => {
        // 1. Crear usuario normal
        const email = uniqueEmail("selfelim");
        const resCrear = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Self Elim",
            email,
            password: "Test1234!",
            telefono: "0999999004",
            rol: "cliente"
          });
        const userId = resCrear.body.data.id;
      
        // 2. Login como el usuario normal
        const resLogin = await request(app)
          .post("/api/auth/login")
          .send({ email, password: "Test1234!" });
        const userToken = resLogin.body.data.token;
      
        // 3. Intentar auto-eliminarse
        const resEliminar = await request(app)
          .delete(`/api/usuarios/${userId}`)
          .set("Authorization", `Bearer ${userToken}`);
        expect(resEliminar.status).toBe(403); // Forbidden
        expect(resEliminar.body.ok).toBe(false);
        expect(resEliminar.body.error).toMatch(/Acceso denegado|se requiere rol/i);
      });
      it("El usuario eliminado no aparece en el listado de usuarios activos", async () => {
        // 1. Crear y eliminar usuario
        const email = uniqueEmail("noactivo");
        const resCrear = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "No Listable",
            email,
            password: "Test1234!",
            telefono: "0999999005",
            rol: "cliente"
          });
        const userId = resCrear.body.data.id;
      
        await request(app)
          .delete(`/api/usuarios/${userId}`)
          .set("Authorization", `Bearer ${token}`);
      
        // 2. Listar usuarios activos
        const resList = await request(app)
          .get("/api/usuarios")
          .set("Authorization", `Bearer ${token}`);
        expect(resList.status).toBe(200);
        // El usuario eliminado no debe estar en el listado
        const emails = resList.body.data.map((u: any) => u.email);
        expect(emails).not.toContain(email);
      });
    });

    // ----- CAMBIO DE CONTRASEÑA POR USUARIO ADMIN ------
    describe("Reset password por admin", () => {
      let usuarioId: string;
      let emailReset: string;
      const passwordOriginal = "ResetTest123!";
      const passwordNuevo = "ResetAdmin2024!";

      beforeAll(async () => {
        // Definir un solo email de test para toda la suite
        emailReset = `jesttest_reset_${Date.now()}@neoptica.com`;

        // Crear usuario de prueba
        const crearRes = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`) // token de admin
          .send({
            nombre_completo: "Usuario Reset",
            email: emailReset,
            password: passwordOriginal,
            telefono: "0991111100",
            rol: "cliente",
          });
        usuarioId = crearRes.body.data.id;
      });

      it("Admin puede restablecer la contraseña de otro usuario", async () => {
        const res = await request(app)
          .put(`/api/usuarios/${usuarioId}/reset-password`)
          .set("Authorization", `Bearer ${token}`)
          .send({ password_nuevo: passwordNuevo });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);

        // El usuario debe poder loguear con el nuevo password
        const login = await request(app).post("/api/auth/login").send({
          email: emailReset, // usar el mismo email definido antes
          password: passwordNuevo,
        });
        expect(login.body.ok).toBe(true);
      });

      it("Debe rechazar si el token no es admin", async () => {
        // Crear usuario normal para probar acceso denegado
        const emailCliente = `jesttest_reset2_${Date.now()}@neoptica.com`;
        const passCliente = "Cliente1234!";
        // Crea usuario
        await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "Cliente Reset",
            email: emailCliente,
            password: passCliente,
            telefono: "0990000888",
            rol: "cliente",
          });

        // Login como cliente para obtener token
        const loginRes = await request(app).post("/api/auth/login").send({
          email: emailCliente,
          password: passCliente,
        });
        const userToken = loginRes.body.data.token;

        // Intenta resetear la contraseña de otro usuario
        const res = await request(app)
          .put(`/api/usuarios/${usuarioId}/reset-password`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ password_nuevo: "NoDebeCambiar123!" });
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
      });
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

    // --- PRUEBAS DE ELIMINACIÓN DE USUARIO ---
    describe("Eliminar usuario", () => {
      let usuarioAEliminarId: string;
      let tokenNoAdmin: string;

      beforeAll(async () => {
        // Crear un usuario normal (rol 'vendedor')
        const email = uniqueEmail("noadmin");
        const resCrear = await request(app)
          .post("/api/usuarios")
          .set("Authorization", `Bearer ${token}`)
          .send({
            nombre_completo: "No Admin",
            email,
            password: "Test1234!",
            telefono: "0999999001",
            rol: "vendedor"
          });
        usuarioAEliminarId = resCrear.body.data.id;

        // Login con el usuario normal
        const resLogin = await request(app)
          .post("/api/auth/login")
          .send({ email, password: "Test1234!" });
        tokenNoAdmin = resLogin.body.data.token;
      });

      it("No admin NO puede eliminar usuario (403)", async () => {
        const res = await request(app)
          .delete(`/api/usuarios/${usuarioAEliminarId}`)
          .set("Authorization", `Bearer ${tokenNoAdmin}`);
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/acceso denegado|admin|rol adecuado/i);
      });

      it("Admin puede eliminar usuario (200)", async () => {
        const res = await request(app)
          .delete(`/api/usuarios/${usuarioAEliminarId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data).toMatch(/eliminado/i);
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
      // console.log("Usuarios de test eliminados:", result.count);
      await prisma.$disconnect();
    });
  });

  // ----- TESTS AVANZADOS Y EDGE CASES -----
  describe("Casos avanzados y edge cases de usuarios", () => {
    it("Debe rechazar cambio de contraseña si es débil", async () => {
      const email = uniqueEmail("weakpw");
      const password = "Fuerte123!";
      await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Weak Password",
          email,
          password,
          telefono: "0999999001",
          rol: "cliente"
        });
      const loginRes = await request(app).post("/api/auth/login").send({ email, password });
      const userToken = loginRes.body.data.token;
      const res = await request(app)
        .post("/api/usuarios/cambiar-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          actual: password,
          nueva: "123"
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/fuerte|déb/i);
    });

    it("Debe rechazar editar email a uno ya existente", async () => {
      const email1 = uniqueEmail("dup1");
      const email2 = uniqueEmail("dup2");
      const res1 = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Usuario1",
          email: email1,
          password: "Test1234!",
          telefono: "0999999002",
          rol: "cliente"
        });
      const res2 = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Usuario2",
          email: email2,
          password: "Test1234!",
          telefono: "0999999003",
          rol: "cliente"
        });
      const usuario2Id = res2.body.data.id;
      const resEdit = await request(app)
        .put(`/api/usuarios/${usuario2Id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ email: email1 });
      expect(resEdit.status).toBe(409);
      expect(resEdit.body.ok).toBe(false);
      expect(resEdit.body.error).toMatch(/ya está registrado/i);
    });

    it("Un usuario común no puede eliminarse a sí mismo", async () => {
      const userToken = await getTokenUsuarioComun();
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(userToken);
      const userId = decoded.id;
      const res = await request(app)
        .delete(`/api/usuarios/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/Acceso denegado|se requiere rol adecuado/i);
    });

    it("Un usuario común no puede cambiar su propio rol", async () => {
      const userToken = await getTokenUsuarioComun();
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(userToken);
      const userId = decoded.id;
      const res = await request(app)
        .put(`/api/usuarios/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rol: "admin" });
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/admin/i);
    });

    it("Debe rechazar creación de usuario si el teléfono no es válido", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Tel Mal",
          email: uniqueEmail("telbad"),
          password: "Test1234!",
          telefono: "1234",
          rol: "cliente"
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/celular|tel/i);
    });

    it("Debe rechazar creación de usuario si el email es inválido", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${token}`)
        .send({
          nombre_completo: "Email Mal",
          email: "noesunemail",
          password: "Test1234!",
          telefono: "0999999999",
          rol: "cliente"
        });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toMatch(/email/i);
    });
  });

});
