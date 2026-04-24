import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p className="mb-4">Could not find requested resource</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Return Home
      </Link>
    </div>
  )
}
