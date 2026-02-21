'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SoloRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/agents/sales'); }, [router]);
  return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-400 text-sm">Redirecting to Sales Agent...</p></div>;
}
