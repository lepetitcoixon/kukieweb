
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, APP_SLOGAN } from '../constants';
import { CookieLogo } from './ui/CookieLogo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import { Button } from './ui/Button';

export const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const { currentUser, logout, isAdmin, isPickupPointUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <header className="bg-kukie-brown text-kukie-beige shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-2 xxs:px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center group">
            <CookieLogo 
              className="text-kukie-yellow group-hover:opacity-80 transition-opacity" 
              width="48"
              height="48"
              chipColor="rgba(245,239,230,0.3)" 
              biteColor="#5D544C" 
            />
            <div className="ml-2 sm:ml-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight group-hover:text-kukie-yellow transition-colors">{APP_NAME}</h1>
              <p className="text-xs text-kukie-dark-beige">{APP_SLOGAN}</p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-0.5 xxs:space-x-1 sm:space-x-2">
            <Link to="/" className="text-xs sm:text-sm font-medium hover:text-kukie-yellow transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md">Inicio</Link>
            <Link to="/catalog" className="text-xs sm:text-sm font-medium hover:text-kukie-yellow transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md">Catálogo</Link>
            
            {currentUser ? (
              <>
                <Link to="/profile" className="text-xs sm:text-sm font-medium hover:text-kukie-yellow transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md">Mi Cuenta</Link>
                {isAdmin() && (
                  <Link to="/admin" className="text-xs sm:text-sm font-medium text-kukie-yellow hover:text-yellow-300 transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md bg-kukie-light-brown">Panel Admin</Link>
                )}
                {isPickupPointUser() && (
                  <Link to="/pickup-dashboard" className="text-xs sm:text-sm font-medium text-kukie-yellow hover:text-yellow-300 transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md bg-kukie-light-brown">Panel Recogida</Link>
                )}
                <Button onClick={handleLogout} variant="ghost" size="sm" className="hover:text-kukie-yellow !px-1 xxs:!px-1.5 sm:!px-2 !py-1 text-xs sm:text-sm">Cerrar Sesión</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs sm:text-sm font-medium hover:text-kukie-yellow transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md">Iniciar Sesión</Link>
                {/* Simplified registration link, assuming users know if they are a pickup point or not. */}
                {/* <Link to="/register" className="text-xs sm:text-sm font-medium hover:text-kukie-yellow transition-colors px-1 xxs:px-1.5 sm:px-2 py-1 rounded-md">Registrarse</Link> */}
              </>
            )}

            <button onClick={() => navigate('/cart')} className="relative text-xs sm:text-sm font-medium hover:text-kukie-yellow transition-colors p-1.5 sm:p-2 rounded-full group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-kukie-yellow text-kukie-brown text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getTotalItems()}
                </span>
              )}
               <span className="sr-only">Ver Carrito</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
