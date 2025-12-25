function getBaseEmailMarkup({
  buttonHref,
  buttonText,
  bodyText,
}: {
  buttonHref: string;
  buttonText: string;
  bodyText: string;
}) {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="margin-bottom: 40px;">
            <img src="https://aster.so/logo_with_text.png" alt="Aster Logo" style="width: auto; height: 32px;">
          </div>
          <p style="color: #000000; line-height: 26px; font-size: 20px; text-align: center; max-width: 580px; margin: 0 auto; margin-bottom: 24px;">
            ${bodyText}
          </p>
          <div style="text-align: center;">
            <a href="${buttonHref}" style="background-color: #1A1A1A; color: white; padding: 8px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold; line-height: 26px; text-align: center;">
              ${buttonText}
            </a>
          </div>
        </div>
      `;
}

export function getEmailVerificationEmail(token: string) {
  return getBaseEmailMarkup({
    buttonHref: `${process.env.DASHBOARD_APP_URL}/callback/signup?token=${token}`,
    buttonText: "Verify your email",
    bodyText:
      "This email address was just used to sign up for an Aster account. If this was you, please click the button below to verify your email address.",
  });
}

export function getPasswordResetEmail(token: string) {
  return getBaseEmailMarkup({
    buttonHref: `${process.env.DASHBOARD_APP_URL}/callback/reset-password?token=${token}`,
    buttonText: "Reset password",
    bodyText:
      "You recently requested to reset your Aster password. Click the button below to create a new password. If you didn't make this request, you can safely ignore this email.",
  });
}
