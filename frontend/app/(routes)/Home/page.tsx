import Card from "@/app/components/Card";
import ListComponent from "@/app/components/List";

const Home = () => {
    return(
        <div className="h-full w-full flex flex-row justify-center items-center py-[2%]">
                <Card className="w-[40%] h-full ml-[1%] mr-[1%] flex justify-center items-center">
                    <ListComponent />
                </Card>
                <Card className="w-[60%] ml-[1%] mr-[0.5%] h-full flex justify-center items-center">
                    <h1 className="text-3xl font-bold">Fare agenda con la settimana</h1>
                </Card>
        </div>
    )
}

export default Home;
