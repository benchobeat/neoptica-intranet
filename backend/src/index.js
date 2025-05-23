require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'Backend OK!' });
});

const PORT = process.env.PORT || 4000;

const { sendMail } = require('./utils/mailer');

app.get('/test-email', async (req, res) => {
  try {
    await sendMail({
      to: 'correo@tucorreo.com', // Puedes poner tu correo real aquí
      subject: 'Correo de prueba Neóptica',
      text: '¡Este es un correo de prueba enviado desde el backend!',
      html: '<b>¡Este es un correo de prueba enviado desde el backend!</b>',
    });
    res.json({ ok: true, msg: 'Correo enviado correctamente.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
