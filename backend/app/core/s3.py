import os
import boto3

class MinioClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MinioClient, cls).__new__(cls)
            cls._instance._init_client()
        return cls._instance

    def _init_client(self):
        self.minio_url = os.getenv("MINIO_URL", "http://minio:9000")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        
        self.client = boto3.client(
            "s3",
            endpoint_url=self.minio_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
        )

    @classmethod
    def get_client(cls):
        return cls().client
