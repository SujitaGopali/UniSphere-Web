import app from "./src/app";
import { PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

async function bootstrap(): Promise<void> {
  await connectToMongoDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
