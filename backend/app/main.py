from fastapi import FastAPI

app = FastAPI(
    title="BOB Intelligence API",
    version="0.1.0",
    description="Beyond Ordinary Boundaries - Intelligence Services",
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "BOB API",
        "version": "0.1.0",
    }
