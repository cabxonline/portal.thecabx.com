"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import PermissionGuard from "@/components/permission-guard"

export default function Users() {

  const [users,setUsers] = useState([])
  const [roles,setRoles] = useState([])
  const [loading,setLoading] = useState(true)

  const [showModal,setShowModal] = useState(false)
  const [editingUser,setEditingUser] = useState(null)

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:"",
    roleId:""
  })


  const fetchData = async ()=>{

    try{

      const usersData = await api("/users")
      const rolesData = await api("/roles")

     const customers = usersData.filter(
  (user) => user.role?.name?.toLowerCase() === "admin"
)

setUsers(customers)
      setRoles(rolesData)

    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    fetchData()
  },[])



  const handleSubmit = async ()=>{

    try{

      if(editingUser){

        await api(`/users/${editingUser.id}`,{
          method:"PUT",
          body:JSON.stringify(form)
        })

      }else{

        await api("/users",{
          method:"POST",
          body:JSON.stringify(form)
        })

      }

      setShowModal(false)
      setEditingUser(null)

      fetchData()

    }catch(err){
      console.error(err)
    }

  }



  const handleDelete = async (id)=>{

    if(!confirm("Delete this user?")) return

    try{

      await api(`/users/${id}`,{
        method:"DELETE"
      })

      fetchData()

    }catch(err){
      console.error(err)
    }

  }



  return (

    <PermissionGuard permission="user.read">

      <div className="p-6 space-y-6">

        <div className="flex justify-between items-center">

          <h1 className="text-2xl font-semibold">
            Users
          </h1>

          <button
            onClick={()=>setShowModal(true)}
            className="bg-black text-white px-4 py-2 rounded text-sm"
          >
            Create User
          </button>

        </div>



        {loading ? (

          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Loading users...</p>
          </div>

        ) : (

          <div className="border rounded-lg overflow-hidden">

            <table className="w-full">

              <thead className="bg-muted">

                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>

              </thead>

              <tbody>

                {users.map(user => (

                  <tr key={user.id} className="border-t">

                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role?.name}</td>

                    <td className="p-3 flex gap-3">

                      <button
                        className="text-blue-600 text-sm"
                        onClick={()=>{
                          setEditingUser(user)
                          setForm({
                            name:user.name,
                            email:user.email,
                            roleId:user.roleId
                          })
                          setShowModal(true)
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-red-600 text-sm"
                        onClick={()=>handleDelete(user.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}



        {showModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">

              <h2 className="text-lg font-semibold">
                {editingUser ? "Edit User" : "Create User"}
              </h2>


              <input
                placeholder="Name"
                className="border p-2 w-full rounded"
                value={form.name}
                onChange={(e)=>setForm({...form,name:e.target.value})}
              />

              <input
                placeholder="Email"
                className="border p-2 w-full rounded"
                value={form.email}
                onChange={(e)=>setForm({...form,email:e.target.value})}
              />


              {!editingUser && (

                <input
                  placeholder="Password"
                  type="password"
                  className="border p-2 w-full rounded"
                  value={form.password}
                  onChange={(e)=>setForm({...form,password:e.target.value})}
                />

              )}


              <select
                className="border p-2 w-full rounded"
                value={form.roleId}
                onChange={(e)=>setForm({...form,roleId:e.target.value})}
              >

                <option value="">Select Role</option>

                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}

              </select>


              <div className="flex justify-end gap-3">

                <button
                  onClick={()=>setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  {editingUser ? "Update" : "Create"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </PermissionGuard>

  )

}