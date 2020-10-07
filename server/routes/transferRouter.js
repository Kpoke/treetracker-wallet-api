const express = require('express');
const transferRouter = express.Router();
const WalletService = require("../services/WalletService");
const Wallet = require("../models/Wallet");
const TrustRelationship = require("../models/TrustRelationship");
const expect = require("expect-runtime");
const helper = require("./utils");
const Joi = require("joi");


transferRouter.post('/',
  helper.apiKeyHandler,
  helper.verifyJWTHandler,
  helper.handlerWrapper(async (req, res) => {
    Joi.assert(
      req.body,
      Joi.object({
        tokens: Joi.array().items(Joi.string()).required(),
        sender_wallet: Joi.string()
          .required(),
        receiver_wallet: Joi.string()
          .required(),
      })
    );
    const walletService = new WalletService();
    const walletLogin = await walletService.getById(res.locals.wallet_id);
    const walletSender = await walletService.getByName(req.body.sender_wallet);
    const walletReceiver = await walletService.getByName(req.body.receiver_wallet);
    await walletLogin.transfer(walletSender, walletReceiver);
    res.status(201).json({});
  })
);

transferRouter.post('/:transfer_id/accept',
  helper.apiKeyHandler,
  helper.verifyJWTHandler,
  helper.handlerWrapper(async (req, res) => {
    Joi.assert(
      req.params,
      Joi.object({
        transfer_id: Joi.number().required(),
      })
    );
    const walletService = new WalletService();
    const walletLogin = await walletService.getById(res.locals.wallet_id);
    await walletLogin.acceptTransfer(req.params.transfer_id);
    res.status(200).json({});
  })
);

transferRouter.post('/:transfer_id/decline',
  helper.apiKeyHandler,
  helper.verifyJWTHandler,
  helper.handlerWrapper(async (req, res) => {
    Joi.assert(
      req.params,
      Joi.object({
        transfer_id: Joi.number().required(),
      })
    );
    const walletService = new WalletService();
    const walletLogin = await walletService.getById(res.locals.wallet_id);
    await walletLogin.declineTransfer(req.params.transfer_id);
    res.status(200).json({});
  })
);

transferRouter.post('/:transfer_id/fulfill',
  helper.apiKeyHandler,
  helper.verifyJWTHandler,
  helper.handlerWrapper(async (req, res) => {
    Joi.assert(
      req.params,
      Joi.object({
        transfer_id: Joi.number().required(),
      })
    );
    const walletService = new WalletService();
    const walletLogin = await walletService.getById(res.locals.wallet_id);
    await walletLogin.fulfillTransfer(req.params.transfer_id);
    res.status(200).json({});
  })
);

transferRouter.get("/", 
  helper.apiKeyHandler,
  helper.verifyJWTHandler,
  helper.handlerWrapper(async (req, res) => {
    const {state, wallet} = req.query;
    const walletService = new WalletService();
    const walletLogin = await walletService.getById(res.locals.wallet_id);
    const result = await walletLogin.getTransfers(state, wallet);
    res.status(200).json({transfers: result});
  })
);


module.exports = transferRouter;
