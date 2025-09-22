export const RecentUpdates = () => {
    return (
        <section id="about" className="py-24 px-4 relative">
            {" "}
            <div className="container mx-auto max-w-5xl ">
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
                        Recent <span className="text-primary"> Updates</span>
                    </h2>

                    <ul className="bg-card-3 px-5 md:px-10 py-10 text-muted-foreground rounded-[50px] border border-border-3 text-left">
                        <li className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                            {/* Month */}
                            <span className="w-24 shrink-0 font-light text-muted-foreground">
                                Sep 2025
                            </span>
                            {/* Description */}
                            <p className="text-base text-foreground leading-relaxed">
                                Deployed my personal website
                            </p>
                        </li>

                        <li className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 mt-5">
                            {/* Month */}
                            <span className="w-24 shrink-0 font-light text-muted-foreground">
                                Aug 2025
                            </span>
                            {/* Description */}
                            <p className="text-base text-foreground leading-relaxed">
                                Deployed the{" "}
                                <a
                                    className="marker marker-3"
                                    href="https://www.aicalendar.art/"
                                    target="_blank"
                                >
                                    AI Calendar
                                </a>{" "}
                                website application
                            </p>
                        </li>

                        <li className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 mt-5">
                            <span className="w-24 shrink-0 font-light text-muted-foreground">
                                Jul 2025
                            </span>
                            <p className="text-base text-foreground leading-relaxed">
                                Finished my first ML project{" "}
                                <a
                                    className="marker marker-2"
                                    href="https://github.com/Softicles/Fine-tuning_an_OCR"
                                    target="_blank"
                                >
                                    Fine-tuning a PaddleOCR model
                                </a>{" "}
                                advised by Professor{" "}
                                <a
                                    className="marker marker-1"
                                    href="https://www.alexkarpekov.com/"
                                    target="_blank"
                                >
                                    Alexander Karpekov
                                </a>
                            </p>
                        </li>

                        <li className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 mt-5">
                            {/* Month */}
                            <span className="w-24 shrink-0 font-light text-muted-foreground">
                                May 2025
                            </span>
                            {/* Description */}
                            <p className="text-base text-foreground leading-relaxed">
                                Started my new job as a Teaching Assistant for
                                CS 2050 - Discrete Math for Professor{" "}
                                <a
                                    className="marker marker-4"
                                    href="https://www.cc.gatech.edu/people/ronnie-howard"
                                    target="_blank"
                                >
                                    Ronnie Howard
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};
