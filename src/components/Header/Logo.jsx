import React from 'react';
    import { Link } from 'react-router-dom';

    const NEW_YANKIT_LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/4502ea55-58dc-4fdb-b457-d141a545e2dc/756040d54ee0518febe5fefe57bb02ac.png";

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