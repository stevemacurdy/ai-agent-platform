import dynamic from 'next/dynamic'
const HomePage = dynamic(() => import('./home-client'), { ssr: false })
export default function Page() { return <HomePage /> }
