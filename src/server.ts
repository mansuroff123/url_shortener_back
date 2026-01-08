import 'dotenv/config';
import app from './app.js';


const PORT: number = Number(process.env.PORT) || 5000;
const HOST: string = process.env.HOST || '0.0.0.0'; // Barcha tarmoq interfeyslari uchun
const CURRENT_IP: string = process.env.CURRENT_IP || 'localhost';


const startServer = () => {
  try {
    const server = app.listen(PORT, HOST, () => {
      console.clear();
      console.log("===========================================");
      console.log(`🚀 SERVER SUCCESSFULLY STARTED`);
      console.log(`🏠 Local:   http://localhost:${PORT}`);
      console.log(`📡 Network: http://${CURRENT_IP}:${PORT}`);
      console.log(`🛠️  Mode:    ${process.env.NODE_ENV || 'development'}`);
      console.log("===========================================");
    });

  
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
      } else {
        console.error(`❌ Server Error:`, error);
      }
      process.exit(1);
    });

    const shutdown = () => {
      console.log('\nStopping server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();