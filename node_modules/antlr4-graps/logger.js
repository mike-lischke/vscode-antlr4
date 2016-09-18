var logger = exports;
logger.logLevel = "error";

logger.log = function(level, message) {
  var levels = ["error", "warning", "info", "debug"];
  if (levels.indexOf(level) <= levels.indexOf(logger.logLevel)) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    };

    console.log("[graps-" + level + '] ' + message);
  }
}
