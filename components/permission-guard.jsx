"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function PermissionGuard({ permission, children }) {

  const [allowed, setAllowed] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("permissions")

    if (!stored) {
      setAllowed(false)
      return
    }

    const permissions = JSON.parse(stored)
    setAllowed(permissions.includes(permission))
  }, [permission])


  if (allowed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Checking permission…</p>
      </div>
    )
  }


  if (!allowed) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">

        <img
          src="/illustrations/no-access.svg"
          alt="No permission"
          className="mb-6 w-56 opacity-90"
        />

        <h2 className="text-2xl font-semibold">
          Access restricted
        </h2>

        <p className="mt-2 max-w-md text-muted-foreground">
          You don’t have permission to view this page.  
          If you believe this is a mistake, please contact an administrator.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="rounded border px-4 py-2 text-sm hover:bg-muted"
          >
            Home
          </Link>
        </div>

      </div>
    )
  }

  return children
}