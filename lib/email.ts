import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/lib/aws/ses";
import { env } from "@/lib/env";

export async function sendAuditAlert(
    to: string,
    auditId: string,
    discrepancy: number
) {
    try {
        const command = new SendEmailCommand({
            Source: env.AWS_FROM_EMAIL,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: `FlowAudit Alert: Audit #${auditId}`,
                    Charset: "UTF-8",
                },
                Body: {
                    Html: {
                        Data: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #e11d48;">Leak Detected</h2>
                <p>Alert: Audit <strong>#${auditId}</strong> has detected a <strong>${discrepancy}%</strong> variance in water usage.</p>
                <p>Please investigate immediately.</p>
                <hr />
                <p style="font-size: 12px; color: #666;">FlowAudit Automated System</p>
              </div>
            `,
                        Charset: "UTF-8",
                    },
                    Text: {
                        Data: `Alert: Audit #${auditId} has detected a ${discrepancy}% variance in water usage. Please investigate immediately.`,
                        Charset: "UTF-8",
                    },
                },
            },
        });

        const result = await sesClient.send(command);
        console.log(`Email sent to ${to}, MessageId: ${result.MessageId}`);
        return { success: true, messageId: result.MessageId };
    } catch (error) {
        console.error("Error sending audit alert email:", error);
        // Rethrow or return failure depending on desired error handling
        throw new Error("Failed to send audit alert email");
    }
}
