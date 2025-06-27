import express from "express";
import {
  saveRecentSearch,
  getRecentSearches,
  deleteRecentSearch,
} from "../controllers/recentSearch.controller";

const router = express.Router();

router.post("/recentSearch", saveRecentSearch); 

router.get("/recentSearch/:userId", getRecentSearches); 

router.delete("/recentSearch/:userId/:term", deleteRecentSearch); 

export default router;
