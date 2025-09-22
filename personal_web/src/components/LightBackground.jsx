import plant1 from "./imgs/plant1.png";
import plant2 from "./imgs/plant2.png";
import plant3 from "./imgs/plant3.png";
import plant4 from "./imgs/plant4.png";
import plant5 from "./imgs/plant5.png";
import plant6 from "./imgs/plant6.png";

export const LightBackground = () => {
    return (
        <div className="pointer-events-none inset-0 -z-0">
            <img
                src={plant1}
                alt="plant1"
                className="absolute max-lg:hidden top-145 w-19.5 h-25.3 left-25"
            />

            <img
                src={plant2}
                alt="plant2"
                className="absolute max-lg:hidden top-265 w-19.5 h-25.3 right-25"
            />

            <img
                src={plant3}
                alt="plant3"
                className="absolute max-lg:hidden top-385 w-19.5 h-25.3 left-25"
            />

            <img
                src={plant4}
                alt="plant4"
                className="absolute max-lg:hidden top-505 w-19.5 h-25.3 right-25"
            />

            <img
                src={plant5}
                alt="plant5"
                className="absolute max-lg:hidden top-630 w-19.5 h-25.3 left-25"
            />

            <img
                src={plant6}
                alt="plant6"
                className="absolute max-lg:hidden top-740 w-19.5 h-25.3 right-25"
            />
        </div>
    );
};
