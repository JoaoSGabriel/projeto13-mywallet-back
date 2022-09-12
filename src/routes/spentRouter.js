import { Router } from "express";
import { createSpent, getSpent, deleteSPent, updateSpent } from "../controllers/spentController.js";
import privateToken from "../middlewares/authorizationMiddleware.js";

const spentRouter = Router();


spentRouter.use(privateToken);

spentRouter.post('/new-spent', createSpent);
spentRouter.get('/my-wallet', getSpent);
spentRouter.delete('/my-wallet/:id', deleteSPent);
spentRouter.put('/my-wallet/:id', updateSpent);

export default spentRouter;