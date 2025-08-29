import React from 'react';
    import { Link } from 'react-router-dom';

    const NEW_YANKIT_LOGO_URL = "/logo.webp";

    const Logo = ({ onClick, isMobile = false }) => (
      <Link to="/" className="flex items-center" onClick={onClick}>
        <img 
          src={NEW_YANKIT_LOGO_URL} 
          alt={`Yankit Logo${isMobile ? ' Mobile' : ''}`} 
          className={isMobile ? "h-[59px] w-auto" : "h-[88px] w-auto"} 
        />
      </Link>
    );
    Logo.displayName = 'Logo';

    export default Logo;