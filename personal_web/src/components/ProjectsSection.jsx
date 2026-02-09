import {
    GithubIcon,
    ExternalLink,
    FileText,
    Trophy,
    Youtube,
    Pen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
    {
        id: 1,
        title: "AI Calendar",
        description:
            "A website that can create events based on text inputs or PDF documents and automatically import them into users’ Google Calendar.",
        image: "/projects/ai_calendar.png",
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
        awards: ["One of the best prototypes for CS 2340 - Final Project"],
    },

    {
        id: 2,
        title: "Movie Store",
        description:
            "A full-stack Django movie store website. I used the Master-Agent Architecture (two EC2s + two EFSs) combined with Jenkins and Docker to deploy this website onto AWS.",
        image: "/projects/movie_store.png",
        tags: ["Python", "Django", "SQLite", "Terraform", "AWS", "Docker"],
        urls: [
            [
                "http://ec2-44-251-8-106.us-west-2.compute.amazonaws.com/",
                ExternalLink,
            ],
            ["https://github.com/Softicles/moviestore_with_aws", GithubIcon],
            [
                "https://aws.plainenglish.io/mastering-jenkins-cost-efficiency-scalable-ci-cd-with-aws-ecs-master-agent-architecture-d157b3788474",
                Pen,
            ],
        ],
        awards: ["Achieved 100/100 points as Midterm Project - CS 2340"],
    },

    {
        id: 3,
        title: "Markov Decision Model with multiple observation processes",
        description: `Found a ghost in the TextWorld environment using Hidden Markov Models with Multiple Observation Processes (task 2 - part A). I read the paper "Hidden Markov Models with Multiple Observation Prrocesses" by James Yuanjie Zhao to understand the algorithm and implemented it from scratch in Python.`,
        image: "/projects/text_world.jpg",
        tags: [
            "Python",
            "TextWorld",
            "numpy",
            "pgmpy",
        ],
        urls: [["https://github.com/Softicles/CS-3600-HW3", GithubIcon], ["https://arxiv.org/abs/2210.09381", Pen]],
        awards: ["Achieved more than 96% accuracy on the test set"],
    },

    {
        id: 4,
        title: "Fine-tuning a PaddleOCR model",
        description: `The English ultra-lightweight PP-OCRv3 model is terrible at recognizing my own handwriting. For this reason, I re-train the model using my notes from the classes I took at Georgia Tech.`,
        image: "/projects/finetune_ocr.png",
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
        id: 5,
        title: "Breast Cancer Classifer",
        description:
            "I solved the Breast Cancer Classifier problem using a ResNet18.",
        image: "/projects/train_loss.png",
        tags: [
            "Python",
            "Sckit-learn",
            "Pandas",
            "Seaborn",
            "Pytorch",
            "Matlotlib",
        ],
        urls: [
            [
                "https://github.com/Softicles/Breast_Cancer_Classifier/blob/main/Breast-Cancer-Classifier.ipynb",
                FileText,
            ],
            [
                "https://www.kaggle.com/competitions/breast-cancer-classification",
                Pen,
            ],
        ],
        awards: ["Achieved around 92% accuracy"],
    },
    {
        id: 6,
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
        awards: ["Achieved 100/100 points as Final Project - ECON 2250"],
    },
    {
        id: 7,
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
        id: 8,
        title: "The Hardest Game in The World",
        description:
            'A game in Game Boy Advance (GBA) style that I made as a submission for Homework 6 at "CS 2110: Computer Organization & Programming" at Georgia Tech.',
        image: "/projects/hardest_game.png",
        tags: ["C", "mGBA", "Docker"],
        urls: [
            [
                "https://github.com/Softicles/The-Hardest-Game-in-The-World",
                GithubIcon,
            ],
        ],
        awards: ["Achieved 105/100 points for HW6 - CS 2110"],
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
            </div>
        </section>
    );
};
