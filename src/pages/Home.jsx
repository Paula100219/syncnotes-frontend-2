export default function Home() {
  const username = localStorage.getItem("username"); // si guardaste el nombre del usuario

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        ¡Bienvenido a SyncNotes!
      </h1>
      <p className="text-gray-700 text-lg">
        Hola {username || "usuario"}, nos alegra verte de nuevo 
      </p>
    </div>
  );
}
