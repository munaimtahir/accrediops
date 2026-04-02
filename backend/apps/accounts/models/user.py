from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.masters.choices import RoleChoices


class User(AbstractUser):
    department = models.ForeignKey(
        "accounts.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.OWNER,
    )

    def __str__(self) -> str:
        return self.get_full_name() or self.username
