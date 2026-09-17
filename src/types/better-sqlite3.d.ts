// Minimal type declarations for better-sqlite3 (installed without @types).
declare module "better-sqlite3" {
  interface Statement {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }
  class Database {
    constructor(filename: string, options?: { fileMustExist?: boolean; readonly?: boolean });
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(source: string, options?: { simple?: boolean }): unknown;
    close(): void;
  }
  export = Database;
}