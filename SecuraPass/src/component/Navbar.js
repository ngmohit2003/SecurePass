import logo from '../logo.png'
import {NavLink} from 'react-router-dom'

const Navbar=()=>{
    return(
        <div className="w-full text-[#E5E8EB] px-[40px] py-[12px] h-[65px]">
            <nav className="flex flex-row justify-between items-center">
        <ul>
        <NavLink to="/">
          <li className="flex gap-[14px]">
            <img src={logo} width="16px" height="14px"></img>
            <p className="text-2xl text-bold">SecurePass</p>
          </li>
        </NavLink>
          
        </ul>
          <ul className="flex flex-row w-[650px] justify-between">
           <NavLink 
            className="relative text-white px-4 py-2
    after:content-[''] after:absolute after:left-0 after:bottom-0 
    after:w-0 after:h-[2px] after:bg-[#1A80E5] 
    after:transition-all after:duration-300 
    hover:after:w-full"
            to="/passwordgenerator"><li>Password Generator</li></NavLink> 
           <NavLink to="/hash-gen"  className="relative text-white px-4 py-2
    after:content-[''] after:absolute after:left-0 after:bottom-0 
    after:w-0 after:h-[2px] after:bg-[#1A80E5] 
    after:transition-all after:duration-300 
    hover:after:w-full"><li>Hash Generator</li></NavLink> 
          
           <NavLink 
            className="relative text-white px-4 py-2
    after:content-[''] after:absolute after:left-0 after:bottom-0 
    after:w-0 after:h-[2px] after:bg-[#1A80E5] 
    after:transition-all after:duration-300 
    hover:after:w-full"
            to="/crackpage"><li>Crackpage</li></NavLink>
           <NavLink 
            className="relative text-white px-4 py-2
    after:content-[''] after:absolute after:left-0 after:bottom-0 
    after:w-0 after:h-[2px] after:bg-[#1A80E5] 
    after:transition-all after:duration-300 
    hover:after:w-full"
           to="/passmanager"><li>Pass Manager</li></NavLink> 
           <NavLink 
            className="relative text-white px-4 py-2
    after:content-[''] after:absolute after:left-0 after:bottom-0 
    after:w-0 after:h-[2px] after:bg-[#1A80E5] 
    after:transition-all after:duration-300 
    hover:after:w-full"
            to="/"><li>Home</li></NavLink> 
          </ul>
        </nav>
        </div>
    )   
}
export default Navbar;