export function Instructions() {
  return (
    <div
      // eslint-disable-next-line tailwind/class-order
      className='absolute max-w-lg px-4 py-2 text-sm transform -translate-x-1/2 bg-gray-900 shadow-xl pointer-events-none select-none md:text-base top-8 left-1/2 text-gray-50'
      style={{
        maxWidth: 'calc(100% - 28px)',
      }}
    >
      <p className='hidden mb-8 md:block'>
        This is a minimal starter for Nextjs + Threejs. Click on the cube to
        navigate to the `/box` page. OrbitControls is enabled by default.
      </p>
      <div className='tracking-wider'>
        Step 1 - <span className='text-green-200'>update:</span>
        <span className='text-red-200'> @/pages/index </span>
        <br />
        Step 2 - <span className='text-green-200'>update:</span>
        <span className='text-red-200'>@/components/canvas/Shader/Shader</span>
        <br />
        Step 3 - <span className='text-green-200'>delete:</span>
        <span className='text-red-200'> @/pages/box </span>
        <br />
        Step 4 - <span className='text-green-200'>update header:</span>
        <span className='text-red-200'> @/config </span>
        <br />
        Step 5 - <span className='text-green-200'>delete:</span>
        <span className='text-red-200'> @/components/dom/Instructions</span>
      </div>
    </div>
  )
}

export function FlorTop() {
  return (
    <div
      // classname='pointer-events-none'
      // eslint-disable-next-line tailwind/class-order
      className='absolute max-w-lg px-4 py-2 text-sm transform -translate-x-1/2 bg-gray-900 shadow-xl select-none md:text-base top-8 left-1/2 text-gray-50'
      style={{
        maxWidth: 'calc(100% - 28px)',
      }}
    >
      <div className='tracking-wider'>
        Made by
        <span className='text-red-200'> fau & magic </span>
        <br />
        <br />
        job contact / freelance

        <br />
        <br />
        <a href="https://t.me/phaunus" target='_blank' rel="noreferrer">
          <span className='text-green-200 underline '>https://t.me/phaunus</span>
        </a>
        <br />

        <br />
        <a href="https://calendly.com/phaunus" target='_blank' rel="noreferrer">
          <span className='text-green-200 underline '>https://calendly.com/phaunus</span>
        </a>
        <br />

        <br />
        <a href="mailto:phaunus[ at ]protonmail[ dot ]com" target='_blank' rel="noreferrer">
          <span className='text-green-200 underline '>Email [fill placeholders] 😁</span>
        </a>
        <br />

        <br />
        <span className="">
          with 💖 #WebGL #Typescript #3RF #React #Next
        </span>
        <br />
        <br />
        <button className="cyberpunk">Press Start</button>
      </div>
    </div>
  )
}
