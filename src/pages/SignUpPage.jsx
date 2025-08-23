import React from 'react';
    import { Navigate } from 'react-router-dom';
    import { CardContent } from '@/components/ui/card';
    import SignUpForm from '@/components/auth/SignUpForm';
    import { useAuth } from '@/contexts/AuthContext';
    import AuthCard from '@/components/auth/AuthCard';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { SignUpPageHeader, SignInLink } from '@/components/auth/pagecomponents/SignUpPageElements';
    import AuthErrorDisplay from '@/components/auth/AuthErrorDisplay';

    const SignUpPage = () => {
      const { session, loading, authError } = useAuth();

      if (loading && session === undefined) {
        return <LoadingSpinner fullScreen={true} />;
      }
      
      if (authError && !session) {
        return <AuthErrorDisplay onRetry={() => window.location.reload()} />;
      }

      if (session) {
        return <Navigate to="/dashboard" replace />;
      }

      return (
        <AuthCard>
          <SignUpPageHeader />
          <CardContent className="p-6">
            <SignUpForm />
          </CardContent>
          <SignInLink />
        </AuthCard>
      );
    };

    export default SignUpPage;