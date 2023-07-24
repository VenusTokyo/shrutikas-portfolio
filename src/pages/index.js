import Head from 'next/head'
import { useState } from 'react'
import { BsFillMoonStarsFill } from 'react-icons/bs'
import { AiFillTwitterCircle, AiFillLinkedin, AiFillGithub } from 'react-icons/ai'
import Image from 'next/image'
import avatar from '../../public/avatar.png'
import web1 from '../../public/web1.png'
import web2 from '../../public/web2.png'
import web3 from '../../public/web3.png'
import web4 from '../../public/web4.png'
import web5 from '../../public/web5.png'
import web6 from '../../public/web6.png'
export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  return (
    <div className={darkMode ? "dark" : ""}>
      <Head>
        <title>Shrutika's Portfolio</title>
      </Head>
      <main className='bg-white px-10 md:px-20 lg:px-40 dark:bg-gray-900'>
        <section className='min-h-screen'>
          <nav className='py-10 mb-12 flex justify-between'>
            <h1 className='text-xl font-burtons dark:text-gray-200'>developedbyS</h1>
            <ul className='flex items-center'>
              <li><BsFillMoonStarsFill onClick={() => setDarkMode(!darkMode)} className='cursor-pointer text-2xl dark:text-gray-200' /></li>
              <li><a href="https://drive.google.com/file/d/1eCJzhvpzf7Q9TD-TIpJDD7_K6td7_lGL/view" className=' bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md ml-8 font-mono'>Resume</a></li>
            </ul>
          </nav>
          <div className='md:flex md:items-center'>
            <div className=' md:w-1/2 sm:w-full'>

              <div className='text-center p-10 '>
                <h2 className=' text-5xl py-2 text-teal-500 md:text-4xl lg:text-5xl font-mono '>Shrutika Shaw&#10084;</h2>
                <h3 className=' text-2xl py-2 md:text-xl font-mono dark:text-gray-200'>Software Developer</h3>
                <p className=' text-sm py-5 leading-6 text-gray-600 dark:text-gray-400 md:text-l font-mono'>Currently pursuing a master's degree in Computer Applications, I thrive on merging my technical expertise with a passion for crafting innovative solutions. &#10024; </p>
              </div>
              <p className='text-xl flex justify-center py-2 font-mono dark:text-gray-200'>Connect with me here &#128071;  </p>
              <div className='text-5xl flex justify-center gap-16 py-1 text-teal-500'>
                <a href="https://twitter.com/quiteironical">
                  <AiFillTwitterCircle />
                </a>
                <a href="https://www.linkedin.com/in/shrutika-shaw/">
                  <AiFillLinkedin />
                </a>
                <a href="https://github.com/VenusTokyo">
                  <AiFillGithub />
                </a>
              </div>
            </div>
            <div className=' flex mt-5 mx-auto bg-gradient-to-br from-teal-400 to-purple-500 backdrop-blur-md rounded-full w-80 h-80  md:w-96 md:h-96'>

              <Image src={avatar} />
            </div>
          </div>
        </section>
        <section>
          <div>
            <h3 className='text-3xl pt-7 py-1 dark:text-gray-200'>Projects</h3>
            <p className='text-md py-5 leading-7 text-gray-600 dark:text-gray-400'>My Projects are listed below</p>
          </div>
          <div className="grid w-full grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
<div className="card w-1/4 h-24" style={{background:URL(web1)}}>
  <div className="textContent">
    hehe bye bye
  </div>
</div>
<div className="card w-1/4 h-24" style={{background:URL(web1)}}>
  <div className="textContent">
    hehe bye bye
  </div>
</div>
<div className="card w-1/4 h-24" style={{background:URL(web1)}}>
  <div className="textContent">
    hehe bye bye
  </div>
</div>
<div className="card w-1/4 h-24" style={{background:URL(web1)}}>
  <div className="textContent">
    hehe bye bye
  </div>
</div>
<div className="card w-1/4 h-24" style={{background:URL(web1)}}>
  <div className="textContent">
    hehe bye bye
  </div>
</div>
<div className="card w-1/4 h-24" style={{background:URL(web1)}}>
  <div className="textContent">
    hehe bye bye
  </div>
</div>
          </div>
        </section>
      </main>
    </div>
  )
}

