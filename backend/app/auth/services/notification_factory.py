from abc import ABC, abstractmethod
from app.auth.services.email_service import send_verification_email

class Notifier(ABC):
    @abstractmethod
    def send_verification(self, to_address: str, token: str):
        pass

class EmailNotifier(Notifier):
    def send_verification(self, to_address: str, token: str):
        send_verification_email(to_address, token)

class NotificationFactory:
    @staticmethod
    def get_notifier(notification_type: str) -> Notifier:
        if notification_type == "email":
            return EmailNotifier()
        raise ValueError(f"Unknown notification type: {notification_type}")
