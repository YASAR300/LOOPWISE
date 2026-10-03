// src/lib/email/templates/reset-password.js
export function resetPasswordTemplate({ name, resetUrl }) {
  const displayName = name || "there";
  return {
    subject: "Reset your Loopwise password",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset your password</title>
<style>
  body { margin: 0; padding: 0; background: #08090A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .container { max-width: 560px; margin: 48px auto; background: #0F1011; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
  .header { padding: 32px 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .logo { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
  .logo span { color: #5E6AD2; }
  .body { padding: 36px 40px; }
  h1 { margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #fff; }
  p { margin: 0 0 20px; font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6; }
  .btn { display: inline-block; padding: 12px 28px; background: #5E6AD2; color: #fff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; }
  .warn { color: rgba(255,200,100,0.7); font-size: 13px; }
  .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.3); }
  .url-fallback { word-break: break-all; color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 20px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Loop<span>wise</span></div>
    </div>
    <div class="body">
      <h1>Reset your password</h1>
      <p>Hi ${displayName}, we received a request to reset the password for your Loopwise account. Click the button below — this link expires in 1 hour.</p>
      <a href="${resetUrl}" class="btn">Reset password</a>
      <p class="url-fallback">Or copy: ${resetUrl}</p>
      <p class="warn">⚠ If you didn't request a password reset, please change your password immediately as your account may be compromised.</p>
    </div>
    <div class="footer">
      <p>This link expires in 1 hour. Loopwise will never ask for your password by email.</p>
    </div>
  </div>
</body>
</html>`,
    text: `Hi ${displayName},\n\nReset your Loopwise password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  };
}
