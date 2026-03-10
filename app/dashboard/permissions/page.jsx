"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Permissions() {

  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchPermissions = async () => {

      try {

        const data = await api("/permissions")

        setPermissions(data)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }

    }

    fetchPermissions()

  }, [])

  if (loading) {
    return <p className="p-6">Loading permissions...</p>
  }

  return (

    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-semibold">
          Permissions
        </h1>

        <button className="px-4 py-2 rounded bg-black text-white text-sm">
          Create Permission
        </button>

      </div>

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-muted">

            <tr>
              <th className="text-left p-3">Permission Key</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Actions</th>
            </tr>

          </thead>

          <tbody>

            {permissions.map((permission) => (

              <tr key={permission.id} className="border-t">

                <td className="p-3 font-mono text-sm">
                  {permission.key}
                </td>

                <td className="p-3">
                  {permission.name}
                </td>

                <td className="p-3 flex gap-3">

                  <button className="text-blue-600 text-sm">
                    Edit
                  </button>

                  <button className="text-red-600 text-sm">
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}