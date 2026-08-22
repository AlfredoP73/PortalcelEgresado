from abc import ABC, abstractmethod
from typing import Optional
from fastapi import UploadFile
import httpx
import os
import uuid
import pika
import json
from circuitbreaker import circuit

class StoragePort(ABC):
    @abstractmethod
    def upload_file(self, file: UploadFile, bucket: str, prefix: str = "") -> str:
        pass

class MinioStorageAdapter(StoragePort):
    def __init__(self):
        from app.core.s3 import MinioClient
        self.s3_client = MinioClient.get_client()

    @circuit(failure_threshold=3, recovery_timeout=30)
    def upload_file(self, file: UploadFile, bucket: str, content_type: str = "application/pdf") -> str:
        try:
            self.s3_client.head_bucket(Bucket=bucket)
        except Exception:
            try:
                self.s3_client.create_bucket(Bucket=bucket)
            except Exception as e:
                print(f"Error creating bucket {bucket}: {e}")

        filename = f"{uuid.uuid4()}_{file.filename}"
        
        self.s3_client.upload_fileobj(
            file.file,
            bucket,
            filename,
            ExtraArgs={"ContentType": content_type}
        )
        return filename

class MatchmakingPort(ABC):
    @abstractmethod
    def trigger_recalculate(self, graduate_id: Optional[int] = None, job_offer_id: Optional[int] = None) -> bool:
        pass

class RabbitMQMatchmakingAdapter(MatchmakingPort):
    def __init__(self):
        self.rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

    @circuit(failure_threshold=5, recovery_timeout=60)
    def trigger_recalculate(self, graduate_id: Optional[int] = None, job_offer_id: Optional[int] = None) -> bool:
        payload = {}
        if graduate_id is not None:
            payload["graduate_id"] = graduate_id
        if job_offer_id is not None:
            payload["job_offer_id"] = job_offer_id
        if not payload:
            return False

        try:
            params = pika.URLParameters(self.rabbitmq_url)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue='matchmaking_queue', durable=True)
            
            channel.basic_publish(
                exchange='',
                routing_key='matchmaking_queue',
                body=json.dumps(payload),
                properties=pika.BasicProperties(
                    delivery_mode=2, # make message persistent
                )
            )
            connection.close()
            return True
        except Exception as e:
            print(f"Error publishing to RabbitMQ: {e}")
            return False
