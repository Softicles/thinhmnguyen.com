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
];

const front_end = [
    // Frontend
    { name: "React", logo: "devicon:react" },
    { name: "CSS", logo: "devicon:css3" },
    { name: "HTML", logo: "devicon:html5" },
    { name: "Tailwind CSS", logo: "devicon:tailwindcss" },
    { name: "Bootstrap", logo: "skill-icons:bootstrap" },
];

const back_end = [
    // Backend
    { name: "Django", logo: "material-icon-theme:django" },
    { name: "Node.js", logo: "devicon:nodejs" },
    { name: "Express.js", logo: "lineicons:expressjs" },
    { name: "Flask", logo: "simple-icons:flask" },
];

const categories = {
    Language: languages,
    "Data & Viz": data_viz,
    "ML & DS": ml_ds,
    Frontend: front_end,
    Backend: back_end,
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

                {/* Frontend */}

                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Frontend</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["Frontend"].map((skill) => (
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

                {/* Backend */}

                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Backend</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categories["Backend"].map((skill) => (
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

            <div className="mt-30 absolute bottom left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                <button>
                    <a href="#hero">
                        <ArrowUp className="h-5 w-5 text-primary" />
                    </a>
                </button>
            </div>
        </section>
    );
};
