export {};

declare module "koa" {
  interface KoaFile {
    mimetype: string;
    [key: string]: unknown;
  }

  interface Request {
    body: unknown;
    files?: Record<string, KoaFile | KoaFile[]>;
  }
}
