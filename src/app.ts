import { routerAuth } from './routers/authRouter';
import { routerUsers } from './routers/usersRouter';
import express, { Request, Response, NextFunction } from 'express';
import { blogsCollection, postsCollection, runDB, commentsCollection, clientsCollection, logCollection, authDevicesSessions, badPractice } from './repositories/db';
import { routerBlogs } from './routers/blogRouter';
import { routerPosts } from './routers/postsRouter';
import { routerComments } from './routers/commentsRouter';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { routerSecurity } from './routers/securityRouter';
dotenv.config();

export const app = express();
app.use(cors({
  credentials: true,
  origin: true,
}));
app.set('trust proxy', true);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

app.use('/auth', routerAuth);
app.use('/users', routerUsers);
app.use('/posts', routerPosts);
app.use('/blogs', routerBlogs);
app.use('/comments', routerComments);
app.use('/security', routerSecurity);

app.use("/testing/all-data", async (req: Request, res: Response) => {
  const b = blogsCollection.deleteMany({});
  const p = postsCollection.deleteMany({});
  const u = clientsCollection.deleteMany({});
  const c = commentsCollection.deleteMany({});
  const s = authDevicesSessions.deleteMany({})
  const bp = badPractice.deleteMany({})
  //const l = logCollection.deleteMany({});

  await Promise.all([b, p, u, c,  s, bp]);
	res.sendStatus(204);
})

app.use((req: Request, res: Response) => {
  res.type('text/plain');
  res.status(404);
  res.send('404 - Не найдено');
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Ошибка сервера');
})