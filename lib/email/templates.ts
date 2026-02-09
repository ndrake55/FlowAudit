export const emailTemplates = {
    resetPassword: (resetLink: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your FlowAudit password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `,

    newReportReady: (reportLink: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your FlowAudit Report is Ready</h2>
      <p>Your new audit report has been generated successfully.</p>
      <a href="${reportLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">View Report</a>
      <p>Note: Payment may be required to view full details.</p>
    </div>
  `,

    subscriptionPaid: (dashboardLink: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Subscription Payment Successful</h2>
      <p>Thank you for your payment! Your monthly subscription is active.</p>
      <p>You can manage your account and subscription settings here:</p>
      <a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; background-color: #6610f2; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `,

    supportTicketReceived: (userName: string, ticketId: string, subject: string, message: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Support Ticket Received</h2>
      <p>Hi ${userName},</p>
      <p>We've received your support request. Our team will get back to you shortly.</p>
      <hr />
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">${message}</blockquote>
    </div>
  `,

    adminNewTicket: (userName: string, userEmail: string, ticketId: string, subject: string, message: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Support Ticket</h2>
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">${message}</blockquote>
      <p>Reply to this email to respond directly to the user (if Reply-To is configured), or use the admin dashboard.</p>
    </div>
  `
};
