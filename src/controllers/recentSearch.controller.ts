import { Request, Response } from "express";
import {
  addSearchTerm,
  fetchSearchTerms,
  removeSearchTerm,
} from "../services/recentSearch.service";

export const saveRecentSearch = async (req: Request, res: Response) => {
  const { user_id, term } = req.body;

  if (!user_id || !term)
    return res.status(400).json({ message: "userId and term required" });

  try {
    await addSearchTerm(user_id, term);
    res.status(200).json({ message: "Search saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving search", error: err });
  }
};

export const getRecentSearches = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ message: "userId required" });

  try {
    const terms = await fetchSearchTerms(user_id);
    res.status(200).json(terms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching searches", error: err });
  }
};

export const deleteRecentSearch = async (req: Request, res: Response) => {
  const { user_id, term } = req.params;

  if (!user_id || !term)
    return res.status(400).json({ message: "userId and term required" });

  try {
    await removeSearchTerm(user_id, term);
    res.status(200).json({ message: "Search deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting search", error: err });
  }
};
