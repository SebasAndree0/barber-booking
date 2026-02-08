import os
import requests

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
MAIL_FROM = os.getenv("MAIL_FROM", "onboarding@resend.dev")
REPLY_TO = os.getenv("REPLY_TO", "")  # ✅ a dónde llegan las respuestas

def send_email(to_email: str, subject: str, text: str) -> None:
    if not RESEND_API_KEY:
        print("⚠️ RESEND_API_KEY vacía -> no se envía")
        return

    payload = {
        "from": MAIL_FROM,
        "to": [to_email],
        "subject": subject,
        "text": text,
    }

    # ✅ Hace que el botón “Responder” llegue a tu Gmail
    if REPLY_TO:
        payload["reply_to"] = REPLY_TO

    r = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        json=payload,
        timeout=15,
    )

    print("📨 Resend status:", r.status_code)
    print("📨 Resend body:", r.text)

    r.raise_for_status()
