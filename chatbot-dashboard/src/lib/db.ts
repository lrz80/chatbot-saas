import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Asegúrate de tenerla en .env
});

export default pool;
