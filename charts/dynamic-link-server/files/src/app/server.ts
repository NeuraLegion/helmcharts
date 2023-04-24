import express, { Request, Response } from 'express';
import { join } from 'path';
import { AddressInfo } from 'net';

export class Server {
  private readonly platform = express();
  private readonly port?: number =
    process.env.HTTP_PORT && !isNaN(+process.env.HTTP_PORT)
      ? +process.env.HTTP_PORT
      : undefined;

  constructor(port?: number) {
    this.port ??= port;
    this.addRenderEngine();
    this.mountRoutes();
  }

  public async bootstrap(): Promise<void> {
    const listener = await this.platform.listen(this.port);
    const addr = listener.address() as unknown as AddressInfo;
    if (!addr) {
      // eslint-disable-next-line no-console
      console.log(`Example app has been terminated`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Example app listening on port ${addr.port}`);
    }
  }

  private addRenderEngine() {
    this.platform.set('views', join(__dirname, 'assets'));
    this.platform.set('view engine', 'ejs');
    const staticFiles = join(__dirname, 'assets');
    this.platform.use(express.static(staticFiles));
  }

  private mountRoutes() {
    this.platform.get('/', (_req: Request, res: Response) => {
      res.sendFile('assets/index.html', { root: __dirname });
    });

    this.platform.get('/link-on-hover-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK ON HOVER PAGE',
        description: 'Link is displayed after hover on an element'
      })
    );

    this.platform.get('/link-on-click-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK ON CLICK PAGE',
        description: 'Link is displayed after clicking a button.'
      })
    );

    this.platform.get('/link-on-submit-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK ON SUBMIT PAGE',
        description: 'Link is displayed after submitting a small form'
      })
    );

    this.platform.get('/link-from-drag-and-drop-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK ON DRAGGED FILE PAGE',
        description:
          'Link is displayed after dragging a file to the area. This is to test how drag&drop interaction is handled by crawler'
      })
    );

    this.platform.get('/link-on-load-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK ON LOAD PAGE',
        description: 'Link is displayed after "load" event gets fired'
      })
    );

    this.platform.get('/link-after-delay-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK AFTER DELAY PAGE',
        description:
          'Link to this page appeared on the page after 2 seconds delay'
      })
    );

    this.platform.get('/link-on-scroll-page', (_req, res) =>
      res.render('lastpage', {
        title: 'LINK ON SCROLL PAGE',
        description:
          'Link is displayed after scroll within the page takes place'
      })
    );

    this.platform.use('/*', (_req: Request, res: Response) => {
      res.status(404).send('Page not found');
    });
  }
}
