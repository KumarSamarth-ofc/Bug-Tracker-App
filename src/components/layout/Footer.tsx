import { Bug } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Bug className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-700">BugTrackr</span>
          </div>
          <div className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Kumar Samarth. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;