import { Router } from "express";
import { addBalance, getBalance } from "../controllers/Balance/balance.controller";

const balanceRouter = Router();

balanceRouter.route('/:mail/addBalance')
    .post(addBalance);

balanceRouter.route('/:mail')
    .get(getBalance);

export default balanceRouter;