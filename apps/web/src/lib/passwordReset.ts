const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:3003';

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface OTPVerifyResponse extends PasswordResetResponse {
  token?: string;
}

/**
 * Request password reset - initiates the process by sending OTP to email
 * Backend should not expose whether email exists for security
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Return generic message for security (don't expose if email exists)
      return {
        success: false,
        error: data.message || 'Unable to process password reset. Please try again.',
      };
    }

    return {
      success: true,
      message: 'If an account exists with this email address, a verification code has been sent.',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again later.',
    };
  }
}

/**
 * Verify OTP code for password reset
 * Returns a token that should be used for the reset password step
 */
export async function verifyPasswordResetOTP(
  email: string,
  otp: string
): Promise<OTPVerifyResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Invalid or expired verification code.',
      };
    }

    return {
      success: true,
      message: 'Email verified successfully.',
      token: data.data?.token || data.token,
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again later.',
    };
  }
}

/**
 * Reset password with new password and reset token
 */
export async function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        token: resetToken,
        newPassword: newPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to reset password. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again later.',
    };
  }
}

/**
 * Resend OTP code
 */
export async function resendPasswordResetOTP(email: string): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/resend-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to resend code. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Verification code has been resent.',
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again later.',
    };
  }
}
