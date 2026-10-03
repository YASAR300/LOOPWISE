// src/lib/email/templates/verify-email.js
export function verifyEmailTemplate({
  name,
  verifyUrl,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://loopwise.ai",
}) {
  const displayName = name || "there";
  return {
    subject: "Verify your Loopwise email address",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify your email</title>
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
      <h1>Verify your email, ${displayName}</h1>
      <p>You're almost in. Click the button below to verify your email address and activate your Loopwise account.</p>
      <a href="${verifyUrl}" class="btn">Verify email address</a>
      <p class="url-fallback">Or copy this link: ${verifyUrl}</p>
    </div>
    <div class="footer">
      <p>If you didn't create a Loopwise account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`,
    text: `Hi ${displayName},\n\nVerify your Loopwise email:\n${verifyUrl}\n\nIf you didn't sign up, ignore this email.`,
  };
}
