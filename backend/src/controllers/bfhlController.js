import { processData } from "../services/bfhlService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { USER_IDENTITY } from "../constants/index.js";

/**
 * POST /bfhl
 * Body: { "data": ["A->B", "A->C", ...] }
 */
export const handlePost = (req, res) => {
  try {
    const { data } = req.body;

    // data must be present and must be an array
    if (!data) return sendError(res, "data field is required", 400);
    if (!Array.isArray(data)) return sendError(res, "data must be an array", 400);

    const result = processData(data);

    sendSuccess(res, {
      ...USER_IDENTITY,
      ...result,
    });
  } catch (err) {
    sendError(res, err.message);
  }
};

/**
 * GET /bfhl
 * Returns operation_code as per spec.
 */
export const handleGet = (req, res) => {
  sendSuccess(res, { operation_code: 1 });
};
