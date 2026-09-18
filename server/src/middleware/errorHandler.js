export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode ?? error.status ?? 500;
  let message = error.message || "An unexpected server error occurred.";
  let details;

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}.`;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(error.keyValue ?? {})[0] ?? "Value"} already exists.`;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  });
}
