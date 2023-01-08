import { app } from './app';
import * as dotenv from 'dotenv';
import { runDB } from './repositories/db';
dotenv.config();

const port = process.env.PORT || 3000;

const startApp = async () => {
  await runDB();
  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`);
  })
}

startApp();