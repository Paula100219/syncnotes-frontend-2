// Helpers seguros para nombre e iniciales

export const getCurrentName = () =>
  (localStorage.getItem("name") || localStorage.getItem("username") || "").toString().trim();

export const getInitials = (name = null) => {
  const val = name || getCurrentName();
  if (!val) return "U";
  const parts = val.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return val.slice(0, 2).toUpperCase();
};