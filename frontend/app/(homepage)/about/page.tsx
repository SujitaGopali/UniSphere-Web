// import Link from "next/link";

// export default function AboutPage() {
//   const coreValues = [
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <path d="M12 20.5s-7.5-4.6-9.8-9.4C.8 7.6 2.3 4 5.7 3.2 8 2.6 10 3.6 12 6c2-2.4 4-3.4 6.3-2.8 3.4.8 4.9 4.4 3.5 7.9-2.3 4.8-9.8 9.4-9.8 9.4Z" />
//         </svg>
//       ),
//       title: "User-Centric",
//       description: "We put our users first in every decision we make, ensuring the best experience possible.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-6 w-6">
//           <path d="M13 2 4 14h6l-1 8 10-13h-6z" />
//         </svg>
//       ),
//       title: "Innovation",
//       description: "Constantly evolving and improving our platform with cutting-edge technology.",
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
//       title: "Community",
//       description: "Building a strong community of event organizers and participants across colleges.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <circle cx="12" cy="9" r="5.5" />
//           <path d="M9 13.8 7.5 21l4.5-2.5 4.5 2.5-1.5-7.2" />
//         </svg>
//       ),
//       title: "Excellence",
//       description: "Committed to delivering the highest quality service and support to our users.",
//     },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* About Us Banner Section - Light Purple and Light Yellow theme */}
//       <section className="relative bg-gradient-to-r from-purple-200 via-indigo-100 to-yellow-200 py-24 px-6 text-center text-slate-950 overflow-hidden border-b border-hairline">
//         {/* Subtle background decoration */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.2),transparent_40%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.15),transparent_45%)]" />
        
//         <div className="relative z-10 mx-auto max-w-4xl">
//           <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
//             About Our Platform
//           </h2>
//           <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-600 font-light leading-relaxed">
//             Empowering educational institutions with modern event management solutions that transform how colleges organize and participate in events
//           </p>
//         </div>
//       </section>

//       {/* Purpose and Direction Section */}
//       <section className="bg-canvas py-20 px-6">
//         <div className="mx-auto max-w-5xl">
//           <div className="text-center mb-16">
//             <h3 className="text-3xl font-bold text-on-dark tracking-tight mb-3">
//               Our Purpose & Direction
//             </h3>
//             <p className="text-sm text-body font-light">
//               Driven by innovation and commitment to excellence
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Mission Card */}
//             <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
//               <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
//                   <circle cx="12" cy="12" r="8.5" />
//                   <circle cx="12" cy="12" r="5" />
//                   <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
//                 </svg>
//               </div>
//               <h4 className="text-2xl font-bold text-on-dark mb-4">
//                 Our Mission
//               </h4>
//               <p className="text-sm text-body leading-relaxed">
//                 To revolutionize how educational institutions manage events by providing a comprehensive, user-friendly platform that streamlines every aspect of event coordination, from planning to execution. We aim to save time, reduce complexity, and enhance the experience for organizers and participants alike.
//               </p>
//             </div>

//             {/* Vision Card */}
//             <div className="rounded-3xl border border-purple-100 bg-purple-50/40 p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
//               <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
//                   <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
//                   <circle cx="12" cy="12" r="3" />
//                 </svg>
//               </div>
//               <h4 className="text-2xl font-bold text-on-dark mb-4">
//                 Our Vision
//               </h4>
//               <p className="text-sm text-body leading-relaxed">
//                 To become the leading platform for educational institutions worldwide, fostering a connected community where events are seamlessly organized, participation is maximized, and every student has access to enriching experiences that complement their academic journey through UniSphere.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Core Values Section */}
//       <section className="bg-canvas border-t border-hairline py-20 px-6 flex-1">
//         <div className="mx-auto max-w-6xl">
//           <div className="text-center mb-16">
//             <h3 className="text-3xl font-bold text-on-dark tracking-tight mb-3">
//               Our Core Values
//             </h3>
//             <p className="text-sm text-body font-light">
//               The principles that guide everything we do
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {coreValues.map((value) => (
//               <div
//                 key={value.title}
//                 className="group rounded-2xl border border-hairline bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-200"
//               >
//                 <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/10">
//                   {value.icon}
//                 </div>
//                 <h4 className="mb-2 text-base font-bold text-on-dark group-hover:text-purple-600 transition-colors">
//                   {value.title}
//                 </h4>
//                 <p className="text-sm text-body leading-relaxed">
//                   {value.description}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

import Link from "next/link";

export default function AboutPage() {
  const coreValues = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M12 20.5s-7.5-4.6-9.8-9.4C.8 7.6 2.3 4 5.7 3.2 8 2.6 10 3.6 12 6c2-2.4 4-3.4 6.3-2.8 3.4.8 4.9 4.4 3.5 7.9-2.3 4.8-9.8 9.4-9.8 9.4Z" />
        </svg>
      ),
      title: "User-Centric",
      description: "We put our users first in every decision we make, ensuring the best experience possible.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-6 w-6">
          <path d="M13 2 4 14h6l-1 8 10-13h-6z" />
        </svg>
      ),
      title: "Innovation",
      description: "Constantly evolving and improving our platform with cutting-edge technology.",
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
      title: "Community",
      description: "Building a strong community of event organizers and participants across colleges.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="9" r="5.5" />
          <path d="M9 13.8 7.5 21l4.5-2.5 4.5 2.5-1.5-7.2" />
        </svg>
      ),
      title: "Excellence",
      description: "Committed to delivering the highest quality service and support to our users.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Section */}
      <section className="relative bg-gradient-to-r from-purple-200 via-indigo-100 to-yellow-200 py-24 px-6 text-center text-slate-950 overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.15),transparent_45%)]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-indigo-700 mb-4">
            About UniSphere
          </span>
          <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-balance">
            About our platform
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-600 font-light leading-relaxed text-balance">
            Empowering educational institutions with modern event management solutions that transform how colleges organize and participate in events
          </p>
        </div>
      </section>

      {/* Purpose and Direction Section */}
      <section className="bg-canvas py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-m-blue-dark mb-3">
              Our Purpose
            </span>
            <h3 className="text-3xl font-bold text-on-dark tracking-tight mb-3">
              Purpose & direction
            </h3>
            <p className="text-sm text-body font-light">
              Driven by innovation and commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-on-dark mb-4">
                Our Mission
              </h4>
              <p className="text-sm text-body leading-relaxed">
                To revolutionize how educational institutions manage events by providing a comprehensive, user-friendly platform that streamlines every aspect of event coordination, from planning to execution. We aim to save time, reduce complexity, and enhance the experience for organizers and participants alike.
              </p>
            </div>

            {/* Vision Card */}
            <div className="rounded-3xl border border-purple-100 bg-purple-50/40 p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-on-dark mb-4">
                Our Vision
              </h4>
              <p className="text-sm text-body leading-relaxed">
                To become the leading platform for educational institutions worldwide, fostering a connected community where events are seamlessly organized, participation is maximized, and every student has access to enriching experiences that complement their academic journey through UniSphere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-canvas border-t border-hairline py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-purple-600 mb-3">
              What We Stand For
            </span>
            <h3 className="text-3xl font-bold text-on-dark tracking-tight mb-3">
              Our core values
            </h3>
            <p className="text-sm text-body font-light">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value) => (
              <div
                key={value.title}
                className="group rounded-2xl border border-hairline bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-200"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/10 transition-transform duration-300 group-hover:scale-105">
                  {value.icon}
                </div>
                <h4 className="mb-2 text-base font-bold text-on-dark group-hover:text-purple-600 transition-colors">
                  {value.title}
                </h4>
                <p className="text-sm text-body leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-24 bg-canvas flex-1">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 px-8 py-14 md:py-16 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 text-balance">
            Join the UniSphere community
          </h2>
          <p className="text-white/70 font-light mb-8 max-w-lg mx-auto">
            Whether you're organizing or attending, there's a place for you here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-sm font-semibold text-purple-700 transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
            <Link
              href="/features"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-7 text-sm font-semibold text-white transition-all hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              See what's possible
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}