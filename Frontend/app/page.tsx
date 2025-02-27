"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Brain, BookOpen, BarChart, Clock, Shield, Star, ChevronRight, Zap, Award } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BrainBoost</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:underline underline-offset-4">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">Pricing</a>
            <a href="#faq" className="text-sm font-medium hover:underline underline-offset-4">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Log in
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">AI-Powered Learning</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Learning Tailored to <span className="text-primary">Your Unique Mind</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our AI tutoring system adapts to your learning style, pace, and knowledge gaps to create a 
                    personalized educational experience that helps you achieve your goals faster.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        className="w-full px-4 py-2 rounded-md border border-input bg-background"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button size="lg" className="sm:w-auto">
                    Start Free Trial
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                  <CheckCircle className="h-4 w-4 text-primary ml-2" />
                  <span>14-day free trial</span>
                  <CheckCircle className="h-4 w-4 text-primary ml-2" />
                  <span>Cancel anytime</span>
                </div>
              </div>
              <div className="relative lg:ml-auto">
                <div className="relative overflow-hidden rounded-lg border bg-background shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1170&auto=format&fit=crop"
                    alt="Student using BrainBoost AI tutoring platform"
                    width={600}
                    height={400}
                    className="object-cover w-full aspect-video"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-lg shadow-lg border">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Average Improvement</p>
                      <p className="text-2xl font-bold">32%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 border-y bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-medium tracking-tight">Trusted by educators and students worldwide</h2>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 grayscale opacity-70">
                <div className="flex items-center justify-center">
                  <Image src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=250&auto=format&fit=crop" alt="University Logo" width={120} height={40} className="h-8 w-auto object-contain" />
                </div>
                <div className="flex items-center justify-center">
                  <Image src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=250&auto=format&fit=crop" alt="Education Partner Logo" width={120} height={40} className="h-8 w-auto object-contain" />
                </div>
                <div className="flex items-center justify-center">
                  <Image src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=250&auto=format&fit=crop" alt="Tech Partner Logo" width={120} height={40} className="h-8 w-auto object-contain" />
                </div>
                <div className="flex items-center justify-center">
                  <Image src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=250&auto=format&fit=crop" alt="School District Logo" width={120} height={40} className="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Smarter Learning, Better Results
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Our AI-powered platform offers a comprehensive suite of tools designed to enhance your learning experience.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Adaptive Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI analyzes your learning patterns and adjusts content difficulty in real-time to optimize your progress.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Personalized Curriculum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get a custom learning path based on your goals, strengths, and areas that need improvement.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights help you understand your learning journey and celebrate milestones.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>24/7 Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn at your own pace with unlimited access to tutoring sessions whenever inspiration strikes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">How It Works</Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    AI That Understands How You Learn
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our advanced AI technology creates a learning experience as unique as you are, without the complexity.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Assessment</h3>
                      <p className="text-muted-foreground">
                        A quick diagnostic test identifies your current knowledge level and learning preferences.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Personalization</h3>
                      <p className="text-muted-foreground">
                        Our AI creates a custom learning plan tailored to your specific needs and goals.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Adaptive Learning</h3>
                      <p className="text-muted-foreground">
                        As you progress, the system continuously adjusts to optimize your learning experience.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Mastery</h3>
                      <p className="text-muted-foreground">
                        Regular assessments ensure you've truly mastered concepts before moving forward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative lg:ml-auto">
                <div className="relative overflow-hidden rounded-lg border bg-background shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=1170&auto=format&fit=crop"
                    alt="BrainBoost AI tutoring platform interface"
                    width={600}
                    height={400}
                    className="object-cover w-full aspect-video"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg border">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Learning Efficiency</p>
                      <p className="text-2xl font-bold">3x Faster</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Testimonials</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Success Stories from Real Students
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Hear from students who have transformed their learning experience with our AI tutoring system.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                        alt="Student portrait"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">Sarah J.</CardTitle>
                      <CardDescription>High School Student</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "I struggled with math for years until I found BrainBoost. The way it adapts to how I learn has helped me improve my grades from a C to an A- in just one semester!"
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant="outline">Math • Grade Improvement: 37%</Badge>
                </CardFooter>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                        alt="Student portrait"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">Michael T.</CardTitle>
                      <CardDescription>College Student</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "As a working student, I needed flexibility. BrainBoost lets me study whenever I have time, and the personalized approach helped me understand complex physics concepts I was struggling with."
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant="outline">Physics • Study Time: -40%</Badge>
                </CardFooter>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                      <Image
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop"
                        alt="Student portrait"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">Aisha K.</CardTitle>
                      <CardDescription>Graduate Student</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Preparing for my MCAT was overwhelming until I found BrainBoost. The way it identified and targeted my knowledge gaps was incredible. I scored in the 90th percentile!"
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant="outline">MCAT Prep • Score Improvement: 28%</Badge>
                </CardFooter>
              </Card>
            </div>
            <div className="mt-16 flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold">98%</p>
                  <p className="text-muted-foreground">Student Satisfaction</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">32%</p>
                  <p className="text-muted-foreground">Average Grade Improvement</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">3x</p>
                  <p className="text-muted-foreground">Faster Learning</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">50k+</p>
                  <p className="text-muted-foreground">Active Students</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Pricing</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Choose the plan that fits your learning needs. All plans include our core AI tutoring technology.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <Card className="border-none shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Perfect for casual learners</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {["5 subjects", "Basic AI tutoring", "Progress tracking", "Mobile access"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Start Free Trial</Button>
                </CardFooter>
              </Card>
              <Card className="border-none shadow-md flex flex-col relative bg-card before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/20 before:to-transparent before:rounded-lg before:-m-[1px] before:z-0">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle>Standard</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Ideal for dedicated students</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-2">
                    {[
                      "Unlimited subjects",
                      "Advanced AI tutoring",
                      "Detailed analytics",
                      "Practice tests",
                      "Study plan creation",
                      "Mobile access"
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button className="w-full">Start Free Trial</Button>
                </CardFooter>
              </Card>
              <Card className="border-none shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>For serious academic achievement</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {[
                      "Everything in Standard",
                      "Priority support",
                      "Live tutor sessions",
                      "Advanced simulations",
                      "Parent/teacher dashboard",
                      "Exam preparation",
                      "Offline access"
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Start Free Trial</Button>
                </CardFooter>
              </Card>
            </div>
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                All plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 border-y">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-medium tracking-tight">Your data is safe with us</h2>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>FERPA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>COPPA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>EdTech Breakthrough Award 2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">FAQ</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Get answers to common questions about our AI tutoring system.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How does the AI tutoring actually work?</AccordionTrigger>
                  <AccordionContent>
                    Our AI tutoring system uses machine learning algorithms to analyze your learning patterns, strengths, and areas for improvement. It creates a personalized learning path and adapts in real-time as you progress. The system identifies knowledge gaps and provides targeted content to address them, ensuring you master concepts before moving forward.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is BrainBoost effective for all subjects?</AccordionTrigger>
                  <AccordionContent>
                    Yes! BrainBoost is designed to work across all major academic subjects including math, science, language arts, social studies, and more. Our AI is trained on comprehensive educational content and can adapt to the specific requirements of each subject area. We regularly update our content to align with current educational standards.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can BrainBoost replace human tutors?</AccordionTrigger>
                  <AccordionContent>
                    BrainBoost is designed to complement human teaching, not replace it. While our AI provides personalized learning experiences and immediate feedback 24/7, we believe in the value of human connection in education. Our Premium plan includes access to live tutors who work alongside the AI system to provide the best of both worlds.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How does BrainBoost protect student privacy?</AccordionTrigger>
                  <AccordionContent>
                    We take privacy extremely seriously. BrainBoost is fully FERPA and COPPA compliant, meaning we adhere to federal regulations for protecting student data. We use advanced encryption for all data, never sell personal information, and give users full control over their data. Parents and students can request data deletion at any time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>What devices can I use BrainBoost on?</AccordionTrigger>
                  <AccordionContent>
                    BrainBoost is available on any device with an internet connection. We have dedicated apps for iOS and Android devices, and our web platform works on all modern browsers. Premium users can also access certain features offline after initial download.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>How long does it take to see results?</AccordionTrigger>
                  <AccordionContent>
                    Most students begin to see improvements within 2-4 weeks of regular use. The exact timeline depends on individual learning goals, frequency of use, and starting knowledge level. Our analytics dashboard shows progress in real-time so you can track improvements as they happen.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Learning Experience?
                </h2>
                <p className="max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Join thousands of students who are achieving their academic goals with BrainBoost.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent">
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm">No credit card required. 14-day free trial.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">BrainBoost</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Personalized AI tutoring that adapts to your unique learning style.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Testimonials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 BrainBoost AI. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              Made with ❤️ for students everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}