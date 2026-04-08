import { useState } from "react";
import { ArrowUp } from "lucide-react";

const COLLAPSED_UPDATES_COUNT = 3;

const updates = [
    {
        month: "Feb 2026",
        description: (
            <p className="text-base text-foreground leading-relaxed">
                Joined{" "}
                <a
                    className="marker marker-3"
                    href="https://bytefight.org/home"
                    target="_blank"
                >
                    ByteFight @ GT
                </a>{" "}
                as an Infrastructure Dev
            </p>
        ),
    },
    {
        month: "Jan 2026",
        description: (
            <p className="text-base text-foreground leading-relaxed">
                Became a Curriculum Officer for{" "}
                <a
                    className="marker marker-3"
                    href="https://sucogt.org/"
                    target="_blank"
                >
                    Supercomputing @ GT
                </a>
            </p>
        ),
    },
    {
        month: "Sep 2025",
        description: (
            <ul className="text-base text-foreground leading-relaxed space-y-2">
                <li>
                    -{" "}
                    Came back to TA for CS 2050 for Professor{" "}
                    <a
                        className="marker marker-4"
                        href="https://faculty.cc.gatech.edu/~ladha/"
                        target="_blank"
                    >
                        Abrahim Ladha
                    </a>
                </li>
                <li>
                    -{" "}
                    Joined the Liver team advised by{" "}
                    <a
                        className="marker marker-2"
                        href="https://med.emory.edu/directory/profile/?u=MMKAZIM"
                        target="_blank"
                    >
                        Dr. Marwan Kazimi
                    </a>{" "}
                    and{" "}
                    <a
                        className="marker marker-1"
                        href="https://ece.gatech.edu/directory/michael-e-west"
                        target="_blank"
                    >
                        Dr. Michael West
                    </a>
                </li>
            </ul>
        ),
    },
    {
        month: "Aug 2025",
        description: (
            <p className="text-base text-foreground leading-relaxed">
                Deployed{" "}
                <a
                    className="marker marker-3"
                    href="https://www.aicalendar.art/"
                    target="_blank"
                >
                    AI Calendar
                </a>{" "}
            </p>
        ),
    },
    {
        month: "Jul 2025",
        description: (
            <p className="text-base text-foreground leading-relaxed">
                <a
                    className="marker marker-2"
                    href="https://github.com/Softicles/Fine-tuning_an_OCR"
                    target="_blank"
                >
                    Fine-tuned a PaddleOCR model
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
        ),
    },
    {
        month: "May 2025",
        description: (
            <p className="text-base text-foreground leading-relaxed">
                Became a Teaching Assistant for CS 2050 - Discrete Math for
                Professor{" "}
                <a
                    className="marker marker-4"
                    href="https://www.cc.gatech.edu/people/ronnie-howard"
                    target="_blank"
                >
                    Ronnie Howard
                </a>
            </p>
        ),
    },
];

const UpdateRow = ({ month, description, isFirst }) => {
    return (
        <li
            className={`flex flex-col sm:flex-row sm:items-start sm:space-x-4 ${
                isFirst ? "" : "pt-5"
            }`}
        >
            <span className="w-24 shrink-0 sm:pr-4 font-semibold text-muted-foreground">
                {month}
            </span>
            <div className="sm:pl-4 flex-1">
                {description}
            </div>
        </li>
    );
};

export const RecentUpdates = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleUpdates = isExpanded
        ? updates
        : updates.slice(0, COLLAPSED_UPDATES_COUNT);
    const canToggle = updates.length > COLLAPSED_UPDATES_COUNT;

    return (
        <section id="about" className="py-24 px-4 relative">
            {" "}
            <div className="container mx-auto max-w-5xl ">
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
                        Recent <span className="text-primary"> Updates</span>
                    </h2>

                    <div className="bg-card-3 px-5 md:px-10 pt-10 pb-6 text-muted-foreground rounded-[50px] border border-border-3 text-left">
                        <div className="relative">
                            <div
                                className="hidden sm:block absolute top-0 bottom-0 left-[6.5rem] w-px bg-border-3/70"
                                aria-hidden="true"
                            />
                            <ul>
                                {visibleUpdates.map((update, index) => (
                                    <UpdateRow
                                        key={update.month}
                                        month={update.month}
                                        description={update.description}
                                        isFirst={index === 0}
                                    />
                                ))}
                            </ul>
                        </div>

                        {canToggle && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded((prev) => !prev)}
                                className="mt-4 flex w-full items-center justify-center text-sm text-foreground/80 hover:text-foreground transition-colors"
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? "Collapse updates" : "Expand updates"}
                            >
                                <ArrowUp
                                    className={`h-4 w-4 motion-safe:animate-bounce transition-transform duration-200 ${
                                        isExpanded ? "" : "rotate-180"
                                    }`}
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
