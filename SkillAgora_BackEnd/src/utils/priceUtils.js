// Utilidades para formatear precios
const priceUtils = {
  // Formatea un precio con símbolo de dólar
  formatPrice: (price, currency = 'USD') => {
    if (!price && price !== 0) return null;
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return null;
    
    // Formatear con 2 decimales
    const formattedPrice = numericPrice.toFixed(2);
    
    // Agregar símbolo de moneda
    switch (currency.toUpperCase()) {
      case 'USD':
        return `$${formattedPrice}`;
      case 'EUR':
        return `€${formattedPrice}`;
      case 'GBP':
        return `£${formattedPrice}`;
      default:
        return `${formattedPrice}`;
    }
  },

  // Formatea un precio sin símbolo de moneda (solo el número)
  formatPriceNumber: (price) => {
    if (!price && price !== 0) return null;
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return null;
    
    return numericPrice.toFixed(2);
  },

  // Obtiene solo el símbolo de moneda
  getCurrencySymbol: (currency = 'USD') => {
    switch (currency.toUpperCase()) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '';
    }
  },

  // Formatea un rango de precios
  formatPriceRange: (minPrice, maxPrice, currency = 'USD') => {
    const min = priceUtils.formatPrice(minPrice, currency);
    const max = priceUtils.formatPrice(maxPrice, currency);
    
    if (!min && !max) return null;
    if (!min) return max;
    if (!max) return min;
    if (min === max) return min;
    
    return `${min} - ${max}`;
  }
};

export default priceUtils; 