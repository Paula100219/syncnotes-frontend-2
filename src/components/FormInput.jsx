export default function FormInput({ label, type, name, value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  );
}
