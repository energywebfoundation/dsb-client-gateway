const CHARACTERS_AFTER_LAST_COLON = 7;
const LAST_CHARACTERS = 5;

export function didFormatMinifier(value) {
  if (!value) {
    return value;
  }

  const lastColonIndex = value.lastIndexOf(':');
  return `${value.substring(
    0,
    lastColonIndex + CHARACTERS_AFTER_LAST_COLON
  )}...${value.substring(value.length - LAST_CHARACTERS)}`;
}
