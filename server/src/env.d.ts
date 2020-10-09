declare namespace NodeJS {
  export interface ProcessEnv {
    REDIS_URL : string;
    PORT : string;
    SESSION_KEY : string;
    CORS_ORIGIN : string;
    COOKIE_DOMAIN : string;
    DATABASE_URL : string;
    DATABASE_NAME : string;
    DATABASE_USERNAME : string;
    DATABASE_PASSWORD : string;
  }
}
