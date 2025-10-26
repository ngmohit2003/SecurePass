import "./App.css";
import {useState} from 'react';
import Navbar from './component/Navbar';
import {Routes,Route} from 'react-router-dom';
import Home from "./pages/Home";
import PasswordGenerator from './pages/PasswordGenerator'
import CrackPage from "./component/CrackPage";
import PassManagerPhase2 from "./component/PassManagerPhase2";
import HashGen from "./component/hash_gen";

function App() {
  
  return (
      <div className="bg-[#121417] w-[100vw] h-[100vh] overflow-x-hidden">
       <Navbar/>
     
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/passwordgenerator" element={<PasswordGenerator/>}/> 
          <Route path="/crackpage" element={<CrackPage/>}/>
          <Route path="/passmanager" element={<PassManagerPhase2/>} />
          <Route path="/hash-gen" element={<HashGen/>}/>
        </Routes>
      </div>

  );
}

export default App;
