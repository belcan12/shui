# Shui – Anslagstavla (React + Vite + AWS)

En enkel anslagstavla med **React (Vite)** i frontend och **Serverless (AWS Lambda + API Gateway + DynamoDB)** i backend.  
Frontend hostas som **statisk webb på S3**.

---

## Live-länkar

- **App (S3 website):** [shui-belin-dev](http://shui-belin-dev.s3-website.eu-north-1.amazonaws.com)
- **API Base URL:** [h0oswzgrlb.execute-api.eu-north-1.amazonaws.com](https://h0oswzgrlb.execute-api.eu-north-1.amazonaws.com)


---

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Node.js 20 (AWS Lambda via Serverless Framework)
- **API:** API Gateway (HTTP API) med CORS
- **Databas:** DynamoDB
- **Hosting:** S3 Static Website Hosting

---

## Funktioner

- Lista alla meddelanden
- Skapa nytt meddelande (username + text)
- Redigera ett befintligt meddelande (PUT per id, backend verifierar att id finns)
- Sortera på datum (nyast/äldst)
- Hämta meddelanden för **alla** användare eller **specifikt** användarnamn  
  (case-insensitivt sökning via GSI `UsernameLowerIndex`)

---

## Datamodell
```jsonc
{
  "id": "string",                // UUID
  "username": "string",
  "usernameLower": "string",     // lowercase för case-insensitiv query
  "text": "string",
  "createdAt": 1700000000000     // epoch ms
}
```

## DynamoDB-index

UsernameIndex — HASH: username, RANGE: createdAt

UsernameLowerIndex — HASH: usernameLower, RANGE: createdAt (case-insensitiv sökning)

## API

**Bas:** `https://h0oswzgrlb.execute-api.eu-north-1.amazonaws.com`

### GET /messages

**Query params**
- `username` *(valfri)* — filtrerar på användare (case-insensitivt)
- `sort` *(valfri)* — `asc` eller `desc` (default `desc`)

**Exempel**
```
/messages?sort=asc
/messages?username=anna&sort=desc 
```


### POST /messages

Body:
```json
{ "username": "Anna", "text": "Hej från Shui!" }
```
### PUT /messages/{id}

Body:
```json
{ "text": "Ny text" }
```

## Frontend – miljövariabler
I shui-frontend/.env:
```bash
VITE_API_BASE_URL=https://h0oswzgrlb.execute-api.eu-north-1.amazonaws.com
```