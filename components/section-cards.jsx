"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SectionCards({ stats }) {

  const cards = [
    {
      title: "Total Revenue",
      value: `₹ ${stats?.revenue ?? 0}`,
      trend: "+12%",
      up: true,
      description: "Total platform revenue",
      link: "/dashboard/payments"
    },
    {
      title: "Customers",
      value: stats?.users ?? 0,
      trend: "+8%",
      up: true,
      description: "Registered customers",
      link: "/dashboard/customers"
    },
    {
      title: "Bookings",
      value: stats?.bookings ?? 0,
      trend: "+15%",
      up: true,
      description: "Total cab bookings",
      link: "/dashboard/bookings"
    },
    {
      title: "Cities",
      value: stats?.cities ?? 0,
      trend: "+3%",
      up: true,
      description: "Active service cities",
      link: "/dashboard/cities"
    }
  ]

  return (

    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card,i)=>(

        <Link key={i} href={card.link}>

          <Card className="@container/card cursor-pointer hover:shadow-lg transition">

            <CardHeader>

              <CardDescription>
                {card.title}
              </CardDescription>

              <CardTitle className="text-2xl font-semibold tabular-nums">
                {card.value}
              </CardTitle>

              <CardAction>
                <Badge variant="outline">

                  {card.up ? <TrendingUpIcon/> : <TrendingDownIcon/>}

                  {card.trend}

                </Badge>
              </CardAction>

            </CardHeader>

            <CardFooter className="flex-col items-start gap-1.5 text-sm">

              <div className="flex gap-2 font-medium">

                {card.up ? "Trending up" : "Trending down"}

                {card.up
                  ? <TrendingUpIcon className="size-4"/>
                  : <TrendingDownIcon className="size-4"/>
                }

              </div>

              <div className="text-muted-foreground">
                {card.description}
              </div>

            </CardFooter>

          </Card>

        </Link>

      ))}

    </div>

  )

}