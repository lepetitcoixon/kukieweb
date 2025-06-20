
import React from 'react';
import { Product, Allergen } from '../types';
import { Button } from './ui/Button';
import { AllergenDisplay } from './ui/AllergenIcon';
import { ALLERGEN_DETAILS } from '../constants';

interface CookieCardProps {
  cookie: Product;
  onViewDetails: (cookie: Product) => void;
  isSubscriptionLayout?: boolean; // For explicit control if needed, though productType is better
}

export const CookieCard: React.FC<CookieCardProps> = ({ cookie, onViewDetails }) => {
  const isSubscription = cookie.productType === 'subscription';

  const cardBaseClasses = "rounded-xl shadow-lg overflow-hidden flex flex-col h-full transform transition-transform duration-300";
  const cookieClasses = "bg-kukie-light-brown text-kukie-beige hover:scale-105";
  const subscriptionClasses = "bg-kukie-brown text-kukie-beige hover:opacity-95"; // Distinct style for subscription

  return (
    <div className={`${cardBaseClasses} ${isSubscription ? subscriptionClasses : cookieClasses}`}>
      <img
        src={cookie.imageUrl || 'https://via.placeholder.com/600x400.png?text=No+Image'}
        alt={cookie.name}
        className="w-full h-40 xs:h-48 object-cover"
      />
      <div className="p-3 sm:p-4 lg:p-5 flex flex-col flex-grow">
        <h3 className={`text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 ${isSubscription ? 'text-kukie-yellow' : 'text-kukie-yellow'}`}>{cookie.name}</h3>
        <p className={`text-xs sm:text-sm mb-2 sm:mb-3 flex-grow ${isSubscription ? 'text-kukie-dark-beige' : 'text-kukie-dark-beige'}`}>{cookie.description}</p>

        {isSubscription ? (
          <div className="mb-2 sm:mb-3">
            <p className={`text-xs mb-1 ${isSubscription ? 'text-gray-400' : 'text-kukie-dark-beige'}`}>Características:</p>
            <span
              className={`inline-flex items-center justify-center bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full mr-1.5 mb-1.5 shadow-sm`}
            >
              Siempre Sin Gluten
            </span>
          </div>
        ) : (
          <div className="mb-2 sm:mb-3">
            <p className="text-xs text-kukie-dark-beige mb-1">Contiene:</p>
            {cookie.defaultAllergens?.length > 0 ? (
              cookie.defaultAllergens.map(allergen => (
                <AllergenDisplay key={allergen} allergen={allergen} type="present" size="sm" />
              ))
            ) : (
              <span className="text-xs text-green-300 italic">Naturalmente libre de alérgenos comunes.</span>
            )}
          </div>
        )}

        <div className="mb-3 sm:mb-4">
          <p className={`text-xs mb-1 ${isSubscription ? 'text-gray-400' : 'text-kukie-dark-beige'}`}>
            {isSubscription ? "Se puede personalizar para ser (además de Sin Gluten):" : "Se puede personalizar para ser:"}
          </p>
          {cookie.availableCustomizations?.length > 0 ? (
            cookie.availableCustomizations.map(allergenKey => (
              <AllergenDisplay key={allergenKey} allergen={allergenKey} type="available-customization" size="sm" />
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">Solo receta estándar.</span>
          )}
        </div>

        <div className="mt-auto flex justify-between items-center">
          <p className={`text-xl sm:text-2xl font-semibold ${isSubscription ? 'text-kukie-yellow' : 'text-kukie-yellow'}`}>
            ${cookie.price.toFixed(2)}{isSubscription && <span className="text-xs">/entrega</span>}
          </p>
          <Button onClick={() => onViewDetails(cookie)} variant="primary" size="sm" className="!text-xs sm:!text-sm">
            {isSubscription ? 'Ver Suscripción' : 'Personalizar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
