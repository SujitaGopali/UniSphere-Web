import app from "./src/app";
import { PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

async function bootstrap(): Promise<void> {
  await connectToMongoDB();

  // Bind 0.0.0.0 so Render/Docker can reach the process (not only localhost).
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
