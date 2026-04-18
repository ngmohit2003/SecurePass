import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  //   <BrowserRouter>
  //     <AuthProvider>
  //       <App />
  //     </AuthProvider>
  //   </BrowserRouter>
  // </StrictMode>
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        
        {/* <Toaster
  position="top-center"
  reverseOrder={false}
  toastOptions={{
    duration: 2000,
    className: "custom-toast",
    style: {
      background: "#9659FB",
      color: "#fff",
      zIndex: 9999,
    },
  }}
/> */}

<Toaster
  position="top-center"
  
  reverseOrder={false}
  toastOptions={{
    duration: 2000,
    className: "custom-toast",
  }}
/>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

