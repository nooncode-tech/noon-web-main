const postgres = require('postgres');

async function test(url) {
  console.log('Testing url:', url);
  const sql = postgres(url, {
    ssl: "require",
    max: 1,
    connect_timeout: 5,
  });
  try {
    const res = await sql`SELECT 1 as num`;
    console.log('Success!', res);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
  }
}

test('postgres://postgres.umqbtqbsfjgfhdptbqfb:S0np1RHX2q3bvnas@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require')
  .then(() => test('postgresql://postgres.umqbtqbsfjgfhdptbqfb:S0np1RHX2q3bvnas@db.umqbtqbsfjgfhdptbqfb.supabase.co:5432/postgres'))
  .then(() => console.log('Done'));
