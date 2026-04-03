import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/lib/theme';
import { 
  LoginForm, 
  PasswordForm, 
  InviteCodeForm, 
  SetPasswordForm, 
  EmailConfirmationForm,
  OTPVerificationForm,
  ForgotPasswordForm
} from '@/components/auth';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';


export default function AuthScreen() {
  const [step, setStep] = useState<'login' | 'password' | 'invite' | 'setPassword' | 'awaitingEmailConfirmation' | 'otp' | 'forgotPassword'>('login');

  const [email, setEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const { signIn, signUp, checkUserExists, loading, error } = useAuth();
  const router = useRouter();

  const handleEmailSubmit = async (submittedEmail: string) => {
    setEmail(submittedEmail);
    const userExists = await checkUserExists(submittedEmail);
    setStep(userExists ? 'password' : 'invite');
  };

  const handlePasswordSubmit = async (password: string) => {
    const result = await signIn(email, password);
    if (!result.error) router.replace('/(tabs)/dashboard');
  };

  const handleInviteCodeSubmit = async (code: string) => {
    setStep('setPassword');
  };

  const handleSetPasswordSubmit = async (password: string) => {
    const result = await signUp(email, password);
    if (!result.error) setStep('awaitingEmailConfirmation');
  };

  const handleForgotPassword = () => {
    setStep('forgotPassword');
  };

  const handleResetSubmit = async (resetEmail: string) => {
    setResetLoading(true);
    setResetError(null);
    setResetMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);

    if (error) {
      setResetError(error.message);
      console.error("Password reset error:", error);
    } else {
      setResetMessage("Password reset request sent to your email.");
      console.log("Password reset request sent successfully.");
    }

    setResetLoading(false);
  };




  const handleBackFromForgot = () => {
    setStep('password');
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 'login' && <LoginForm onEmailSubmit={handleEmailSubmit} loading={loading} error={error || undefined} />}
      {step === 'password' && <PasswordForm email={email} onPasswordSubmit={handlePasswordSubmit} onBackToEmail={() => setStep('login')} onForgotPasswordClick={handleForgotPassword} loading={loading} error={error || undefined} />}
      {step === 'forgotPassword' && <ForgotPasswordForm initialEmail={email} onSubmit={handleResetSubmit} onBackToLogin={handleBackFromForgot} loading={resetLoading} error={resetError || undefined} successMessage={resetMessage || undefined} />}



      {step === 'invite' && <InviteCodeForm onCodeSubmit={handleInviteCodeSubmit} loading={loading} error={error || undefined} />}
      {step === 'setPassword' && <SetPasswordForm email={email} onPasswordSubmit={handleSetPasswordSubmit} loading={loading} error={error || undefined} />}
      {step === 'awaitingEmailConfirmation' && <EmailConfirmationForm email={email} onResendClick={() => console.log('Resend')} resendCountdown={0} />}
      {step === 'otp' && <OTPVerificationForm email={email} onCodeSubmit={(code) => console.log('OTP:', code)} onResendCode={() => console.log('Resend')} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.white, padding: 20 },
});
