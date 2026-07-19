// import Link from "next/link";
// import Image from "next/image";

// export default function HomePage() {
//   const features = [
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="3" y="4.5" width="18" height="16" rx="2" />
//           <path d="M3 9.5h18" />
//           <path d="M8 2.5v4M16 2.5v4" />
//           <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
//           <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
//           <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
//         </svg>
//       ),
//       title: "Event Management",
//       description: "Create and manage events with ease. Track registrations and attendance in real-time.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <circle cx="9" cy="8" r="3" />
//           <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
//           <circle cx="17" cy="9" r="2.4" />
//           <path d="M15.5 14.2c2.4.3 4.5 2.4 4.5 5.3" />
//         </svg>
//       ),
//       title: "Contingent Tracking",
//       description: "Manage college contingents efficiently with dedicated coordinator tools.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="3" y="3" width="7" height="7" rx="1" />
//           <rect x="14" y="3" width="7" height="7" rx="1" />
//           <rect x="3" y="14" width="7" height="7" rx="1" />
//           <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="currentColor" stroke="none" />
//         </svg>
//       ),
//       title: "QR Check-in",
//       description: "Fast and secure QR code-based check-in system for seamless event entry.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <path d="M3 20V4M3 20h18" />
//           <rect x="6.5" y="13" width="3" height="7" rx="0.5" fill="currentColor" stroke="none" />
//           <rect x="11.5" y="9" width="3" height="11" rx="0.5" fill="currentColor" stroke="none" />
//           <rect x="16.5" y="5" width="3" height="15" rx="0.5" fill="currentColor" stroke="none" />
//         </svg>
//       ),
//       title: "Analytics Dashboard",
//       description: "Get insights with powerful analytics and real-time event statistics.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="5" y="11" width="14" height="9" rx="2" />
//           <path d="M8 11V7a4 4 0 0 1 8 0v4" />
//           <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
//         </svg>
//       ),
//       title: "Secure Platform",
//       description: "Enterprise-grade security with role-based access control.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-6 w-6">
//           <path d="M13 2 4 14h6l-1 8 10-13h-6z" />
//         </svg>
//       ),
//       title: "Lightning Fast",
//       description: "Optimized performance for handling thousands of participants.",
//     },
//   ];

//   return (
//     <>
//       {/* Hero Section */}
//       <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-6 overflow-hidden">
//         {/* Background Image */}
//         <div className="absolute inset-0 z-0">
//           <Image
//             src="/dashboard-hero.jpg?v=2"
//             alt="Graduation Celebration"
//             fill
//             className="object-cover"
//             priority
//             unoptimized
//           />
//           {/* Dark Overlay to dim the image */}
//           <div className="absolute inset-0 bg-black/60" />
//         </div>

//         {/* Content on top of image */}
//         <div className="relative z-10 flex flex-col items-center max-w-4xl">
//           {/* Badge */}
//           <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-2 mb-8">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white">
//               <path d="M12 3 2 8l10 5 10-5-10-5Z" />
//               <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
//               <path d="M21 8v6" />
//             </svg>
//             <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white">
//               College Event Management
//             </span>
//           </div>

//           {/* Main Heading */}
//           <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
//             Welcome to{" "}
//             <span className="bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
//               UniSphere
//             </span>
//           </h1>

//           {/* Subtitle */}
//           <p className="mb-12 max-w-2xl text-base md:text-lg text-white/75 font-light leading-relaxed">
//             UniSphere brings all your campus activities into one scholarly yet vibrant
//             platform. From guest lectures to social gatherings, never miss a beat of
//             your university life.
//           </p>

//           {/* Buttons */}
//           <div className="flex flex-wrap justify-center gap-5">
//             <Link
//               href="/register"
//               className="group inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-m-blue-dark transition-all hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
//             >
//               Get Started
//               <span className="transition-transform group-hover:translate-x-1">→</span>
//             </Link>
//             <Link
//               href="/login"
//               className="group inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/25 px-8 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5"
//             >
//               Login
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="bg-canvas py-20 px-6">
//         <div className="mx-auto max-w-6xl">
//           <p className="text-center text-base md:text-lg text-m-blue-dark font-light italic mb-14">
//             Powerful features designed to make event management effortless
//           </p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((feature) => (
//               <div
//                 key={feature.title}
//                 className="group rounded-xl border border-hairline bg-surface-card p-7 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-m-blue-light/30"
//               >
//                 <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-m-blue-light/20 to-m-blue-dark/10 text-m-blue-dark">
//                   {feature.icon}
//                 </div>
//                 <h3 className="mb-2 text-base font-semibold text-on-dark">
//                   {feature.title}
//                 </h3>
//                 <p className="text-sm text-body leading-relaxed">
//                   {feature.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9.5h18" />
          <path d="M8 2.5v4M16 2.5v4" />
          <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
      title: "Event Management",
      description: "Create and manage events with ease. Track registrations and attendance in real-time.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M15.5 14.2c2.4.3 4.5 2.4 4.5 5.3" />
        </svg>
      ),
      title: "Contingent Tracking",
      description: "Manage college contingents efficiently with dedicated coordinator tools.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="currentColor" stroke="none" />
        </svg>
      ),
      title: "QR Check-in",
      description: "Fast and secure QR code-based check-in system for seamless event entry.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M3 20V4M3 20h18" />
          <rect x="6.5" y="13" width="3" height="7" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="11.5" y="9" width="3" height="11" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="16.5" y="5" width="3" height="15" rx="0.5" fill="currentColor" stroke="none" />
        </svg>
      ),
      title: "Analytics Dashboard",
      description: "Get insights with powerful analytics and real-time event statistics.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      ),
      title: "Secure Platform",
      description: "Enterprise-grade security with role-based access control.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-6 w-6">
          <path d="M13 2 4 14h6l-1 8 10-13h-6z" />
        </svg>
      ),
      title: "Lightning Fast",
      description: "Optimized performance for handling thousands of participants.",
    },
  ];

  const stats = [
    { value: "50+", label: "Colleges onboard" },
    { value: "1,200+", label: "Events hosted" },
    { value: "80K+", label: "Check-ins processed" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/dashboard-hero.jpg?v=2"
            alt="Graduation Celebration"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black/75" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-4xl py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-2 mb-8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white" aria-hidden="true">
              <path d="M12 3 2 8l10 5 10-5-10-5Z" />
              <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
              <path d="M21 8v6" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white">
              College Event Management
            </span>
          </div>

          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight text-balance">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
              UniSphere
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-base md:text-lg text-white/75 font-light leading-relaxed text-balance">
            UniSphere brings all your campus activities into one scholarly yet vibrant
            platform. From guest lectures to social gatherings, never miss a beat of
            your university life.
          </p>

          <div className="flex flex-wrap justify-center gap-5 mb-16">
            <Link
              href="/register"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-white px-8 text-sm font-semibold text-m-blue-dark transition-all hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get Started
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
            <Link
              href="/login"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/25 px-8 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Login
            </Link>
          </div>

          {/* Trust / stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-6 border-t border-white/15 pt-8 w-full max-w-2xl">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-white/60 mt-1 text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-canvas py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-m-blue-dark mb-3">
              Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-on-dark tracking-tight mb-4">
              Everything you need, in one place
            </h2>
            <p className="text-base md:text-lg text-body font-light leading-relaxed">
              Powerful features designed to make event management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-hairline bg-surface-card p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-m-blue-light/30"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-m-blue-light/20 to-m-blue-dark/10 text-m-blue-dark transition-transform duration-300 group-hover:scale-105">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-on-dark">
                  {feature.title}
                </h3>
                <p className="text-sm text-body leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-m-blue-dark to-blue-900 px-8 py-14 md:py-16 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 text-balance">
            Ready to bring your campus events online?
          </h2>
          <p className="text-white/70 font-light mb-8 max-w-lg mx-auto">
            Join coordinators and students already running events on UniSphere.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-sm font-semibold text-m-blue-dark transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Create your account
            </Link>
            <Link
              href="/features"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-7 text-sm font-semibold text-white transition-all hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore features
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}