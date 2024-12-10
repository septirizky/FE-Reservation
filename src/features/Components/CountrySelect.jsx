const countryOptions = [
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "other", flag: "+", name: "Other" },
];

const CountrySelect = ({ countryCode, handleCountryCodeChange }) => {
  return (
    <select
      value={countryCode}
      onChange={handleCountryCodeChange}
      className="block w-32 py-2 pl-3 pr-8 text-base border border-gray-300 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-l-md"
    >
      {countryOptions.map((option) => (
        <option key={option.code} value={option.code}>
          {option.flag} {option.code}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;
