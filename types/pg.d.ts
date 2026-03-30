declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = any>(
      text: string,
      values?: any[]
    ): Promise<QueryResult<T>>;
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export interface PoolClient {
    query<T = any>(
      text: string,
      values?: any[]
    ): Promise<QueryResult<T>>;
    release(): void;
  }
}
