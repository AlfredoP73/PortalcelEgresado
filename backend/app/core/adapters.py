from abc import ABC, abstractmethod
from typing import Optional
from fastapi import UploadFile
import httpx
import os
import uuid

class StoragePort(ABC):
    @abstractmethod
    def upload_file(self, file: UploadFile, bucket: str, prefix: str = "") -> str:
        pass

class MinioStorageAdapter(StoragePort):
    def __init__(self):
        from app.core.s3 import MinioClient
        self.s3_client = MinioClient.get_client()

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

class HttpMatchmakingAdapter(MatchmakingPort):
    def __init__(self):
        self.url = os.getenv("MATCHMAKING_URL", "http://matchmaking:8000")
        self.internal_token = os.getenv("MATCHMAKING_INTERNAL_TOKEN", "token_interno_servicios")

    def trigger_recalculate(self, graduate_id: Optional[int] = None, job_offer_id: Optional[int] = None) -> bool:
        payload = {}
        if graduate_id is not None:
            payload["graduate_id"] = graduate_id
        if job_offer_id is not None:
            payload["job_offer_id"] = job_offer_id
        if not payload:
            return False

        try:
            resp = httpx.post(
                f"{self.url}/matching/recalcular",
                json=payload,
                headers={"X-Internal-Token": self.internal_token},
                timeout=10.0,
            )
            resp.raise_for_status()
            return True
        except httpx.HTTPError:
            return False
