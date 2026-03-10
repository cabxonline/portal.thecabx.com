"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Drivers(){

  const [drivers,setDrivers] = useState([])
  const [cars,setCars] = useState([])
  const [loading,setLoading] = useState(true)

  const [showModal,setShowModal] = useState(false)
  const [editingDriver,setEditingDriver] = useState(null)

  const [form,setForm] = useState({
    name:"",
    phone:"",
    carId:"",
    status:"offline"
  })


  /* ---------------- FETCH DATA ---------------- */

  const fetchData = async () => {

    try{

      const driversRes = await api("/drivers")
      const carsRes = await api("/cars")

      const driversData = driversRes?.data ?? driversRes ?? []
      const carsData = carsRes?.data ?? carsRes ?? []

      setDrivers(Array.isArray(driversData) ? driversData : [])
      setCars(Array.isArray(carsData) ? carsData : [])

    }catch(err){

      console.error("Fetch error:",err)

    }finally{

      setLoading(false)

    }

  }

  useEffect(()=>{
    fetchData()
  },[])



  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {

    try{

      if(editingDriver){

        await api(`/drivers/${editingDriver.id}`,{
          method:"PATCH",
          body:JSON.stringify(form)
        })

      }else{

        await api("/drivers",{
          method:"POST",
          body:JSON.stringify(form)
        })

      }

      setShowModal(false)
      setEditingDriver(null)

      setForm({
        name:"",
        phone:"",
        carId:"",
        status:"offline"
      })

      fetchData()

    }catch(err){

      console.error("Submit error:",err)

    }

  }



  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {

    if(!confirm("Delete this driver?")) return

    try{

      await api(`/drivers/${id}`,{
        method:"DELETE"
      })

      fetchData()

    }catch(err){

      console.error("Delete error:",err)

    }

  }



  /* ---------------- EDIT ---------------- */

  const handleEdit = (driver) => {

    setEditingDriver(driver)

    setForm({
      name:driver.name || "",
      phone:driver.phone || "",
      carId:driver.carId || "",
      status:driver.status || "offline"
    })

    setShowModal(true)

  }



  return(

    <div className="p-6 space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Drivers
        </h1>

        <button
          onClick={()=>{

            setEditingDriver(null)

            setForm({
              name:"",
              phone:"",
              carId:"",
              status:"offline"
            })

            setShowModal(true)

          }}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Create Driver
        </button>

      </div>



      {/* TABLE */}

      {loading ? (

        <p>Loading drivers...</p>

      ) : drivers.length === 0 ? (

        <p className="text-gray-500">No drivers found</p>

      ) : (

        <div className="border rounded-lg overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Car</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>

            </thead>

            <tbody>

              {drivers.map(driver => (

                <tr key={driver.id} className="border-t">

                  <td className="p-3">{driver.name}</td>

                  <td className="p-3">{driver.phone}</td>

                  <td className="p-3">
                    {driver.car?.model
                      ? `${driver.car.model} (${driver.car.plateNumber})`
                      : "—"}
                  </td>

                  <td className="p-3">

                    <span className="px-2 py-1 rounded bg-gray-100 text-sm">

                      {driver.status || "offline"}

                    </span>

                  </td>

                  <td className="p-3 flex gap-3">

                    <button
                      className="text-blue-600 text-sm"
                      onClick={()=>handleEdit(driver)}
                    >
                      Edit
                    </button>

                    <button
                      className="text-red-600 text-sm"
                      onClick={()=>handleDelete(driver.id)}
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



      {/* MODAL */}

      {showModal && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          onClick={()=>setShowModal(false)}
        >

          <div
            className="bg-white p-6 rounded-lg w-[400px] space-y-4"
            onClick={(e)=>e.stopPropagation()}
          >

            <h2 className="text-lg font-semibold">
              {editingDriver ? "Edit Driver" : "Create Driver"}
            </h2>



            {/* NAME */}

            <input
              placeholder="Driver Name"
              className="border p-2 w-full rounded"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />


            {/* PHONE */}

            <input
              placeholder="Phone"
              className="border p-2 w-full rounded"
              value={form.phone}
              onChange={(e)=>setForm({...form,phone:e.target.value})}
            />


            {/* CAR */}

            <select
              className="border p-2 w-full rounded"
              value={form.carId}
              onChange={(e)=>setForm({...form,carId:e.target.value})}
            >

              <option value="">Select Car</option>

              {cars.map(car => (

                <option key={car.id} value={car.id}>

                  {car.model} ({car.plateNumber})

                </option>

              ))}

            </select>



            {/* STATUS */}

            <select
              className="border p-2 w-full rounded"
              value={form.status}
              onChange={(e)=>setForm({...form,status:e.target.value})}
            >

              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="busy">Busy</option>

            </select>



            {/* ACTIONS */}

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
                {editingDriver ? "Update" : "Create"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}