"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import PermissionGuard from "@/components/permission-guard"

export default function CarCategories() {

  const [categories,setCategories] = useState([])
  const [loading,setLoading] = useState(true)

  const [showModal,setShowModal] = useState(false)
  const [editing,setEditing] = useState(null)

  const [form,setForm] = useState({
    name:"",
    capacity:"",
    baseFare:"",
    perKm:""
  })


  const fetchCategories = async ()=>{

    try{

      const data = await api("/car-categories")
      setCategories(data)

    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    fetchCategories()
  },[])


  const openCreate = ()=>{
    setEditing(null)
    setForm({
      name:"",
      capacity:"",
      baseFare:"",
      perKm:""
    })
    setShowModal(true)
  }


  const openEdit = (category)=>{
    setEditing(category)

    setForm({
      name:category.name,
      capacity:category.capacity,
      baseFare:category.baseFare,
      perKm:category.perKm
    })

    setShowModal(true)
  }


  const handleSubmit = async ()=>{

    try{

      if(editing){

        await api(`/car-categories/${editing.id}`,{
          method:"PUT",
          body:JSON.stringify(form)
        })

      }else{

        await api("/car-categories",{
          method:"POST",
          body:JSON.stringify(form)
        })

      }

      setShowModal(false)
      fetchCategories()

    }catch(err){
      console.error(err)
    }

  }


  const handleDelete = async (id)=>{

    if(!confirm("Delete category?")) return

    try{

      await api(`/car-categories/${id}`,{
        method:"DELETE"
      })

      fetchCategories()

    }catch(err){
      console.error(err)
    }

  }


  if(loading){
    return <p className="p-6">Loading categories...</p>
  }


  return(

<PermissionGuard permission="car.read">

    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Car Categories
        </h1>

        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Category
        </button>

      </div>


      <div className="border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-muted">

            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Capacity</th>
              <th className="text-left p-3">Base Fare</th>
              <th className="text-left p-3">Per KM</th>
              <th className="text-left p-3">Actions</th>
            </tr>

          </thead>

          <tbody>

            {categories.map((cat)=>(
              <tr key={cat.id} className="border-t">

                <td className="p-3">{cat.name}</td>

                <td className="p-3">{cat.capacity}</td>

                <td className="p-3">₹{cat.baseFare}</td>

                <td className="p-3">₹{cat.perKm}</td>

                <td className="p-3 flex gap-3">

                  <button
                    onClick={()=>openEdit(cat)}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>handleDelete(cat.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>



      {showModal &&(

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">

            <h2 className="text-lg font-semibold">
              {editing ? "Edit Category" : "Create Category"}
            </h2>

            <input
              placeholder="Category Name"
              className="border p-2 w-full"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />

            <input
              placeholder="Capacity"
              type="number"
              className="border p-2 w-full"
              value={form.capacity}
              onChange={(e)=>setForm({...form,capacity:e.target.value})}
            />

            <input
              placeholder="Base Fare"
              type="number"
              className="border p-2 w-full"
              value={form.baseFare}
              onChange={(e)=>setForm({...form,baseFare:e.target.value})}
            />

            <input
              placeholder="Per KM"
              type="number"
              className="border p-2 w-full"
              value={form.perKm}
              onChange={(e)=>setForm({...form,perKm:e.target.value})}
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={()=>setShowModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-black text-white px-4 py-2 rounded"
              >
                {editing ? "Update" : "Create"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

</PermissionGuard>

  )

}