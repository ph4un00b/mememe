import dynamic from 'next/dynamic'

// Step 5 - delete Instructions components
// import Instructions from '@/components/dom/Instructions'
import { Fondo } from '@/components/pages/Home/Fondo'
import { Phau } from '@/components/pages/Home/Phau'
// import Shader from '@/components/canvas/Shader/Shader'

// Dynamic import is used to prevent a payload when the website start that will include threejs r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49

/**
 * Hey guys! The fact the error is not getting handle is because the starter is using dynamic component imports which is very nice for a fast render of the DOM but can have some issues such as this one.

I can only recommend importing statically to prevent this:
import Box from '@/components/canvas/Box'

I think it should be better to let the developer choose and go back to static import. That's not very the best performance-wise as it will add a big payload with all the r3f / threejs stack.

What do you guys think?
 */

const Shader = dynamic(() => import('@/components/canvas/Shader/Shader'), {
  ssr: false,
})

// const Fondo = dynamic(() => import('@/components/pages/Home/Fondo'), {
//   ssr: false,
// })
// const Phau = dynamic(() => import('@/components/pages/Home/Phau'), {
//   ssr: false,
// })

// dom components goes here
const Page = (props) => {
  return (
    <>
      {/* <Instructions /> */}
    </>
  )
}

// canvas components goes here
// It will receive same props as Page component (from getStaticProps, etc.)
Page.r3f = (props) => (
  <>
    <Phau />
    {/* <Shader /> */}
    <Fondo />
    <axesHelper scale={4} />
  </>
)

export default Page

/** not ssr needed */
// export async function getStaticProps() {
//   return {
//     props: {
//       title: 'Index',
//     },
//   }
// }
