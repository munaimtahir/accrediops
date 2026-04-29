from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ClientProfile(models.Model):
    organization_name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    license_number = models.CharField(max_length=120, blank=True)
    registration_number = models.CharField(max_length=120, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    department_names = models.JSONField(default=list, blank=True)
    linked_users = models.ManyToManyField(
        "accounts.User",
        blank=True,
        related_name="client_profiles",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization_name", "id"]

    def __str__(self) -> str:
        return self.organization_name
