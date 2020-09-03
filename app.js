import express from 'express';
import accountsRouter from './routes/accountsRouter.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const app = express();
(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERDB}:${process.env.PWDDB}@cluster0.1v9ej.mongodb.net/myBank?retryWrites=true&w=majority`,
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

app.listen(process.env.PORT, () => {
  console.log('App listen on port' + process.env.PORT);
});
