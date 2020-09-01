import mongoose from 'mongoose';

const accountsSchema = mongoose.Schema({
  agencia: {
    type: String,
    require: true,
  },
  conta: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    min: 0,
  },
});

const accountsModel = mongoose.model('accounts', accountsSchema, 'accounts');

export { accountsModel };
