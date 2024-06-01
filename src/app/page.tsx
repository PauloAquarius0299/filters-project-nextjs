"use client"

import type { Product as TProduct } from '@/db'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { QueryResult } from '@upstash/vector'
import Product from '@/components/Products/Product'
import ProductSkeleton from '@/components/Products/ProductSkeleton'
import { Accordion,  AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import { Slider } from '@/components/ui/slider'

const SORT_OPTIONS = [
  {name: 'Nenhum', value: 'none'},
  {name: 'Preço: baixo a alto', value: 'price-asc'},
  {name: 'Preço: alto a baixo', value: 'price-desc'},
] as const

const COLOR_FILTERS = {
  id: 'color',
  name: 'Colors',
  options: [
    {value: 'white', label: 'Branco'},
    {value: 'beige', label: 'Beige'},
    {value: 'blue', label: 'Azul'},
    {value: 'green', label: 'Verde'},
    {value: 'purple', label: 'Roxo'},
  ] as const,
}
const SIZE_FILTERS = {
  id: 'size',
  name: 'Size',
  options: [
    { value: 'S', label: 'G' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'P' },
  ],
} as const

const PRICE_FILTERS = {
  id: 'Price',
  name: 'Price',
  options: [
    {value: [0,100], label: 'Qualquer Preço'},
    {
      value: [0,20],
      label: 'Entre $20',
    },
    {
      value: [0,40],
      label: 'Entre $40',
    },
  ],
} as const

const SUBCATEGORIES = [
  {name: 'T-Shrtis', selected: true, href: '#'},
  {name: 'Hoodies', selected: false, href: '#'},
  {name: 'Sweatshirts', selected: false, href: "#"},
  {name: 'Accessories', selected: false, href: '#'},
]

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number,number]

export default function Home() {
  const [filter,setFilter] = useState({
    color: ['beige', 'blue', 'green', 'purple', 'white'],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    size: ['L', 'M', 'S'],
    sort: 'none',
  })

  const {data: products, refetch} = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const {data} = await axios.post<QueryResult<TProduct>[]>(
        'http://localhost:3000/api/products',
        {
          filter:{
            sort: filter.sort,
            color: filter.color,
            price: filter.price.range,
            size: filter.size,
          },
        }
      )

      return data
    }
  })

  const onSubmit  = () => refetch()

 

  const applyArrayFilter = ({
    category,
    value,
  } : {
    category: keyof Omit<typeof filter, 'price' | 'sort'>
    value: string
  }) => {
    const isFilterApplied = filter[category].includes(value as never)

    if(isFilterApplied){
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }))
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }))
    }
  }

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1])
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1])
  
  return (
    <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24 ">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 ">
        Seleção de algodão de alta qualidade
        </h1>

        <div className='flex items-center'>
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Organizar
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0  text-gray-400 group-hover:text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end'>
              {SORT_OPTIONS.map((option) => (
                <button key={option.name} 
                className={cn('text-left w-full block px-4 py-2 text-sm', {
                  'text-gray-900 bg-gray-100': option.value === filter.sort,
                  'text-gray-500': option.value !== filter.sort,
                })}
                onClick={() => {
                  setFilter((prev) => ({
                    ...prev,
                    sort:option.value,
                  }))
                }} >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className='-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg-hidden'>
            <Filter className='h-5 w-5' />
          </button>
        </div>
      </div>

      <section className='pb-24 pt-6'>
        <div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
          {/* FILTROS */}
          <div className='hidden lg:block'>
            <ul className='space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900'>
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                  disabled={!category.selected}
                  className='disabled:cursor-not-allowed disabled:opacity-600'
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            <Accordion type='multiple' className='animate-none'>
              {/* COLOR FILTER */}
              <AccordionItem value='color'>
                <AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
                  <span className='font-medium text-gray-900'>Color</span>
                </AccordionTrigger>

                <AccordionContent className='pt-6 animate-none'>
                  <ul className='space-y-4'>
                    {COLOR_FILTERS.options.map((option, optionIdx) => (
                      <li key={option.value} className='flex items-center'>
                        <input
                          type='checkbox'
                          id={`color-${optionIdx}`}
                          onChange={() => {
                            applyArrayFilter({
                              category: 'color',
                              value: option.value,
                            })
                          }}
                          checked={filter.color.includes(option.value)}
                          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                        />
                        <label
                          htmlFor={`color-${optionIdx}`}
                          className='ml-3 text-sm text-gray-600'>
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>


              {/* SIZE FILTERS */}
              <AccordionItem value='size'>
                <AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
                  <span className='font-medium text-gray-900'>Tamanhos</span>
                </AccordionTrigger>

                <AccordionContent className='pt-6 animate-none'>
                  <ul className='space-y-4'>
                    {SIZE_FILTERS.options.map((option, optionIdx) => (
                      <li key={option.value} className='flex items-center'>
                        <input 
                        type='checkbox'
                        id={`size-${optionIdx}`}
                        onChange={()=> {
                          applyArrayFilter({
                            category: 'size',
                            value: option.value,
                          })
                        }}
                        checked={filter.size.includes(option.value)}
                        className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                        />
                        <label htmlFor={`size-${optionIdx}`} className='ml-3 text-sm text-gray-600'>
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='price'>
              <AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
                  <span className='font-medium text-gray-900'>Preço</span>
                </AccordionTrigger>

                <AccordionContent className='pt-6 animate-none'>
                  <ul className='space-y-4'>
                    {PRICE_FILTERS.options.map((option, optionIdx) => (
                      <li key={option.label} className='flex items-center'>
                        <input 
                        type='radio'
                        id={`price-${optionIdx}`}
                        onChange={()=>{
                          setFilter((prev) => ({
                            ...prev,
                            price:{
                              isCustom: false,
                              range:[...option.value],
                            },
                          }))
                         
                        }}
                        checked={
                          !filter.price.isCustom &&
                          filter.price.range[0] === option.value[0] &&
                          filter.price.range[1] === option.value[1]
                        }
                        className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                        />
                        <label
                        htmlFor={`price-${optionIdx}`}
                        className='ml-3 text-sm text-gray-600'
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}

                    <li className='flex justify-center flex-col gap-2'>
                      <div>
                        <input 
                        type='radio'
                        id={`price-${PRICE_FILTERS.options.length}`}
                        onChange={()=>{
                          setFilter((prev) => ({
                            ...prev,
                            price:{
                              isCustom: true,
                              range: [0,100],
                            },
                          }))

                          
                        }}

                        checked={filter.price.isCustom}
                        className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                        />
                        <label
                        htmlFor={`price-${PRICE_FILTERS.options.length}`}
                        className='ml-3 text-sm text-gray-600'
                        >
                          Definir
                        </label>
                      </div>

                      <div className='flex justify-between'>
                        <p className='font-medium'>Preço</p>
                      <div>
                      {filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{' '}
                          $ -{' '}
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}{' '}
                          $
                      </div>
                      </div>

                      <Slider 
                      className={cn({
                        'opacity-50': !filter.price.isCustom,
                      })}
                      disabled={!filter.price.isCustom}
                      onValueChange={(range) => {
                        const [newMin, newMax] = range

                        setFilter((prev) => ({
                          ...prev,
                          price:{
                            isCustom: true,
                            range: [newMin, newMax],
                          },
                        }))
                      }}
                      value={
                        filter.price.isCustom
                        ? filter.price.range
                        : DEFAULT_CUSTOM_PRICE
                      }
                      min={DEFAULT_CUSTOM_PRICE[0]}
                      defaultValue={DEFAULT_CUSTOM_PRICE}
                      max={DEFAULT_CUSTOM_PRICE[1]}
                      step={5}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>

          <ul className='lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
            {products 
            ? products.map((product) => (
              <Product product={product.metadata!} />
            ))
          : new Array(12)
          .fill(null)
          .map((_, i) => <ProductSkeleton key={i} />)}
          </ul>
        </div>
      </section>
    </main>
  );
}
