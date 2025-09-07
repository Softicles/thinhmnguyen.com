import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// help applying className to html objects looks cleaner
export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};
