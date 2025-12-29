import { Icon } from "@iconify/react";
import avatar from "./imgs/IMG_2763_cropped.jpg";
import { cn } from "@/lib/utils";
import { TypeAnimation } from "react-type-animation";
import { Link } from "react-router-dom";

export const HeroSection = () => {
    return (
        <section id="hero" className="hero gradient animate-gradientShift">
            <div className="max-w-4xl z-10">
                <div>
                    <h1
                        className={cn(
                            "text-4xl md:text-6xl tracking-tight flex flex-col",
                            "items-center text-center md:flex-row md:items-center md:text-left"
                        )}
                    >
                        <img
                            src={avatar}
                            alt="Chibi Avatar"
                            className="w-60 h-60 rounded-full object-cover"
                        />

                        <div className="container space-y-1">
                            <span className="opacity-0 animate-fade-in">
                                Thinh
                            </span>
                            <span className="text-primary font-bold opacity-0 animate-fade-in-delay-1">
                                {" "}
                                Nguyen
                            </span>
                            <div className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl text-center md:text-left">
                                <TypeAnimation
                                    sequence={[
                                        "CS student — Art lover — Math enthusiast",
                                    ]}
                                    wrapper="span"
                                    speed={50}
                                />
                            </div>

                            <a
                                className="animate-fade-in-delay-2 inline-block"
                                href="https://www.linkedin.com/in/thinh-minh-nguyen/"
                                target="_blank"
                            >
                                <Icon
                                    icon="ri:linkedin-fill"
                                    width={40}
                                    height={40}
                                    className="inline-block align-middle hover:text-primary duration-300"
                                />
                            </a>
                            <a
                                className="animate-fade-in-delay-2 inline-block"
                                href="https://github.com/Softicles"
                                target="_blank"
                            >
                                <Icon
                                    icon="ri:github-fill"
                                    width={40}
                                    height={40}
                                    className="inline-block align-middle ml-4 hover:text-primary duration-300"
                                />
                            </a>
                            <a
                                className="animate-fade-in-delay-2 inline-block"
                                href="mailto:thinhmnguyen4105@gmail.com"
                            >
                                <Icon
                                    icon="basil:gmail-solid"
                                    width={40}
                                    height={40}
                                    className="inline-block align-middle ml-4 hover:text-primary duration-300"
                                />
                            </a>

                            <br />
                            <div className="inline-flex items-center gap-4">
                                <a
                                    href="https://drive.google.com/file/d/1ArFwg1cyaUMaekSeTHnh7MVm4ekKmzHK/view?usp=sharing"
                                    className="md:position-center px-3 py-1 text-[19px] rounded-full border border-primary font-bold text-primary hover:bg-primary/10 transition-colors duration-300"
                                    target="_blank"
                                >
                                    View Resume
                                </a>

                                {/* <Link
                                    to="/archive"
                                    className="px-3 py-1 text-[19px] rounded-full border border-primary font-bold text-primary hover:bg-primary/10 transition-colors duration-300"
                                >
                                    Archive
                                </Link> */}
                            </div>
                        </div>
                    </h1>
                </div>
            </div>
        </section>
    );
};
