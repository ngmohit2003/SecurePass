import { useState, useRef, useEffect } from "react";
import { FaCopy } from "react-icons/fa";

const PasswordGenerator = () => {
  const [passwordLength, setPasswordLength] = useState(10);
  const [password, setPassword] = useState("");
  const [strengthColor, setStrengthColor] = useState("#ccc");
  const [suggestions, setSuggestions] = useState([]);    // updated
  const [selectedPassword, setSelectedPassword] = useState("");  // updated


  const [includeUpper, setIncludeUpper] = useState(false);
  const [includeLower, setIncludeLower] = useState(false);
  const [includeNumber, setIncludeNumber] = useState(false);
  const [includeSymbol, setIncludeSymbol] = useState(false);
  const [userName, setUserName] = useState(""); // 🆕 User name input

  const copyMsgRef = useRef(null);
  const passwordRef = useRef(null);
  const symbols = '@#$&_+=|./';

  const getRndInteger = (min, max) => Math.floor(Math.random() * (max - min)) + min;
  const generateRandomNumber = () => getRndInteger(0, 9);
  const generateLowerCase = () => String.fromCharCode(getRndInteger(97, 123));
  const generateUpperCase = () => String.fromCharCode(getRndInteger(65, 91));
  const generateSymbol = () => symbols.charAt(getRndInteger(0, symbols.length));

  const setIndicator = (color) => setStrengthColor(color);

  const calcStrength = () => {
    const hasUpper = includeUpper;
    const hasLower = includeLower;
    const hasNum = includeNumber;
    const hasSym = includeSymbol;

    if (hasUpper && hasLower && (hasNum || hasSym) && passwordLength >= 8) {
      setIndicator("#0f0");
    } else if ((hasLower || hasUpper) && (hasNum || hasSym) && passwordLength >= 6) {
      setIndicator("#ff0");
    } else {
      setIndicator("#f00");
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

  //updated from here...down to...........................................
  const generateNameBasedSuggestions = (name) => {
  if (!name.trim()) return [];

  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // You can customize these patterns
  const patterns = [
    `@${formattedName}123`,
    `${formattedName}#1#2#3`,
    `#${formattedName}@123`,
    `#${formattedName}00@123`,
    `@123-${formattedName}`,
  ];

  return patterns;
  };

  //  here..........................................

  // const generatePassword = () => {
  //   let funcArr = [];
  //   if (includeUpper) funcArr.push(generateUpperCase);
  //   if (includeLower) funcArr.push(generateLowerCase);
  //   if (includeNumber) funcArr.push(generateRandomNumber);
  //   if (includeSymbol) funcArr.push(generateSymbol);

  //   if (funcArr.length === 0 && userName.trim() === "") return;

  //   let tempPassword = "";

  //   // 🧩 Include user’s name first (to be shuffled later)
  //   if (userName.trim() !== "") {
  //     tempPassword += userName.trim();
  //   }

  //   const remainingLength = Math.max(passwordLength - tempPassword.length, 0);

  //   // Compulsory inclusion of at least one of each selected type
  //   funcArr.forEach((fn) => (tempPassword += fn()));

  //   // Fill the rest with random selected functions
  //   for (let i = 0; i < remainingLength - funcArr.length; i++) {
  //     const randIndex = getRndInteger(0, funcArr.length);
  //     tempPassword += funcArr[randIndex]();
  //   }

  //   // 🔀 Shuffle the final password (name included)
  //   tempPassword = shufflePassword(Array.from(tempPassword));

  //   // Trim to desired length
  //   setPassword(tempPassword.slice(0, passwordLength));
  //   calcStrength();
  // };

  // update-2.......................................................................|
  const generatePassword = () => {                                               //this block is added
  // 🧩 If user entered name, show custom suggestions                           //this block is added
  if (userName.trim() !== "") {                                                 //this block is added
    const newSuggestions = generateNameBasedSuggestions(userName);              //this block is added
    setSuggestions(newSuggestions);                                             //this block is added
    setPassword(""); // Clear old password                                      //this block is added
    return;                                                                     //this block is added
  }                                                                            //this block is added

  // 🧠 Otherwise, continue your existing random password logic
  let funcArr = [];
  if (includeUpper) funcArr.push(generateUpperCase);
  if (includeLower) funcArr.push(generateLowerCase);
  if (includeNumber) funcArr.push(generateRandomNumber);
  if (includeSymbol) funcArr.push(generateSymbol);

  if (funcArr.length === 0 && userName.trim() === "") return;

  let tempPassword = "";

  if (userName.trim() !== "") {
    tempPassword += userName.trim();
  }

  const remainingLength = Math.max(passwordLength - tempPassword.length, 0);

  funcArr.forEach((fn) => (tempPassword += fn()));

  for (let i = 0; i < remainingLength - funcArr.length; i++) {
    const randIndex = getRndInteger(0, funcArr.length);
    tempPassword += funcArr[randIndex]();
  }

  tempPassword = shufflePassword(Array.from(tempPassword));
  setPassword(tempPassword.slice(0, passwordLength));
  setSuggestions([]); // Clear old suggestions
  calcStrength();
};
// update-2 till here ^ .....................................................................

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      copyMsgRef.current.innerText = "Copied!";
      copyMsgRef.current.classList.add("active");
      setTimeout(() => copyMsgRef.current.classList.remove("active"), 2000);
    } catch {
      copyMsgRef.current.innerText = "Failed!";
    }
  };

  return (
    <div className="max-w-[960px] mx-auto py-20 h-[695px] flex flex-col gap-[12px] text-[#FFFFFF] leading-[2]">
      <div className="mx-auto p-[16px]">
        <p className="text-2xl text-bold">Password Generator</p>
      </div>
{/* ...
      <div className="display-container mx-auto relative">
        <input
          ref={passwordRef}
          value={password}
          placeholder="Password"
          readOnly
          className="display bg-[#3D4754] rounded-md w-[488px] h-[32px] p-[15px]"
        />
        <button className="copyBtn absolute right-[5px] top-[6px]" onClick={copyToClipboard}>
          <span
            className="tooltip absolute top-[-25px] right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300 [&.active]:opacity-100"
            ref={copyMsgRef}
          ></span>
          <FaCopy />
        </button>
      </div>... */}

      <div className="display-container mx-auto relative">
        <input
          ref={passwordRef}
          value={password}
          placeholder="Password"
          readOnly
          className="display bg-[#3D4754] rounded-md w-[488px] h-[32px] p-[15px]"
        />
        <button className="copyBtn absolute right-[5px] top-[6px]" onClick={copyToClipboard}>
          <span
            className="tooltip absolute top-[-25px] right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300 [&.active]:opacity-100"
            ref={copyMsgRef}
          ></span>
          <FaCopy />
        </button>
      </div>

      {/* 🆕 Dropdown for suggestions */}                                    
      {suggestions.length > 0 && (                                            // here to 
        <div className="mx-auto bg-[#3D4754] rounded-md w-[488px] mt-2">
          <select
            className="w-full bg-[#3D4754] p-2 rounded-md"
            value={selectedPassword}
            onChange={(e) => {                                              //updated block
              setSelectedPassword(e.target.value);
              setPassword(e.target.value);
              setSuggestions([]); // Hide dropdown after selection
            }}
          >
            <option value="">Select a password suggestion...</option>
            {suggestions.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}                             
                                                                    


      <div className="input-container flex flex-col mx-auto">

        {/* 🆕 Name Input Field */}
        <div className="py-[3px] flex flex-col gap-[8px]">
          <label htmlFor="username">Include Your Name</label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="bg-[#3D4754] rounded-md w-[488px] h-[32px] p-[10px]"
          />
        </div>

        <div className="length-container flex justify-between">
          <p>Password Length</p>
          <p>{passwordLength}</p>
        </div>

        <input
          type="range"
          min="1"
          max="20"
          className="slider py-[12px]"
          step="1"
          value={passwordLength}
          onChange={(e) => setPasswordLength(parseInt(e.target.value))}
        />

        <div className="check py-[3px] flex gap-[12px]">
          <input
            type="checkbox"
            id="uppercase"
            checked={includeUpper}
            onChange={(e) => setIncludeUpper(e.target.checked)}
          />
          <label htmlFor="uppercase">Include Uppercase Letters</label>
        </div>

        <div className="check py-[3px] flex gap-[12px]">
          <input
            type="checkbox"
            id="lowercase"
            checked={includeLower}
            onChange={(e) => setIncludeLower(e.target.checked)}
          />
          <label htmlFor="lowercase">Include Lowercase Letters</label>
        </div>

        <div className="check py-[3px] flex gap-[12px]">
          <input
            type="checkbox"
            id="numbers"
            checked={includeNumber}
            onChange={(e) => setIncludeNumber(e.target.checked)}
          />
          <label htmlFor="numbers">Include Numbers</label>
        </div>

        <div className="check py-[3px] flex gap-[12px]">
          <input
            type="checkbox"
            id="symbols"
            checked={includeSymbol}
            onChange={(e) => setIncludeSymbol(e.target.checked)}
          />
          <label htmlFor="symbols">Include Symbols</label>
        </div>

        <div className="strength-container py-[3px] flex gap-[12px] items-center">
          <p>Strength</p>
          <div
            className="indicator w-[15px] h-[15px] rounded-[20px] border border-gray-400"
            style={{ backgroundColor: strengthColor }}
          ></div>
        </div>

        <button
          className="generateButton p-[8px] rounded-md bg-[#1A80E5] text-[#FFFFFF]"
          onClick={generatePassword}
        >
          GENERATE PASSWORD
        </button>
      </div>
    </div>
  );
};

export default PasswordGenerator;
