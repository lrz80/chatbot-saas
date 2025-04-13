"use client";

export default function UpgradePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso restringido</h1>
        <p className="text-gray-700 mb-6">
          Para usar el dashboard necesitas tener una <strong>membresía activa</strong>.
        </p>
        <a href="/dashboard/settings">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
            Pagar membresía
          </button>
        </a>
      </div>
    </div>
  );
}
