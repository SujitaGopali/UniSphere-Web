export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={container}>
      {children}
    </div>
  );
}

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f4f4",
  color: "black", // ✅ FIX: text visible
  fontFamily: "Arial, sans-serif",
};