import Image from 'next/image'
import React from 'react'
import edx from '../../public/edx.svg'
import coursera from '../../public/coursera.svg'
import udemy from '../../public/udemy.svg'
import khanacademy from '../../public/khanacademy.svg'
import physics_wallah from "../../public/physics_wallah.svg"

const TrustedBy = () => {
  // Create an array of images and their alt text
  const partners = [
    { src: edx, alt: 'Edx Logo' },
    { src: coursera, alt: 'Coursera Logo' },
    { src: udemy, alt: 'Udemy Logo' },
    { src: khanacademy, alt: 'Khan Academy Logo' },
    { src: physics_wallah, alt: 'Physics Wallah Logo' },
  ];

  return (
    <section className="pb-16 bg-transparent relative overflow-hidden">
      {/* Subtle blue background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DFE2FE]/10 dark:from-zinc-950/90 to-[#DFE2FE]/20 dark:to-[#DFE2FE]/5"></div>

      {/* Animated accent elements */}
      <div className="absolute -left-20 top-1/4 w-40 h-40 rounded-full bg-[#8E98F5]/10 dark:bg-[#8E98F5]/20 blur-xl animate-pulse-slow"></div>
      <div className="absolute -right-20 bottom-1/4 w-40 h-40 rounded-full bg-[#7091E6]/10 blur-xl animate-pulse-slow" 
           style={{ animationDelay: "1.5s" }}></div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight bg-gradient-to-t from-[#3D52A0] dark:from-[#b3cdff] to-[#7091E6] bg-clip-text text-transparent">
              Trusted by educators and students worldwide
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base max-w-xl mx-auto">
              Joining thousands of educational institutions empowering the next generation of learners
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-8 md:gap-12 items-center justify-center w-full max-w-4xl mx-auto">
            {partners.map((partner, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative p-4 bg-white/5 dark:bg-zinc-800/90 backdrop-blur-sm rounded-xl border border-[#B1CBFA]/20 transition-all duration-300 hover:border-[#8E98F5]/50 hover:shadow-lg hover:shadow-[#7091E6]/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#DFE2FE]/10 to-[#7091E6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                  <Image
                    src={partner.src}
                    alt={partner.alt}
                    width={100}
                    height={40}
                    className="h-14 w-auto object-contain relative z-10 transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;
