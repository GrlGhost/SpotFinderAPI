import { Router } from "express";
import { addBalance } from "../controllers/Balance/balance.controller";

const balanceRouter = Router();

balanceRouter.route('/:mail/addBalance')
    .post(addBalance);

export default balanceRouter;