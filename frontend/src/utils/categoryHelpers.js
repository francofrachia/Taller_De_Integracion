import { FaRocket } from 'react-icons/fa';
import { GiDinosaurRex, GiCastle, GiNinjaMask, GiCrown } from 'react-icons/gi';
import { FiBox } from 'react-icons/fi';

/**
 * Normalizes and formats the name of a category for user display.
 * @param {string} name - The raw name of the category from the database.
 * @returns {string} The formatted user-friendly display name.
 */
export const displayCategoryName = (name) => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower.includes('harry potter')) return 'Harry Potter';
  if (lower.includes('icon') || lower.includes('creator')) return 'Clásicos';
  if (lower.includes('city') || lower.includes('ciudad') || lower.includes('construccion') || lower.includes('construcción')) return 'Construcciones';
  if (lower.includes('technic') || lower.includes('speed')) return 'Vehículos';
  return name;
};

/**
 * Generates a normalized, CSS class friendly slug from the category name.
 * @param {string} name - The raw name of the category.
 * @returns {string} The normalized slug.
 */
export const getCategoryClass = (name) => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower.includes('harry potter')) return 'harry-potter';
  if (lower.includes('star wars')) return 'star-wars';
  if (lower.includes('marvel') || lower.includes('heroes') || lower.includes('héroes')) return 'marvel';
  if (lower.includes('dc')) return 'dc';
  if (lower.includes('disney')) return 'disney';
  if (lower.includes('minecraft')) return 'minecraft';
  if (lower.includes('city') || lower.includes('ciudad') || lower.includes('construccion') || lower.includes('construcción') || lower.includes('ciudades')) return 'construcciones';
  if (lower.includes('technic') || lower.includes('speed') || lower.includes('architecture') || lower.includes('vehiculo') || lower.includes('vehículo')) return 'vehiculos';
  if (lower.includes('icon') || lower.includes('creator') || lower.includes('clasico') || lower.includes('clásico') || lower.includes('clasicos') || lower.includes('clásicos')) return 'clasicos';
  return lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-');
};

/**
 * Resolves colors, icons, emojis, and vector components for a category.
 * @param {string} name - The raw name of the category.
 * @returns {object} Object containing { emoji, color, icon, vectorComponent, textColor, hoverBg, hoverTextColor, shadowColor }
 */
export const getCategoryVisuals = (name) => {
  if (!name) return {
    emoji: '🧱',
    color: '#FFD700',
    icon: null,
    vectorComponent: FiBox,
    textColor: '#1a1a1a',
    hoverBg: '#ffcf00',
    hoverTextColor: '#111827',
    shadowColor: '#cc9e00'
  };
  const lower = name.toLowerCase().trim();

  let emoji = '🧱';
  let color = '#FFD700';
  let iconPath = null;
  let vectorComponent = null;
  let textColor = '#1a1a1a';
  
  let hoverBg = null;
  let hoverTextColor = null;
  let shadowColor = null;

  if (lower.includes('star wars')) {
    color = '#263238';
    iconPath = '/imagenes icons/star wars.svg';
    textColor = '#ffffff';
    emoji = '🚀';
    hoverBg = '#1a1a1a';
    hoverTextColor = '#ffffff';
    shadowColor = '#000000';
  } else if (lower.includes('dc')) {
    color = '#0076F6';
    iconPath = '/imagenes icons/dc.svg';
    textColor = '#ffffff';
    emoji = '🦇';
    hoverBg = '#0082f0';
    hoverTextColor = '#ffffff';
    shadowColor = '#00569e';
  } else if (lower.includes('marvel') || lower.includes('héroes') || lower.includes('super heroes')) {
    color = '#EF5350';
    iconPath = '/imagenes icons/marvel.svg';
    textColor = '#ffffff';
    emoji = '🦸‍♂️';
    hoverBg = '#e3000b';
    hoverTextColor = '#ffffff';
    shadowColor = '#990007';
  } else if (lower.includes('harry potter')) {
    color = '#7E57C2';
    iconPath = '/imagenes icons/harry potter.svg';
    textColor = '#ffffff';
    emoji = '⚡';
    hoverBg = '#740000';
    hoverTextColor = '#ffcc00';
    shadowColor = '#4a0000';
  } else if (lower.includes('city') || lower.includes('construcciones') || lower.includes('ciudad') || lower.includes('ciudades')) {
    color = '#4FC3F7';
    iconPath = '/imagenes icons/city.svg';
    textColor = '#1a1a1a';
    emoji = '🏢';
    hoverBg = '#4fc3f7';
    hoverTextColor = '#111827';
    shadowColor = '#0097a7';
  } else if (lower.includes('technic') || lower.includes('speed') || lower.includes('architecture') || lower.includes('vehiculos') || lower.includes('vehículos')) {
    color = '#455A64';
    iconPath = '/imagenes icons/vehiculos.svg';
    textColor = '#ffffff';
    emoji = '🏎️';
    hoverBg = '#ff7800';
    hoverTextColor = '#ffffff';
    shadowColor = '#c85000';
  } else if (lower.includes('minecraft')) {
    color = '#4CAF50';
    iconPath = '/imagenes icons/minecraft.svg';
    textColor = '#ffffff';
    emoji = '🟩';
    hoverBg = '#508a37';
    hoverTextColor = '#ffffff';
    shadowColor = '#325c20';
  } else if (lower.includes('icon') || lower.includes('creator') || lower.includes('clasico') || lower.includes('clásico')) {
    color = '#FFB300';
    iconPath = '/imagenes icons/icons.svg';
    textColor = '#1a1a1a';
    emoji = '🧱';
    hoverBg = '#ffcf00';
    hoverTextColor = '#111827';
    shadowColor = '#cc9e00';
  } else if (lower.includes('disney')) {
    color = '#00b2eb';
    iconPath = '/imagenes icons/disney.svg';
    textColor = '#ffffff';
    emoji = '🏰';
    hoverBg = '#00b2eb';
    hoverTextColor = '#ffffff';
    shadowColor = '#007ba3';
  } else if (lower.includes('cartoon') || lower.includes('network') || lower.includes('looney')) {
    color = '#1a1a1a';
    iconPath = '/imagenes icons/cartoonNetwork.svg';
    textColor = '#ffffff';
    emoji = '📺';
    hoverBg = '#1a1a1a';
    hoverTextColor = '#ffffff';
    shadowColor = '#000000';
  }
  // Dynamic categories checks
  else if (lower.includes('jurassic') || lower.includes('dino') || lower.includes('parque')) {
    vectorComponent = GiDinosaurRex;
    emoji = '🦖';
    color = '#2e7d32';
    textColor = '#ffffff';
    hoverBg = '#2e7d32';
    hoverTextColor = '#ffffff';
    shadowColor = '#1b5e20';
  } else if (lower.includes('castle') || lower.includes('castillo') || lower.includes('knight') || lower.includes('medieval')) {
    vectorComponent = GiCastle;
    emoji = '🏰';
    color = '#78909c';
    textColor = '#ffffff';
    hoverBg = '#78909c';
    hoverTextColor = '#ffffff';
    shadowColor = '#4f5b66';
  } else if (lower.includes('space') || lower.includes('espacio') || lower.includes('galaxy') || lower.includes('cohete')) {
    vectorComponent = FaRocket;
    emoji = '🚀';
    color = '#1a237e';
    textColor = '#ffffff';
    hoverBg = '#1a237e';
    hoverTextColor = '#ffffff';
    shadowColor = '#0d125a';
  } else if (lower.includes('ninja') || lower.includes('ninjago')) {
    vectorComponent = GiNinjaMask;
    emoji = '🥷';
    color = '#b71c1c';
    textColor = '#ffffff';
    hoverBg = '#b71c1c';
    hoverTextColor = '#ffffff';
    shadowColor = '#7f0000';
  } else if (lower.includes('friends') || lower.includes('chicas') || lower.includes('princess') || lower.includes('corona')) {
    vectorComponent = GiCrown;
    emoji = '👑';
    color = '#ec407a';
    textColor = '#ffffff';
    hoverBg = '#ec407a';
    hoverTextColor = '#ffffff';
    shadowColor = '#b4004e';
  } else {
    vectorComponent = FiBox;
  }

  // Fallback defaults
  if (!hoverBg) hoverBg = '#ffcf00';
  if (!hoverTextColor) hoverTextColor = '#111827';
  if (!shadowColor) shadowColor = '#cc9e00';

  // Dynamic shadow glow and icon filter
  const shadowGlow = hoverBg === '#1a1a1a' ? '#1a1a1a80' : `${hoverBg}73`;
  const iconFilter = hoverTextColor === '#111827'
    ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))'
    : 'brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))';

  return { emoji, color, icon: iconPath, vectorComponent, textColor, hoverBg, hoverTextColor, shadowColor, shadowGlow, iconFilter };
};
