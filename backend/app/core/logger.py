import logging
import json
import os
import datetime

class JSONFormatter(logging.Formatter):
    def __init__(self, service_name: str):
        super().__init__()
        self.service_name = service_name

    def format(self, record):
        log_record = {
            "time": datetime.datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "service": self.service_name,
            "message": record.getMessage(),
            "name": record.name,
        }
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logger(service_name: str) -> logging.Logger:
    logger = logging.getLogger(service_name)
    
    # If the logger already has handlers, assume it's configured
    if logger.handlers:
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Send logs to stdout so Docker/Promtail can capture them
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter(service_name))
    logger.addHandler(handler)
    
    # Optional: silence some noisy logs like pika or uvicorn
    logging.getLogger("pika").setLevel(logging.WARNING)
    
    return logger
