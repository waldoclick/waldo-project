export {};

declare module "koa" {
  interface KoaFile {
    mimetype: string;
    [key: string]: unknown;
  }

  interface Request {
    body: any;
    files?: Record<string, KoaFile | KoaFile[]>;
  }
}
