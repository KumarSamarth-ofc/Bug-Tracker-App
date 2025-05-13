import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="h-20 w-20 text-yellow-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for might have been removed or doesn't exist.
      </p>
      <Link
        to={isAuthenticated ? '/dashboard' : '/login'}
        className="btn btn-primary flex items-center"
      >
        <Home className="h-4 w-4 mr-2" />
        {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
      </Link>
    </div>
  );
};

export default NotFound;