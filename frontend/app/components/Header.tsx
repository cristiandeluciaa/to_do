"use client";
import Link from "next/link";
import { useDate } from "@/app/context/DateContext";
import { signOut } from "next-auth/react";

const Header = () => {
  const { returnToday } = useDate();

  return (
    <div className="w-screen h-full bg-[#101b2f] border-b border-b-[#1B263B] text-white">
      <div className="flex justify-start items-center h-full px-[4%]">
        <div className="text-2xl font-bold pr-[7.5%]">
          <span>TODO</span>
        </div>
        <nav className="flex justify-start items-center h-full w-full">
          <ButtonNav nome={"Home"} pagina={"/"} />
        </nav>
        <div className="flex items-center gap-2 h-full">
          <ButtonNav onClick={returnToday} nome={"Ritorna a oggi"} />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white mr-[1%] hover:text-red-400 cursor-pointer hover:bg-[#1B263B] py-[0.5vh] px-[2vw] rounded-sm text-[1.6vh] transition-colors duration-200"
          >
            Esci
          </button>
        </div>
      </div>
    </div>
  );
};

const ButtonNav = ({
  nome,
  pagina,
  onClick,
}: {
  nome: string;
  pagina?: string;
  onClick?: () => void;
}) => {
  const baseClass =
    "text-white mr-[1%] hover:text-[#E0E1DD] cursor-pointer hover:bg-[#1B263B] py-[0.5%] px-[2%] rounded-sm text-[1.6vh] transition-colors duration-200";

  if (pagina) {
    return (
      <Link href={pagina} className={baseClass}>
        {nome}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass + " py-[0.5vh] px-[2vw]"}>
      {nome}
    </button>
  );
};

export default Header;
