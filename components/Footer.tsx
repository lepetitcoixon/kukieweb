
import React from 'react';
import { CONTACT_INFO, APP_NAME } from '../constants';
import { CookieLogo } from './ui/CookieLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-kukie-brown text-kukie-dark-beige py-6 sm:py-8 mt-10 sm:mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center mb-3 sm:mb-4">
           <CookieLogo 
              className="text-kukie-yellow opacity-70 mb-1 sm:mb-2" 
              width="40" // Adjusted from 50 
              height="40" // Adjusted from 50
              chipColor="rgba(245,239,230,0.2)"
              biteColor="#5D544C"
            />
          <h3 className="text-lg sm:text-xl font-semibold text-kukie-beige mb-0.5 sm:mb-1">{APP_NAME}</h3>
          <p className="text-xs sm:text-sm">{CONTACT_INFO.instagram} &bull; {CONTACT_INFO.phone}</p>
        </div>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
        </p>
        <p className="text-xs mt-1">
          Hecho con &hearts; para los amantes de las galletas.
        </p>
      </div>
    </footer>
  );
};
