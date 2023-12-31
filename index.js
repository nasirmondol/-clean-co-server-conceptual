const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = 'veryverysecretamikicubolbona';


app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dsmrntz.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const servicesCollection = client.db('clean_co').collection('services');
    const bookingCollection = client.db('clean_co').collection('bookings');

    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/bookings', async (req, res) => {
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    })

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, secret);
      console.log(token);
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      }).send({ success: true });
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('clean co server is running')
})



app.listen(port, () => {
  console.log(`Running server on port ${port}`)
})