import settings from './settings';
import express, { NextFunction, Request, Response } from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import http from 'http';
import { AddressInfo } from 'net';
import { join } from 'path';

declare module 'express' {
  interface Request {
    user?: { uid: string };
  }
}

export class Server {
  private readonly platform = express();
  private readonly port?: number =
    process.env.HTTP_PORT && !isNaN(+process.env.HTTP_PORT)
      ? +process.env.HTTP_PORT
      : undefined;
  private server?: http.Server;
  private readonly admin = initializeApp({
    projectId: 'ao-firebase',
    credential: credential.cert(settings)
  });

  constructor(port?: number) {
    this.addRenderEngine();
    this.mountRoutes();
    this.port ??= port;
  }

  public async bootstrap(): Promise<void> {
    this.server = await this.platform.listen(this.port);
    const addr = this.server.address() as unknown as AddressInfo;

    process
      .on('SIGTERM', this.close)
      .on('SIGINT', this.close)
      .on('SIGHUP', this.close);

    if (!addr) {
      // eslint-disable-next-line no-console
      console.log(`Example app has been terminated`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Example app listening on port ${addr.port}`);
    }
  }

  private addRenderEngine(): void {
    const staticFiles = join(__dirname, 'assets');
    this.platform.use(express.static(staticFiles));
    this.platform.set('views', staticFiles);
    this.platform.set('view engine', 'ejs');

    this.platform.use((_: Request, res: Response, next: NextFunction) => {
      const orig = res.render;
      // you'll probably want to use a full blown render engine capable of layouts
      res.render = (view, locals) => {
        this.platform.render(view, locals, (err, html) => {
          if (err) {
            throw err;
          }

          orig.call(res, '_layout', {
            ...locals,
            // @ts-expect-error wrong signature
            body: html
          });
        });
      };
      next();
    });
  }

  private mainPage = (_: Request, res: Response, next: NextFunction) => {
    try {
      return res.render('main', {
        title: 'Dashboard'
      });
    } catch (err) {
      return next(err);
    }
  };

  private loginPage = (_: Request, res: Response, next: NextFunction) => {
    try {
      return res.render('login', {
        title: 'Log in'
      });
    } catch (err) {
      return next(err);
    }
  };

  private userinfo = (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).send(req.user);
    } catch (err) {
      return next(err);
    }
  };

  private verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        res.status(401).send('Wrong credentials.');

        return;
      }

      const decodedToken = await getAuth(this.admin).verifyIdToken(token);

      const { docs } = await getFirestore(this.admin)
        .collection('members')
        .where('userId', '==', decodedToken.uid)
        .limit(1)
        .get();

      const [user]: FirebaseFirestore.QueryDocumentSnapshot[] = docs;

      if (!user) {
        res.status(401).send('Wrong credentials.');

        return;
      }

      req.user = { ...decodedToken, ...user.data() };

      next();
    } catch {
      res.status(401).send('Wrong credentials.');
    }
  };

  private extractToken(req: Request): string | undefined {
    const authorization = req.header('authorization') ?? '';

    return authorization.substring(6).trim();
  }

  private mountRoutes(): void {
    this.platform.get('/login', this.loginPage);
    this.platform.get('/', this.mainPage);
    this.platform.get('/api/userinfo', this.verifyToken, this.userinfo);
  }

  private close = (): void => {
    this.server?.close();
  };
}
