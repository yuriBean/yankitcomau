import React from 'react';
    import { Navigate } from 'react-router-dom';
    import { CardContent } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext';
    import SignInForm from '@/components/auth/SignInForm';
    import AuthCard from '@/components/auth/AuthCard';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { SignInPageHeader, SignUpLink } from '@/components/auth/pagecomponents/SignInPageElements.jsx';
    import AuthErrorDisplay from '@/components/auth/AuthErrorDisplay';


    const SignInPage = () => {
      const { session, loading: sessionLoading, authError } = useAuth();

      if (sessionLoading && session === undefined) {
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
          <SignInPageHeader />
          <CardContent className="p-6">
            <SignInForm />
          </CardContent>
          <SignUpLink />
        </AuthCard>
      );
    };

    export default SignInPage;