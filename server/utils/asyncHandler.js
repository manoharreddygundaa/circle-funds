/**
 * asyncHandler — wraps async controller functions.
 *
 * Instead of writing try/catch in every controller:
 *   const myController = async (req, res, next) => {
 *     try { ... } catch(e) { next(e) }
 *   }
 *
 * You write:
 *   const myController = asyncHandler(async (req, res) => { ... });
 *
 * Any thrown error is automatically forwarded to the global errorHandler middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
