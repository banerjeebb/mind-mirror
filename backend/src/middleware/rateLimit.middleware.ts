import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests, please try again later" },
});

export const journalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many requests, please try again later" },
});
