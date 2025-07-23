// app/page.tsx
export default function HomePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-24"
      style={{
        backgroundColor: '#1E566F', // Specific background color from original landing page
        color: 'white',              // General font color for the page
        fontFamily: 'Poppins, sans-serif' // Apply Poppins font to the whole page
      }}
    >
      <div className="text-center">
        {/* NEW: Shelivery Logo */}
        {/* Placed above the h1, centered with mx-auto, and given some bottom margin for spacing.
            Adjust h-24/h-32 (height) as needed for your desired size. */}
        <img
          src="/icons/shelivery-logo2.svg" // Path to your SVG in the public directory
          alt="Shelivery Logo"
          className="mx-auto h-24 sm:h-32 mb-6" // Centered horizontally, responsive height, and margin-bottom
        />

        {/* STEP 2: Color of Font (Specific - Shelivery Yellow) */}
        <h1 className="text-4xl font-bold tracking-tight text-shelivery-primary-yellow sm:text-6xl">
          Shelivery
        </h1>
        {/* STEP 2: Color of Font (Specific - White for description) */}
        <p className="mt-6 text-lg leading-8 text-white">
          Group Shopping for Dormitories
        </p>
        {/* STEP 2: Color of Font (Specific - White for detailed description) */}
        <p className="mt-4 text-sm text-white">
          Share delivery costs and coordinate group orders with your dormmates
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {/* STEP 3: Button Style (Get Started) */}
          <a
            href="/auth"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shelivery-primary-yellow"
            style={{
              backgroundColor: '#FFD700', // Shelivery Primary Yellow
              color: '#1E566F'            // Text color matching the page's background
            }}
          >
            Get Started
          </a>
          {/* STEP 3: Button Style (Learn more) */}
          <a
            href="#features"
            className="text-sm font-semibold leading-6 rounded-lg border-2 px-5 py-2.5 hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#FFD700', // Shelivery Primary Yellow
              color: '#FFD700'        // Shelivery Primary Yellow
            }}
          >
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  )
}