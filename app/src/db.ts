import pg from 'pg-promise';

const pgp = pg();

const db = pgp({
    'host': process.env.PGHOST,
    'database': process.env.PGDATABASE,
    'user': process.env.PGUSER,
    'password': process.env.PGPASSWORD,
    'port': process.env.PGPORT == undefined ? undefined : parseInt(process.env.PGPORT)
});

export default db;
