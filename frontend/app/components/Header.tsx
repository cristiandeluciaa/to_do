import Link from "next/link"

const Header = () => {
    return (
        <div className="w-screen h-full bg-[#0D1B2A] border-b border-b-[#1B263B] text-white">
            <div className="flex justify-start items-center h-full px-[4%]">
                <div className="text-2xl font-bold pr-[7.5%]"><span>TODO</span></div>
                <nav className="flex justify-start items-center h-full w-full">
                    <ButtonNav nome={"Home"} pagina={"Home"} />
                    <ButtonNav nome={"Lista"} pagina={"Lista"} />
                    <ButtonNav nome={"Calendario"} pagina={"Calendario"} />
                </nav>
            </div>
        </div>
    )
}

const ButtonNav = ({ nome, pagina }: { nome: string, pagina: string }) => {
    return (
        <Link
            href={"/" + pagina}
            className="text-white mr-[1%] hover:text-[#E0E1DD] hover:bg-[#1B263B] py-[1%] px-[2%] rounded-sm text-[1.6vh] transition-colors duration-200"
        >
            {nome}
        </Link>
    )
}

export default Header;
