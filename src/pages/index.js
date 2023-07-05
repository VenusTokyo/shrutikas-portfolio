import Head from 'next/head'
import { BsFillMoonStarsFill } from 'react-icons/bs'
import { AiFillTwitterCircle, AiFillLinkedin, AiFillGithub } from 'react-icons/ai'
import Image from 'next/image'
import avatar from '../../public/shru avatar.png'
export default function Home() {
  return (
    <>
      <Head>
        <title>Shrutika's Portfolio</title>
      </Head>
      <main className='bg-white px-10'>
        <section className='min-h-screen'>
          <nav className='py-10 mb-12 flex justify-between'>
            <h1 className='text-xl font-burtons'>developedbyS</h1>
            <ul className='flex items-center'>
              <li><BsFillMoonStarsFill className='cursor-pointer text-2xl' /></li>
              <li><a href="#" className=' bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md ml-8'>Resume</a></li>
            </ul>
          </nav>
          <div className='text-center p-10 '>
            <h2 className=' text-5xl py-2 text-teal-500 font-medium'>Shrutika Shaw</h2>
            <h3 className=' text-2xl py-2'>Software Developer</h3>
            <p className=' text-md py-5 leading-7 text-gray-600'>Currently pursuing a master's degree in Computer Applications, I thrive on merging my technical expertise with a passion for crafting innovative solutions. In addition to my academic pursuits, I channel my creativity and artistic versatility into captivating paintings, allowing my artistic flair to shine through. </p>
          </div>
          <div className='text-5xl flex justify-center gap-16 py-3 text-teal-500'>
            <AiFillTwitterCircle />
            <AiFillLinkedin />
            <AiFillGithub />
          </div>
          <div className=' relative bg-gradient-to-b from-teal-400 to-purple-600 rounded-full '>
            <Image src={avatar} />
          </div>
        </section>

      </main>
    </>
  )
}

