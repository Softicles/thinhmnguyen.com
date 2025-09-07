import { Copyright, MessageCircleHeart, Github, Linkedin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="py-12 px-4 bg-card relative border-t border-transparent mt-12 pt-8 justify-between items-center gradient animate-gradientShift">
            <p className="container text-[20] text-muted-foreground space-y-2 inline-block mt-2">
                Designed and built with love by{" "}
                <span className="font-semibold">Thinh Nguyen</span>
                <MessageCircleHeart className="ml-2 h-6 w-6 text-red-900 inline-block" />
            </p>
            <p className="text-sm text-muted-foreground font-light">
                © 2025 | Thinh Nguyen
            </p>
        </footer>
    );
};
