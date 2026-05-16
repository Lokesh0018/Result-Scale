import express from "express";
import {login} from "../controller/loginController";

export const router = express.Router();
router.post("/login",login);