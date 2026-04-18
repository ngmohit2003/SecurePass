import { HiKey, HiLockClosed, HiGlobeAlt } from "react-icons/hi2";
import { TbBinaryTree } from "react-icons/tb";
import { GiBreakingChain } from "react-icons/gi";
import { MdNetworkCheck } from "react-icons/md";

export const featuresData = [
  {
    title: "Pass Generator",
    desc: "Generate highly secure, random passwords using customizable rules  to protect user accounts from cyber attacks.",
    // color: "from-blue-500 to-indigo-500",
    icon: HiKey,
    image:"block2.png",
  },
  {
    title: "Hash Generator",
    desc: "Convert plain text passwords into cryptographic hashes using various hashing algorithms, allowing users to understand  how hashes impacts security.",
    // color: "from-cyan-500 to-teal-500",
    icon: TbBinaryTree,
    image:"block8.png",
  },
  {
    title: "Crack Page",
    desc: "Simulate password cracking techniques ethically in a controlled environment to demonstrate how weak passwords can be compromised.",
    // color: "from-purple-500 to-pink-500",
    icon: GiBreakingChain,
    image:"block1.png",
  },
  {
    title: "Pass Manager",
    desc: "Securely store & organize user credentials all in one place, reducing password reuse and helping users prevents possible data breaches.",
    // color: "from-orange-400 to-amber-500",
    icon: HiLockClosed,
    image:"block3.png",
  },
  {
    title: "Packet Analyzer",
    desc: "Inspect and analyze live network packets to  detect suspicious traffic patterns, and network-level threats and vulnerabilities ",
    // color: "from-emerald-500 to-green-500",
    icon: MdNetworkCheck,
    image:"block5.png",
  },
  {
    title: "DNS Intelligence",
    desc: "Gather and analyze DNS information to identify potential security risks, vulnerabilities and malicious activities targeting public domain names.",
    // color: "from-rose-500 to-red-500",
    icon: HiGlobeAlt,
    image:"block7.png",
  },
];
