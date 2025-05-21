# Cosmonavt Game API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints except user registration require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting
- 100 requests per minute per IP address
- Rate limit headers are included in the response

## Endpoints

### User Management

#### Register User
```http
POST /user
```
Request body:
```json
{
    "username": "string (3-30 chars)",
    "email": "string (valid email)",
    "password": "string (min 6 chars)"
}
```
Response (201):
```json
{
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "date",
    "preferences": {
        "difficulty": "string (easy|normal|hard)",
        "audio": {
            "music": "number (0-100)",
            "sfx": "number (0-100)"
        },
        "controls": {
            "sensitivity": "number (1-10)"
        }
    },
    "token": "string (JWT)"
}
```
Error Responses:
- 409 Conflict: User with email or username already exists
- 400 Bad Request: Invalid input data
- 500 Internal Server Error: Server error

#### Get User
```http
GET /user/:id
```
Response (200):
```json
{
    "id": "string",
    "username": "string",
    "stats": {
        "playTime": "number",
        "kills": "number",
        "deaths": "number",
        "missionsCompleted": "number",
        "logsCollected": "number"
    },
    "progress": {
        "currentMission": "string",
        "unlockedAreas": ["string"],
        "collectedItems": ["string"]
    },
    "preferences": {
        "difficulty": "string (easy|normal|hard)",
        "audio": {
            "music": "number (0-100)",
            "sfx": "number (0-100)"
        },
        "controls": {
            "sensitivity": "number (1-10)"
        }
    }
}
```
Error Responses:
- 404 Not Found: User not found
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

#### Update User
```http
PATCH /user/:id
```
Request body:
```json
{
    "stats": {
        "playTime": "number",
        "kills": "number",
        "deaths": "number",
        "missionsCompleted": "number",
        "logsCollected": "number"
    },
    "progress": {
        "currentMission": "string",
        "unlockedAreas": ["string"],
        "collectedItems": ["string"]
    },
    "preferences": {
        "difficulty": "string (easy|normal|hard)",
        "audio": {
            "music": "number (0-100)",
            "sfx": "number (0-100)"
        },
        "controls": {
            "sensitivity": "number (1-10)"
        }
    }
}
```
Response (200):
```json
{
    "id": "string",
    "updatedAt": "date",
    "stats": {
        "playTime": "number",
        "kills": "number",
        "deaths": "number",
        "missionsCompleted": "number",
        "logsCollected": "number"
    },
    "progress": {
        "currentMission": "string",
        "unlockedAreas": ["string"],
        "collectedItems": ["string"]
    },
    "preferences": {
        "difficulty": "string (easy|normal|hard)",
        "audio": {
            "music": "number (0-100)",
            "sfx": "number (0-100)"
        },
        "controls": {
            "sensitivity": "number (1-10)"
        }
    }
}
```
Error Responses:
- 404 Not Found: User not found
- 401 Unauthorized: Missing or invalid token
- 400 Bad Request: Invalid update data
- 500 Internal Server Error: Server error

#### Delete User
```http
DELETE /user/:id
```
Response (204): No Content
Error Responses:
- 404 Not Found: User not found
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Session Management

#### Create Session
```http
POST /session
```
Request body:
```json
{
    "userId": "string",
    "gameMode": "string",
    "difficulty": "string",
    "maxPlayers": "number",
    "isPrivate": "boolean",
    "seed": "string"
}
```
Response (201):
```json
{
    "id": "string",
    "gameMode": "string",
    "difficulty": "string",
    "maxPlayers": "number",
    "isPrivate": "boolean",
    "seed": "string",
    "createdAt": "date",
    "status": "string",
    "players": [{
        "id": "string",
        "username": "string",
        "ready": "boolean"
    }]
}
```

#### Get Session
```http
GET /session/:id
```
Response (200):
```json
{
    "id": "string",
    "gameMode": "string",
    "difficulty": "string",
    "maxPlayers": "number",
    "isPrivate": "boolean",
    "seed": "string",
    "createdAt": "date",
    "status": "string",
    "players": [{
        "id": "string",
        "username": "string",
        "ready": "boolean"
    }],
    "gameState": {
        "currentPhase": "string",
        "timeElapsed": "number",
        "activeEvents": ["string"]
    }
}
```

#### Get World Seed
```http
GET /session/:id/seed
```
Response (200):
```json
{
    "seed": "string",
    "version": "string",
    "parameters": {
        "difficulty": "string",
        "size": "string",
        "biomeDistribution": {
            "industrial": "number",
            "research": "number",
            "living": "number"
        }
    }
}
```

### Item Management

#### List Items
```http
GET /items
```
Query Parameters:
- `type`: Filter by item type (weapon, consumable, etc.)
- `rarity`: Filter by rarity
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response (200):
```json
{
    "items": [{
        "id": "string",
        "name": "string",
        "type": "string",
        "rarity": "string",
        "stats": {
            "damage": "number",
            "durability": "number"
        },
        "description": "string"
    }],
    "pagination": {
        "total": "number",
        "page": "number",
        "limit": "number",
        "pages": "number"
    }
}
```

#### Use Item
```http
POST /items/use
```
Request body:
```json
{
    "userId": "string",
    "itemId": "string",
    "quantity": "number",
    "target": "string"
}
```
Response (200):
```json
{
    "success": "boolean",
    "effects": {
        "health": "number",
        "stamina": "number"
    },
    "remainingQuantity": "number"
}
```

#### Equip Item
```http
PATCH /items/equip
```
Request body:
```json
{
    "userId": "string",
    "itemId": "string",
    "slot": "string"
}
```
Response (200):
```json
{
    "success": "boolean",
    "equippedItems": {
        "primary": {
            "id": "string",
            "name": "string"
        },
        "secondary": "null",
        "utility": "null"
    }
}
```

### Log Management

#### Get User Logs
```http
GET /logs/:user
```
Response (200):
```json
{
    "logs": [{
        "id": "string",
        "title": "string",
        "content": "string",
        "type": "string",
        "discoveredAt": "date",
        "location": {
            "chunk": "string",
            "coordinates": {
                "x": "number",
                "y": "number"
            }
        }
    }],
    "progress": {
        "total": "number",
        "discovered": "number",
        "categories": {
            "story": "number",
            "lore": "number",
            "research": "number"
        }
    }
}
```

#### Register Log
```http
POST /logs
```
Request body:
```json
{
    "userId": "string",
    "sessionId": "string",
    "logId": "string",
    "discoveryTime": "date",
    "location": {
        "chunk": "string",
        "coordinates": {
            "x": "number",
            "y": "number"
        }
    }
}
```
Response (201):
```json
{
    "id": "string",
    "discoveredAt": "date",
    "experienceGained": "number"
}
```

### Ranking Management

#### Get Rankings
```http
GET /ranking
```
Query Parameters:
- `type`: Ranking type (global, session, weekly, monthly)
- `category`: Category (kills, score, missions)
- `limit`: Number of entries (default: 10)
- `offset`: Starting position (default: 0)

Response (200):
```json
{
    "rankings": [{
        "position": "number",
        "userId": "string",
        "username": "string",
        "score": "number",
        "stats": {
            "kills": "number",
            "deaths": "number",
            "missionsCompleted": "number"
        }
    }],
    "pagination": {
        "total": "number",
        "limit": "number",
        "offset": "number"
    }
}
```

### Event Management

#### Report Event
```http
POST /event
```
Request body:
```json
{
    "userId": "string",
    "sessionId": "string",
    "type": "string",
    "timestamp": "date",
    "metadata": {
        "target": "string",
        "location": {
            "chunk": "string",
            "coordinates": {
                "x": "number",
                "y": "number"
            }
        },
        "details": {
            "damage": "number",
            "weapon": "string"
        }
    }
}
```
Response (201):
```json
{
    "id": "string",
    "processedAt": "date",
    "scoreChange": "number",
    "achievements": [{
        "id": "string",
        "name": "string",
        "unlockedAt": "date"
    }]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "error": "Bad Request",
    "message": "string"
}
```

### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "Please authenticate"
}
```

### 404 Not Found
```json
{
    "error": "Not Found",
    "message": "string"
}
```

### 409 Conflict
```json
{
    "error": "Conflict",
    "message": "string"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal Server Error",
    "message": "string"
}
```

## Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
``` 