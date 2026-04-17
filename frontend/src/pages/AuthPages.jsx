// Purpose: Pages — Login, Register, Chat routes for React Router v6
import React from 'react';
import AuthForm from '../components/AuthForm';

export function LoginPage()    { return <AuthForm mode="login"    />; }
export function RegisterPage() { return <AuthForm mode="register" />; }
