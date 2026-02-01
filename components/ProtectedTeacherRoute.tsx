
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedTeacherRoute: React.FC = () => {
    const isAuth = localStorage.getItem('quizmaster_teacher_auth') === 'true';

    if (!isAuth) {
        return <Navigate to="/teacher/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedTeacherRoute;
