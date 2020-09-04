import express from 'express';
import { accountsModel } from '../models/accountsModule.js';
const accountsRouter = express.Router();

accountsRouter.get('/', async (req, res, next) => {
  try {
    const accounts = await accountsModel.find();
    res.send(accounts);
  } catch (err) {
    next(err);
  }
});

accountsRouter.get('/less/:qtdToshow', async (req, res, next) => {
  try {
    const qtdToShow = req.params.qtdToshow;
    const accounts = await accountsModel
      .find({}, { _id: 0, __v: 0 })
      .sort({ balance: 1 })
      .limit(Number(qtdToShow));

    res.send(accounts);
  } catch (err) {
    next(err);
  }
});

accountsRouter.get('/bigger/:qtdToshow', async (req, res, next) => {
  try {
    const qtdToShow = req.params.qtdToshow;
    const accounts = await accountsModel
      .find({}, { _id: 0, __v: 0 })
      .sort({ balance: -1 })
      .limit(Number(qtdToShow));

    res.send(accounts);
  } catch (err) {
    next(err);
  }
});

accountsRouter.get('/transferUsers', async (req, res, next) => {
  try {
    const accounts = await accountsModel.aggregate([
      {
        $group: {
          _id: '$agencia',
          balance: { $max: '$balance' },
        },
      },
    ]);

    for (const account of accounts) {
      let newAccount = await accountsModel.findOne({
        $and: [
          {
            agencia: account._id,
            balance: account.balance,
          },
        ],
      });

      newAccount.agencia = 99;
      newAccount.save();
    }

    let accountsPrivate = await accountsModel.find({
      agencia: 99,
    });

    console.log(accountsPrivate);

    res.send(accountsPrivate);
  } catch (err) {
    next(err);
  }
});

accountsRouter.get('/getAccount', async (req, res, next) => {
  try {
    console.log(req.query);
    const accountToShow = req.query;
    if (!accountToShow.agencia || !accountToShow.conta) {
      throw new Error('Agencia, conta e Balance são obrigatórios');
    }
    const account = await accountsModel.findOne({
      $and: [
        {
          agencia: accountToShow.agencia,
          conta: accountToShow.conta,
        },
      ],
    });
    if (!account) {
      throw new Error('Conta não existe!');
    }
    res.send(`O seu saldo é de: ${account.balance}`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.get('/average/:agencia', async (req, res, next) => {
  try {
    const agencia = req.params.agencia;
    if (!agencia) {
      throw new Error('Agencia é obrigatória');
    }

    const avgAgencia = await accountsModel.aggregate([
      {
        $match: {
          agencia: agencia,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$balance' },
        },
      },
    ]);
    let avg = 0;
    avgAgencia.forEach((item) => {
      avg = item.avg;
    });
    res.send(`A média de contas para essa agencia é de: ${avg.toFixed(2)}`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.delete('/', async (req, res, next) => {
  try {
    const accountToDelete = req.query;
    if (!accountToDelete.agencia || !accountToDelete.conta) {
      throw new Error('Agencia, conta e Balance são obrigatórios');
    }
    const accountDeleted = await accountsModel.findOneAndDelete({
      $and: [
        {
          agencia: accountToDelete.agencia,
          conta: accountToDelete.conta,
        },
      ],
    });
    if (!accountDeleted) {
      throw new Error('Conta não existe!');
    }
    const sumAgencias = await accountsModel.aggregate([
      {
        $match: {
          agencia: accountToDelete.agencia,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);
    let sum = 0;
    sumAgencias.forEach((item) => {
      sum = item.count;
    });
    res.send(`A quantidade de contas para essa agencia é de: ${sum}`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.delete('/deleteAll', async (req, res, next) => {
  try {
    const deleteAll = await accountsModel.remove();
    if (!deleteAll) {
      throw new Error('Conta não existe!');
    }

    res.send(`Contas excluidas com sucesso`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.post('/', async (req, res, next) => {
  try {
    //carga inicial

    const accountsToInsert = req.body;
    let account = [];
    accountsToInsert.forEach(async (accountItem) => {
      account = new accountsModel(accountItem);
      await account.save();
    });

    // const account = new accountsModel(req.body);
    // await account.save();

    res.send(account);

    //const accounts = new accountsModel(req.body);
    //await accounts.save();
  } catch (err) {
    next(err);
  }
});

accountsRouter.patch('/depositBalance', async (req, res, next) => {
  try {
    const accountToUpdate = req.body;
    if (
      !accountToUpdate.agencia ||
      !accountToUpdate.conta ||
      accountToUpdate.deposito == null
    ) {
      throw new Error('Agencia, conta e Balance são obrigatórios');
    }
    const account = await accountsModel.findOne({
      $and: [
        { agencia: accountToUpdate.agencia },
        { conta: accountToUpdate.conta },
      ],
    });
    if (!account) {
      throw new Error('Conta informada não existe!');
    }
    account.balance += accountToUpdate.deposito;
    await account.updateOne(account);
    res.send(`O saldo é ${account.balance}`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.put('/depositBalance', async (req, res, next) => {
  try {
    const accountToUpdate = req.body;
    if (
      !accountToUpdate.agencia ||
      !accountToUpdate.conta ||
      accountToUpdate.deposito == null
    ) {
      throw new Error('Agencia, conta e Balance são obrigatórios');
    }
    const account = await accountsModel.findOne({
      $and: [
        { agencia: accountToUpdate.agencia },
        { conta: accountToUpdate.conta },
      ],
    });
    if (!account) {
      throw new Error('Conta informada não existe!');
    }
    account.balance += accountToUpdate.deposito;
    await account.updateOne(account);
    res.send(`O saldo é ${account.balance}`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.put('/sendMoney', async (req, res, next) => {
  try {
    const data = req.query;
    if (!data.contaOrigem || !data.contaDestino || data.valor == null) {
      throw new Error('Conta origem, conta destino e valor são obrigatórios');
    }
    const contaDestino = await accountsModel.findOne({
      $and: [{ conta: data.contaDestino }],
    });
    const contaOrigem = await accountsModel.findOne({
      $and: [{ conta: data.contaOrigem }],
    });
    if (!contaDestino || !contaOrigem) {
      throw new Error('Conta informada não existe!');
    }

    if (contaOrigem.agencia === contaDestino.agencia) {
      contaDestino.balance += Number(data.valor);
      contaOrigem.balance -= Number(data.valor);
    } else {
      contaDestino.balance += Number(data.valor);
      contaOrigem.balance = contaOrigem.balance - Number(data.valor) - 8;
    }
    await contaDestino.updateOne(contaDestino);
    await contaOrigem.updateOne(contaOrigem);

    res.send(`O saldo da sua conta é: ${contaOrigem.balance}`);
  } catch (err) {
    next(err);
  }
});

accountsRouter.put('/withDrawBalance', async (req, res, next) => {
  try {
    const accountToUpdate = req.body;
    if (
      !accountToUpdate.agencia ||
      !accountToUpdate.conta ||
      accountToUpdate.saque == null
    ) {
      throw new Error('Agencia, conta e saque são obrigatórios');
    }
    const account = await accountsModel.findOne({
      $and: [
        { agencia: accountToUpdate.agencia },
        { conta: accountToUpdate.conta },
      ],
    });
    if (!account) {
      throw new Error('Conta informada não existe!');
    }
    account.balance = account.balance - accountToUpdate.saque - 1;
    if (account.balance >= 0) {
      await account.updateOne(account);
      res.send(account);
    } else {
      throw new Error('Impossivel movimentar, saldo ficará negativo!');
    }
  } catch (err) {
    next(err);
  }
});

accountsRouter.use((err, req, res, next) => {
  res.status(400).send({ error: err.message });
});

export default accountsRouter;
