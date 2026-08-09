/**
 * Topic Controller
 * 
 * Responsibility:
 * Handles incoming HTTP requests related to topic discovery and management.
 * Delegates work to topic service and formats response JSON objects.
 */

const getTopics = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Get topics endpoint starter' });
  } catch (error) {
    next(error);
  }
};

const discoverTopics = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Discover topics endpoint starter' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTopics, discoverTopics };
