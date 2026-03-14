export async function sendAlert(message: string) {

  try {

    await fetch(process.env.NEXT_PUBLIC_ALERT_WEBHOOK!, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        text: message
      })

    });

  } catch (error) {

    console.error("Alert failed:", error);

  }

}