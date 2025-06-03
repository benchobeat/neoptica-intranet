import app from './app';

// Solo inicia el servidor si este archivo es ejecutado directamente
// y no cuando es importado como módulo (en tests por ejemplo)
if (require.main === module) {
  console.log('Arrancando backend...');
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on ${process.env.SWAGGER_BASE_URL}`);
  });
}