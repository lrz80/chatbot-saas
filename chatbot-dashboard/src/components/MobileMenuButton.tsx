import { FiMenu } from "react-icons/fi";

export default function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 bg-purple-700/80 text-white p-2 rounded-lg shadow-md hover:bg-purple-600 transition-all"
    >
      <FiMenu size={24} />
    </button>
  );
}
