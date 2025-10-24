import {
    GithubIcon,
    ExternalLink,
    FileText,
    Trophy,
    Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
    {
        id: 1,
        title: "AI Calendar",
        description:
            'A website that can create events based on text inputs or PDF documents and automatically import them into users’ Google Calendar. This project initially served as the final project for "CS 2340: Objects and Design" at Georgia Tech.',
        image: "/projects/ai_calendar.png",
        tags: [
            "Python",
            "JavaScript",
            "Django",
            "React",
            "CSS",
            "Bootstrap",
            "HTML",
            "OpenAI API",
            "Google Calendar API",
            "OAuth",
        ],
        urls: [
            ["https://aicalendar.art", ExternalLink],
            ["https://github.com/Softicles/Continue-AI-Calendar", GithubIcon],
        ],
        awards: ["Achieved 100/100 points at Final Demo day"],
    },
    {
        id: 2,
        title: "Fine-tuning a PaddleOCR model",
        description: `I figured out that the English ultra-lightweight PP-OCRv3 model is terrible at recognizing my own handwriting, even though I think it's not that bad. For this reason, I used my own handwritten documents from the classes I took at Georgia Tech to re-train the model.`,
        image: "/projects/finetune_ocr.png",
        tags: [
            "PaddlePaddle",
            "PPOCRLabel",
            "Python",
            "Linux",
            "OpenAI API",
            "PIL",
        ],
        urls: [["https://github.com/Softicles/Fine-tuning_an_OCR", GithubIcon]],
        awards: ["Achieved 90% reduction in loss value"],
    },
    {
        id: 3,
        title: "EPL Payroll vs Performance",
        description:
            "I did some statistical analysis to explore the relationship between a team’s payroll and its performance in the English Premier League (EPL). Does a high-value team imply a good seasonal performance?",
        image: "/projects/epl_analysis.png",
        tags: ["R", "RStudio", "Excel"],
        urls: [
            [
                "https://github.com/Softicles/EPL-payroll-points-analysis",
                GithubIcon,
            ],
            [
                "https://github.com/Softicles/EPL-payroll-points-analysis/blob/main/EPL_payroll_vs_points_analysis.pdf",
                FileText,
            ],
            ["https://youtu.be/08_uHv_Ve2s", Youtube],
        ],
        awards: [],
    },

    {
        id: 4,
        title: "Model complicated Random Variables with R",
        description:
            'This is the final project for "MATH 3215: Probabilities and Statistic" taught by Dr. Manh Khang Huynh. This is the best Math class that I have taken at Georgia Tech so far! (I also attach my note for this class inside the repository)',
        image: "/projects/plot_of_N10_problem_6.png",
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
        id: 5,
        title: "The Hardest Game in The World",
        description:
            'This is a game in Game Boy Advance (GBA) style that I made as a submission for Homework 6 at "CS 2110: Computer Organization & Programming" at Georgia Tech.',
        image: "/projects/hardest_game.png",
        tags: ["C", "mGBA"],
        urls: [
            [
                "https://github.com/Softicles/The-Hardest-Game-in-The-World",
                GithubIcon,
            ],
        ],
        awards: ["Achieved 105/100 points"],
    },
];

export const ProjectsSection = () => {
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
                    {projects.map((project, key) => (
                        <div
                            key={key}
                            className="group border border-border-2 bg-card-2 rounded-lg overflow-hidden shadow-xs card-hover"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-6">
                                <div className="flex">
                                    <div className="flex space-x-3">
                                        {project.urls.map(
                                            ([link, Icon], key) => (
                                                <a
                                                    key={key}
                                                    href={link}
                                                    target="_blank"
                                                    className="text-foreground/80
                                        hover:text-primary transition-colors
                                        duration-300"
                                                >
                                                    <Icon size={30} />
                                                </a>
                                            )
                                        )}
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

                            <div className="flex flex-wrap font-semibold mb-6 text-left">
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
                                            "px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary",
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
            </div>
        </section>
    );
};
