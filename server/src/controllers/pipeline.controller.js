const { runPipeline, getPipelineStatus, stopPipeline } = require('../services/pipeline.service');

const run = async (req, res, next) => {
  try {
    // Run pipeline in background
    const resultPromise = runPipeline();
    
    // Return immediately — pipeline runs async
    res.json({
      success: true,
      message: 'Pipeline started',
      data: getPipelineStatus(),
    });

    // Wait for completion (logs will capture results)
    await resultPromise;
  } catch (error) {
    if (error.message === 'Pipeline is already running') {
      return res.status(409).json({ success: false, error: error.message });
    }
    next(error);
  }
};

const status = async (req, res, next) => {
  try {
    res.json({ success: true, data: getPipelineStatus() });
  } catch (error) {
    next(error);
  }
};

const stop = async (req, res, next) => {
  try {
    const stopped = stopPipeline();
    res.json({
      success: true,
      message: stopped ? 'Pipeline stop requested' : 'Pipeline is not running',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { run, status, stop };
