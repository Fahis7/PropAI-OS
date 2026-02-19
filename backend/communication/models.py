from django.db import models

class ChatLog(models.Model):
    """
    Stores history of AI conversations for analytics.
    """
    organization = models.ForeignKey('core.Organization', on_delete=models.CASCADE)
    user_message = models.TextField()
    ai_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat at {self.timestamp}"