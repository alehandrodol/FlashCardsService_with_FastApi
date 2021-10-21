from fastapi_users.authentication import JWTAuthentication

SECRET = "fg75y4g84hg94hgt8gh4ufjv4vu4hu"

jwt_authentication = JWTAuthentication(secret=SECRET, lifetime_seconds=3600, tokenUrl="auth/jwt/login")
