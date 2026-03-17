const AuditLog = require('../models/AuditLog');

const audit = (action, targetModel = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (data && data.success !== false) {
        try {
          await AuditLog.create({
            action,
            userId: req.user?._id,
            targetModel,
            details: { method: req.method, path: req.path },
            ipAddress: req.ip,
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = { audit };
