export const AboutSection = () => {
    return (
        <section id="about" className="mt-20 px-4 relative">
            {" "}
            <div className="container mx-auto max-w-5xl ">
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
                        About <span className="text-primary"> Me</span>
                    </h2>

                    <p className="bg-card-1 px-5 md:px-10 py-10 text-muted-foreground rounded-[50px] border border-border-1 text-left">
                        I'm an undergraduate student majoring in Computer
                        Science with{" "}
                        <a
                            className="marker marker-2"
                            href="https://www.cc.gatech.edu/academics/threads/intelligence"
                            target="_blank"
                        >
                            Intelligence
                        </a>{" "}
                        and{" "}
                        <a
                            className="marker marker-2"
                            href="https://www.cc.gatech.edu/academics/threads/theory"
                            target="_blank"
                        >
                            Theory
                        </a>{" "}
                        threads at{" "}
                        <a
                            className="marker marker-3"
                            href="https://www.gatech.edu/"
                            target="_blank"
                        >
                            Georgia Tech
                        </a>
                        . My current interests are Machine Learning and Software
                        Engineering, which I believe have a lot of potential for
                        innovation and application. Outside of school, I love
                        playing piano, badminton, and running. I take pride in my
                        personal record of{" "}
                        <a
                            className="marker marker-4"
                            href="https://strava.app.link/q5L9VZ6NrWb"
                            target="_blank"
                        >
                            23:08 in the 5K
                        </a>. Currently, I'm learning about badminton.

                        <br /> <br />I have a big desire to interact with the
                        world. In particular, I like to learn and find ways
                        to apply my skills. For this reason, I enjoy attending
                        class lectures, where I can learn many tips and skills
                        from the professors. Furthermore, I love chatting with people,
                        so after classes I am usually spotted working on algorithms at the
                        {" "}
                        <a
                            className="marker marker-1"
                            href="https://programmingteam.cc.gatech.edu/"
                            target="_blank"
                        >
                            Competitive Programming @ GT
                        </a>{" "} club or doing projects with friends at{" "}
                        <a
                            className="marker marker-2"
                            href="https://www.linkedin.com/company/supercomputing-gt/posts/?feedView=all"
                            target="_blank"
                        >
                            Supercomputing @ GT
                        </a>. I'm always open to collaboration so
                        feel free to reach out!
                    </p>
                </div>
            </div>
        </section>
    );
};
