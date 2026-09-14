# 🔌 API Documentation

The backend exposes a RESTful API. All data payloads and responses are in JSON format.

## Base URL
`/api`

## Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## Authentication
Protected endpoints require a Bearer token in the `Authorization` header:
`Authorization: Bearer <Firebase_ID_Token>`

## Global Middlewares
- **Rate Limiting**: Limits repeated requests to public APIs.
- **Helmet**: Secures HTTP headers.
- **CORS**: Restricts access to authorized frontend domains.
- **Auth Guard**: Validates Firebase tokens to inject `req.user`.
