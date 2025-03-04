import { Brain } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

const Footer = () => {
  return (
          <footer className="border-t py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              <div className="col-span-2 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">BrainWave</span>
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
                  <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                  <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Testimonials</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Case Studies</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">About</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-medium mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground">Accessibility</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2025 BrainWave AI. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground mt-4 md:mt-0">
                Made with ❤️ for students everywhere
              </p>
            </div>
          </div>
        </footer>
  )
}

export default Footer