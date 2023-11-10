import Head from 'next/head'
import { useState } from 'react'
import { BsFillMoonStarsFill, BsPerson } from 'react-icons/bs'
import { AiFillTwitterCircle, AiFillLinkedin, AiFillGithub   } from 'react-icons/ai'
import { BiLogoHtml5, BiLogoCss3, BiLogoJavascript, BiLogoReact, BiPhoneCall } from 'react-icons/bi'
import {PiAtBold} from 'react-icons/pi'
import {RiMessage2Line} from 'react-icons/ri'
import Image from 'next/image'
import avatar from '../../public/avatar.png'
import web1 from '../../public/web1.png'
import web2 from '../../public/web2.png'
import web3 from '../../public/web3.png'
import web4 from '../../public/web4.png'
import web5 from '../../public/web5.png'
import web6 from '../../public/web6.png'
import restaurant from '../../public/web7.png'
import mypic from "../../public/mypic.png"


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
            <h3 className='text-3xl pt-7 py-1 text-teal-500'>Projects</h3>
            <p className='text-md py-5 leading-7 text-gray-600 dark:text-gray-400'>My Projects are listed below</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ">
            <div className="flex flex-col  items-center m-3 rounded-xl shadow-2xl bg-gray-800">
              <Image className='rounded-xl' src={web1} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>GPT-3 Website</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoReact color='cyan' /><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>
              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://gpt3-venustokyo.netlify.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/GPT-3" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>
            <div className="flex flex-col  items-center m-3 rounded-xl shadow-2xl card">
              <Image className='rounded-xl' src={restaurant} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>Gericht Restaurant Website</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoReact color='cyan' /><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>
              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://venustokyo-gericht-restaurant.vercel.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/Gericht-Restaurant-Website" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>
            <div className="flex flex-col  items-center m-3 rounded-lg shadow-2xl card">
              <Image className='rounded-lg' src={web2} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>Times of India Clone</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoReact color='cyan' /><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>
              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://times-of-india-venustokyo.netlify.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/Times-Of-India" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>
            <div className="flex flex-col  items-center m-3 rounded-lg shadow-2xl card">
              <Image className='rounded-lg' src={web3} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>Weather WebApp</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>

              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://venustokyo-weather-app.netlify.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/Weather-App" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>
            <div className="flex flex-col  items-center m-3 rounded-lg shadow-2xl card">
              <Image className='rounded-lg' src={web4} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>Meme Generator</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>

              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://venustokyo-meme-app.netlify.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/Meme-App" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>
            <div className="flex flex-col  items-center m-3 rounded-lg shadow-2xl card">
              <Image className='rounded-lg' src={web5} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>Todo WebApp</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>

              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://venustokyo-keep-notes.netlify.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/keep-notes" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>
            <div className="flex flex-col  items-center m-3 rounded-lg shadow-2xl card">
              <Image className='rounded-lg' src={web6} height={'300'} style={{ width: '100%', overflow: 'hidden' }} />
              <h2 className=' mt-4 text-white font-mono text-2xl'>Dictionary</h2>
              <h3 className='flex text-2xl mt-3 space-x-3' ><BiLogoHtml5 color='red' /><BiLogoCss3 color='blue' /><BiLogoJavascript color='yellow' /> </h3>

              <div className="flex justify-around mt-5 mb-5 w-full">
                <a href="https://venustokyo-dictionary.netlify.app/" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Live</a>
                <a href="https://github.com/VenusTokyo/Dictionary" className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md  font-mono'>Code</a>
              </div>
            </div>


          </div>
        </section>
        <section>
          <div>

            <p className='text-md py-5 leading-7 text-gray-600 dark:text-gray-400'></p>
          </div>
          <div className=" flex justify-around md:flex-row flex-col-reverse w-full">
            
            <div className="flex flex-col justify-start md:w-1/2">
              <h3 className='text-3xl pt-7 py-1 text-teal-500 mb-6'>Contact Me</h3>
              <form action="https://formsubmit.co/shrutika.shaw2015@gmail.com" method="POST" className='rounded-xl glow p-2'>
                <div className="flex input-box mt-2 ml-4">
                  <BsPerson color='white' fontSize={30}/>
                  <input type="text" placeholder='Name' name='Name' className='w-full input pl-3' />
                </div>
                <div className="flex input-box ml-4">
                  <PiAtBold color='white' fontSize={30}/>
                  <input type="email" placeholder='Email Address' name='Email' className='w-full input pl-3'/>
                </div>
                <div className="flex input-box ml-4">
                  <BiPhoneCall color='white' fontSize={30}/>
                  <input type="phone" placeholder='Phone Number' name='Phone' className='w-full input pl-3'/>
                </div>
                <div className="flex input-box ml-4">
                  <RiMessage2Line color='white' fontSize={30}/>
                  <textarea type="text" placeholder='Message' rows={6} className='w-full input pl-3'/>
                </div>

                <button type='submit' value='submit' className='ml-4 mb-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-md font-mono'>Submit</button>

              </form>
            </div>
            <div className="flex justify-center items-end ">
              {/* <div className='h-full border border-l-2 border-purple-500'/> */}
              {/* <div className="blob absolute"></div> */}
              <Image src={mypic} height={400}  className=' z-10' />
            </div>
          </div>
          <div className="flex justify-center mt-16 pt-3 pb-3 border-t-slate-500 border-t-2 text-gray-700 dark:text-gray-400">
            Developed by with &#10084; | Shrutika Shaw &copy; 2023
          </div>
        </section>
        
      </main>
    </div>
  )
}

