import {
    GithubIcon,
    ExternalLink,
    FileText,
    Trophy,
    Pen,
    ArrowUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const COLLAPSED_PROJECTS_COUNT = 4;

const projects = [
    {
        id: 1,
        title: "Fine-tuning a PaddleOCR model",
        description: `The English ultra-lightweight PP-OCRv3 model cannot reliably recognize my own handwriting. Therefore, I made a new dataset from my lecture notes at Georgia Tech and fine-tuned the model using its provided source code.`,
        image: "/projects/finetune_ocr.webp",
        tags: [
            "Python",
            "PaddlePaddle",
            "PPOCRLabel",
            "OpenAI API",
            "PIL",
            "Linux",
        ],
        urls: [["https://github.com/Softicles/Fine-tuning_an_OCR", GithubIcon]],
        awards: ["Achieved 90% reduction in loss value"],
    },

    {
        id: 2,
        title: "Symbolic Regression with Multi-Objective Genetic Programming",
        description: `I used Genetic Algorithms aiming to recreate a polynomial I came up in the beginning. The polynomials are modeled with Expression Tree, then evolved over 50 generations with 500 candidates/generation.`,
        image: "/projects/symbolic_regression_mogp.webp",
        tags: ["Python", "DEAP", "NumPy", "Matplotlib", "NSGA-II"],
        urls: [["https://github.com/Softicles/symbolic-regression-mogp", GithubIcon]],
        awards: ["Reduced RMSE by 98% with a 22-node expression"],
    },

    {
        id: 3,
        title: "Markov Decision Model with multiple observation processes",
        description: `I read the paper "Hidden Markov Models with Multiple Observation Prrocesses" by James Yuanjie Zhao to implement a hidden Markov model that outputs the distribution of the Ghost's correct position in the world of TextWorld.`,
        image: "/projects/text_world_hmm_figure.webp",
        tags: [
            "Python",
            "TextWorld",
            "numpy",
            "pgmpy",
        ],
        urls: [["https://github.com/Softicles/CS-3600-HW3", GithubIcon], ["https://arxiv.org/abs/2210.09381", Pen]],
        awards: ["Achieved > 97% accuracy on ghost spotting"],
    },

    {
        id: 4,
        title: "AI Calendar",
        description:
            "A website that can make a plan for users based on their availability descriptions and auto-import it into their virtual calendars.",
        image: "/projects/ai_calendar.webp",
        tags: [
            "Python",
            "JavaScript",
            "Django",
            "React",
            "OpenAI API",
            "Google Calendar API",
            "OAuth",
            "PostgreSQL",
            "Vercel",
        ],
        urls: [
            ["https://aicalendar.art", ExternalLink],
            ["https://github.com/Softicles/Continue-AI-Calendar", GithubIcon],
        ],
        awards: ["One of the best Final Projects in CS 2340"],
    },

    {
        id: 5,
        title: "Model complicated Random Variables with R",
        description:
            'The best theoretical class I have took so far at Tech. The Project includes, to name but a few, interesting problems such as recovering the degree of a noisy polynomial random model and simulating then proving a "Car Crash" event follows a well-known distribution.',
        image: "/projects/plot_of_N10_problem_6_card.webp",
        // Tall plot on a wide card: show all of it on white instead of cropping.
        imagePosition: "object-contain bg-white",
        tags: ["R", "RStudio"],
        urls: [
            [
                "https://github.com/Softicles/MATH-3215-Final-Project/tree/master",
                GithubIcon,
            ],
            [
                "https://github.com/Softicles/MATH-3215-Final-Project/blob/master/take_home_final.pdf",
                FileText,
            ],
        ],
        awards: [],
    },

    {
        id: 6,
        title: "The Hardest Game in The World",
        description:
            'A funky game in Game Boy Advance (GBA) style.',
        image: "/projects/hardest_game.webp",
        tags: ["C", "mGBA", "Docker"],
        urls: [
            [
                "https://github.com/Softicles/The-Hardest-Game-in-The-World",
                GithubIcon,
            ],
        ],
        awards: ["105/100 points Final Project in CS 2110"],
    },
];

export const ProjectsSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleProjects = isExpanded
        ? projects
        : projects.slice(0, COLLAPSED_PROJECTS_COUNT);
    const canToggle = projects.length > COLLAPSED_PROJECTS_COUNT;

    return (
        <section id="projects" className="px-4 relative">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
                    {" "}
                    Featured <span className="text-primary"> Projects </span>
                </h2>

                {/* <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Here are some projects.
                </p> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {visibleProjects.map((project, key) => (
                        <div
                            key={key}
                            className="group border border-border-2 bg-card-2 rounded-lg overflow-hidden shadow-xs card-hover"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", project.imagePosition)}
                                />
                            </div>

                            <div className="p-6">
                                <div className="flex">
                                    <div className="flex space-x-3">
                                        {project.urls.map((entry, key) => {
                                            const link = entry[0];
                                            const IconComponent = entry[1];

                                            return (
                                                <a
                                                    key={key}
                                                    href={link}
                                                    target="_blank"
                                                    className="text-foreground/80
                                        hover:text-primary transition-colors
                                        duration-300"
                                                >
                                                    <IconComponent size={30} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Project Title */}
                            <h3 className="inline-block px-6 text-xl font-semibold mb-1">
                                {project.title}
                            </h3>

                            {/* Project Description */}

                            <p className="px-3 md:px-6 text-muted-foreground text-sm mt-4 mb-4 text-left">
                                {project.description}
                            </p>

                            {/* Achievements */}

                            <div className="flex flex-wrap font-semibold mb-6 text-sm text-left">
                                {project.awards.map((award, key) => (
                                    <span key={key} className="px-3 md:px-6">
                                        <Trophy className="h-6 w-6 text-yellow-300 inline-block align-middle" />{" "}
                                        {award}
                                    </span>
                                ))}
                            </div>

                            {/* Tags */}

                            <div className="flex flex-wrap gap-2 mb-4 px-3 md:px-6">
                                {project.tags.map((tag, id) => (
                                    <span
                                        key={id}
                                        className={cn(
                                            "px-2 text-xs font-medium border rounded-full bg-secondary text-secondary",
                                            "hover:text-primary transition-colors duration-300"
                                        )}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {canToggle && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="mt-8 mx-auto block text-sm font-medium hover:underline transition-colors motion-safe:animate-bounce"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse projects" : "Expand projects"}
                    >
                        {isExpanded ? "See less" : "See more"}
                    </button>
                )}
            </div>
        </section>
    );
};
