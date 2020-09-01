import express from 'express';
import accountsRouter from './routes/accountsRouter.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const app = express();
const params = dotenv.config();

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${params.parsed.USERDB}:${params.parsed.USERDB}@cluster0.1v9ej.mongodb.net/myBank?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
  } catch (error) {
    console.log('err' + error);
  }
})();

app.use(express.json());
app.use('/account', accountsRouter);

app.listen(params.parsed.PORT, () => {
  console.log('App listen on port 3000');
});