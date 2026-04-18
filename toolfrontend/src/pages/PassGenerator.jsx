
import { useState, useRef, useEffect } from "react";
import Navbar2 from "../components/Navbar2";
import { showError, showSuccess } from "../utils/toast";

const PassGenerator = () => {
  const [passwordLength, setPasswordLength] = useState(10);
  const [password, setPassword] = useState("");
  const [strengthColor, setStrengthColor] = useState("#ccc");
  const [strengthText, setStrengthText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPassword, setSelectedPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [includeUpper, setIncludeUpper] = useState(false);
  const [includeLower, setIncludeLower] = useState(false);
  const [includeNumber, setIncludeNumber] = useState(false);
  const [includeSymbol, setIncludeSymbol] = useState(false);
  const [userName, setUserName] = useState("");

  const passwordRef = useRef(null);

  const symbols = "@#$&_+=|./";

  const getRndInteger = (min, max) =>
    Math.floor(Math.random() * (max - min)) + min;

  const generateRandomNumber = () => getRndInteger(0, 10);
  const generateLowerCase = () =>
    String.fromCharCode(getRndInteger(97, 123));
  const generateUpperCase = () =>
    String.fromCharCode(getRndInteger(65, 91));
  const generateSymbol = () =>
    symbols.charAt(getRndInteger(0, symbols.length));

  const calcStrength = () => {
    if (
      includeUpper &&
      includeLower &&
      (includeNumber || includeSymbol) &&
      passwordLength >= 8
    ) {
      setStrengthColor("#22c55e");
      setStrengthText("Very Strong");
    } else if (
      (includeUpper || includeLower) &&
      (includeNumber || includeSymbol) &&
      passwordLength >= 6
    ) {
      setStrengthColor("#facc15");
      setStrengthText("Medium");
    } else {
      setStrengthColor("#ef4444");
      setStrengthText("Weak");
    }
  };

  useEffect(() => {
    calcStrength();
  }, [includeUpper, includeLower, includeNumber, includeSymbol, passwordLength]);

  const shufflePassword = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  };

  const generatePassword = () => {
    const hasAnyOption =
      includeUpper || includeLower || includeNumber || includeSymbol;

    if (!hasAnyOption) {
      showError("Please select at least one option");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      let funcArr = [];
      if (includeUpper) funcArr.push(generateUpperCase);
      if (includeLower) funcArr.push(generateLowerCase);
      if (includeNumber) funcArr.push(generateRandomNumber);
      if (includeSymbol) funcArr.push(generateSymbol);

   
const generateSmartPassword = () => {
  const cleanName = userName.trim();

  // Smart case variation
  const smartName = cleanName
    .split("")
    .map((ch, i) =>
      i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()
    )
    .join("");

  let prefix = "";
  let suffix = "";

  if (includeSymbol) {
    prefix += generateSymbol();
  }

  if (includeNumber) {
    suffix += generateRandomNumber();
  }

  if (includeUpper && !/[A-Z]/.test(smartName)) {
    suffix += generateUpperCase();
  }

  if (includeLower && !/[a-z]/.test(smartName)) {
    suffix += generateLowerCase();
  }

  let basePassword = prefix + smartName + suffix;

  // Fill remaining length
  while (basePassword.length < passwordLength) {
    if (includeNumber) basePassword += generateRandomNumber();
    else if (includeSymbol) basePassword += generateSymbol();
    else basePassword += generateUpperCase();
  }

  return basePassword.slice(0, passwordLength);
};
      const newSuggestions = new Set();

      while (newSuggestions.size < 6) {
        newSuggestions.add(generateSmartPassword());
      }

      setSuggestions(Array.from(newSuggestions));
      setPassword("");
      setSelectedPassword("");
      showSuccess("passwords generated!");
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = async () => {
    if (!password) {
      showError("Select a password first");
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      showSuccess("Password copied to clipboard!");
    } catch {
      showError("Failed to copy password");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar2 />

      <div
        className="min-h-screen pt-20 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('pass.jpeg')" }}
      >
        {/* LEFT SIDE */}
        <div className="w-full lg:w-2/5 flex justify-center lg:ml-14 mb-12 lg:mb-0">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center lg:text-left animate-pulse text-black leading-tight">
            Unique Password Generator
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-3/5 max-w-4xl space-y-6">

          {/* Password Display */}
          <div className="bg-gray-100 rounded-2xl p-3 shadow-inner">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                ref={passwordRef}
                value={password}
                placeholder="Your secure password"
                readOnly
                className="flex-1 bg-transparent outline-none text-sm sm:text-base tracking-widest"
              />

              {password && (
                <span
                  className="px-4 py-2 text-sm font-semibold rounded-full text-white text-center"
                  style={{ backgroundColor: strengthColor }}
                >
                  {strengthText}
                </span>
              )}

              <button
                onClick={copyToClipboard}
                className="bg-[#9659FB] text-white px-6 py-2 rounded-full hover:scale-105 transition w-full sm:w-auto"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Name Input */}
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name for suggestion"
            className="w-full bg-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-[#9659FB] outline-none"
          />

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="mb-2 font-medium">Select a password:</p>
              <select
                className="w-full bg-white border rounded-lg p-2"
                value={selectedPassword}
                onChange={(e) => {
                  setSelectedPassword(e.target.value);
                  setPassword(e.target.value);
                  setSuggestions([]);
                  calcStrength();
                }}
              >
                <option value="">Choose a password</option>
                {suggestions.map((pass, index) => (
                  <option key={index} value={pass}>
                    {pass}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Length */}
          <div>
            <div className="flex justify-between font-medium mb-2">
              <span>Password Length</span>
              <span>{passwordLength}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={passwordLength}
              onChange={(e) => setPasswordLength(+e.target.value)}
              className="w-full border border-[#9659FB]"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-lg">
            <label className="flex items-center gap-3">
              <input className="w-4 h-4" type="checkbox" onChange={(e) => setIncludeUpper(e.target.checked)} />
              ABC
            </label>
            <label className="flex items-center gap-3">
              <input className="w-4 h-4" type="checkbox" onChange={(e) => setIncludeLower(e.target.checked)} />
              abc
            </label>
            <label className="flex items-center  gap-3">
              <input className="w-4 h-4" type="checkbox" onChange={(e) => setIncludeNumber(e.target.checked)} />
              123
            </label>
            <label className="flex items-center gap-3">
              <input className="w-4 h-4" type="checkbox" onChange={(e) => setIncludeSymbol(e.target.checked)} />
              #$&
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-semibold tracking-wide transition
              ${
                isGenerating
                  ? "bg-[#9659FB] cursor-not-allowed text-white"
                  : "bg-[#9659FB] hover:scale-[1.02] text-white"
              }`}
          >
            {isGenerating ? "Generating password..." : "Generate password"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default PassGenerator;