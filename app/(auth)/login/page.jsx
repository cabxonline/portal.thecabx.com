"use client"

import { LoginForm } from "@/components/login-form"
import { CarTaxiFront } from "lucide-react"

export default function LoginPage() {
  return (

    <div
      className="relative flex min-h-screen items-center justify-center p-6 md:p-10 bg-cover bg-center"
     style={{
  backgroundImage: "url('https://t3.ftcdn.net/jpg/18/72/40/70/360_F_1872407083_mnA9oGvKujzyoGk0BAoly0mfsbeLeWAX.jpg')"
}}
    >

      {/* Dark Overlay */}

      <div className="absolute inset-0 bg-black/60"></div>


      {/* Login Card */}

      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur rounded-xl shadow-xl p-8 space-y-6">

        {/* Logo */}

        <div className="flex items-center justify-center gap-2 text-xl font-semibold">

          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500 text-black">
            <CarTaxiFront className="size-5" />
          </div>

          CabX Cabs

        </div>


        {/* Login Form */}

        <LoginForm />

      </div>

    </div>

  )
}