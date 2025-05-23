# Manual Técnico de Instalación y Setup - Fase 0 Neóptica Intranet

---

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación y Configuración de Entorno](#instalacion-entorno)
3. [Estructura del Proyecto y Repositorio Git](#estructura-proyecto)
4. [Frontend: Setup y pruebas con Next.js y Ant Design](#frontend-setup)
5. [Backend: Setup Express, Prisma y PostgreSQL](#backend-setup)
6. [Base de Datos y Migraciones](#db-setup)
7. [CI/CD Básico con GitHub Actions](#cicd)
8. [Backups Automáticos](#backups)
9. [SMTP de Pruebas](#smtp)
10. [Restauración de Backups](#restore)
11. [Notas y Recomendaciones](#notas)
12. [FAQ y Troubleshooting](#faq)

---

## 1. Requisitos Previos

- Ubuntu 22.04+ con GUI (probado en Ubuntu 24.04)
- Acceso a terminal y permisos de sudo
- Cuenta de GitHub
- Cuenta gratuita en Mailtrap.io (para SMTP)
- Conexión a internet
- Se recomienda experiencia básica en terminal Linux, edición de archivos y uso de Visual Studio Code.

> **Nota:** Si eres nuevo en Linux, consulta el Glosario y la sección FAQ al final de este manual.

---

## 2. Instalación y Configuración de Entorno

Estos comandos deben ejecutarse desde una terminal con usuario que tenga permisos de sudo:

```bash
sudo apt update && sudo apt upgrade -y                # Actualiza paquetes del sistema
sudo apt install -y git curl wget build-essential     # Instala herramientas básicas (git, compiladores, descargas)
sudo snap install --classic code                      # Instala Visual Studio Code
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -   # Configura Node.js 22.x LTS
sudo apt install -y nodejs                            # Instala Node.js y npm
sudo apt install -y postgresql postgresql-contrib     # Instala PostgreSQL
```

**Verifica las versiones:**
- `git --version`  (debe mostrar la versión instalada)
- `node -v`        (ejemplo: v22.x.x)
- `npm -v`
- `psql --version`
- `code --version`

---

## 3. Estructura del Proyecto y Repositorio Git

### Clona el repositorio principal o inicializa uno nuevo

```bash
mkdir ~/neoptica-intranet
cd ~/neoptica-intranet
git clone https://github.com/benchobeat/neoptica-intranet.git .  # Clona en la carpeta actual
# Si ya existe el repo y quieres actualizarlo: git pull origin main
```

### Crea carpetas base para organizar el proyecto

```bash
mkdir frontend backend shared docs scripts
# Si deseas mantener carpetas vacías:
touch frontend/.gitkeep backend/.gitkeep shared/.gitkeep docs/.gitkeep scripts/.gitkeep
```

> **Tip:** Git ignora carpetas vacías. El archivo `.gitkeep` es una convención para asegurar que la estructura de carpetas se suba al repo.

---

## 4. Frontend: Setup y pruebas con Next.js y Ant Design

```bash
cd ~/neoptica-intranet/frontend
npx create-next-app@15.1.8 . --typescript
npm install antd@5.25.2 @ant-design/icons
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

- **Importante:** Agrega en la PRIMERA línea de `~/neoptica-intranet/frontend/src/app/layout.tsx`:
  ```tsx
  import 'antd/dist/reset.css'; // Estilos globales de Ant Design
  import './globals.css';       // Tus estilos globales (de Next.js)
  ```
- Prueba el frontend ejecutando:
  ```bash
  npm run dev
  ```
  y abre en tu navegador http://localhost:3000
- Usa y verifica componentes Ant Design (ejemplo, Button, Alert) en `~/neoptica-intranet/frontend/src/app/page.tsx`.

> Si ves errores de lint sobre “React in scope”, ajusta las reglas de ESLint desactivando `'react/react-in-jsx-scope': 'off'`.

> Si `npm run dev` falla, intenta `npm install` nuevamente.

---

## 5. Backend: Setup Express, Prisma y PostgreSQL

```bash
cd ~/neoptica-intranet/backend
npm init -y
npm install express cors dotenv nodemailer
npm install --save-dev nodemon
npm install prisma@6.8.2 @prisma/client
npx prisma init
```

- En `~/neoptica-intranet/backend/.env` configura la conexión a la base de datos:
  ```env
  DATABASE_URL="postgresql://neoptica_dev:TU_PASSWORD@localhost:5432/neoptica_dev?schema=public"
  # Reemplaza TU_PASSWORD por tu contraseña real
  ```
- Crea y carga el esquema SQL en PostgreSQL.
- Prueba Prisma con:
  ```bash
  npx prisma db pull
  ```
- El endpoint `/` de Express (en `~/neoptica-intranet/backend/src/index.js`) debe responder "Backend OK!"

> **Tip:** No subas nunca archivos `.env` al repositorio (agrega `.env` a `.gitignore`).

---

## 6. Base de Datos y Migraciones

- Crea usuario y base de datos desde terminal:

```bash
sudo -u postgres psql
# Ya dentro de psql ejecuta:
CREATE USER neoptica_dev WITH PASSWORD 'TU_PASSWORD';
CREATE DATABASE neoptica_dev OWNER neoptica_dev;
GRANT ALL PRIVILEGES ON DATABASE neoptica_dev TO neoptica_dev;
\q
```
- Importa el esquema y vistas desde archivos `.sql` si los tienes (puedes usar `psql -U ... -d ... -f archivo.sql`).
- Verifica acceso y sincronización con Prisma.

> Si la base de datos ya existe y quieres eliminarla, usa `DROP DATABASE nombre_db;` dentro de `psql`.

---

## 7. CI/CD Básico con GitHub Actions

Crea el archivo de workflow en `~/neoptica-intranet/.github/workflows/ci.yml`:

```yaml
name: CI - Build & Lint
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  frontend:
    name: Frontend (Next.js)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22.x'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
  backend:
    name: Backend (Express + Prisma)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22.x'
      - run: npm ci
      - run: echo "Backend instalado correctamente"
```

- Al hacer `git push`, revisa la pestaña **Actions** en GitHub para ver el estado del workflow. Si falla, revisa los logs detallados.
- Si tienes dudas, consulta [GitHub Actions Docs](https://docs.github.com/en/actions).

---

## 8. Backups Automáticos

- **Carpeta sugerida para backups:** `/home/rmosquera/bd_backups`
- **Script de backup automático:** Crea el archivo `/home/rmosquera/bd_backups/backup_neoptica.sh`:
  ```bash
  #!/bin/bash
  FECHA=$(date +%Y%m%d_%H%M%S)
  pg_dump -U neoptica_dev -h localhost -d neoptica_dev -F c -b -v -f /home/rmosquera/bd_backups/neoptica_dev_$FECHA.backup
  ```
  Dale permisos de ejecución:
  ```bash
  chmod +x /home/rmosquera/bd_backups/backup_neoptica.sh
  ```
- **Seguridad:** Usa la variable de entorno `PGPASSWORD` o el archivo seguro `~/.pgpass` para que el script funcione sin pedir contraseña.
- **Ejecutar backup manualmente:**
  ```bash
  export PGPASSWORD='TU_PASSWORD'
  /home/rmosquera/bd_backups/backup_neoptica.sh
  # O si tienes .pgpass configurado, sólo corre el script
  ```
- **Programar backup automático con cron (ejemplo: diario 2am):**
  ```
  0 2 * * * /home/rmosquera/bd_backups/backup_neoptica.sh
  ```
- **No subas archivos de backup al repositorio.**

---

## 9. SMTP de Pruebas

- **Cuenta en [mailtrap.io](https://mailtrap.io/):** Crea una inbox y copia los parámetros SMTP para Node.js.
- **Instala Nodemailer en el backend:**
  ```bash
  cd ~/neoptica-intranet/backend
  npm install nodemailer
  ```
- **Configura variables SMTP en** `~/neoptica-intranet/backend/.env`:
  ```env
  SMTP_HOST=sandbox.smtp.mailtrap.io
  SMTP_PORT=2525
  SMTP_USER=xxxxxx
  SMTP_PASS=yyyyyy
  ```
- **Crea archivo utilitario:** `~/neoptica-intranet/backend/src/utils/mailer.js` con la configuración de Nodemailer.
- **Crea endpoint de prueba en** `~/neoptica-intranet/backend/src/index.js`:
  ```js
  app.get('/test-email', async (req, res) => {
    try {
      await sendMail({
        to: 'correo@tucorreo.com',
        subject: 'Correo de prueba Neóptica',
        text: '¡Este es un correo de prueba enviado desde el backend!',
        html: '<b>¡Este es un correo de prueba enviado desde el backend!</b>',
      });
      res.json({ ok: true, msg: 'Correo enviado correctamente.' });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
  ```
- Prueba accediendo a [http://localhost:4000/test-email](http://localhost:4000/test-email) y revisa tu inbox en Mailtrap.

---

## 10. Restauración de Backups

- **Script interactivo:** `/home/rmosquera/bd_backups/restore_neoptica.sh`
  ```bash
  #!/bin/bash
  BACKUP_DIR="/home/rmosquera/bd_backups"
  DB_USER="neoptica_dev"
  DB_NAME="neoptica_dev"
  DB_HOST="localhost"
  BACKUPS=($BACKUP_DIR/*.backup)
  if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "No se encontraron archivos de backup en $BACKUP_DIR"
    exit 1
  fi
  for i in "${!BACKUPS[@]}"; do
    echo "$i) $(basename "${BACKUPS[$i]}")"
  done
  read -p "Ingresa el número del archivo de backup que quieres restaurar: " CHOICE
  if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 0 ] || [ "$CHOICE" -ge "${#BACKUPS[@]}" ]; then
    echo "Selección inválida."
    exit 1
  fi
  SELECTED_BACKUP="${BACKUPS[$CHOICE]}"
  read -p "¿Estás seguro que quieres restaurar este backup sobre la base de datos '$DB_NAME'? (s/N): " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
    echo "Operación cancelada."
    exit 0
  fi
  pg_restore -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -c -v "$SELECTED_BACKUP"
  ```
- **Advertencia:** La restauración sobrescribe el contenido actual de la base de datos. Haz siempre un backup antes.
- **Requiere** tener el password configurado vía `.pgpass` o `PGPASSWORD`.

---

## 11. Notas y Recomendaciones

- Mantén el archivo `.pgpass` seguro (permiso 600: `chmod 600 ~/.pgpass`).
- Nunca subas archivos `.env` ni backups al repositorio Git.
- Usa siempre entornos separados para desarrollo y producción.
- Si `npm run dev` o cualquier comando falla, revisa el mensaje de error, consulta la FAQ, y asegúrate de estar en el path correcto.
- Actualiza y prueba tus workflows de CI/CD tras cambios en dependencias.
- Mantén todos los scripts (backup, restore) con permisos restrictivos (`chmod 700 script.sh`).
- Documenta cada cambio relevante para facilitar la colaboración.

---

## 12. FAQ y Troubleshooting

### ¿Qué hago si un comando no se encuentra?  
Asegúrate de haber instalado correctamente todas las dependencias. Usa `which comando` para comprobar su ubicación.

### ¿Por qué mi base de datos no conecta?
- Verifica usuario, password y puerto en tu `.env`.
- Prueba conectando manualmente con `psql`.

### `npm run dev` falla o no arranca
- Revisa el mensaje de error.
- Ejecuta `npm install` para instalar dependencias faltantes.
- Verifica que estás en la carpeta correcta (`frontend` o `backend`).

### ¿Qué hago si GitHub Actions marca error?
- Haz click en el job fallido en la pestaña **Actions** y revisa el log paso a paso.
- Revisa versiones de Node y dependencias.

### ¿Cómo restauro un backup antiguo?
- Usa el script `restore_neoptica.sh`.
- **Siempre haz backup antes de restaurar.**

---

# Glosario (Básico)

- **VS Code:** Editor de código recomendado.
- **Linter:** Herramienta para mantener el código limpio y consistente.
- **Workflow:** Proceso automatizado en GitHub Actions.
- **.env:** Archivo para variables de entorno sensibles (nunca subir al repo).
- **Backup:** Copia de seguridad de la base de datos.
- **PGPASSWORD/.pgpass:** Métodos seguros para pasar la contraseña de PostgreSQL en scripts.

---

# Fin de la Fase 0 🎉

Este manual permite reproducir el setup inicial de Neóptica Intranet y es la base para futuras fases del proyecto.
