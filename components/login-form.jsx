"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ className, ...props }) {

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState(false)

  const handleLogin = async (e) => {

    e.preventDefault()

    try {

      setLoading(true)

      const res = await api("/auth/login",{
        method:"POST",
        body: JSON.stringify({ email,password })
      })

      // store local data
      localStorage.setItem("token",res.token)
      localStorage.setItem("permissions",JSON.stringify(res.permissions))
      localStorage.setItem("user",JSON.stringify(res.user))

      // IMPORTANT: store token in cookie for middleware
      document.cookie = `token=${res.token}; path=/; max-age=604800`

      toast.success("Login successful")

      router.push("/dashboard")

    } catch(err) {

      toast.error(err.message)

    } finally {

      setLoading(false)

    }

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>

      <Card>
      <CardHeader className="text-center">

  <CardTitle className="text-xl">
    CabX Admin Login
  </CardTitle>

  <CardDescription>
    Sign in to manage CabX bookings & drivers
  </CardDescription>

</CardHeader>
        <CardContent>

          <form onSubmit={handleLogin}>
            <FieldGroup>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>

            </FieldGroup>
          </form>

        </CardContent>
      </Card>

    </div>
  )
}