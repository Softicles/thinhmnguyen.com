import { Icon } from "@iconify/react";
import { ArrowUp } from "lucide-react";
const languages = [
    // Language
    { name: "Python", logo: "devicon:python" },
    { name: "C", logo: "devicon:c" },
    { name: "Java", logo: "devicon:java" },
    { name: "JavaScript", logo: "devicon:javascript" },
    { name: "R", logo: "devicon:r" },
    { name: "Assembly", logo: "vscode-icons:file-type-assembly" },
    { name: "SQL", logo: "arcticons:sqlite-editor" },
];

const data_viz = [
    // Data & Viz
    { name: "Numpy", logo: "devicon:numpy" },
    { name: "Pandas", logo: "devicon:pandas" },
    { name: "Matplotlib", logo: "devicon:matplotlib" },
    { name: "Seaborn", logo: "logos:seaborn-icon" },
    { name: "Jupyter", logo: "devicon:jupyter" },
    { name: "Colab", logo: "simple-icons:googlecolab" },
];

const ml_ds = [
    // ML & DS
    { name: "PyTorch", logo: "devicon:pytorch" },
    { name: "Scikit-learn", logo: "devicon:scikitlearn" },
    { name: "Hugging Face", logo: "noto-v1:hugging-face" },
    { name: "RStudio", logo: "devicon:rstudio" },
];

const cloud = [
    // Cloud
    { name: "Jenkins", logo: "material-icon-theme:jenkins" },
    { name: "AWS", logo: "skill-icons:aws-light" },
    { name: "Terraform", logo: "catppuccin:terraform" },
    { name: "Docker", logo: "devicon:docker" },
];

const web_dev = [
    // Web Dev
    { name: "React", logo: "devicon:react" },
    { name: "Tailwind CSS", logo: "devicon:tailwindcss" },
    { name: "Bootstrap", logo: "skill-icons:bootstrap" },
    { name: "Django", logo: "material-icon-theme:django" },
    { name: "Node.js", logo: "devicon:nodejs" },
    { name: "Express.js", logo: "lineicons:expressjs" },
    { name: "Flask", logo: "simple-icons:flask" },
];

const categories = {
    Language: languages,
    "Data & Viz": data_viz,
    "ML & DS": ml_ds,
    Cloud: cloud,
    "Full-stack": web_dev,
};

export const SkillsSection = () => {
    return (
        <section id="skills" className="py-24 px-4 relative bg-secondary/30">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
                    My <span className="text-primary"> Skills</span>
                </h2>
            </div>

            <div className="flex flex-wrap justify-center content-center items-start gap-8">
                {/* Languages */}
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Language</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["Language"].map((skill) => (
                            <tr
                                key={skill["name"]}
                                style={{
                                    border: "transparent",
                                    padding: "6px 8px",
                                    textAlign: "left",
                                }}
                            >
                                <td>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Icon
                                            icon={skill["logo"]}
                                            width={30}
                                            height={30}
                                        />
                                        {skill["name"]}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Data & Viz */}

                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Data & Viz</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["Data & Viz"].map((skill) => (
                            <tr
                                key={skill["name"]}
                                style={{
                                    border: "transparent",
                                    padding: "6px 8px",
                                    textAlign: "left",
                                }}
                            >
                                <td>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Icon
                                            icon={skill["logo"]}
                                            width={30}
                                            height={30}
                                        />
                                        {skill["name"]}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ML & DS */}

                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>ML & DS</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["ML & DS"].map((skill) => (
                            <tr
                                key={skill["name"]}
                                style={{
                                    border: "transparent",
                                    padding: "6px 8px",
                                    textAlign: "left",
                                }}
                            >
                                <td>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Icon
                                            icon={skill["logo"]}
                                            width={30}
                                            height={30}
                                        />
                                        {skill["name"]}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Cloud */}

                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Cloud</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["Cloud"].map((skill) => (
                            <tr
                                key={skill["name"]}
                                style={{
                                    border: "transparent",
                                    padding: "6px 8px",
                                    textAlign: "left",
                                }}
                            >
                                <td>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Icon
                                            icon={skill["logo"]}
                                            width={30}
                                            height={30}
                                        />
                                        {skill["name"]}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Web-dev */}

                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Full Stack</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["Full-stack"].map((skill) => (
                            <tr
                                key={skill["name"]}
                                style={{
                                    border: "transparent",
                                    padding: "6px 8px",
                                    textAlign: "left",
                                }}
                            >
                                <td>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Icon
                                            icon={skill["logo"]}
                                            width={30}
                                            height={30}
                                        />
                                        {skill["name"]}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-15 absolute bottom left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                <button>
                    <a href="#hero">
                        <ArrowUp className="h-5 w-5 text-primary" />
                    </a>
                </button>
            </div>
        </section>
    );
};
