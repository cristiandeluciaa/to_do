import Card from "@/app/components/Card";
import ListComponent from "@/app/components/List";
import Calendar from "../Calendario/page";

const Home = () => {
    return(
        <div className="h-full w-full flex flex-row justify-center items-center py-[2%]">
                <Card className="w-[25%] h-full ml-[1%] mr-[1%] flex justify-center items-center">
                    <ListComponent gg={null} />
                </Card>
                <Card className="w-[75%] ml-[1%] mr-[0.5%] h-full flex justify-center items-center">
                    <Calendar />
                </Card>
        </div>
    )
}

export default Home;
