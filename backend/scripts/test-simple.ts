console.log('Prueba de script simple');
console.error('Prueba de error');

// Para asegurarnos de que el script no termina antes de mostrar los logs
setTimeout(() => {
  console.log('Terminando después de 1 segundo');
}, 1000);
