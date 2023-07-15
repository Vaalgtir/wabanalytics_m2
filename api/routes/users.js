import express from "express";

const routerUsers = express.Router();

import { authAdmin } from "../middleware/auth.js";
import {
  login,
  createUser,
  validateToken,
  fetchAll,
  deleteUser,
  update,
  validateMail,
  mailConfirm,
  updatePassword,
} from "../controlers/users.js";

routerUsers.post("/create", createUser);
routerUsers.post("/fetchAll", authAdmin, fetchAll);
routerUsers.delete("/delete/:id", authAdmin, deleteUser);
routerUsers.post("/update/:id", authAdmin, update);
routerUsers.post("/updatePassword/:id", authAdmin, updatePassword);
routerUsers.post("/login", login);
routerUsers.post("/validateToken", validateToken);
routerUsers.post("/validateMail", validateMail);
routerUsers.get("/mailConfirm/:id", mailConfirm);

export default routerUsers;
