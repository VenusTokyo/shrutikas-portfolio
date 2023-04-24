import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-between p-24 bg-pink-300">
      
      <button onClick={Window}>About me</button>
      <button>About me</button>
      <button>About me</button>
      <button>About me</button>
      <button>About me</button>
      <button>About me</button>
    </main>
  )
}
function Window(){
  return(
    <div className="z-10 w-2/3 h-4/5 align-middle bg-pink-100"></div>
  )
}
