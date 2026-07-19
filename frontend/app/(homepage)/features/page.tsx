// import Link from "next/link";

// export default function FeaturesPage() {
//   const coordinatorFeatures = [
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="3" y="4.5" width="18" height="16" rx="2" />
//           <path d="M3 9.5h18" />
//           <path d="M8 2.5v4M16 2.5v4" />
//           <path d="M12 13v5M9.5 15.5h5" />
//         </svg>
//       ),
//       title: "Event Creation & Management",
//       description: "Create events with detailed information, set capacity limits, and manage registrations effortlessly.",
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
//       title: "QR Code Check-in",
//       description: "Generate unique QR codes for participants and enable fast, contactless check-ins at your events.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="3" y="5" width="18" height="14" rx="2" />
//           <path d="m4 6.5 8 6 8-6" />
//         </svg>
//       ),
//       title: "Invite College Leaders",
//       description: "Send invitations to college leaders and track their responses in real-time.",
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
//       title: "Real-time Analytics",
//       description: "Monitor registrations, attendance, and engagement with comprehensive analytics dashboards.",
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
//       title: "Bulk Attendance",
//       description: "Mass check-in functionality for efficient event management and attendance tracking.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <circle cx="12" cy="12" r="3" />
//           <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
//         </svg>
//       ),
//       title: "Access Management",
//       description: "Control event permissions, roles, and manage team access with granular controls.",
//     },
//   ];

//   const participantFeatures = [
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <circle cx="12" cy="12" r="9" />
//           <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" />
//         </svg>
//       ),
//       title: "Event Discovery",
//       description: "Browse and discover exciting events happening across colleges and universities.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="2.5" y="5" width="19" height="14" rx="2" />
//           <circle cx="8.5" cy="12" r="2.2" />
//           <path d="M5.5 16.5c.6-1.6 1.8-2.4 3-2.4s2.4.8 3 2.4" />
//           <path d="M15 9.5h4M15 12.5h4M15 15.5h2.5" />
//         </svg>
//       ),
//       title: "Digital QR Passport",
//       description: "Get your personal QR code for quick check-ins at all registered events.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <path d="M6 2.5h9l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
//           <path d="M15 2.5V7h4" />
//           <path d="M8 12h8M8 15.5h8M8 19h5" />
//         </svg>
//       ),
//       title: "Event Feed",
//       description: "Stay updated with personalized event recommendations and updates.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <circle cx="12" cy="8" r="3.5" />
//           <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
//           <path d="m9.2 17.8 1.9 1.9 3.5-3.5" />
//         </svg>
//       ),
//       title: "ID Verification",
//       description: "Complete one-time ID verification for seamless event registrations.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <rect x="3" y="4.5" width="18" height="16" rx="2" />
//           <path d="M3 9.5h18" />
//           <path d="M8 2.5v4M16 2.5v4" />
//           <path d="m8.7 14.2 1.8 1.8 3.3-3.6" />
//         </svg>
//       ),
//       title: "My Events",
//       description: "Track all your registered events, attendance history, and upcoming activities.",
//     },
//     {
//       icon: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
//           <circle cx="12" cy="9" r="5.5" />
//           <path d="M9 13.8 7.5 21l4.5-2.5 4.5 2.5-1.5-7.2" />
//         </svg>
//       ),
//       title: "Digital Certificates",
//       description: "View, download, and share your event participation certificates instantly.",
//     },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Features Banner Section */}
//       <section className="relative bg-gradient-to-r from-purple-200 via-indigo-100 to-yellow-200 py-24 px-6 text-center text-slate-950 overflow-hidden border-b border-hairline">
//         {/* Subtle background decoration */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.2),transparent_40%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(234,179,8,0.15),transparent_45%)]" />
        
//         <div className="relative z-10 mx-auto max-w-4xl">
//           <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
//             Powerful Features for Every User
//           </h2>
//           <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-600 font-light leading-relaxed">
//             Comprehensive tools designed to make event management seamless for coordinators and participants
//           </p>
//         </div>
//       </section>

//       {/* Features Lists Section */}
//       <section className="bg-canvas py-20 px-6 flex-1">
//         <div className="mx-auto max-w-6xl">
//           {/* Event Coordinators */}
//           <div className="mb-24">
//             <div className="flex flex-col items-center mb-12">
//               <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
//                   <rect x="3" y="4.5" width="18" height="16" rx="2" />
//                   <path d="M3 9.5h18" />
//                   <path d="M8 2.5v4M16 2.5v4" />
//                   <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
//                   <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
//                   <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl md:text-3xl font-bold text-on-dark tracking-tight">
//                 For Event Coordinators
//               </h3>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {coordinatorFeatures.map((feature) => (
//                 <div
//                   key={feature.title}
//                   className="group rounded-2xl border border-blue-100/55 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
//                 >
//                   <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                     {feature.icon}
//                   </div>
//                   <h4 className="mb-2 text-base font-bold text-on-dark group-hover:text-blue-600 transition-colors">
//                     {feature.title}
//                   </h4>
//                   <p className="text-sm text-body leading-relaxed">
//                     {feature.description}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Participants */}
//           <div>
//             <div className="flex flex-col items-center mb-12">
//               <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 shadow-sm">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
//                   <rect x="7" y="2.5" width="10" height="19" rx="2" />
//                   <path d="M7 18h10" />
//                   <circle cx="12" cy="19.3" r="0.6" fill="currentColor" stroke="none" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl md:text-3xl font-bold text-on-dark tracking-tight">
//                 For Participants
//               </h3>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {participantFeatures.map((feature) => (
//                 <div
//                   key={feature.title}
//                   className="group rounded-2xl border border-pink-100/55 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-pink-200"
//                 >
//                   <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
//                     {feature.icon}
//                   </div>
//                   <h4 className="mb-2 text-base font-bold text-on-dark group-hover:text-pink-600 transition-colors">
//                     {feature.title}
//                   </h4>
//                   <p className="text-sm text-body leading-relaxed">
//                     {feature.description}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

import Link from "next/link";

export default function FeaturesPage() {
  const coordinatorFeatures = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9.5h18" />
          <path d="M8 2.5v4M16 2.5v4" />
          <path d="M12 13v5M9.5 15.5h5" />
        </svg>
      ),
      title: "Event Creation & Management",
      description: "Create events with detailed information, set capacity limits, and manage registrations effortlessly.",
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
      title: "QR Code Check-in",
      description: "Generate unique QR codes for participants and enable fast, contactless check-ins at your events.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 6.5 8 6 8-6" />
        </svg>
      ),
      title: "Invite College Leaders",
      description: "Send invitations to college leaders and track their responses in real-time.",
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
      title: "Real-time Analytics",
      description: "Monitor registrations, attendance, and engagement with comprehensive analytics dashboards.",
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
      title: "Bulk Attendance",
      description: "Mass check-in functionality for efficient event management and attendance tracking.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      ),
      title: "Access Management",
      description: "Control event permissions, roles, and manage team access with granular controls.",
    },
  ];

  const participantFeatures = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" />
        </svg>
      ),
      title: "Event Discovery",
      description: "Browse and discover exciting events happening across colleges and universities.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <circle cx="8.5" cy="12" r="2.2" />
          <path d="M5.5 16.5c.6-1.6 1.8-2.4 3-2.4s2.4.8 3 2.4" />
          <path d="M15 9.5h4M15 12.5h4M15 15.5h2.5" />
        </svg>
      ),
      title: "Digital QR Passport",
      description: "Get your personal QR code for quick check-ins at all registered events.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M6 2.5h9l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
          <path d="M15 2.5V7h4" />
          <path d="M8 12h8M8 15.5h8M8 19h5" />
        </svg>
      ),
      title: "Event Feed",
      description: "Stay updated with personalized event recommendations and updates.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
          <path d="m9.2 17.8 1.9 1.9 3.5-3.5" />
        </svg>
      ),
      title: "ID Verification",
      description: "Complete one-time ID verification for seamless event registrations.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9.5h18" />
          <path d="M8 2.5v4M16 2.5v4" />
          <path d="m8.7 14.2 1.8 1.8 3.3-3.6" />
        </svg>
      ),
      title: "My Events",
      description: "Track all your registered events, attendance history, and upcoming activities.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="9" r="5.5" />
          <path d="M9 13.8 7.5 21l4.5-2.5 4.5 2.5-1.5-7.2" />
        </svg>
      ),
      title: "Digital Certificates",
      description: "View, download, and share your event participation certificates instantly.",
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
            Features
          </span>
          <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-balance">
            Powerful features for every user
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-600 font-light leading-relaxed text-balance">
            Comprehensive tools designed to make event management seamless for coordinators and participants
          </p>
        </div>
      </section>

      {/* Features Lists Section */}
      <section className="bg-canvas py-24 px-6 flex-1">
        <div className="mx-auto max-w-6xl">
          {/* Event Coordinators */}
          <div className="mb-28">
            <div className="flex flex-col items-center mb-12">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <rect x="3" y="4.5" width="18" height="16" rx="2" />
                  <path d="M3 9.5h18" />
                  <path d="M8 2.5v4M16 2.5v4" />
                  <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
                  <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-blue-600 mb-2">
                For Organizers
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-on-dark tracking-tight">
                For Event Coordinators
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coordinatorFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-blue-100/55 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h4 className="mb-2 text-base font-bold text-on-dark group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-body leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex flex-col items-center mb-12">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <rect x="7" y="2.5" width="10" height="19" rx="2" />
                  <path d="M7 18h10" />
                  <circle cx="12" cy="19.3" r="0.6" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-pink-600 mb-2">
                For Attendees
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-on-dark tracking-tight">
                For Participants
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participantFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-pink-100/55 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-pink-200"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-transform duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h4 className="mb-2 text-base font-bold text-on-dark group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-body leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-24 bg-canvas">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-14 md:py-16 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 text-balance">
            See these features in action
          </h2>
          <p className="text-white/70 font-light mb-8 max-w-lg mx-auto">
            Set up your first event in minutes — no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-sm font-semibold text-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started free
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-7 text-sm font-semibold text-white transition-all hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Learn more about us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}