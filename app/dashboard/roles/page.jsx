"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"

import PermissionGuard from "@/components/permission-guard"
import DataTable from "@/components/data-table"

export default function Roles(){

  const [roles,setRoles] = useState([])
  const [loading,setLoading] = useState(true)

  const fetchRoles = async ()=>{

    try{

      const data = await api("/roles")
      setRoles(data)

    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    fetchRoles()
  },[])


  if(loading){
    return <p className="p-6">Loading roles...</p>
  }


  const columns = [

    {
      key:"name",
      label:"Role"
    },

    {
      key:"permissions",
      label:"Permissions",
      render:(row)=>row.permissions?.length || 0
    },

    {
      key:"createdAt",
      label:"Created",
      render:(row)=>new Date(row.createdAt).toLocaleDateString()
    },

    {
      key:"actions",
      label:"Actions",
      render:(row)=>(
        <div className="flex gap-3">

          <Link
            href={`/dashboard/roles/${row.id}/permissions`}
            className="text-green-600 text-sm"
          >
            Permissions
          </Link>

        </div>
      )
    }

  ]


  return (

    <PermissionGuard permission="role.read">

      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-semibold">
          Role Management
        </h1>

        <DataTable
          columns={columns}
          data={roles}
        />

      </div>

    </PermissionGuard>

  )

}