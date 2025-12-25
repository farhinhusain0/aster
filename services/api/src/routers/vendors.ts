import express, { Request, Response } from "express";
import { vendorModel } from "@aster/db";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { catchAsync } from "../utils/errors";

const router = express.Router();
router.use(checkAuth);
router.use(getDBUser);

router.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const vendors = await vendorModel.get().sort({ order: 1 });

    return res.status(200).json(vendors);
  }),
);

export { router };
