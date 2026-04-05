from django.contrib.auth import authenticate
from rest_framework import serializers

from apps.api.serializers.common import UserSummarySerializer


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        user = authenticate(request=request, username=attrs["username"], password=attrs["password"])
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is inactive.")
        attrs["user"] = user
        return attrs


class SessionSerializer(serializers.Serializer):
    authenticated = serializers.BooleanField()
    user = UserSummarySerializer(allow_null=True)
