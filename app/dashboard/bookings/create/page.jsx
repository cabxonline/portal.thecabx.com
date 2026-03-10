"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CreateBooking(){

  const router = useRouter()

  const [users,setUsers] = useState([])
  const [cars,setCars] = useState([])

  const [form,setForm] = useState({
    userId:"",
    carCategoryId:"",
    pickupAddress:"",
    dropAddress:"",
    fare:""
  })


  useEffect(()=>{

    async function loadData(){

      try{

        const usersRes = await api("/users")
        const carsRes = await api("/car-categories")

        setUsers(usersRes.data || usersRes)
        setCars(carsRes.data || carsRes)

      }catch(err){

        console.error(err)

      }

    }

    loadData()

  },[])



  const handleSubmit = async (e)=>{

    e.preventDefault()

    try{

      await api("/bookings",{
        method:"POST",
        body:JSON.stringify(form)
      })

      router.push("/dashboard/bookings")

    }catch(err){

      console.error(err)

    }

  }



  return(

    <div className="w-full mx-auto p-6">

      <h1 className="text-2xl font-semibold mb-6">
        Create Booking
      </h1>


      <form onSubmit={handleSubmit} className="space-y-4">

        {/* USER */}

        <select
          className="border p-2 w-full rounded"
          value={form.userId}
          onChange={(e)=>setForm({...form,userId:e.target.value})}
        >

          <option value="">Select Customer</option>

          {users.map(user=>(
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}

        </select>



        {/* CAR CATEGORY */}

        <select
          className="border p-2 w-full rounded"
          value={form.carCategoryId}
          onChange={(e)=>setForm({...form,carCategoryId:e.target.value})}
        >

          <option value="">Select Car Category</option>

          {cars.map(car=>(
            <option key={car.id} value={car.id}>
              {car.name}
            </option>
          ))}

        </select>



        {/* PICKUP */}

        <input
          placeholder="Pickup Address"
          className="border p-2 w-full rounded"
          value={form.pickupAddress}
          onChange={(e)=>setForm({...form,pickupAddress:e.target.value})}
        />



        {/* DROP */}

        <input
          placeholder="Drop Address"
          className="border p-2 w-full rounded"
          value={form.dropAddress}
          onChange={(e)=>setForm({...form,dropAddress:e.target.value})}
        />



        {/* FARE */}

        <input
          type="number"
          placeholder="Fare"
          className="border p-2 w-full rounded"
          value={form.fare}
          onChange={(e)=>setForm({...form,fare:e.target.value})}
        />



        <button
          className="bg-black text-white px-6 py-2 rounded"
        >
          Create Booking
        </button>

      </form>

    </div>

  )

}