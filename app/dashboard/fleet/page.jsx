"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Fleet() {

  const [cars,setCars] = useState([])
  const [categories,setCategories] = useState([])
  const [loading,setLoading] = useState(true)

  const [showModal,setShowModal] = useState(false)
  const [editingCar,setEditingCar] = useState(null)

  const [form,setForm] = useState({
    model:"",
    plateNumber:"",
    categoryId:""
  })


  const fetchData = async ()=>{

    try{

      const carsData = await api("/cars")
      const categoriesData = await api("/car-categories")

      setCars(carsData.data || carsData)
      setCategories(categoriesData)

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

      if(editingCar){

        await api(`/cars/${editingCar.id}`,{
          method:"PATCH",
          body:JSON.stringify(form)
        })

      }else{

        await api("/cars",{
          method:"POST",
          body:JSON.stringify(form)
        })

      }

      setShowModal(false)
      setEditingCar(null)

      setForm({
        model:"",
        plateNumber:"",
        categoryId:""
      })

      fetchData()

    }catch(err){
      console.error(err)
    }

  }



  const handleDelete = async (id)=>{

    if(!confirm("Delete this car?")) return

    try{

      await api(`/cars/${id}`,{
        method:"DELETE"
      })

      fetchData()

    }catch(err){
      console.error(err)
    }

  }



  return (

    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Fleet Management
        </h1>

        <button
          onClick={()=>setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Add Vehicle
        </button>

      </div>



      {loading ? (

        <p>Loading vehicles...</p>

      ) : (

        <div className="border rounded-lg overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-3 text-left">Model</th>
                <th className="p-3 text-left">Plate Number</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Driver</th>
                <th className="p-3 text-left">Actions</th>
              </tr>

            </thead>

            <tbody>

              {cars.map(car => (

                <tr key={car.id} className="border-t">

                  <td className="p-3">{car.model}</td>

                  <td className="p-3">{car.plateNumber}</td>

                  <td className="p-3">
                    {car.category?.name || "—"}
                  </td>

                  <td className="p-3">
                    {car.driver?.name || "Not Assigned"}
                  </td>

                  <td className="p-3 flex gap-3">

                    <button
                      className="text-blue-600 text-sm"
                      onClick={()=>{

                        setEditingCar(car)

                        setForm({
                          model:car.model,
                          plateNumber:car.plateNumber,
                          categoryId:car.categoryId
                        })

                        setShowModal(true)

                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="text-red-600 text-sm"
                      onClick={()=>handleDelete(car.id)}
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

          <div className="bg-white p-6 rounded-lg w-[420px] space-y-4">

            <h2 className="text-lg font-semibold">

              {editingCar ? "Edit Vehicle" : "Add Vehicle"}

            </h2>



            <input
              placeholder="Car Model"
              className="border p-2 w-full rounded"
              value={form.model}
              onChange={(e)=>setForm({...form,model:e.target.value})}
            />


            <input
              placeholder="Plate Number"
              className="border p-2 w-full rounded"
              value={form.plateNumber}
              onChange={(e)=>setForm({...form,plateNumber:e.target.value})}
            />


            <select
              className="border p-2 w-full rounded"
              value={form.categoryId}
              onChange={(e)=>setForm({...form,categoryId:e.target.value})}
            >

              <option value="">Select Category</option>

              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
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
                {editingCar ? "Update" : "Create"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}