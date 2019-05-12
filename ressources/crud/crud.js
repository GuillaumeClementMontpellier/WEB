//connection a la BD TODO adapter
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});


//acces a la base de donnee TODO adapter
app.get('/db', async (req, res) => {
    try {
      
      const client = await pool.connect()

      const result = await client.query('SELECT * FROM test');
      const results = { 'results': (result) ? result.rows : null};

      res.render('pages/db', results );

      client.release();

    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })