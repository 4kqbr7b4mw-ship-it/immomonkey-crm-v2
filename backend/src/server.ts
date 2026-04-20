import { app } from "./app.js";
import { env } from "./config/env.js";
import { testDbConnection } from "./config/db.js";

async function bootstrap() {
  try {
    await testDbConnection();

    app.listen(env.PORT, () => {
      console.log(`✅ Server läuft auf Port ${env.PORT}`);
      console.log(`➡ Health: http://localhost:${env.PORT}/api/health`);
      console.log(`➡ Leads:  http://localhost:${env.PORT}/api/leads`);
    });
  } catch (error) {
    console.error("❌ Start fehlgeschlagen:", error);
    process.exit(1);
  }
}

bootstrap();