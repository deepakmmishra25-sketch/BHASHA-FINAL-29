import Link from "next/link";
import type { ReactNode } from "react";
import { Globe, Users, Landmark, Gift, ArrowUpRight } from "lucide-react";

const stats = [
  {
    value: "13",
    label: "Languages",
    Icon: Globe,
  },
  {
    value: "50K+",
    label: "Entrepreneurs",
    Icon: Users,
  },
  {
    value: "200+",
    label: "Gov. Schemes",
    Icon: Landmark,
  },
  {
    value: "Free",
    label: "Forever Plan",
    Icon: Gift,
  },
];

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* =========================================================
          LEFT SIDE — BHARAT / FARMER / MSME HERO
      ========================================================= */}
      <section className="relative hidden lg:flex min-h-screen overflow-hidden text-white">

        {/* Hero Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/auth-hero.svg')",
          }}
          aria-hidden="true"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/70" />

        {/* Orange brand tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-orange-950/20" />

        {/* Main content */}
        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">

          {/* =====================================================
              BRAND
          ===================================================== */}
          <Link
            href="/"
            className="flex w-fit items-center gap-3 group"
          >
            <span
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl
                bg-white/15
                backdrop-blur-md
                ring-1 ring-white/25
                transition
                group-hover:bg-white/25
              "
            >
              <Globe className="h-5 w-5" />
            </span>

            <span className="text-xl font-bold tracking-tight">
              BhashaSetu AI
            </span>
          </Link>


          {/* =====================================================
              HERO MESSAGE
          ===================================================== */}
          <div className="max-w-2xl pt-16">

            {/* Made for Bharat badge */}
            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-white/12
                px-3
                py-1.5
                text-xs
                font-medium
                backdrop-blur-md
                ring-1
                ring-white/20
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />

              Made for Bharat
            </div>


            {/* Hindi heading */}
            <h1
              className="
                font-devanagari
                text-4xl
                font-bold
                leading-[1.18]
                tracking-tight
                xl:text-5xl
              "
            >
              अपनी भाषा में,
              <br />
              अपना{" "}
              <span className="text-orange-300">
                भविष्य
              </span>{" "}
              बनाएं
            </h1>


            {/* Supporting text */}
            <p
              className="
                mt-4
                max-w-xl
                text-base
                font-medium
                leading-7
                text-white/90
                xl:text-lg
              "
            >
              Build your future in your own language — connect
              farmers, artisans, MSMEs and entrepreneurs with
              opportunities that matter.
            </p>

          </div>


          {/* =====================================================
              STATISTICS
          ===================================================== */}
          <div
            className="
              mt-10
              grid
              max-w-2xl
              grid-cols-2
              gap-3
              xl:gap-4
            "
          >

            {stats.map(({ value, label, Icon }) => (
              <div
                key={label}
                className="
                  group
                  rounded-2xl
                  border
                  border-white/15
                  bg-black/20
                  p-4
                  backdrop-blur-md
                  transition
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-black/30
                "
              >

                <div className="flex items-center gap-3">

                  {/* Icon */}
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-orange-500/85
                      shadow-lg
                      shadow-orange-950/20
                    "
                  >
                    <Icon className="h-5 w-5" />
                  </span>


                  {/* Text */}
                  <div>

                    <div className="text-2xl font-bold leading-none">
                      {value}
                    </div>

                    <div className="mt-1 text-xs text-white/75">
                      {label}
                    </div>

                  </div>

                </div>

              </div>
            ))}

          </div>


          {/* =====================================================
              FOOTER
          ===================================================== */}
          <div
            className="
              mt-8
              flex
              items-center
              justify-between
              text-xs
              text-white/70
            "
          >

            <p>
              © 2026 BhashaSetu AI · Made for Bharat 🇮🇳
            </p>

            <span
              className="
                hidden
                items-center
                gap-1
                sm:flex
              "
            >
              Empowering local dreams

              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>

          </div>

        </div>

      </section>


      {/* =========================================================
          RIGHT SIDE — EXISTING LOGIN FORM
      ========================================================= */}
      <section
        className="
          flex
          min-h-screen
          flex-col
          items-center
          justify-center
          p-6
          sm:p-8
          lg:p-12
        "
      >

        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">

          <Link
            href="/"
            className="flex items-center gap-2"
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-saffron-500
                to-orange-600
              "
            >
              <Globe className="h-5 w-5 text-white" />
            </div>

            <span className="text-lg font-bold">
              BhashaSetu
              <span className="text-primary">
                {" "}AI
              </span>
            </span>

          </Link>

        </div>


        {/* Existing authentication page */}
        <div className="w-full max-w-md">
          {children}
        </div>

      </section>

    </main>
  );
}
