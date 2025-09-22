import { Background } from "../components/Background";
import { HeroSection } from "../components/HeroSection";
import { AboutSection } from "../components/AboutSection";
import { SkillsSection } from "../components/SkillsSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { Footer } from "../components/Footer";
import { RecentUpdates } from "../components/RecentUpdates";
import { ThemeToggle } from "../components/ThemeToggle";
import { LightBackground } from "../components/LightBackground";

export const Home = () => {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden ">
            {/*Theme Toggle*/}
            <ThemeToggle />
            {/*Background Effects*/}
            <Background />
            {/*Main Content*/}
            <HeroSection />
            <AboutSection />
            <RecentUpdates />
            <ProjectsSection />
            <SkillsSection />
            {/*Footer*/}
            <Footer />
        </div>
    );
};
