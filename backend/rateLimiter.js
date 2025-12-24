import rateLimit from "express-rate-limit";

/**
 * Rate limiter for expensive routes (LLM, upload)
 */
export const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,                 // max 5 requests per minute per IP
  standardHeaders: true,  // return rate limit info in headers
  legacyHeaders: false,   // disable X-RateLimit-* headers

  message: {
    message: "Too many requests. Please wait a moment and try again.",
  },
});

