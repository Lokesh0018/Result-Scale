import express from "express";
import {login} from "../controller/studentController";

export const router = express.Router();

router.post("/login",login);