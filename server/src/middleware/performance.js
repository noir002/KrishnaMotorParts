// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }
    
    // Add response time header
    res.set('X-Response-Time', `${responseTime}ms`);
    
    // Call original end method
    originalEnd.apply(this, args);
  };
  
  next();
};

// Memory usage monitoring
const memoryMonitor = () => {
  const used = process.memoryUsage();
  const memoryInfo = {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  };
  
  // Log memory usage if heap usage is high
  if (memoryInfo.heapUsed > 100) { // 100MB threshold
    console.warn('High memory usage detected:', memoryInfo);
  }
  
  return memoryInfo;
};

// Start memory monitoring interval
let memoryInterval;
const startMemoryMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    memoryInterval = setInterval(() => {
      memoryMonitor();
    }, 30000); // Check every 30 seconds
  }
};

const stopMemoryMonitoring = () => {
  if (memoryInterval) {
    clearInterval(memoryInterval);
  }
};

module.exports = {
  performanceMonitor,
  memoryMonitor,
  startMemoryMonitoring,
  stopMemoryMonitoring
};