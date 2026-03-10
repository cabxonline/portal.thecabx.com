"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function RolePermissionsPage() {

  const { roleId } = useParams()

  const [permissions, setPermissions] = useState([])
  const [rolePermissions, setRolePermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {

    try {

      const perms = await api("/permissions")
      const rolePerms = await api(`/roles/${roleId}/permissions`)

      setPermissions(perms)

      const ids = rolePerms.map(p => p.permissionId)
      setRolePermissions(ids)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    fetchData()
  }, [])

  const togglePermission = (permissionId) => {

    setRolePermissions(prev => {

      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId)
      }

      return [...prev, permissionId]

    })

  }

  const savePermissions = async () => {

    try {

      setSaving(true)

      await api(`/roles/${roleId}/permissions/bulk`, {
        method: "POST",
        body: JSON.stringify({
          permissions: rolePermissions
        })
      })

      toast.success("Permissions updated")

    } catch (err) {
      console.error(err)
      toast.error("Failed to update permissions")
    } finally {
      setSaving(false)
    }

  }

  if (loading) {
    return <p className="p-6">Loading permissions...</p>
  }

  return (

    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-semibold">
          Role Permissions
        </h1>

        <button
          onClick={savePermissions}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded text-sm"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>


      <div className="border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-muted">

            <tr>
              <th className="p-3 text-left">Permission Key</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Enabled</th>
            </tr>

          </thead>

          <tbody>

            {permissions.map(permission => {

              const checked = rolePermissions.includes(permission.id)

              return (

                <tr key={permission.id} className="border-t">

                  <td className="p-3 font-mono text-sm">
                    {permission.key}
                  </td>

                  <td className="p-3">
                    {permission.name}
                  </td>

                  <td className="p-3">

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(permission.id)}
                    />

                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>

      </div>

    </div>

  )

}