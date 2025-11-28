export const Badge = ({ children, color = "blue" }) => {
  const styles = {
    blue: "bg-blue-100 text-blue-800",
    orange: "bg-orange-100 text-orange-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${styles[color] || styles.gray}`}>
      {children}
    </span>
  );
};

