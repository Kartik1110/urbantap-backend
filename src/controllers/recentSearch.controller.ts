import { Request, Response } from "express";
import {
  addSearchTerm,
  fetchSearchTerms,
  removeSearchTerm,
} from "../services/recentSearch.service";

export const saveRecentSearch = async (req: Request, res: Response) => {
  const { userId, term } = req.body;

  if (!userId || !term)
    return res.status(400).json({ message: "userId and term required" });

  try {
    await addSearchTerm(userId, term);
    res.status(200).json({ message: "Search saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving search", error: err });
  }
};

export const getRecentSearches = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "userId required" });

  try {
    const terms = await fetchSearchTerms(userId);
    res.status(200).json(terms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching searches", error: err });
  }
};

export const deleteRecentSearch = async (req: Request, res: Response) => {
  const { userId, term } = req.params;

  if (!userId || !term)
    return res.status(400).json({ message: "userId and term required" });

  try {
    await removeSearchTerm(userId, term);
    res.status(200).json({ message: "Search deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting search", error: err });
  }
};
