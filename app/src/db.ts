import pg from 'pg-promise';

const pgp = pg();

const db = pgp({
    'host': process.env.PGHOST,
    'database': process.env.PGDATABASE,
    'user': process.env.PGUSER,
    'password': process.env.PGPASSWORD,
    'port': parseInt(process.env.PGPORT || '5432')
});

export default db;
